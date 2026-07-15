import { db } from "@better-comments/db";
import { TRPCError } from "@trpc/server";
import { sql } from "drizzle-orm";
import { z } from "zod";

import { publicProcedure, router } from "../index";

export const invitationsRouter = router({
  getContext: publicProcedure
    .input(
      z.object({
        invitationId: z.string().min(1),
      }),
    )
    .query(async ({ input }) => {
      const invitation = await db.query.invitation.findFirst({
        where: (table, { eq }) => eq(table.id, input.invitationId),
        with: {
          organization: {
            columns: {
              name: true,
            },
          },
        },
      });

      if (!invitation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found",
        });
      }

      const existingUser = await db.query.user.findFirst({
        where: (table) => sql`lower(${table.email}) = ${invitation.email.toLowerCase()}`,
        columns: {
          id: true,
        },
      });

      return {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        organizationName: invitation.organization.name,
        hasAccount: Boolean(existingUser),
      };
    }),
});
