import { protectedProcedure, publicProcedure, router } from "../index";
import { analyticsRouter } from "./analytics";
import { commentsRouter } from "./comments";
import { workspaceCustomizationRouter } from "./workspace-customization";

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
  comments: commentsRouter,
  analytics: analyticsRouter,
});
export type AppRouter = typeof appRouter;
