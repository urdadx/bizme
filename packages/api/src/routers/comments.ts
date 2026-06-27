import { db, toggleCommentLike } from "@better-comments/db";
import { comment, commentAttachment, commentReaction, page } from "@better-comments/db/schema/index";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import type { Context } from "../context";
import { protectedProcedure, router } from "../index";
import { getActiveWorkspaceId } from "./utils";

const commentIdInput = z.object({
  id: z.string().min(1),
});

const commentUpdateInput = commentIdInput.extend({
  body: z.string().trim().min(1).max(5000),
});

const commentPinInput = commentIdInput.extend({
  isPinned: z.boolean(),
});

const commentClassifyInput = commentIdInput.extend({
  classification: z.enum(["legitimate", "spam"]),
});

const commentReplyInput = commentIdInput.extend({
  body: z.string().trim().min(1).max(5000),
});

type CommentRow = typeof comment.$inferSelect;
type CommentAttachmentRow = typeof commentAttachment.$inferSelect;
type PageRow = typeof page.$inferSelect;
type CommentReactionRow = typeof commentReaction.$inferSelect;

export type CommentAttachmentItem = {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
};

export type CommentTreeItem = {
  id: string;
  commentNumber: number | null;
  author: string;
  authorEmail: string | null;
  authorProvider: CommentRow["authorProvider"];
  date: string;
  content: string;
  likes: number;
  replies: number;
  avatar: string;
  isPinned: boolean;
  status: CommentRow["status"];
  classification: CommentRow["classification"];
  isBlocked: boolean;
  locationCity: string | null;
  locationCountry: string | null;
  locationCountryCode: string | null;
  locationContinent: string | null;
  deviceType: string | null;
  browser: string | null;
  os: string | null;
  attachments: CommentAttachmentItem[];
  children: CommentTreeItem[];
};

type RequestWithCloudflare = Request & {
  cf?: {
    city?: unknown;
    country?: unknown;
    continent?: unknown;
  };
};

const CONTINENT_NAMES: Record<string, string> = {
  AF: "Africa",
  AN: "Antarctica",
  AS: "Asia",
  EU: "Europe",
  NA: "North America",
  OC: "Oceania",
  SA: "South America",
};

export type CommentReactionItem = {
  id: string;
  type: CommentReactionRow["type"];
  visitorId: string;
  name: string;
  avatar: string | null;
  date: string;
};

