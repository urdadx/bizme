import { protectedProcedure, publicProcedure, router } from "../index";
import { analyticsRouter } from "./analytics";
import { blockedUsersRouter } from "./blocked-users";
import { commentsRouter } from "./comments";
import { workspaceCustomizationRouter } from "./workspace-customization";
import { workspaceSettingsRouter } from "./workspace-settings";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
  workspaceCustomization: workspaceCustomizationRouter,
  workspaceSettings: workspaceSettingsRouter,
  comments: commentsRouter,
  analytics: analyticsRouter,
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session ?? null;
  }),
  blockedUsers: blockedUsersRouter,
});
export type AppRouter = typeof appRouter;
