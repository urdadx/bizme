import { env } from "@better-comments/env/server";
import { createClient } from "@libsql/client";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";

import * as schema from "./schema";
import { comment, commentReaction } from "./schema";

export function createDb() {
  const client = createClient({
    url: env.DATABASE_URL,
  });

  return drizzle({ client, schema });
}

export const db = createDb();

export async function updateCommentBody({
  id,
  workspaceId,
  body,
}: {
  id: string;
  workspaceId: string;
  body: string;
}) {
  await db
    .update(comment)
    .set({ body, updatedAt: new Date() })
    .where(and(eq(comment.id, id), eq(comment.workspaceId, workspaceId)));
}

export async function markCommentDeleted({
  id,
  workspaceId,
}: {
  id: string;
  workspaceId: string;
}) {
  await db
    .update(comment)
    .set({ status: "deleted", updatedAt: new Date() })
    .where(and(eq(comment.id, id), eq(comment.workspaceId, workspaceId)));
}

export async function toggleCommentLike({
  commentId,
  visitorId,
}: {
  commentId: string;
  visitorId: string;
}) {
  const existing = await db.query.commentReaction.findFirst({
    where: (table, { and, eq }) =>
      and(eq(table.commentId, commentId), eq(table.visitorId, visitorId), eq(table.type, "like")),
  });

  const liked = !existing;

  if (existing) {
    await db
      .delete(commentReaction)
      .where(and(eq(commentReaction.id, existing.id), eq(commentReaction.commentId, commentId)));
  } else {
    await db.insert(commentReaction).values({
      id: crypto.randomUUID(),
      commentId,
      visitorId,
      type: "like",
    });
  }

  const likes = await db.query.commentReaction.findMany({
    where: (table, { and, eq }) => and(eq(table.commentId, commentId), eq(table.type, "like")),
  });

  await db
    .update(comment)
    .set({ likesCount: likes.length, updatedAt: new Date() })
    .where(eq(comment.id, commentId));

  return { liked, likes: likes.length };
}
