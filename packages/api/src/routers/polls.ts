import { db } from "@better-comments/db";
import { poll, pollOption } from "@better-comments/db/schema/index";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import type { Context } from "../context";
import { protectedProcedure, router } from "../index";
import { getActiveWorkspaceId } from "./utils";

const pollStatuses = ["draft", "active", "closed"] as const;

const pollIdInput = z.object({
  id: z.string().min(1),
});

const createPollInput = z.object({
  question: z.string().trim().min(1).max(240),
  closesAt: z.string().datetime().nullable().optional(),
  status: z.enum(pollStatuses).default("draft"),
  options: z.array(z.object({
    label: z.string().trim().min(1).max(120),
    imageUrl: z.string().url().nullable().optional(),
  })).min(2).max(4),
});

const updateStatusInput = pollIdInput.extend({
  status: z.enum(pollStatuses),
});

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

function formatDate(date: Date | null) {
  if (!date) return null;

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getTimeLeftLabel(status: (typeof pollStatuses)[number], closesAt: Date | null) {
  if (status === "draft") return "Draft";
  if (status === "closed") return "Closed";
  if (!closesAt) return "No end date";

  const diffMs = closesAt.getTime() - Date.now();

  if (diffMs <= 0) return "Ended";

  const totalMinutes = Math.ceil(diffMs / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h left`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  }

  return `${minutes}m left`;
}

function getEffectiveStatus(status: (typeof pollStatuses)[number], closesAt: Date | null) {
  if (status === "active" && closesAt && closesAt <= new Date()) {
    return "closed" as const;
  }

  return status;
}

function incrementCount(map: Map<string, number>, value: string | null) {
  if (!value) return;

  map.set(value, (map.get(value) ?? 0) + 1);
}

function toBreakdown(map: Map<string, number>) {
  return Array.from(map.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
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

async function getWorkspacePoll(workspaceId: string, id: string) {
  const existing = await db.query.poll.findFirst({
    where: (table, { and, eq }) => and(eq(table.id, id), eq(table.workspaceId, workspaceId)),
  });

  if (!existing) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Poll not found",
    });
  }

  return existing;
}

export const pollsRouter = router({
  detail: protectedProcedure.input(pollIdInput).query(async ({ ctx, input }) => {
    const workspaceId = getActiveWorkspaceId(ctx.session);
    const selectedPoll = await getWorkspacePoll(workspaceId, input.id);
    const [options, votes] = await Promise.all([
      db.query.pollOption.findMany({
        where: (table, { eq }) => eq(table.pollId, selectedPoll.id),
        orderBy: (table, { asc }) => [asc(table.position)],
      }),
      db.query.pollVote.findMany({
        where: (table, { eq }) => eq(table.pollId, selectedPoll.id),
        orderBy: (table) => [desc(table.createdAt)],
      }),
    ]);
    const optionById = new Map(options.map((option) => [option.id, option]));
    const voteCountByOptionId = new Map<string, number>();
    const countries = new Map<string, number>();
    const devices = new Map<string, number>();
    const browsers = new Map<string, number>();

    for (const vote of votes) {
      voteCountByOptionId.set(vote.optionId, (voteCountByOptionId.get(vote.optionId) ?? 0) + 1);
      incrementCount(countries, vote.locationCountry);
      incrementCount(devices, vote.deviceType);
      incrementCount(browsers, vote.browser);
    }

    const totalVotes = votes.length;
    const effectiveStatus = getEffectiveStatus(selectedPoll.status, selectedPoll.closesAt);

    return {
      poll: {
        id: selectedPoll.id,
        workspaceId: selectedPoll.workspaceId,
        question: selectedPoll.question,
        status: selectedPoll.status,
        effectiveStatus,
        closesAt: selectedPoll.closesAt?.toISOString() ?? null,
        closesAtLabel: formatDate(selectedPoll.closesAt),
        timeLeftLabel: getTimeLeftLabel(selectedPoll.status, selectedPoll.closesAt),
        createdAt: selectedPoll.createdAt.toISOString(),
        createdAtLabel: formatDateTime(selectedPoll.createdAt),
        updatedAt: selectedPoll.updatedAt.toISOString(),
        lastActivity: formatRelativeDate(selectedPoll.updatedAt),
        totalVotes,
        uniqueVisitors: new Set(votes.map((vote) => vote.visitorId)).size,
      },
      options: options.map((option) => {
        const voteCount = voteCountByOptionId.get(option.id) ?? 0;

        return {
          id: option.id,
          label: option.label,
          imageUrl: option.imageUrl,
          votes: voteCount,
          percentage: totalVotes > 0 ? Math.round((voteCount / totalVotes) * 1000) / 10 : 0,
        };
      }),
      votes: votes.map((vote) => {
        const option = optionById.get(vote.optionId);

        return {
          id: vote.id,
          visitorId: vote.visitorId,
          optionId: vote.optionId,
          optionLabel: option?.label ?? "Unknown option",
          date: formatRelativeDate(vote.createdAt),
          createdAt: vote.createdAt.toISOString(),
          locationCity: vote.locationCity,
          locationCountry: vote.locationCountry,
          locationCountryCode: vote.locationCountryCode,
          locationContinent: vote.locationContinent,
          deviceType: vote.deviceType,
          browser: vote.browser,
        };
      }),
      breakdowns: {
        countries: toBreakdown(countries),
        devices: toBreakdown(devices),
        browsers: toBreakdown(browsers),
      },
    };
  }),
  list: protectedProcedure.query(async ({ ctx }) => {
    const workspaceId = getActiveWorkspaceId(ctx.session);
    const polls = await db.query.poll.findMany({
      where: (table, { eq }) => eq(table.workspaceId, workspaceId),
      orderBy: (table) => [desc(table.updatedAt)],
    });
    const pollIds = polls.map((item) => item.id);
    const [options, votes] = await Promise.all([
      pollIds.length > 0
        ? db.query.pollOption.findMany({
          where: (table) => inArray(table.pollId, pollIds),
        })
        : [],
      pollIds.length > 0
        ? db.query.pollVote.findMany({
          where: (table) => inArray(table.pollId, pollIds),
        })
        : [],
    ]);
    const optionCountByPollId = new Map<string, number>();
    const voteCountByPollId = new Map<string, number>();

    for (const option of options) {
      optionCountByPollId.set(option.pollId, (optionCountByPollId.get(option.pollId) ?? 0) + 1);
    }

    for (const vote of votes) {
      voteCountByPollId.set(vote.pollId, (voteCountByPollId.get(vote.pollId) ?? 0) + 1);
    }

    return polls.map((item) => ({
        id: item.id,
        workspaceId: item.workspaceId,
        question: item.question,
        votes: voteCountByPollId.get(item.id) ?? 0,
        options: optionCountByPollId.get(item.id) ?? 0,
        status: item.status,
        closesAt: item.closesAt?.toISOString() ?? null,
        closesAtLabel: formatDate(item.closesAt),
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
        lastActivity: formatRelativeDate(item.updatedAt),
      }));
  }),
  create: protectedProcedure.input(createPollInput).mutation(async ({ ctx, input }) => {
    const workspaceId = getActiveWorkspaceId(ctx.session);

    await requireWorkspaceAdmin(ctx.session, workspaceId);

    const id = crypto.randomUUID();
    const optionRows = input.options.map((option, index) => ({
      id: crypto.randomUUID(),
      pollId: id,
      label: option.label.trim(),
      imageUrl: option.imageUrl ?? null,
      position: index,
    }));

    await db.insert(poll).values({
      id,
      workspaceId,
      question: input.question.trim(),
      status: input.status,
      closesAt: input.closesAt ? new Date(input.closesAt) : null,
    });
    await db.insert(pollOption).values(optionRows);

    return {
      id,
      options: optionRows.map((option) => ({ id: option.id, label: option.label })),
    };
  }),
  updateStatus: protectedProcedure.input(updateStatusInput).mutation(async ({ ctx, input }) => {
    const workspaceId = getActiveWorkspaceId(ctx.session);

    await requireWorkspaceAdmin(ctx.session, workspaceId);
    await getWorkspacePoll(workspaceId, input.id);
    await db
      .update(poll)
      .set({ status: input.status, updatedAt: new Date() })
      .where(and(eq(poll.id, input.id), eq(poll.workspaceId, workspaceId)));

    return getWorkspacePoll(workspaceId, input.id);
  }),
  delete: protectedProcedure.input(pollIdInput).mutation(async ({ ctx, input }) => {
    const workspaceId = getActiveWorkspaceId(ctx.session);

    await requireWorkspaceAdmin(ctx.session, workspaceId);
    await getWorkspacePoll(workspaceId, input.id);
    await db.delete(poll).where(and(eq(poll.id, input.id), eq(poll.workspaceId, workspaceId)));

    return { id: input.id };
  }),
});
