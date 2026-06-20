import { TRPCError } from "@trpc/server";

import type { Context } from "../context";

export function getActiveWorkspaceId(session: NonNullable<Context["session"]>) {
  const workspaceId = session.session.activeOrganizationId;

  if (!workspaceId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No active workspace selected",
    });
  }

  return workspaceId;
}
