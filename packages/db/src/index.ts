import { env } from "@better-comments/env/server";
import { createClient } from "@libsql/client";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";

import * as schema from "./schema";
import { comment, commentReaction } from "./schema";

export const client = createClient({
  url: env.DATABASE_URL,
});

export function createDb() {
  return drizzle({ client, schema });
}

export const db = createDb();

const authSchemaStatements = [
  `CREATE TABLE IF NOT EXISTS user (
    id text PRIMARY KEY NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    email_verified integer DEFAULT false NOT NULL,
    image text,
    created_at integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
    updated_at integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS user_email_unique ON user (email)`,
  `CREATE TABLE IF NOT EXISTS organization (
    id text PRIMARY KEY NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    logo text,
    metadata text,
    website_url text DEFAULT '' NOT NULL,
    created_at integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
    updated_at integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS organization_slug_unique ON organization (slug)`,
  `CREATE INDEX IF NOT EXISTS organization_slug_idx ON organization (slug)`,
  `CREATE TABLE IF NOT EXISTS session (
    id text PRIMARY KEY NOT NULL,
    expires_at integer NOT NULL,
    token text NOT NULL,
    created_at integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
    updated_at integer NOT NULL,
    ip_address text,
    user_agent text,
    user_id text NOT NULL,
    active_organization_id text,
    is_onboarded integer DEFAULT false NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (active_organization_id) REFERENCES organization(id) ON UPDATE no action ON DELETE set null
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS session_token_unique ON session (token)`,
  `CREATE INDEX IF NOT EXISTS session_userId_idx ON session (user_id)`,
  `CREATE TABLE IF NOT EXISTS account (
    id text PRIMARY KEY NOT NULL,
    account_id text NOT NULL,
    provider_id text NOT NULL,
    user_id text NOT NULL,
    access_token text,
    refresh_token text,
    id_token text,
    access_token_expires_at integer,
    refresh_token_expires_at integer,
    scope text,
    password text,
    created_at integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
    updated_at integer NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id) ON UPDATE no action ON DELETE cascade
  )`,
  `CREATE INDEX IF NOT EXISTS account_userId_idx ON account (user_id)`,
  `CREATE TABLE IF NOT EXISTS member (
    id text PRIMARY KEY NOT NULL,
    organization_id text NOT NULL,
    user_id text NOT NULL,
    role text DEFAULT 'member' NOT NULL,
    created_at integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
    FOREIGN KEY (organization_id) REFERENCES organization(id) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (user_id) REFERENCES user(id) ON UPDATE no action ON DELETE cascade
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS member_organizationId_userId_unique ON member (organization_id, user_id)`,
  `CREATE INDEX IF NOT EXISTS member_organizationId_idx ON member (organization_id)`,
  `CREATE INDEX IF NOT EXISTS member_userId_idx ON member (user_id)`,
  `CREATE TABLE IF NOT EXISTS invitation (
    id text PRIMARY KEY NOT NULL,
    organization_id text NOT NULL,
    email text NOT NULL,
    role text DEFAULT 'member' NOT NULL,
    status text DEFAULT 'pending' NOT NULL,
    expires_at integer NOT NULL,
    inviter_id text NOT NULL,
    created_at integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
    FOREIGN KEY (organization_id) REFERENCES organization(id) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (inviter_id) REFERENCES user(id) ON UPDATE no action ON DELETE cascade
  )`,
  `CREATE INDEX IF NOT EXISTS invitation_organizationId_idx ON invitation (organization_id)`,
  `CREATE INDEX IF NOT EXISTS invitation_email_idx ON invitation (email)`,
  `CREATE TABLE IF NOT EXISTS verification (
    id text PRIMARY KEY NOT NULL,
    identifier text NOT NULL,
    value text NOT NULL,
    expires_at integer NOT NULL,
    created_at integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
    updated_at integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS verification_identifier_idx ON verification (identifier)`,
];

export async function ensureAuthSchema() {
  for (const statement of authSchemaStatements) {
    await client.execute(statement);
  }
}

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

export async function markCommentDeleted({ id, workspaceId }: { id: string; workspaceId: string }) {
  await db
    .update(comment)
    .set({ status: "deleted", updatedAt: new Date() })
    .where(and(eq(comment.id, id), eq(comment.workspaceId, workspaceId)));
}

export async function toggleCommentLike({
  commentId,
  visitorId,
  visitorName,
  visitorAvatar,
}: {
  commentId: string;
  visitorId: string;
  visitorName?: string | null;
  visitorAvatar?: string | null;
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
      visitorName,
      visitorAvatar,
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
