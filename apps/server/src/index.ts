import { createContext } from "@better-comments/api/context";
import { appRouter } from "@better-comments/api/routers/index";
import { auth } from "@better-comments/auth";
import { db } from "@better-comments/db";
import { comment, commentAttachment, pollOption } from "@better-comments/db/schema/index";
import { env } from "@better-comments/env/server";
import { trpcServer } from "@hono/trpc-server";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

import { canManageEmbedComment, embedRoutes, getEmbedSession } from "./embed";

const app = new Hono();
const MAX_COMMENT_IMAGE_SIZE = 2 * 1024 * 1024;
const COMMENT_IMAGE_UPLOAD_DIR = join(process.cwd(), "uploads", "comment-images");
const POLL_OPTION_IMAGE_UPLOAD_DIR = join(process.cwd(), "uploads", "poll-option-images");
const COMMENT_IMAGE_MIME_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

function getPublicUploadUrl(requestUrl: string, path: string, filename: string) {
  const url = new URL(requestUrl);
  return `${url.origin}/uploads/${path}/${filename}`;
}

async function requireWorkspaceAdmin(headers: Headers, workspaceId: string) {
  const session = await auth.api.getSession({ headers });

  if (!session) {
    return null;
  }

  const membership = await db.query.member.findFirst({
    where: (table, { and, eq }) =>
      and(eq(table.organizationId, workspaceId), eq(table.userId, session.user.id)),
  });

  if (!membership || !["admin", "owner"].includes(membership.role)) {
    return null;
  }

  return session;
}

app.use(logger());
app.use(
  "/*",
  cors({
    origin: (origin, c) => {
      if (c.req.path.startsWith("/embed/")) {
        return origin;
      }

      return env.CORS_ORIGIN;
    },
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Bizme-Visitor-Id"],
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.route("/embed", embedRoutes);

app.get("/uploads/comment-images/:filename", async (c) => {
  const filename = c.req.param("filename");

  if (!/^[a-f0-9-]+\.(jpg|png|webp|gif)$/.test(filename)) {
    return c.text("Not found", 404);
  }

  const file = Bun.file(join(COMMENT_IMAGE_UPLOAD_DIR, filename));

  if (!(await file.exists())) {
    return c.text("Not found", 404);
  }

  return new Response(file);
});

app.get("/uploads/poll-option-images/:filename", async (c) => {
  const filename = c.req.param("filename");

  if (!/^[a-f0-9-]+\.(jpg|png|webp|gif)$/.test(filename)) {
    return c.text("Not found", 404);
  }

  const file = Bun.file(join(POLL_OPTION_IMAGE_UPLOAD_DIR, filename));

  if (!(await file.exists())) {
    return c.text("Not found", 404);
  }

  return new Response(file);
});

app.post("/comment-attachments", async (c) => {
  const formData = await c.req.formData().catch(() => null);
  const commentId = formData?.get("commentId");

  if (!formData || typeof commentId !== "string" || !commentId) {
    return c.json({ error: { message: "Invalid attachment payload" } }, 400);
  }

  const targetComment = await db.query.comment.findFirst({
    where: (table, { eq }) => eq(table.id, commentId),
  });

  if (!targetComment) {
    return c.json({ error: { message: "Comment not found" } }, 404);
  }

  const adminSession = await requireWorkspaceAdmin(c.req.raw.headers, targetComment.workspaceId);
  const embedSession = await getEmbedSession(c.req.raw.headers);
  const canManageComment = canManageEmbedComment({
    row: targetComment,
    embedSession,
    visitorId: c.req.header("X-Bizme-Visitor-Id"),
  });

  if (!adminSession && !canManageComment) {
    return c.json({ error: { message: "Admin permission required" } }, 403);
  }

  const files = formData.getAll("images").filter((item): item is File => item instanceof File);

  if (files.length === 0) {
    return c.json({ attachments: [] });
  }

  await mkdir(COMMENT_IMAGE_UPLOAD_DIR, { recursive: true });

  const attachments = [];

  for (const file of files) {
    const extension = COMMENT_IMAGE_MIME_TYPES.get(file.type);

    if (!extension) {
      return c.json({ error: { message: `${file.name} is not a supported image.` } }, 400);
    }

    if (file.size > MAX_COMMENT_IMAGE_SIZE) {
      return c.json({ error: { message: `${file.name} is larger than 2 MB.` } }, 400);
    }

    const id = crypto.randomUUID();
    const filename = `${id}.${extension}`;
    const url = getPublicUploadUrl(c.req.url, "comment-images", filename);

    await Bun.write(join(COMMENT_IMAGE_UPLOAD_DIR, filename), file);
    await db.insert(commentAttachment).values({
      id,
      commentId,
      url,
      filename: file.name,
      mimeType: file.type,
      size: file.size,
    });

    attachments.push({
      id,
      url,
      filename: file.name,
      mimeType: file.type,
      size: file.size,
    });
  }

  await db
    .update(comment)
    .set({ updatedAt: new Date() })
    .where(and(eq(comment.id, commentId), eq(comment.workspaceId, targetComment.workspaceId)));

  return c.json({ attachments }, 201);
});

app.post("/poll-option-images", async (c) => {
  const formData = await c.req.formData().catch(() => null);
  const optionId = formData?.get("optionId");
  const file = formData?.get("image");

  if (!formData || typeof optionId !== "string" || !optionId || !(file instanceof File)) {
    return c.json({ error: { message: "Invalid poll option image payload" } }, 400);
  }

  const targetOption = await db.query.pollOption.findFirst({
    where: (table, { eq }) => eq(table.id, optionId),
  });

  if (!targetOption) {
    return c.json({ error: { message: "Poll option not found" } }, 404);
  }

  const targetPoll = await db.query.poll.findFirst({
    where: (table, { eq }) => eq(table.id, targetOption.pollId),
  });

  if (!targetPoll) {
    return c.json({ error: { message: "Poll not found" } }, 404);
  }

  if (!(await requireWorkspaceAdmin(c.req.raw.headers, targetPoll.workspaceId))) {
    return c.json({ error: { message: "Admin permission required" } }, 403);
  }

  const extension = COMMENT_IMAGE_MIME_TYPES.get(file.type);

  if (!extension) {
    return c.json({ error: { message: `${file.name} is not a supported image.` } }, 400);
  }

  if (file.size > MAX_COMMENT_IMAGE_SIZE) {
    return c.json({ error: { message: `${file.name} is larger than 2 MB.` } }, 400);
  }

  await mkdir(POLL_OPTION_IMAGE_UPLOAD_DIR, { recursive: true });

  const id = crypto.randomUUID();
  const filename = `${id}.${extension}`;
  const url = getPublicUploadUrl(c.req.url, "poll-option-images", filename);

  await Bun.write(join(POLL_OPTION_IMAGE_UPLOAD_DIR, filename), file);
  await db.update(pollOption).set({ imageUrl: url }).where(eq(pollOption.id, optionId));

  return c.json({ url }, 201);
});

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext: (_opts, context) => {
      return createContext({ context });
    },
  }),
);

app.get("/", (c) => {
  return c.text("OK");
});

export default app;
