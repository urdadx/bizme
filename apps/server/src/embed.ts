import { db, markCommentDeleted, toggleCommentLike, updateCommentBody } from "@better-comments/db";
import { comment, commentAttachment, page, poll, pollVote } from "@better-comments/db/schema/index";
import { env } from "@better-comments/env/server";
import { eq, inArray } from "drizzle-orm";
import { Hono } from "hono";
import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import { z } from "zod";

const DEFAULT_CUSTOMIZATION = {
  fontFamily: "inter",
  theme: "light",
  brandColor: "#6170F8",
  textColor: "#1F2937",
  hidePoweredBy: false,
  allowedDomains: [] as string[],
};

const DEFAULT_SETTINGS = {
  allowAnonymousComments: false,
  allowImageUploads: true,
  bannedWords: ["fuck", "nude", "crap"] as string[],
};

const EMBED_SESSION_COOKIE = "bizme_embed_session";
const EMBED_STATE_TTL_MS = 10 * 60 * 1000;
const EMBED_SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
const EMBED_SESSION_TTL_MS = EMBED_SESSION_TTL_SECONDS * 1000;

const commentsQuerySchema = z.object({
  installKey: z.string().min(1),
  pageUrl: z.string().url(),
  parentId: z.string().min(1).optional(),
});

const pollsQuerySchema = z.object({
  installKey: z.string().min(1),
  pollId: z.string().min(1).optional(),
  visitorId: z.string().min(1).optional(),
});

const votePollSchema = z.object({
  installKey: z.string().min(1),
  optionId: z.string().min(1),
  visitorId: z.string().min(1),
});

const createCommentSchema = z.object({
  installKey: z.string().min(1),
  pageUrl: z.string().url(),
  pageTitle: z.string().optional(),
  body: z.string().trim().min(1).max(5000),
  parentId: z.string().optional(),
  visitorId: z.string().min(1).optional(),
  authorName: z.string().trim().min(1).max(120).optional(),
  authorProvider: z.enum(["anonymous", "google", "github"]).default("anonymous"),
});

const updateCommentSchema = z.object({
  installKey: z.string().min(1),
  pageUrl: z.string().url(),
  body: z.string().trim().min(1).max(5000),
  visitorId: z.string().min(1).optional(),
  authorProvider: z.enum(["anonymous", "google", "github"]).default("anonymous"),
});

const deleteCommentSchema = z.object({
  installKey: z.string().min(1),
  pageUrl: z.string().url(),
  visitorId: z.string().min(1).optional(),
  authorProvider: z.enum(["anonymous", "google", "github"]).default("anonymous"),
});

const likeCommentSchema = z.object({
  installKey: z.string().min(1),
  pageUrl: z.string().url(),
  visitorId: z.string().min(1).optional(),
  authorProvider: z.enum(["anonymous", "google", "github"]).default("anonymous"),
});

type CommentRow = typeof comment.$inferSelect;
type CommentAttachmentRow = typeof commentAttachment.$inferSelect;

type PollRow = typeof poll.$inferSelect;

type EmbedCommentAttachment = {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
};

type EmbedComment = {
  id: string;
  author: string;
  authorProvider: CommentRow["authorProvider"];
  date: string;
  content: string;
  likes: number;
  replies: number;
  avatar: string | null;
  attachments: EmbedCommentAttachment[];
  children: EmbedComment[];
};

type EmbedPoll = {
  id: string;
  question: string;
  status: PollRow["status"];
  closesAt: string | null;
  totalVotes: number;
  selectedOptionId: string | null;
  options: {
    id: string;
    label: string;
    imageUrl: string | null;
    votes: number;
  }[];
};

type EmbedAuthProvider = "google" | "github";

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

type EmbedAuthState = {
  provider: EmbedAuthProvider;
  installKey: string;
  pageUrl?: string;
  createdAt: number;
};

function getCountryName(country: string | undefined) {
  if (!country) return undefined;

  if (country.length !== 2) return country;

  return new Intl.DisplayNames(["en"], { type: "region" }).of(country.toUpperCase()) ?? country;
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

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsBannedWord(body: string, bannedWords: string[]) {
  const normalizedBody = body.toLowerCase();

  return bannedWords.some((word) => {
    const normalizedWord = word.trim().toLowerCase();

    if (!normalizedWord) {
      return false;
    }

    const pattern = new RegExp(`(^|[^a-z0-9_])${escapeRegExp(normalizedWord)}(?=$|[^a-z0-9_])`, "i");
    return pattern.test(normalizedBody);
  });
}

function getDeviceType(userAgent: string) {
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) return "Tablet";
  if (/mobi|android|iphone|ipod|blackberry|phone/i.test(userAgent)) return "Mobile";
  return userAgent ? "Desktop" : undefined;
}

