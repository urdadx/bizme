import { db } from "@better-comments/db";
import { blockedUser } from "@better-comments/db/schema/index";
import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import type { Context } from "../context";
import { protectedProcedure, router } from "../index";
import { getActiveWorkspaceId } from "./utils";

const blockUserInput = z.object({
  name: z.string().trim().min(1).max(120).nullable().optional(),
  email: z.string().trim().email(),
  reason: z.string().trim().max(500).nullable().optional(),
});

const unblockUserInput = z.object({
  email: z.string().trim().email(),
});

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
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

export const blockedUsersRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const workspaceId = getActiveWorkspaceId(ctx.session);
    const rows = await db.query.blockedUser.findMany({
      where: (table, { eq }) => eq(table.workspaceId, workspaceId),
      orderBy: (table) => [desc(table.createdAt)],
    });

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      reason: row.reason,
      createdAt: row.createdAt,
      joinedAt: `Blocked on ${formatDate(row.createdAt)}`,
    }));
  }),
  candidates: protectedProcedure.query(async ({ ctx }) => {
    const workspaceId = getActiveWorkspaceId(ctx.session);

    await requireWorkspaceAdmin(ctx.session, workspaceId);

    const [comments, blockedUsers] = await Promise.all([
      db.query.comment.findMany({
        where: (table, { and, eq, ne }) =>
          and(
            eq(table.workspaceId, workspaceId),
            ne(table.status, "deleted"),
          ),
        orderBy: (table) => [desc(table.updatedAt)],
      }),
      db.query.blockedUser.findMany({
        where: (table, { eq }) => eq(table.workspaceId, workspaceId),
      }),
    ]);
    const blockedEmails = new Set(blockedUsers.map((user) => user.email.toLowerCase()));
    const candidateByEmail = new Map<
      string,
      { name: string | null; email: string; commentsCount: number; lastCommentAt: Date }
    >();

    for (const comment of comments) {
      const email = comment.authorEmail?.trim().toLowerCase();

      if (!email || blockedEmails.has(email)) {
        continue;
      }

      const existing = candidateByEmail.get(email);

      if (existing) {
        existing.commentsCount += 1;
        if (comment.updatedAt > existing.lastCommentAt) {
          existing.lastCommentAt = comment.updatedAt;
          existing.name = comment.authorName;
        }
        continue;
      }

      candidateByEmail.set(email, {
        name: comment.authorName,
        email,
        commentsCount: 1,
        lastCommentAt: comment.updatedAt,
      });
    }

    return Array.from(candidateByEmail.values()).map((candidate) => ({
      name: candidate.name,
      email: candidate.email,
      commentsCount: candidate.commentsCount,
      lastComment: `Last commented ${formatDate(candidate.lastCommentAt)}`,
    }));
  }),
  block: protectedProcedure.input(blockUserInput).mutation(async ({ ctx, input }) => {
    const workspaceId = getActiveWorkspaceId(ctx.session);
    const email = normalizeEmail(input.email);

    await requireWorkspaceAdmin(ctx.session, workspaceId);

    const existing = await db.query.blockedUser.findFirst({
      where: (table, { and, eq }) => and(eq(table.workspaceId, workspaceId), eq(table.email, email)),
    });

    if (existing) {
      return existing;
    }

    await db.insert(blockedUser).values({
      id: crypto.randomUUID(),
      workspaceId,
      name: input.name?.trim() || null,
      email,
      reason: input.reason?.trim() || null,
    });

    const created = await db.query.blockedUser.findFirst({
      where: (table, { and, eq }) => and(eq(table.workspaceId, workspaceId), eq(table.email, email)),
    });

    if (!created) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Unable to block user",
      });
    }

    return created;
  }),
  unblock: protectedProcedure.input(unblockUserInput).mutation(async ({ ctx, input }) => {
    const workspaceId = getActiveWorkspaceId(ctx.session);
    const email = normalizeEmail(input.email);

    await requireWorkspaceAdmin(ctx.session, workspaceId);
    await db
      .delete(blockedUser)
      .where(and(eq(blockedUser.workspaceId, workspaceId), eq(blockedUser.email, email)));

    return { email };
  }),
});
