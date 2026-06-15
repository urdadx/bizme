import { createDb } from "@better-comments/db";
import * as schema from "@better-comments/db/schema/index";
import { env } from "@better-comments/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";

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
    session: {
      additionalFields: {
        activeOrganizationId: {
          type: "string",
          required: false,
          defaultValue: null,
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
