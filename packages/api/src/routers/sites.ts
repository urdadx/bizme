import { db } from "@better-comments/db";
import {
  DEFAULT_BANNED_WORDS,
  member,
  organization,
  session,
  workspaceCustomization,
  workspaceSettings,
} from "@better-comments/db/schema/index";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure, router } from "../index";

const createSiteInput = z.object({
  name: z.string().trim().min(1).max(120),
  logo: z.string().trim().url().max(1000).optional().or(z.literal("")),
  websiteUrl: z.string().trim().url().max(500).optional().or(z.literal("")),
});

function slugify(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return slug || "site";
}

async function getAvailableSlug(name: string) {
  const baseSlug = slugify(name);

  for (let index = 0; index < 20; index += 1) {
    const slug = index === 0 ? baseSlug : `${baseSlug}-${index + 1}`;
    const existing = await db.query.organization.findFirst({
      where: (table, { eq }) => eq(table.slug, slug),
      columns: { id: true },
    });

    if (!existing) {
      return slug;
    }
  }

  return `${baseSlug}-${crypto.randomUUID().slice(0, 8)}`;
}

export const sitesRouter = router({
  create: protectedProcedure.input(createSiteInput).mutation(async ({ ctx, input }) => {
    const id = crypto.randomUUID();
    const slug = await getAvailableSlug(input.name);
    const websiteUrl = input.websiteUrl?.trim() || "";

    await db.insert(organization).values({
      id,
      name: input.name,
      slug,
      logo: input.logo?.trim() || null,
      websiteUrl,
    });

    await Promise.all([
      db.insert(member).values({
        id: crypto.randomUUID(),
        organizationId: id,
        userId: ctx.session.user.id,
        role: "owner",
      }),
      db.insert(workspaceSettings).values({
        workspaceId: id,
        bannedWords: DEFAULT_BANNED_WORDS,
      }),
      db.insert(workspaceCustomization).values({
        workspaceId: id,
      }),
      db
        .update(session)
        .set({
          activeOrganizationId: id,
          isOnboarded: true,
          updatedAt: new Date(),
        })
        .where(eq(session.userId, ctx.session.user.id)),
    ]);

    const created = await db.query.organization.findFirst({
      where: (table, { eq }) => eq(table.id, id),
    });

    if (!created) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Unable to create site.",
      });
    }

    return created;
  }),
});