function formatRelativeDate(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
	return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

function formatCommentDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getAuthorName(row: CommentRow) {
  return row.authorName ?? row.authorEmail ?? "Anonymous";
}

function getAvatar(row: CommentRow) {
  if (row.authorImage) {
    return row.authorImage;
  }

  if (row.authorProvider === "github" && row.authorExternalId) {
    return `https://avatars.githubusercontent.com/u/${encodeURIComponent(row.authorExternalId)}?v=4`;
  }

  return `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(getAuthorName(row))}`;
}

function getCountryName(country: string | undefined) {
  if (!country) return undefined;

  if (country.length !== 2) return country;

  return new Intl.DisplayNames(["en"], { type: "region" }).of(country.toUpperCase()) ?? country;
}

function getHeaderValue(headers: Headers, name: string) {
  const value = headers.get(name)?.trim();
  return value ? value : undefined;
}

function decodeCloudflareHeader(value: string | undefined) {
  if (!value) return undefined;

  try {
    return decodeURIComponent(value).trim() || undefined;
  } catch {
    return value.trim() || undefined;
  }
}

function getCloudflareCountryCode(request: RequestWithCloudflare) {
  const country = getHeaderValue(request.headers, "cf-ipcountry") ??
    (typeof request.cf?.country === "string" ? request.cf.country : undefined);
  const countryCode = country?.toUpperCase();

  return countryCode && countryCode !== "XX" ? countryCode : undefined;
}

function getCloudflareValue(
  request: RequestWithCloudflare,
  headerName: string,
  cfValue: unknown,
) {
  return decodeCloudflareHeader(
    getHeaderValue(request.headers, headerName) ?? (typeof cfValue === "string" ? cfValue : undefined),
  );
}

function getContinentName(continent: string | undefined) {
  const code = continent?.trim().toUpperCase();

  if (!code) return undefined;

  return CONTINENT_NAMES[code] ?? continent;
}

function getBrowser(userAgent: string) {
  if (/Edg\//.test(userAgent)) return "Edge";
  if (/OPR\//.test(userAgent)) return "Opera";
  if (/Chrome\//.test(userAgent) && !/Chromium\//.test(userAgent)) return "Chrome";
  if (/Firefox\//.test(userAgent)) return "Firefox";
  if (/Safari\//.test(userAgent) && !/Chrome\//.test(userAgent)) return "Safari";
  if (/Chromium\//.test(userAgent)) return "Chromium";
  return userAgent ? "Unknown" : undefined;
}

function getOS(userAgent: string) {
  if (/Windows NT/i.test(userAgent)) return "Windows";
  if (/iPhone|iPad|iPod/i.test(userAgent)) return "iOS";
  if (/Android/i.test(userAgent)) return "Android";
  if (/Mac OS X|Macintosh/i.test(userAgent)) return "macOS";
  if (/Linux/i.test(userAgent)) return "Linux";
  return userAgent ? "Unknown" : undefined;
}

function getDeviceType(userAgent: string) {
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) return "Tablet";
  if (/mobi|android|iphone|ipod|blackberry|phone/i.test(userAgent)) return "Mobile";
  return userAgent ? "Desktop" : undefined;
}

function getCommentMetadata(request: RequestWithCloudflare) {
  const requestUrl = new URL(request.url);
  const host = request.headers.get("host") ?? requestUrl.host;
  const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(requestUrl.hostname) ||
    host.startsWith("localhost:") ||
    host.startsWith("127.0.0.1:");
  const userAgent = request.headers.get("user-agent") ?? "";
  const countryCode = getCloudflareCountryCode(request) ?? (isLocalhost ? "GH" : undefined);
  const continentCode = getCloudflareValue(request, "cf-ipcontinent", request.cf?.continent);
  const city = getCloudflareValue(request, "cf-ipcity", request.cf?.city);

  return {
    locationCity: city ?? (isLocalhost ? "Accra" : undefined),
    locationCountry: getCountryName(countryCode),
    locationCountryCode: countryCode,
    locationContinent: continentCode ? getContinentName(continentCode) : isLocalhost ? "Africa" : undefined,
    deviceType: getDeviceType(userAgent),
    browser: getBrowser(userAgent),
    os: getOS(userAgent),
  };
}

function toAttachmentItem(row: CommentAttachmentRow): CommentAttachmentItem {
  return {
    id: row.id,
    url: row.url,
    filename: row.filename,
    mimeType: row.mimeType,
    size: row.size,
  };
}

function toTreeItem(
  row: CommentRow,
  isBlocked = false,
  attachmentsByCommentId: Map<string, CommentAttachmentItem[]> = new Map(),
): CommentTreeItem {
  return {
    id: row.id,
    commentNumber: row.commentNumber,
    author: getAuthorName(row),
    authorEmail: row.authorEmail,
    authorProvider: row.authorProvider,
    date: formatRelativeDate(row.createdAt),
    content: row.body,
    likes: row.likesCount,
    replies: 0,
    avatar: getAvatar(row),
    isPinned: row.isPinned,
    status: row.status,
    classification: row.classification,
    isBlocked,
    locationCity: row.locationCity,
    locationCountry: row.locationCountry,
    locationCountryCode: row.locationCountryCode,
    locationContinent: row.locationContinent,
    deviceType: row.deviceType,
    browser: row.browser,
    os: row.os,
    attachments: attachmentsByCommentId.get(row.id) ?? [],
    children: [],
  };
}

function getReactionFallbackName(visitorId: string) {
  if (visitorId.startsWith("anonymous:")) return "Anonymous";
  if (visitorId.startsWith("github:")) return "GitHub user";
  if (visitorId.startsWith("google:")) return "Google user";
  return "User";
}

function getReactionFallbackAvatar(visitorId: string) {
  if (visitorId.startsWith("github:")) {
    return `https://avatars.githubusercontent.com/u/${encodeURIComponent(visitorId.slice("github:".length))}?v=4`;
  }

  return null;
}

function toReactionItem(
  row: CommentReactionRow,
  userById: Map<string, { name: string; image: string | null }> = new Map(),
): CommentReactionItem {
  const userId = row.visitorId.startsWith("user:") ? row.visitorId.slice("user:".length) : null;
  const matchedUser = userId ? userById.get(userId) : undefined;
  const name = row.visitorName ?? matchedUser?.name ?? getReactionFallbackName(row.visitorId);

  return {
    id: row.id,
    type: row.type,
    visitorId: row.visitorId,
    name,
    avatar:
      row.visitorAvatar ??
      matchedUser?.image ??
      getReactionFallbackAvatar(row.visitorId) ??
      `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(name)}`,
    date: formatRelativeDate(row.createdAt),
  };
}

function nestComments(
  rows: CommentRow[],
  rootParentId: string | null,
  attachmentsByCommentId: Map<string, CommentAttachmentItem[]> = new Map(),
) {
  const byId = new Map<string, CommentTreeItem>();
  const roots: CommentTreeItem[] = [];

  for (const row of rows) {
    byId.set(row.id, toTreeItem(row, false, attachmentsByCommentId));
  }

  for (const row of rows) {
    const item = byId.get(row.id);

    if (!item) continue;

    if (row.parentId && row.parentId !== rootParentId) {
      const parent = byId.get(row.parentId);

      if (parent) {
        parent.children.push(item);
        parent.replies = parent.children.length;
        continue;
      }
    }

    if (row.parentId === rootParentId) {
      roots.push(item);
    }
  }

  return roots;
}

function getPreview(body: string) {
  return body.length > 80 ? `${body.slice(0, 77)}...` : body;
}

async function getWorkspaceComment(workspaceId: string, id: string) {
  const existing = await db.query.comment.findFirst({
    where: (table, { and, eq }) => and(eq(table.id, id), eq(table.workspaceId, workspaceId)),
  });

  if (!existing) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Comment not found",
    });
  }

  return existing;
}

async function getNextPageCommentNumber(workspaceId: string, pageId: string) {
  const latest = await db.query.comment.findFirst({
    columns: {
      commentNumber: true,
    },
    where: (table, { and, eq, isNull }) =>
      and(
        eq(table.workspaceId, workspaceId),
        eq(table.pageId, pageId),
        isNull(table.parentId),
      ),
    orderBy: (table) => [desc(table.commentNumber)],
  });

  return (latest?.commentNumber ?? 0) + 1;
}

async function requireWorkspaceAdmin(
  session: NonNullable<Context["session"]>,
  workspaceId: string,
) {
  const membership = await db.query.member.findFirst({
    where: (table, { and, eq }) =>
      and(eq(table.organizationId, workspaceId), eq(table.userId, session.user.id)),
  });

  if (!membership || !["admin", "owner"].includes(membership.role)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin permission required",
    });
  }
}

export const commentsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const workspaceId = getActiveWorkspaceId(ctx.session);
    const [comments, pages] = await Promise.all([
      db.query.comment.findMany({
        where: (table, { and, eq, ne }) =>
          and(eq(table.workspaceId, workspaceId), ne(table.status, "deleted")),
        orderBy: (table) => [desc(table.isPinned), desc(table.updatedAt)],
      }),
      db.query.page.findMany({
        where: (table, { eq }) => eq(table.workspaceId, workspaceId),
      }),
    ]);
    const pageById = new Map(pages.map((item) => [item.id, item]));
    const repliesByParentId = new Map<string, number>();

    for (const item of comments) {
      if (item.parentId) {
        repliesByParentId.set(item.parentId, (repliesByParentId.get(item.parentId) ?? 0) + 1);
      }
    }

    return comments
      .filter((item) => !item.parentId)
      .map((item) => {
        const commentPage = pageById.get(item.pageId);

        return {
          id: item.id,
          commentNumber: item.commentNumber,
          commenter: getAuthorName(item),
          authorProvider: item.authorProvider,
          avatar: getAvatar(item),
          preview: getPreview(item.body),
          page: commentPage?.path ?? "Unknown page",
          pageUrl: commentPage?.url ?? null,
          likes: item.likesCount,
          replies: repliesByParentId.get(item.id) ?? 0,
          status: item.status,
          classification: item.classification,
          isPinned: item.isPinned,
          createdAt: item.createdAt.toISOString(),
          date: formatCommentDate(item.createdAt),
          lastActivity: formatRelativeDate(item.updatedAt),
        };
      });
  }),
  detail: protectedProcedure.input(commentIdInput).query(async ({ ctx, input }) => {
    const workspaceId = getActiveWorkspaceId(ctx.session);
    const selectedComment = await getWorkspaceComment(workspaceId, input.id);
    const [commentPage, pageComments, reactions] = await Promise.all([
      db.query.page.findFirst({
        where: (table, { and, eq }) =>
          and(eq(table.id, selectedComment.pageId), eq(table.workspaceId, workspaceId)),
      }),
      db.query.comment.findMany({
        where: (table, { and, eq, ne }) =>
          and(
            eq(table.pageId, selectedComment.pageId),
            eq(table.workspaceId, workspaceId),
            ne(table.status, "deleted"),
          ),
        orderBy: (table) => [desc(table.isPinned), desc(table.createdAt)],
      }),
      db.query.commentReaction.findMany({
        where: (table, { eq }) => eq(table.commentId, selectedComment.id),
        orderBy: (table) => [desc(table.createdAt)],
      }),
    ]);

    if (!commentPage) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Comment page not found",
      });
    }

    const reactionUserIds = reactions
      .map((reaction) => reaction.visitorId.startsWith("user:") ? reaction.visitorId.slice("user:".length) : null)
      .filter((id): id is string => Boolean(id));
    const reactionUsers = reactionUserIds.length > 0
      ? await db.query.user.findMany({
        where: (table, { inArray }) => inArray(table.id, reactionUserIds),
      })
      : [];
    const userById = new Map(reactionUsers.map((item) => [item.id, item]));
    const selectedCommentEmail = selectedComment.authorEmail?.toLowerCase() ?? null;
    const attachments = pageComments.length > 0
      ? await db.query.commentAttachment.findMany({
        where: (table) => inArray(table.commentId, pageComments.map((item) => item.id)),
      })
      : [];
    const attachmentsByCommentId = new Map<string, CommentAttachmentItem[]>();

    for (const attachment of attachments) {
      const items = attachmentsByCommentId.get(attachment.commentId) ?? [];
      items.push(toAttachmentItem(attachment));
      attachmentsByCommentId.set(attachment.commentId, items);
    }

    const blocked = selectedCommentEmail
      ? await db.query.blockedUser.findFirst({
        where: (table, { and, eq }) =>
          and(
            eq(table.workspaceId, workspaceId),
            eq(table.email, selectedCommentEmail),
          ),
      })
      : null;
    const replies = nestComments(pageComments, selectedComment.id, attachmentsByCommentId);

    return {
      comment: toTreeItem(selectedComment, Boolean(blocked), attachmentsByCommentId),
      page: {
        id: commentPage.id,
        title: commentPage.title,
        path: commentPage.path,
        url: commentPage.url,
      } satisfies Pick<PageRow, "id" | "title" | "path" | "url">,
      replies,
      reactions: reactions.map((reaction) => toReactionItem(reaction, userById)),
    };
  }),
  neighbors: protectedProcedure.input(commentIdInput).query(async ({ ctx, input }) => {
    const workspaceId = getActiveWorkspaceId(ctx.session);
    const selectedComment = await getWorkspaceComment(workspaceId, input.id);
    const rootComments = await db.query.comment.findMany({
      columns: {
        id: true,
      },
      where: (table, { and, eq, isNull, ne }) =>
        and(
          eq(table.workspaceId, workspaceId),
          isNull(table.parentId),
          ne(table.status, "deleted"),
        ),
      orderBy: (table) => [desc(table.isPinned), desc(table.updatedAt)],
    });
    const currentRootId = selectedComment.parentId ?? selectedComment.id;
    const currentIndex = rootComments.findIndex((item) => item.id === currentRootId);

    return {
      previousId: currentIndex > 0 ? rootComments[currentIndex - 1]?.id ?? null : null,
      nextId:
        currentIndex >= 0 && currentIndex < rootComments.length - 1
          ? rootComments[currentIndex + 1]?.id ?? null
          : null,
    };
  }),
  update: protectedProcedure.input(commentUpdateInput).mutation(async ({ ctx, input }) => {
    const workspaceId = getActiveWorkspaceId(ctx.session);

    await getWorkspaceComment(workspaceId, input.id);

    await db
      .update(comment)
      .set({
        body: input.body,
        updatedAt: new Date(),
      })
      .where(and(eq(comment.id, input.id), eq(comment.workspaceId, workspaceId)));

    return getWorkspaceComment(workspaceId, input.id);
  }),
  delete: protectedProcedure.input(commentIdInput).mutation(async ({ ctx, input }) => {
    const workspaceId = getActiveWorkspaceId(ctx.session);

    await requireWorkspaceAdmin(ctx.session, workspaceId);
    await getWorkspaceComment(workspaceId, input.id);

    await db
      .update(comment)
      .set({
        status: "deleted",
        updatedAt: new Date(),
      })
      .where(and(eq(comment.id, input.id), eq(comment.workspaceId, workspaceId)));

    return { id: input.id };
  }),
  pin: protectedProcedure.input(commentPinInput).mutation(async ({ ctx, input }) => {
    const workspaceId = getActiveWorkspaceId(ctx.session);

    await requireWorkspaceAdmin(ctx.session, workspaceId);
    await getWorkspaceComment(workspaceId, input.id);

    await db
      .update(comment)
      .set({
        isPinned: input.isPinned,
        updatedAt: new Date(),
      })
      .where(and(eq(comment.id, input.id), eq(comment.workspaceId, workspaceId)));

    return getWorkspaceComment(workspaceId, input.id);
  }),
  classify: protectedProcedure.input(commentClassifyInput).mutation(async ({ ctx, input }) => {
    const workspaceId = getActiveWorkspaceId(ctx.session);

    await requireWorkspaceAdmin(ctx.session, workspaceId);
    await getWorkspaceComment(workspaceId, input.id);

    await db
      .update(comment)
      .set({
        classification: input.classification,
        updatedAt: new Date(),
      })
      .where(and(eq(comment.id, input.id), eq(comment.workspaceId, workspaceId)));

    return getWorkspaceComment(workspaceId, input.id);
  }),
  reply: protectedProcedure.input(commentReplyInput).mutation(async ({ ctx, input }) => {
    const workspaceId = getActiveWorkspaceId(ctx.session);
    const parent = await getWorkspaceComment(workspaceId, input.id);
    const id = crypto.randomUUID();

    await db.insert(comment).values({
      id,
      workspaceId,
      pageId: parent.pageId,
      parentId: parent.id,
      authorName: ctx.session.user.name,
      authorEmail: ctx.session.user.email,
      authorImage: ctx.session.user.image,
      authorExternalId: ctx.session.user.id,
      authorProvider: "email",
      ...getCommentMetadata(ctx.request as RequestWithCloudflare),
      body: input.body,
      status: "visible",
    });

    await db
      .update(comment)
      .set({ updatedAt: new Date() })
      .where(and(eq(comment.id, parent.id), eq(comment.workspaceId, workspaceId)));

    return getWorkspaceComment(workspaceId, id);
  }),
  like: protectedProcedure.input(commentIdInput).mutation(async ({ ctx, input }) => {
    const workspaceId = getActiveWorkspaceId(ctx.session);

    await getWorkspaceComment(workspaceId, input.id);

    return toggleCommentLike({
      commentId: input.id,
      visitorId: `user:${ctx.session.user.id}`,
      visitorName: ctx.session.user.name,
      visitorAvatar: ctx.session.user.image,
    });
  }),
});
