import { createDb } from "@better-comments/db";
import * as schema from "@better-comments/db/schema/index";
import { env } from "@better-comments/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { eq } from "drizzle-orm";

export function createAuth() {
  const db = createDb();

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",

      schema: schema,
    }),
    trustedOrigins: [env.CORS_ORIGIN],
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    },
    user: {
      deleteUser: {
        enabled: true,
      },
    },
    session: {
      additionalFields: {
        activeOrganizationId: {
          type: "string",
          required: false,
          defaultValue: null,
          input: false,
        },
        isOnboarded: {
          type: "boolean",
          required: false,
          defaultValue: false,
          input: false,
        },
      },
    },
    databaseHooks: {
      session: {
        create: {
          before: async (sessionData) => {
            const activeMembership = await db.query.member.findFirst({
              where: (member, { eq }) => eq(member.userId, sessionData.userId),
              columns: {
                organizationId: true,
              },
            });

            return {
              data: {
                ...sessionData,
                activeOrganizationId: activeMembership?.organizationId ?? null,
                isOnboarded: Boolean(activeMembership),
              },
            };
          },
        },
      },
    },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    advanced: {
      defaultCookieAttributes: {
        sameSite: "none",
        secure: true,
        httpOnly: true,
      },
    },
    plugins: [
      organization({
        organizationHooks: {
          afterCreateOrganization: async ({ organization, user }) => {
            await Promise.all([
              db
                .update(schema.session)
                .set({
                  activeOrganizationId: organization.id,
                  isOnboarded: true,
                  updatedAt: new Date(),
                })
                .where(eq(schema.session.userId, user.id)),
              db
                .insert(schema.workspaceSettings)
                .values({
                  workspaceId: organization.id,
                  bannedWords: schema.DEFAULT_BANNED_WORDS,
                })
                .onConflictDoNothing(),
            ]);
          },
        },
        schema: {
          organization: {
            additionalFields: {
              websiteUrl: {
                type: "string",
                required: false,
                defaultValue: "",
                input: true,
              },
            },
          },
        },
      }),
    ],
  });
}

export const auth = createAuth();
