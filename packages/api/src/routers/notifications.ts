import { db } from "@better-comments/db";
import { notification } from "@better-comments/db/schema/index";
import { and, count, desc, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure, router } from "../index";
import { getActiveWorkspaceId } from "./utils";

const notificationIdInput = z.object({
  id: z.string().min(1),
});

export const notificationsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const workspaceId = getActiveWorkspaceId(ctx.session);

    return db.query.notification.findMany({
      where: (table, { eq }) => eq(table.workspaceId, workspaceId),
      orderBy: (table) => [desc(table.createdAt)],
      limit: 10,
    });
  }),
  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    const workspaceId = getActiveWorkspaceId(ctx.session);
    const [result] = await db
      .select({ value: count() })
      .from(notification)
      .where(and(eq(notification.workspaceId, workspaceId), isNull(notification.readAt)));

    return result?.value ?? 0;
  }),
  markRead: protectedProcedure.input(notificationIdInput).mutation(async ({ ctx, input }) => {
    const workspaceId = getActiveWorkspaceId(ctx.session);

    await db
      .update(notification)
      .set({ readAt: new Date() })
      .where(and(eq(notification.id, input.id), eq(notification.workspaceId, workspaceId)));

    return { id: input.id };
  }),
  markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    const workspaceId = getActiveWorkspaceId(ctx.session);
    const readAt = new Date();

    await db
      .update(notification)
      .set({ readAt })
      .where(and(eq(notification.workspaceId, workspaceId), isNull(notification.readAt)));

    return { readAt };
  }),
});
