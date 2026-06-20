import { db } from "@better-comments/db";
import { workspaceCustomization } from "@better-comments/db/schema/index";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure, router } from "../index";
import { getActiveWorkspaceId } from "./utils";

const customizationInput = z.object({
  fontFamily: z.string().min(1),
  theme: z.string().min(1),
  brandColor: z.string().min(1),
  textColor: z.string().min(1),
  hidePoweredBy: z.boolean(),
  allowedDomains: z.array(z.string()),
});

export const workspaceCustomizationRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const workspaceId = getActiveWorkspaceId(ctx.session);

    const existing = await db.query.workspaceCustomization.findFirst({
      where: (customization, { eq }) => eq(customization.workspaceId, workspaceId),
    });

    if (existing) {
      return existing;
    }

    await db.insert(workspaceCustomization).values({
      workspaceId,
    });

    const created = await db.query.workspaceCustomization.findFirst({
      where: (customization, { eq }) => eq(customization.workspaceId, workspaceId),
    });

    if (!created) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Unable to create workspace customization",
      });
    }

    return created;
  }),
  update: protectedProcedure.input(customizationInput).mutation(async ({ ctx, input }) => {
    const workspaceId = getActiveWorkspaceId(ctx.session);

    await db
      .insert(workspaceCustomization)
      .values({
        workspaceId,
        ...input,
      })
      .onConflictDoUpdate({
        target: workspaceCustomization.workspaceId,
        set: {
          ...input,
          updatedAt: new Date(),
        },
      });

    const updated = await db.query.workspaceCustomization.findFirst({
      where: eq(workspaceCustomization.workspaceId, workspaceId),
    });

    if (!updated) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Unable to update workspace customization",
      });
    }

    return updated;
  }),
});