function getCommentMetadata(c: Context) {
  const request = c.req.raw as RequestWithCloudflare;
  const requestUrl = new URL(request.url);
  const host = c.req.header("host") ?? requestUrl.host;
  const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(requestUrl.hostname) ||
    host.startsWith("localhost:") ||
    host.startsWith("127.0.0.1:");
  const userAgent = c.req.header("user-agent") ?? "";
  const cfCountry = typeof request.cf?.country === "string" ? request.cf.country : undefined;
  const countryCode = (cfCountry ?? (isLocalhost ? "GH" : undefined))?.toUpperCase();
  const continentCode = typeof request.cf?.continent === "string" ? request.cf.continent : undefined;

  return {
    locationCity: typeof request.cf?.city === "string" ? request.cf.city : isLocalhost ? "Accra" : undefined,
    locationCountry: getCountryName(countryCode),
    locationCountryCode: countryCode,
    locationContinent: continentCode ? CONTINENT_NAMES[continentCode] ?? continentCode : isLocalhost ? "Africa" : undefined,
    deviceType: getDeviceType(userAgent),
    browser: getBrowser(userAgent),
  };
}

type EmbedAuthSession = {
  provider: EmbedAuthProvider;
  providerUserId: string;
  name: string;
  email: string | null;
  avatar: string | null;
  expiresAt: number;
};

type OAuthProfile = {
  id: string;
  name: string;
  email: string | null;
  avatar: string | null;
};

function jsonError(message: string, status: 400 | 401 | 403 | 404 | 501) {
  return { error: { message, status } };
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

async function signValue(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(env.BETTER_AUTH_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));

  return Buffer.from(signature).toString("base64url");
}

async function encodeSignedPayload(payload: unknown) {
  const encoded = base64UrlEncode(JSON.stringify(payload));
  const signature = await signValue(encoded);

  return `${encoded}.${signature}`;
}

async function decodeSignedPayload<T>(value: string | undefined) {
  if (!value) return null;

  const [encoded, signature] = value.split(".");

  if (!encoded || !signature) return null;

  const expectedSignature = await signValue(encoded);

  if (signature !== expectedSignature) return null;

  try {
    return JSON.parse(base64UrlDecode(encoded)) as T;
  } catch {
    return null;
  }
}

function getCookieOptions() {
  const secure = env.BETTER_AUTH_URL.startsWith("https://");

  return {
    httpOnly: true,
    sameSite: secure ? ("None" as const) : ("Lax" as const),
    secure,
    path: "/embed",
    maxAge: EMBED_SESSION_TTL_SECONDS,
  };
}

