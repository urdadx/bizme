import { env } from "@better-comments/env/web";
import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: env.VITE_SERVER_URL,
  plugins: [
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
