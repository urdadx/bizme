import { db } from "@better-comments/db";
import { desc, inArray } from "drizzle-orm";

import { protectedProcedure, router } from "../index";
import { getActiveWorkspaceId } from "./utils";

type LocationStat = {
  title: string;
  value: number;
  countryCode?: string;
};

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatCommentDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getPreview(body: string) {
  return body.length > 80 ? `${body.slice(0, 77)}...` : body;
}

function getLastSevenDays() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return toDateKey(date);
  });
}

function incrementStat(map: Map<string, LocationStat>, title: string | null, countryCode?: string | null) {
  if (!title) return;

  const existing = map.get(title);

  if (existing) {
    existing.value += 1;
    return;
  }

  map.set(title, {
    title,
    value: 1,
    countryCode: countryCode ?? undefined,
  });
}

function toSortedStats(map: Map<string, LocationStat>) {
  return Array.from(map.values()).sort((a, b) => b.value - a.value || a.title.localeCompare(b.title));
}

export const analyticsRouter = router({
  overview: protectedProcedure.query(async ({ ctx }) => {
    const workspaceId = getActiveWorkspaceId(ctx.session);
    const [comments, pages, polls] = await Promise.all([
      db.query.comment.findMany({
        columns: {
          id: true,
          pageId: true,
          authorName: true,
          authorEmail: true,
          authorExternalId: true,
          authorVisitorId: true,
          body: true,
          likesCount: true,
          classification: true,
          createdAt: true,
          updatedAt: true,
          parentId: true,
        },
        where: (table, { and, eq, ne }) =>
          and(eq(table.workspaceId, workspaceId), ne(table.status, "deleted")),
        orderBy: (table) => [desc(table.updatedAt)],
      }),
      db.query.page.findMany({
        columns: {
          id: true,
          path: true,
          title: true,
          url: true,
        },
        where: (table, { eq }) => eq(table.workspaceId, workspaceId),
      }),
      db.query.poll.findMany({
        columns: {
          id: true,
        },
        where: (table, { eq }) => eq(table.workspaceId, workspaceId),
      }),
    ]);

    const pollIds = polls.map((item) => item.id);
    const rootComments = comments.filter((comment) => !comment.parentId);
    const rootCommentIds = rootComments.map((item) => item.id);
    const [votes, reactions] = await Promise.all([
      pollIds.length > 0
        ? db.query.pollVote.findMany({
          columns: {
            createdAt: true,
            visitorId: true,
          },
          where: (table) => inArray(table.pollId, pollIds),
        })
        : [],
      rootCommentIds.length > 0
        ? db.query.commentReaction.findMany({
          columns: {
            visitorId: true,
          },
          where: (table) => inArray(table.commentId, rootCommentIds),
        })
        : [],
    ]);
    const days = getLastSevenDays();
    const dayStats = new Map(days.map((date) => [date, { date, comments: 0, votes: 0 }]));

    for (const item of rootComments) {
      const stat = dayStats.get(toDateKey(item.createdAt));
      if (stat) stat.comments += 1;
    }

    for (const item of votes) {
      const stat = dayStats.get(toDateKey(item.createdAt));
      if (stat) stat.votes += 1;
    }

    const users = new Set<string>();
    const addUser = (id: string | null) => {
      if (id) users.add(id);
    };

    for (const item of rootComments) {
      addUser(item.authorVisitorId ?? item.authorEmail ?? item.authorExternalId);
    }

    for (const item of reactions) {
      addUser(item.visitorId);
    }

    for (const item of votes) {
      addUser(item.visitorId);
    }

    const totalComments = rootComments.length;
    const totalVotes = votes.length;
    const totalReactions = reactions.length;
    const chartData = Array.from(dayStats.values());
    const recentComments = rootComments
      .slice(0, 5)
      .map((comment) => ({
        id: comment.id,
        date: formatCommentDate(comment.createdAt),
        user: comment.authorName ?? comment.authorEmail ?? "Anonymous",
        comment: getPreview(comment.body),
      }));

    const commentsByPageId = new Map<string, number>();
    for (const item of rootComments) {
      commentsByPageId.set(item.pageId, (commentsByPageId.get(item.pageId) ?? 0) + 1);
    }

    return {
      metrics: {
        totalComments,
        spamComments: rootComments.filter((item) => item.classification === "spam").length,
        totalVotes,
        engagementRate: totalComments > 0
          ? Math.round((totalReactions / totalComments) * 1000) / 10
          : 0,
        uniqueUsers: users.size,
        totalReactions,
      },
      overview: {
        totalComments: chartData.reduce((total, item) => total + item.comments, 0),
        totalVotes: chartData.reduce((total, item) => total + item.votes, 0),
      },
      chartData,
      pagesData: pages
        .map((page) => ({
          id: page.id,
          pageName: page.title ?? page.path,
          url: page.url,
          comments: commentsByPageId.get(page.id) ?? 0,
        }))
        .filter((page) => page.comments > 0)
        .sort((a, b) => b.comments - a.comments || a.pageName.localeCompare(b.pageName)),
      recentComments,
    };
  }),
  metrics: protectedProcedure.query(async ({ ctx }) => {
    const workspaceId = getActiveWorkspaceId(ctx.session);
    const [comments, polls] = await Promise.all([
      db.query.comment.findMany({
        columns: {
          id: true,
          authorEmail: true,
          authorExternalId: true,
          authorVisitorId: true,
          classification: true,
        },
        where: (table, { and, eq, ne }) =>
          and(eq(table.workspaceId, workspaceId), ne(table.status, "deleted")),
      }),
      db.query.poll.findMany({
        columns: {
          id: true,
        },
        where: (table, { eq }) => eq(table.workspaceId, workspaceId),
      }),
    ]);

    const commentIds = comments.map((item) => item.id);
    const pollIds = polls.map((item) => item.id);
    const [reactions, votes] = await Promise.all([
      commentIds.length > 0
        ? db.query.commentReaction.findMany({
          columns: {
            visitorId: true,
          },
          where: (table) => inArray(table.commentId, commentIds),
        })
        : [],
      pollIds.length > 0
        ? db.query.pollVote.findMany({
          columns: {
            visitorId: true,
          },
          where: (table) => inArray(table.pollId, pollIds),
        })
        : [],
    ]);

    const users = new Set<string>();
    const addUser = (id: string | null) => {
      if (id) users.add(id);
    };

    for (const item of comments) {
      addUser(item.authorVisitorId ?? item.authorEmail ?? item.authorExternalId);
    }

    for (const item of reactions) {
      addUser(item.visitorId);
    }

    for (const item of votes) {
      addUser(item.visitorId);
    }

    const totalComments = comments.length;
    const totalVotes = votes.length;
    const totalReactions = reactions.length;
    const engagementRate = totalComments > 0
      ? Math.round((totalReactions / totalComments) * 1000) / 10
      : 0;

    return {
      totalComments,
      spamComments: comments.filter((item) => item.classification === "spam").length,
      totalVotes,
      engagementRate,
      uniqueUsers: users.size,
      totalReactions,
    };
  }),
  locations: protectedProcedure.query(async ({ ctx }) => {
    const workspaceId = getActiveWorkspaceId(ctx.session);
    const rows = await db.query.comment.findMany({
      where: (table, { and, eq, ne }) =>
        and(eq(table.workspaceId, workspaceId), ne(table.status, "deleted")),
      orderBy: (table) => [desc(table.createdAt)],
    });
    const countries = new Map<string, LocationStat>();
    const cities = new Map<string, LocationStat>();
    const continents = new Map<string, LocationStat>();

    for (const row of rows) {
      incrementStat(countries, row.locationCountry, row.locationCountryCode);
      incrementStat(cities, row.locationCity, row.locationCountryCode);
      incrementStat(continents, row.locationContinent);
    }

    return {
      countries: toSortedStats(countries),
      cities: toSortedStats(cities),
      continents: toSortedStats(continents),
    };
  }),
});
