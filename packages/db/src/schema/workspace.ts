import { relations, sql } from "drizzle-orm";
import {
  type AnySQLiteColumn,
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

import { organization } from "./auth";

export const workspaceDomainStatuses = ["pending", "active", "failed"] as const;
export const commentStatuses = ["visible", "pending", "hidden", "deleted"] as const;
export const commentAuthorProviders = ["anonymous", "google", "github", "email"] as const;
export const pollStatuses = ["draft", "active", "closed"] as const;

export const workspaceSettings = sqliteTable("workspace_settings", {
  workspaceId: text("workspace_id")
    .primaryKey()
    .references(() => organization.id, { onDelete: "cascade" }),
  allowAnonymousComments: integer("allow_anonymous_comments", { mode: "boolean" })
    .default(false)
    .notNull(),
  allowImageUploads: integer("allow_image_uploads", { mode: "boolean" }).default(true).notNull(),
  bannedWords: text("banned_words", { mode: "json" })
    .$type<string[]>()
    .default(sql`'[]'`)
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const workspaceCustomization = sqliteTable("workspace_customization", {
  workspaceId: text("workspace_id")
    .primaryKey()
    .references(() => organization.id, { onDelete: "cascade" }),
  fontFamily: text("font_family").default("inter").notNull(),
  theme: text("theme").default("light").notNull(),
  brandColor: text("brand_color").default("#6170F8").notNull(),
  textColor: text("text_color").default("#1F2937").notNull(),
  hidePoweredBy: integer("hide_powered_by", { mode: "boolean" }).default(false).notNull(),
  allowedDomains: text("allowed_domains", { mode: "json" })
    .$type<string[]>()
    .default(sql`'[]'`)
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const workspaceDomain = sqliteTable(
  "workspace_domain",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    domain: text("domain").notNull(),
    status: text("status", { enum: workspaceDomainStatuses }).default("pending").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("workspace_domain_domain_unique").on(table.domain),
    index("workspace_domain_workspaceId_idx").on(table.workspaceId),
  ],
);

export const blockedUser = sqliteTable(
  "blocked_user",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name"),
    email: text("email").notNull(),
    reason: text("reason"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("blocked_user_workspaceId_email_unique").on(table.workspaceId, table.email),
    index("blocked_user_workspaceId_idx").on(table.workspaceId),
  ],
);

export const page = sqliteTable(
  "page",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    path: text("path").notNull(),
    title: text("title"),
    url: text("url").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("page_workspaceId_path_unique").on(table.workspaceId, table.path),
    index("page_workspaceId_idx").on(table.workspaceId),
  ],
);

export const comment = sqliteTable(
  "comment",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    pageId: text("page_id")
      .notNull()
      .references(() => page.id, { onDelete: "cascade" }),
    parentId: text("parent_id").references((): AnySQLiteColumn => comment.id, {
      onDelete: "cascade",
    }),
    authorName: text("author_name"),
    authorEmail: text("author_email"),
    authorImage: text("author_image"),
    authorExternalId: text("author_external_id"),
    authorVisitorId: text("author_visitor_id"),
    authorProvider: text("author_provider", { enum: commentAuthorProviders })
      .default("anonymous")
      .notNull(),
    locationCity: text("location_city"),
    locationCountry: text("location_country"),
    locationCountryCode: text("location_country_code"),
    locationContinent: text("location_continent"),
    deviceType: text("device_type"),
    browser: text("browser"),
    body: text("body").notNull(),
    status: text("status", { enum: commentStatuses }).default("visible").notNull(),
    isPinned: integer("is_pinned", { mode: "boolean" }).default(false).notNull(),
    likesCount: integer("likes_count").default(0).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("comment_workspaceId_idx").on(table.workspaceId),
    index("comment_pageId_idx").on(table.pageId),
    index("comment_parentId_idx").on(table.parentId),
    index("comment_status_idx").on(table.status),
  ],
);

export const commentReaction = sqliteTable(
  "comment_reaction",
  {
    id: text("id").primaryKey(),
    commentId: text("comment_id")
      .notNull()
      .references(() => comment.id, { onDelete: "cascade" }),
    type: text("type").default("like").notNull(),
    visitorId: text("visitor_id").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("comment_reaction_commentId_visitorId_type_unique").on(
      table.commentId,
      table.visitorId,
      table.type,
    ),
    index("comment_reaction_commentId_idx").on(table.commentId),
  ],
);

export const poll = sqliteTable(
  "poll",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    pageId: text("page_id")
      .notNull()
      .references(() => page.id, { onDelete: "cascade" }),
    question: text("question").notNull(),
    status: text("status", { enum: pollStatuses }).default("draft").notNull(),
    closesAt: integer("closes_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("poll_workspaceId_idx").on(table.workspaceId),
    index("poll_pageId_idx").on(table.pageId),
    index("poll_status_idx").on(table.status),
  ],
);

export const pollOption = sqliteTable(
  "poll_option",
  {
    id: text("id").primaryKey(),
    pollId: text("poll_id")
      .notNull()
      .references(() => poll.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    imageUrl: text("image_url"),
    position: integer("position").default(0).notNull(),
  },
  (table) => [index("poll_option_pollId_idx").on(table.pollId)],
);

export const pollVote = sqliteTable(
  "poll_vote",
  {
    id: text("id").primaryKey(),
    pollId: text("poll_id")
      .notNull()
      .references(() => poll.id, { onDelete: "cascade" }),
    optionId: text("option_id")
      .notNull()
      .references(() => pollOption.id, { onDelete: "cascade" }),
    visitorId: text("visitor_id").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("poll_vote_pollId_visitorId_unique").on(table.pollId, table.visitorId),
    index("poll_vote_pollId_idx").on(table.pollId),
    index("poll_vote_optionId_idx").on(table.optionId),
  ],
);

export const workspaceSettingsRelations = relations(workspaceSettings, ({ one }) => ({
  workspace: one(organization, {
    fields: [workspaceSettings.workspaceId],
    references: [organization.id],
  }),
}));

export const workspaceCustomizationRelations = relations(workspaceCustomization, ({ one }) => ({
  workspace: one(organization, {
    fields: [workspaceCustomization.workspaceId],
    references: [organization.id],
  }),
}));

export const workspaceDomainRelations = relations(workspaceDomain, ({ one }) => ({
  workspace: one(organization, {
    fields: [workspaceDomain.workspaceId],
    references: [organization.id],
  }),
}));

export const blockedUserRelations = relations(blockedUser, ({ one }) => ({
  workspace: one(organization, {
    fields: [blockedUser.workspaceId],
    references: [organization.id],
  }),
}));

export const pageRelations = relations(page, ({ one, many }) => ({
  workspace: one(organization, {
    fields: [page.workspaceId],
    references: [organization.id],
  }),
  comments: many(comment),
  polls: many(poll),
}));

export const commentRelations = relations(comment, ({ one, many }) => ({
  workspace: one(organization, {
    fields: [comment.workspaceId],
    references: [organization.id],
  }),
  page: one(page, {
    fields: [comment.pageId],
    references: [page.id],
  }),
  parent: one(comment, {
    fields: [comment.parentId],
    references: [comment.id],
    relationName: "commentReplies",
  }),
  replies: many(comment, { relationName: "commentReplies" }),
  reactions: many(commentReaction),
}));

export const commentReactionRelations = relations(commentReaction, ({ one }) => ({
  comment: one(comment, {
    fields: [commentReaction.commentId],
    references: [comment.id],
  }),
}));

export const pollRelations = relations(poll, ({ one, many }) => ({
  workspace: one(organization, {
    fields: [poll.workspaceId],
    references: [organization.id],
  }),
  page: one(page, {
    fields: [poll.pageId],
    references: [page.id],
  }),
  options: many(pollOption),
  votes: many(pollVote),
}));

export const pollOptionRelations = relations(pollOption, ({ one, many }) => ({
  poll: one(poll, {
    fields: [pollOption.pollId],
    references: [poll.id],
  }),
  votes: many(pollVote),
}));

export const pollVoteRelations = relations(pollVote, ({ one }) => ({
  poll: one(poll, {
    fields: [pollVote.pollId],
    references: [poll.id],
  }),
  option: one(pollOption, {
    fields: [pollVote.optionId],
    references: [pollOption.id],
  }),
}));
