import { db } from "@better-comments/db";
import { workspaceSettings } from "@better-comments/db/schema/index";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure, router } from "../index";
import { getActiveWorkspaceId } from "./utils";

const DEFAULT_BANNED_WORDS = ["fuck", "nude", "crap"];
const MAX_BANNED_WORDS = 100;
const MAX_BANNED_WORD_LENGTH = 80;

const settingsInput = z.object({
  allowAnonymousComments: z.boolean(),
  allowImageUploads: z.boolean(),
  bannedWords: z.array(z.string().trim().min(1).max(MAX_BANNED_WORD_LENGTH)).max(MAX_BANNED_WORDS),
});

function normalizeBannedWords(words: string[]) {
  return Array.from(new Set(words.map((word) => word.trim().toLowerCase()).filter(Boolean))).slice(
    0,
    MAX_BANNED_WORDS,
  );
}

async function getOrCreateWorkspaceSettings(workspaceId: string) {
  const existing = await db.query.workspaceSettings.findFirst({
    where: (settings, { eq }) => eq(settings.workspaceId, workspaceId),
  });

  if (existing) {
    return existing;
  }

  await db.insert(workspaceSettings).values({
    workspaceId,
    bannedWords: DEFAULT_BANNED_WORDS,
  });

  const created = await db.query.workspaceSettings.findFirst({
    where: (settings, { eq }) => eq(settings.workspaceId, workspaceId),
  });

  if (!created) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Unable to create workspace settings",
    });
  }

  return created;
}

export const workspaceSettingsRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const workspaceId = getActiveWorkspaceId(ctx.session);

    return getOrCreateWorkspaceSettings(workspaceId);
  }),
  update: protectedProcedure.input(settingsInput).mutation(async ({ ctx, input }) => {
    const workspaceId = getActiveWorkspaceId(ctx.session);
    const bannedWords = normalizeBannedWords(input.bannedWords);

    await db
      .insert(workspaceSettings)
      .values({
        workspaceId,
        allowAnonymousComments: input.allowAnonymousComments,
        allowImageUploads: input.allowImageUploads,
        bannedWords,
      })
      .onConflictDoUpdate({
        target: workspaceSettings.workspaceId,
        set: {
          allowAnonymousComments: input.allowAnonymousComments,
          allowImageUploads: input.allowImageUploads,
          bannedWords,
          updatedAt: new Date(),
        },
      });

    const updated = await db.query.workspaceSettings.findFirst({
      where: eq(workspaceSettings.workspaceId, workspaceId),
    });

    if (!updated) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Unable to update workspace settings",
      });
    }

    return updated;
  }),
});