function getCookieValue(headers: Headers, name: string) {
  const cookieHeader = headers.get("cookie");

  if (!cookieHeader) return undefined;

  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

function getEmbedCallbackUrl(provider: EmbedAuthProvider) {
  return new URL(`/embed/auth/${provider}/callback`, env.BETTER_AUTH_URL).toString();
}

function renderPopupResponse(payload: { ok: boolean; message: string }) {
  const serialized = JSON.stringify({ type: "bizme:auth", ...payload });

  return `<!doctype html><html><head><title>Bizme auth</title></head><body><script>window.opener&&window.opener.postMessage(${serialized},"*");window.close();</script><p>${payload.message}</p></body></html>`;
}

function getPagePath(pageUrl: string) {
  const url = new URL(pageUrl);
  return `${url.pathname}${url.search}` || "/";
}

function getRequestHostname(headers: Headers) {
  const source = headers.get("origin") ?? headers.get("referer");

  if (!source) {
    return null;
  }

  try {
    return new URL(source).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function normalizeDomain(domain: string) {
  return domain
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    ?.toLowerCase();
}

async function getWorkspace(installKey: string) {
  return db.query.organization.findFirst({
    where: (table, { eq }) => eq(table.id, installKey),
  });
}

async function ensureAllowedOrigin(workspaceId: string, headers: Headers) {
  const [activeDomains, customization] = await Promise.all([
    db.query.workspaceDomain.findMany({
      where: (table, { and, eq }) =>
        and(eq(table.workspaceId, workspaceId), eq(table.status, "active")),
    }),
    db.query.workspaceCustomization.findFirst({
      where: (table, { eq }) => eq(table.workspaceId, workspaceId),
    }),
  ]);
  const allowedDomains = [
    ...activeDomains.map((domain) => domain.domain),
    ...(customization?.allowedDomains ?? []),
  ].filter(Boolean);

  if (allowedDomains.length === 0) {
    return true;
  }

  const hostname = getRequestHostname(headers);

  if (!hostname) {
    return false;
  }

  return allowedDomains.some((domain) => normalizeDomain(domain) === hostname);
}

async function getPublicConfig(workspaceId: string) {
  const [settings, customization] = await Promise.all([
    db.query.workspaceSettings.findFirst({
      where: (table, { eq }) => eq(table.workspaceId, workspaceId),
    }),
    db.query.workspaceCustomization.findFirst({
      where: (table, { eq }) => eq(table.workspaceId, workspaceId),
    }),
  ]);

  return {
    settings: {
      ...DEFAULT_SETTINGS,
      ...settings,
    },
    customization: {
      ...DEFAULT_CUSTOMIZATION,
      ...customization,
    },
  };
}

async function getOrCreatePage(workspaceId: string, pageUrl: string, pageTitle?: string) {
  const path = getPagePath(pageUrl);

  const existing = await db.query.page.findFirst({
    where: (table, { and, eq }) => and(eq(table.workspaceId, workspaceId), eq(table.path, path)),
  });

  if (existing) {
    return existing;
  }

  const id = crypto.randomUUID();

  await db.insert(page).values({
    id,
    workspaceId,
    path,
    title: pageTitle,
    url: pageUrl,
  });

  const created = await db.query.page.findFirst({
    where: (table, { eq }) => eq(table.id, id),
  });

  if (!created) {
    throw new Error("Unable to create page");
  }

  return created;
}

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

function toEmbedAttachment(row: CommentAttachmentRow): EmbedCommentAttachment {
  return {
    id: row.id,
    url: row.url,
    filename: row.filename,
    mimeType: row.mimeType,
    size: row.size,
  };
}

function toEmbedComment(
  row: CommentRow,
  attachmentsByCommentId: Map<string, EmbedCommentAttachment[]> = new Map(),
): EmbedComment {
  return {
    id: row.id,
    author: row.authorName ?? "Anonymous",
    authorProvider: row.authorProvider,
    date: formatRelativeDate(row.createdAt),
    content: row.body,
    likes: row.likesCount,
    replies: 0,
    avatar: getCommentAvatar(row),
    attachments: attachmentsByCommentId.get(row.id) ?? [],
    children: [],
  };
}

function getCommentAvatar(row: CommentRow) {
  if (row.authorImage) {
    return row.authorImage;
  }

  if (row.authorProvider === "github" && row.authorExternalId) {
    return `https://avatars.githubusercontent.com/u/${encodeURIComponent(row.authorExternalId)}?v=4`;
  }

  return null;
}

async function getEmbedSession(headers: Headers) {
  const session = await decodeSignedPayload<EmbedAuthSession>(
    getCookieValue(headers, EMBED_SESSION_COOKIE),
  );

  if (!session || session.expiresAt < Date.now()) {
    return null;
  }

  return session;
}

function canManageEmbedComment({
  row,
  embedSession,
  visitorId,
}: {
  row: CommentRow;
  embedSession: EmbedAuthSession | null;
  visitorId?: string;
}) {
  if (row.authorProvider === "anonymous") {
    return Boolean(row.authorVisitorId && visitorId && row.authorVisitorId === visitorId);
  }

  if (!embedSession || embedSession.provider !== row.authorProvider) {
    return false;
  }

  if (row.authorExternalId && embedSession.providerUserId === row.authorExternalId) {
    return true;
  }

  return Boolean(
    embedSession.email &&
    row.authorEmail &&
    embedSession.email.toLowerCase() === row.authorEmail.toLowerCase(),
  );
}

async function getManageableComment({
  installKey,
  pageUrl,
  commentId,
  headers,
  visitorId,
}: {
  installKey: string;
  pageUrl: string;
  commentId: string;
  headers: Headers;
  visitorId?: string;
}) {
  const workspace = await getWorkspace(installKey);

  if (!workspace) {
    return { error: jsonError("Invalid installKey", 404), status: 404 as const };
  }

  if (!(await ensureAllowedOrigin(workspace.id, headers))) {
    return {
      error: jsonError("Origin is not allowed for this workspace", 403),
      status: 403 as const,
    };
  }

  const row = await db.query.comment.findFirst({
    where: (table, { and, eq }) =>
      and(
        eq(table.id, commentId),
        eq(table.workspaceId, workspace.id),
        eq(table.status, "visible"),
      ),
  });

  if (!row) {
    return { error: jsonError("Comment not found", 404), status: 404 as const };
  }

  const commentPage = await db.query.page.findFirst({
    where: (table, { and, eq }) =>
      and(eq(table.id, row.pageId), eq(table.workspaceId, workspace.id)),
  });

  if (!commentPage || commentPage.path !== getPagePath(pageUrl)) {
    return { error: jsonError("Comment not found", 404), status: 404 as const };
  }

  const embedSession = await getEmbedSession(headers);

  if (!canManageEmbedComment({ row, embedSession, visitorId })) {
    return { error: jsonError("You can only manage your own comments", 403), status: 403 as const };
  }

  return { row, workspace };
}

async function getPageComment({
  installKey,
  pageUrl,
  commentId,
  headers,
}: {
  installKey: string;
  pageUrl: string;
  commentId: string;
  headers: Headers;
}) {
  const workspace = await getWorkspace(installKey);

  if (!workspace) {
    return { error: jsonError("Invalid installKey", 404), status: 404 as const };
  }

  if (!(await ensureAllowedOrigin(workspace.id, headers))) {
    return {
      error: jsonError("Origin is not allowed for this workspace", 403),
      status: 403 as const,
    };
  }

  const row = await db.query.comment.findFirst({
    where: (table, { and, eq }) =>
      and(
        eq(table.id, commentId),
        eq(table.workspaceId, workspace.id),
        eq(table.status, "visible"),
      ),
  });

  if (!row) {
    return { error: jsonError("Comment not found", 404), status: 404 as const };
  }

  const commentPage = await db.query.page.findFirst({
    where: (table, { and, eq }) =>
      and(eq(table.id, row.pageId), eq(table.workspaceId, workspace.id)),
  });

  if (!commentPage || commentPage.path !== getPagePath(pageUrl)) {
    return { error: jsonError("Comment not found", 404), status: 404 as const };
  }

  return { row, workspace, commentPage };
}

async function getEmbedVisitorKey({
  authorProvider,
  headers,
  visitorId,
}: {
  authorProvider: "anonymous" | "google" | "github";
  headers: Headers;
  visitorId?: string;
}) {
  if (authorProvider === "anonymous") {
    if (!visitorId) {
      return { error: jsonError("Missing anonymous visitorId", 401), status: 401 as const };
    }

    return { visitorKey: `anonymous:${visitorId}`, visitorName: "Anonymous", visitorAvatar: null };
  }

  const embedSession = await getEmbedSession(headers);

  if (!embedSession || embedSession.provider !== authorProvider) {
    return { error: jsonError("Login is required", 401), status: 401 as const };
  }

  const subject = embedSession.providerUserId ?? embedSession.email;

  if (!subject) {
    return { error: jsonError("Unable to identify commenter", 401), status: 401 as const };
  }

  return {
    visitorKey: `${authorProvider}:${subject}`,
    visitorName: embedSession.name,
    visitorAvatar: embedSession.avatar,
  };
}

function buildOAuthStartUrl(provider: EmbedAuthProvider, state: string) {
  const redirectUri = getEmbedCallbackUrl(provider);

  if (provider === "google") {
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", env.GOOGLE_CLIENT_ID);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("state", state);
    url.searchParams.set("prompt", "select_account");
    return url.toString();
  }

  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", "read:user user:email");
  url.searchParams.set("state", state);
  return url.toString();
}

async function fetchGoogleProfile(code: string): Promise<OAuthProfile> {
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: getEmbedCallbackUrl("google"),
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error("Unable to exchange Google authorization code.");
  }

  const tokenPayload = (await tokenResponse.json()) as { access_token?: string };

  if (!tokenPayload.access_token) {
    throw new Error("Google did not return an access token.");
  }

  const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${tokenPayload.access_token}` },
  });

  if (!profileResponse.ok) {
    throw new Error("Unable to load Google profile.");
  }

  const profile = (await profileResponse.json()) as {
    sub?: string;
    name?: string;
    email?: string;
    picture?: string;
  };

  if (!profile.sub) {
    throw new Error("Google profile did not include a user id.");
  }

  return {
    id: profile.sub,
    name: profile.name ?? profile.email ?? "Google user",
    email: profile.email ?? null,
    avatar: profile.picture ?? null,
  };
}

async function fetchGitHubProfile(code: string): Promise<OAuthProfile> {
  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: getEmbedCallbackUrl("github"),
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error("Unable to exchange GitHub authorization code.");
  }

  const tokenPayload = (await tokenResponse.json()) as { access_token?: string };

  if (!tokenPayload.access_token) {
    throw new Error("GitHub did not return an access token.");
  }

  const [profileResponse, emailsResponse] = await Promise.all([
    fetch("https://api.github.com/user", {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${tokenPayload.access_token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }),
    fetch("https://api.github.com/user/emails", {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${tokenPayload.access_token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }),
  ]);

  if (!profileResponse.ok) {
    throw new Error("Unable to load GitHub profile.");
  }

  const profile = (await profileResponse.json()) as {
    id?: number;
    name?: string | null;
    login?: string;
    email?: string | null;
    avatar_url?: string;
  };

  if (!profile.id) {
    throw new Error("GitHub profile did not include a user id.");
  }

  let email = profile.email ?? null;

  if (!email && emailsResponse.ok) {
    const emails = (await emailsResponse.json()) as Array<{
      email: string;
      primary: boolean;
      verified: boolean;
    }>;
    email =
      emails.find((item) => item.primary && item.verified)?.email ??
      emails.find((item) => item.verified)?.email ??
      null;
  }

  return {
    id: String(profile.id),
    name: profile.name ?? profile.login ?? email ?? "GitHub user",
    email,
    avatar: profile.avatar_url ?? null,
  };
}

async function fetchOAuthProfile(provider: EmbedAuthProvider, code: string) {
  return provider === "google" ? fetchGoogleProfile(code) : fetchGitHubProfile(code);
}

async function handleOAuthCallback(c: Context, provider: EmbedAuthProvider) {
  const code = c.req.query("code");
  const stateValue = c.req.query("state");
  const error = c.req.query("error");

  if (error) {
    return c.html(renderPopupResponse({ ok: false, message: `Login failed: ${error}` }), 400);
  }

  if (!code || !stateValue) {
    return c.html(renderPopupResponse({ ok: false, message: "Missing OAuth callback data." }), 400);
  }

  const state = await decodeSignedPayload<EmbedAuthState>(stateValue);

  if (!state || state.provider !== provider || Date.now() - state.createdAt > EMBED_STATE_TTL_MS) {
    return c.html(
      renderPopupResponse({ ok: false, message: "OAuth login expired. Try again." }),
      400,
    );
  }

  if (!(await getWorkspace(state.installKey))) {
    return c.html(renderPopupResponse({ ok: false, message: "Invalid widget install key." }), 404);
  }

  try {
    const profile = await fetchOAuthProfile(provider, code);
    const session = await encodeSignedPayload({
      provider,
      providerUserId: profile.id,
      name: profile.name,
      email: profile.email,
      avatar: profile.avatar,
      expiresAt: Date.now() + EMBED_SESSION_TTL_MS,
    } satisfies EmbedAuthSession);

    setCookie(c, EMBED_SESSION_COOKIE, session, getCookieOptions());

    return c.html(
      renderPopupResponse({ ok: true, message: "Login complete. You can close this window." }),
    );
  } catch (callbackError) {
    return c.html(
      renderPopupResponse({
        ok: false,
        message:
          callbackError instanceof Error ? callbackError.message : "Unable to complete login.",
      }),
      400,
    );
  }
}

async function getAttachmentsByCommentId(commentIds: string[]) {
  if (commentIds.length === 0) {
    return new Map<string, EmbedCommentAttachment[]>();
  }

  const rows = await db.query.commentAttachment.findMany({
    where: (table) => inArray(table.commentId, commentIds),
  });
  const attachmentsByCommentId = new Map<string, EmbedCommentAttachment[]>();

  for (const row of rows) {
    const items = attachmentsByCommentId.get(row.commentId) ?? [];
    items.push(toEmbedAttachment(row));
    attachmentsByCommentId.set(row.commentId, items);
  }

  return attachmentsByCommentId;
}

async function toEmbedPoll(row: PollRow, visitorId?: string): Promise<EmbedPoll> {
  const [options, votes] = await Promise.all([
    db.query.pollOption.findMany({
      where: (table, { eq }) => eq(table.pollId, row.id),
      orderBy: (table, { asc }) => asc(table.position),
    }),
    db.query.pollVote.findMany({
      where: (table, { eq }) => eq(table.pollId, row.id),
    }),
  ]);
  const votesByOptionId = new Map<string, number>();
  const selectedVote = visitorId ? votes.find((vote) => vote.visitorId === visitorId) : null;

  for (const vote of votes) {
    votesByOptionId.set(vote.optionId, (votesByOptionId.get(vote.optionId) ?? 0) + 1);
  }

  return {
    id: row.id,
    question: row.question,
    status: row.status,
    closesAt: row.closesAt?.toISOString() ?? null,
    totalVotes: votes.length,
    selectedOptionId: selectedVote?.optionId ?? null,
    options: options.map((option) => ({
      id: option.id,
      label: option.label,
      imageUrl: option.imageUrl,
      votes: votesByOptionId.get(option.id) ?? 0,
    })),
  };
}

function isPollOpen(row: PollRow) {
  return row.status === "active" && (!row.closesAt || row.closesAt > new Date());
}

function getCommentLevel(
  rows: CommentRow[],
  parentId?: string,
  attachmentsByCommentId: Map<string, EmbedCommentAttachment[]> = new Map(),
) {
  const replyCounts = new Map<string, number>();

  for (const row of rows) {
    if (row.parentId) {
      replyCounts.set(row.parentId, (replyCounts.get(row.parentId) ?? 0) + 1);
    }
  }

  return rows
    .filter((row) => (parentId ? row.parentId === parentId : !row.parentId))
    .map((row) => ({
      ...toEmbedComment(row, attachmentsByCommentId),
      replies: replyCounts.get(row.id) ?? 0,
      children: [],
    }));
}

export const embedRoutes = new Hono()
  .get("/config", async (c) => {
    const installKey = c.req.query("installKey");

    if (!installKey) {
      return c.json(jsonError("Missing installKey", 400), 400);
    }

    const workspace = await getWorkspace(installKey);

    if (!workspace) {
      return c.json(jsonError("Invalid installKey", 404), 404);
    }

    if (!(await ensureAllowedOrigin(workspace.id, c.req.raw.headers))) {
      return c.json(jsonError("Origin is not allowed for this workspace", 403), 403);
    }

    const config = await getPublicConfig(workspace.id);

    return c.json({
      workspace: {
        id: workspace.id,
        name: workspace.name,
        logo: workspace.logo,
      },
      ...config,
    });
  })
  .get("/comments", async (c) => {
    const result = commentsQuerySchema.safeParse({
      installKey: c.req.query("installKey"),
      pageUrl: c.req.query("pageUrl"),
      parentId: c.req.query("parentId") || undefined,
    });

    if (!result.success) {
      return c.json(jsonError("Invalid comments query", 400), 400);
    }

    const workspace = await getWorkspace(result.data.installKey);

    if (!workspace) {
      return c.json(jsonError("Invalid installKey", 404), 404);
    }

    if (!(await ensureAllowedOrigin(workspace.id, c.req.raw.headers))) {
      return c.json(jsonError("Origin is not allowed for this workspace", 403), 403);
    }

    const path = getPagePath(result.data.pageUrl);
    const existingPage = await db.query.page.findFirst({
      where: (table, { and, eq }) => and(eq(table.workspaceId, workspace.id), eq(table.path, path)),
    });

    if (!existingPage) {
      return c.json({ comments: [] });
    }

    const rows = await db.query.comment.findMany({
      where: (table, { and, eq }) =>
        and(eq(table.pageId, existingPage.id), eq(table.status, "visible")),
      orderBy: (table, { asc }) => asc(table.createdAt),
    });
    const attachmentsByCommentId = await getAttachmentsByCommentId(rows.map((row) => row.id));

    if (result.data.parentId && !rows.some((row) => row.id === result.data.parentId)) {
      return c.json(jsonError("Parent comment not found", 404), 404);
    }

    return c.json({ comments: getCommentLevel(rows, result.data.parentId, attachmentsByCommentId) });
  })
  .get("/polls", async (c) => {
    const result = pollsQuerySchema.safeParse({
      installKey: c.req.query("installKey"),
      pollId: c.req.query("pollId") || undefined,
      visitorId: c.req.query("visitorId") || undefined,
    });

    if (!result.success) {
      return c.json(jsonError("Invalid polls query", 400), 400);
    }

    const workspace = await getWorkspace(result.data.installKey);

    if (!workspace) {
      return c.json(jsonError("Invalid installKey", 404), 404);
    }

    if (!result.data.pollId && !(await ensureAllowedOrigin(workspace.id, c.req.raw.headers))) {
      return c.json(jsonError("Origin is not allowed for this workspace", 403), 403);
    }

    let targetPoll: PollRow | undefined;

    if (result.data.pollId) {
      targetPoll = await db.query.poll.findFirst({
        where: (table, { and, eq }) =>
          and(eq(table.id, result.data.pollId as string), eq(table.workspaceId, workspace.id)),
      }) ?? undefined;
    }

    if (!targetPoll) {
      return c.json({ poll: null });
    }

    return c.json({ poll: await toEmbedPoll(targetPoll, result.data.visitorId) });
  })
  .post("/polls/:id/vote", async (c) => {
    const body = await c.req.json().catch(() => null);
    const result = votePollSchema.safeParse(body);

    if (!result.success) {
      return c.json(jsonError("Invalid vote payload", 400), 400);
    }

    const workspace = await getWorkspace(result.data.installKey);

    if (!workspace) {
      return c.json(jsonError("Invalid installKey", 404), 404);
    }

    const targetPoll = await db.query.poll.findFirst({
      where: (table, { and, eq }) =>
        and(eq(table.id, c.req.param("id")), eq(table.workspaceId, workspace.id)),
    });

    if (!targetPoll) {
      return c.json(jsonError("Poll not found", 404), 404);
    }

    if (!isPollOpen(targetPoll)) {
      return c.json(jsonError("Poll is closed", 403), 403);
    }

    const targetOption = await db.query.pollOption.findFirst({
      where: (table, { and, eq }) =>
        and(eq(table.id, result.data.optionId), eq(table.pollId, targetPoll.id)),
    });

    if (!targetOption) {
      return c.json(jsonError("Poll option not found", 404), 404);
    }

    const existingVote = await db.query.pollVote.findFirst({
      where: (table, { and, eq }) =>
        and(eq(table.pollId, targetPoll.id), eq(table.visitorId, result.data.visitorId)),
    });
    const metadata = getCommentMetadata(c);

    if (existingVote) {
      await db
        .update(pollVote)
        .set({
          optionId: result.data.optionId,
          ...metadata,
        })
        .where(eq(pollVote.id, existingVote.id));
    } else {
      await db.insert(pollVote).values({
        id: crypto.randomUUID(),
        pollId: targetPoll.id,
        optionId: result.data.optionId,
        visitorId: result.data.visitorId,
        ...metadata,
      });
    }

    return c.json({ poll: await toEmbedPoll(targetPoll, result.data.visitorId) });
  })
  .post("/comments", async (c) => {
    const body = await c.req.json().catch(() => null);
    const result = createCommentSchema.safeParse(body);

    if (!result.success) {
      return c.json(jsonError("Invalid comment payload", 400), 400);
    }

    const workspace = await getWorkspace(result.data.installKey);

    if (!workspace) {
      return c.json(jsonError("Invalid installKey", 404), 404);
    }

    if (!(await ensureAllowedOrigin(workspace.id, c.req.raw.headers))) {
      return c.json(jsonError("Origin is not allowed for this workspace", 403), 403);
    }

    const config = await getPublicConfig(workspace.id);

    const embedSession = await getEmbedSession(c.req.raw.headers);

    if (result.data.authorProvider === "anonymous") {
      if (!config.settings.allowAnonymousComments) {
        return c.json(jsonError("Anonymous comments are disabled", 403), 403);
      }

      if (!result.data.visitorId) {
        return c.json(jsonError("Missing anonymous visitorId", 401), 401);
      }
    } else if (!embedSession || embedSession.provider !== result.data.authorProvider) {
      return c.json(jsonError("Login is required to comment", 401), 401);
    }

    if (embedSession?.email) {
      const blocked = await db.query.blockedUser.findFirst({
        where: (table, { and, eq }) =>
          and(eq(table.workspaceId, workspace.id), eq(table.email, embedSession.email!.toLowerCase())),
      });

      if (blocked) {
        return c.json(jsonError("This commenter is blocked", 403), 403);
      }
    }

    const commentPage = await getOrCreatePage(
      workspace.id,
      result.data.pageUrl,
      result.data.pageTitle,
    );

    if (result.data.parentId) {
      const parent = await db.query.comment.findFirst({
        where: (table, { and, eq }) =>
          and(
            eq(table.id, result.data.parentId as string),
            eq(table.workspaceId, workspace.id),
            eq(table.pageId, commentPage.id),
            eq(table.status, "visible"),
          ),
      });

      if (!parent) {
        return c.json(jsonError("Parent comment not found", 404), 404);
      }
    }

    const id = crypto.randomUUID();
    const metadata = getCommentMetadata(c);
    const hasBannedWord = containsBannedWord(result.data.body, config.settings.bannedWords);
    const status = hasBannedWord ? "pending" : "visible";

    await db.insert(comment).values({
      id,
      workspaceId: workspace.id,
      pageId: commentPage.id,
      parentId: result.data.parentId,
      authorName: embedSession?.name ?? result.data.authorName ?? "Anonymous",
      authorEmail: embedSession?.email,
      authorImage: embedSession?.avatar,
      authorExternalId: embedSession?.providerUserId,
      authorVisitorId:
        result.data.authorProvider === "anonymous" ? result.data.visitorId : undefined,
      authorProvider: result.data.authorProvider,
      ...metadata,
      body: result.data.body,
      status,
      classification: hasBannedWord ? "spam" : "legitimate",
    });

    const created = await db.query.comment.findFirst({
      where: (table, { eq }) => eq(table.id, id),
    });

    if (!created) {
      return c.json(jsonError("Unable to create comment", 400), 400);
    }

    return c.json({ comment: toEmbedComment(created) }, 201);
  })
  .post("/comments/:id/like", async (c) => {
    const body = await c.req.json().catch(() => null);
    const result = likeCommentSchema.safeParse(body);

    if (!result.success) {
      return c.json(jsonError("Invalid like payload", 400), 400);
    }

    const target = await getPageComment({
      installKey: result.data.installKey,
      pageUrl: result.data.pageUrl,
      commentId: c.req.param("id"),
      headers: c.req.raw.headers,
    });

    if ("error" in target) {
      return c.json(target.error, target.status);
    }

    const visitor = await getEmbedVisitorKey({
      authorProvider: result.data.authorProvider,
      headers: c.req.raw.headers,
      visitorId: result.data.visitorId,
    });

    if ("error" in visitor) {
      return c.json(visitor.error, visitor.status);
    }

    return c.json(
      await toggleCommentLike({
        commentId: target.row.id,
        visitorId: visitor.visitorKey,
        visitorName: visitor.visitorName,
        visitorAvatar: visitor.visitorAvatar,
      }),
    );
  })
  .patch("/comments/:id", async (c) => {
    const body = await c.req.json().catch(() => null);
    const result = updateCommentSchema.safeParse(body);

    if (!result.success) {
      return c.json(jsonError("Invalid comment payload", 400), 400);
    }

    const manageable = await getManageableComment({
      installKey: result.data.installKey,
      pageUrl: result.data.pageUrl,
      commentId: c.req.param("id"),
      headers: c.req.raw.headers,
      visitorId: result.data.visitorId,
    });

    if ("error" in manageable) {
      return c.json(manageable.error, manageable.status);
    }

    await updateCommentBody({
      id: manageable.row.id,
      workspaceId: manageable.workspace.id,
      body: result.data.body,
    });

    const updated = await db.query.comment.findFirst({
      where: (table, { eq }) => eq(table.id, manageable.row.id),
    });

    if (!updated) {
      return c.json(jsonError("Unable to update comment", 400), 400);
    }

    const attachmentsByCommentId = await getAttachmentsByCommentId([updated.id]);

    return c.json({ comment: toEmbedComment(updated, attachmentsByCommentId) });
  })
  .delete("/comments/:id", async (c) => {
    const body = await c.req.json().catch(() => null);
    const result = deleteCommentSchema.safeParse(body);

    if (!result.success) {
      return c.json(jsonError("Invalid comment payload", 400), 400);
    }

    const manageable = await getManageableComment({
      installKey: result.data.installKey,
      pageUrl: result.data.pageUrl,
      commentId: c.req.param("id"),
      headers: c.req.raw.headers,
      visitorId: result.data.visitorId,
    });

    if ("error" in manageable) {
      return c.json(manageable.error, manageable.status);
    }

    await markCommentDeleted({
      id: manageable.row.id,
      workspaceId: manageable.workspace.id,
    });

    return c.json({ id: manageable.row.id });
  })
  .post("/auth/anonymous", (c) => {
    return c.json({
      visitorId: crypto.randomUUID(),
      provider: "anonymous",
    });
  })
  .get("/auth/session", async (c) => {
    const session = await getEmbedSession(c.req.raw.headers);

    return c.json({ session });
  })
  .get("/auth/google/start", async (c) => {
    const installKey = c.req.query("installKey");

    if (!installKey) {
      return c.json(jsonError("Missing installKey", 400), 400);
    }

    if (!(await getWorkspace(installKey))) {
      return c.json(jsonError("Invalid installKey", 404), 404);
    }

    const state = await encodeSignedPayload({
      provider: "google",
      installKey,
      pageUrl: c.req.query("pageUrl"),
      createdAt: Date.now(),
    } satisfies EmbedAuthState);

    return c.redirect(buildOAuthStartUrl("google", state));
  })
  .get("/auth/github/start", async (c) => {
    const installKey = c.req.query("installKey");

    if (!installKey) {
      return c.json(jsonError("Missing installKey", 400), 400);
    }

    if (!(await getWorkspace(installKey))) {
      return c.json(jsonError("Invalid installKey", 404), 404);
    }

    const state = await encodeSignedPayload({
      provider: "github",
      installKey,
      pageUrl: c.req.query("pageUrl"),
      createdAt: Date.now(),
    } satisfies EmbedAuthState);

    return c.redirect(buildOAuthStartUrl("github", state));
  })
  .get("/auth/google/callback", async (c) => {
    return handleOAuthCallback(c, "google");
  })
  .get("/auth/github/callback", async (c) => {
    return handleOAuthCallback(c, "github");
  });
