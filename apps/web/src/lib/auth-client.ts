import { env } from "@better-comments/env/web";
import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields, organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: env.VITE_SERVER_URL,
  plugins: [
    inferAdditionalFields({
      session: {
        activeOrganizationId: {
          type: "string",
          required: false,
        },
        isOnboarded: {
          type: "boolean",
          required: false,
        },
      },
    }),
    organizationClient({
      schema: {
        organization: {
          additionalFields: {
            websiteUrl: {
              type: "string",
              required: false,
            },
          },
        },
      },
    }),
  ],
});

export const { useSession, signIn, signUp, signOut, resetPassword } = authClient;
