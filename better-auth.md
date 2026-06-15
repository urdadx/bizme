import { db } from "@padyna/db";
import \* as schema from "@padyna/db/schema/index";
import { env } from "@padyna/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { v4 as uuidv4 } from "uuid";
import { nanoid } from "nanoid";
import { getActiveOrganization } from "@padyna/db/get-active-organization";
import { getActiveChatbot } from "@padyna/db/get-active-chatbot";
import { createOrganizationNotification } from "@padyna/db/notifications";
import { chatbot, session, user } from "@padyna/db/schema/index";
import { polarClient } from "./lib/payments";
import { eq } from "drizzle-orm";
import { polar, portal } from "@polar-sh/better-auth";
import { Resend } from "resend";
import { OrganizationInvitationEmail } from "@padyna/email-templates";

const resend = new Resend(env.RESEND_API_KEY!);

async function ensurePolarCustomerExternalId({
userId,
email,
name,
}: {
userId: string;
email?: string | null;
name?: string | null;
}) {
if (!email) {
return null;
}

try {
await polarClient.customers.getExternal({
externalId: userId,
});

    return userId;

} catch {
const { result: existingCustomers } = await polarClient.customers.list({
email,
});

    let customer = existingCustomers.items[0];

    if (!customer) {
      customer = await polarClient.customers.create({
        email,
        name: name ?? undefined,
      });
    }

    if (customer.externalId !== userId) {
      await polarClient.customers.update({
        id: customer.id,
        customerUpdate: {
          externalId: userId,
        },
      });
    }

    return userId;

}
}

export const auth = betterAuth({
database: drizzleAdapter(db, {
provider: "pg",
schema: schema,
}),
socialProviders: {
...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
? {
google: {
clientId: env.GOOGLE_CLIENT_ID,
clientSecret: env.GOOGLE_CLIENT_SECRET,
prompt: "select_account",
},
}
: {}),
},

user: {
additionalFields: {
isSubscribed: {
type: "boolean",
required: false,
defaultValue: false,
input: false,
},
role: {
type: "string",
required: false,
defaultValue: "admin",
input: false,
},
},
deleteUser: {
enabled: true,
afterDelete: async (user) => {
await polarClient.customers.deleteExternal({
externalId: user.id,
});
},
},
},
session: {
additionalFields: {
activeOrganization: {
type: "string",
required: false,
defaultValue: null,
input: false,
},
activeChatbot: {
type: "string",
required: false,
defaultValue: null,
input: false,
},
},
},
trustedOrigins: [env.CORS_ORIGIN],
emailAndPassword: {
enabled: true,
},
advanced: {
defaultCookieAttributes: {
sameSite: "none",
secure: true,
httpOnly: true,
},
database: {
generateId: () => uuidv4(),
},
},
databaseHooks: {
session: {
create: {
before: async (sessionData) => {
try {
const activeOrganization = await getActiveOrganization(sessionData.userId);
const activeChatbot = await getActiveChatbot(sessionData.userId, activeOrganization);

            return {
              data: {
                ...sessionData,
                activeOrganization,
                activeChatbot,
              },
            };
          } catch (error) {
            console.error("Failed to resolve active organization/chatbot for user:", {
              userId: sessionData.userId,
              error,
            });
          }
          return {
            data: {
              ...sessionData,
              activeOrganization: null,
              activeChatbot: null,
            },
          };
        },
      },
    },

},
plugins: [
organization({
organizationHooks: {
afterCreateOrganization: async ({ organization, user }) => {
try {
const embedToken = `padyna_${nanoid(16)}`;

            const [createdChatbot] = await db
              .insert(chatbot)
              .values({
                organizationId: organization.id,
                name: `${organization.name} AI Agent`,
                image: organization.logo,
                embedToken,
              })
              .returning();

            const activeChatbotId = createdChatbot?.id || null;

            try {
              const externalCustomerId = await ensurePolarCustomerExternalId({
                userId: user.id,
                email: user.email,
                name: user.name,
              });

              if (externalCustomerId) {
                await db
                  .update(schema.organization)
                  .set({ externalCustomerId })
                  .where(eq(schema.organization.id, organization.id));
              }
            } catch (error) {
              console.error("Failed to get Polar customer:", {
                userId: user.id,
                error,
              });
            }

            await db
              .update(session)
              .set({
                activeChatbot: activeChatbotId,
                activeOrganization: organization.id,
                updatedAt: new Date(),
              })
              .where(eq(session.userId, user.id));
          } catch (error) {
            console.error("Failed to create default chatbot for organization:", {
              organizationId: organization.id,
              error,
            });
          }
        },
        afterUpdateOrganization: async ({ organization, user }) => {
          if (!organization) {
            return;
          }

          try {
            await createOrganizationNotification({
              organizationId: organization.id,
              actorUserId: user.id,
              eventType: "team.name_updated",
              entityType: "organization",
              entityId: organization.id,
              title: "Team details updated",
              body: organization.name,
              metadata: {
                organizationId: organization.id,
                organizationName: organization.name,
              },
            });
          } catch (error) {
            console.error("Failed to create team.name_updated notification:", {
              organizationId: organization.id,
              error,
            });
          }
        },
        afterCreateInvitation: async ({ invitation, inviter, organization }) => {
          try {
            await createOrganizationNotification({
              organizationId: organization.id,
              actorUserId: inviter.id,
              eventType: "team.member_invited",
              entityType: "invitation",
              entityId: invitation.id,
              title: "New team member invited",
              body: invitation.email,
              metadata: {
                invitationId: invitation.id,
                invitedEmail: invitation.email,
                role: invitation.role,
              },
              dedupeKey: `team.member_invited:${invitation.id}`,
            });
          } catch (error) {
            console.error("Failed to create team.member_invited notification:", {
              organizationId: organization.id,
              invitationId: invitation.id,
              error,
            });
          }
        },
      },
      async sendInvitationEmail(data) {
        const inviteLink = `${env.BETTER_AUTH_URL}/api/accept-invitation/${data.id}`;
        await resend.emails.send({
          from: "Padyna <invitation@padyna.com>",
          to: [data.email],
          subject: `You've been invited to join ${data.organization.name}`,
          react: OrganizationInvitationEmail({
            invitedByUsername: data.inviter.user.name,
            invitedByEmail: data.inviter.user.email,
            teamName: data.organization.name,
            inviteLink,
          }),
        });
      },
    }),
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [portal()],
      getCustomerCreateParams: async ({ user: newUser }) => {
        try {
          const { result: existingCustomers } = await polarClient.customers.list({
            email: newUser.email,
          });

          const existingCustomer = existingCustomers.items[0];

          const userId = newUser.id;
          if (existingCustomer?.externalId && userId && existingCustomer.externalId !== userId) {
            await db
              .update(user)
              .set({ id: existingCustomer.externalId })
              .where(eq(user.id, userId));
          }

          return {};
        } catch (error) {
          console.error("Error in getCustomerCreateParams:", error);
          return {};
        }
      },
    }),

],
});
