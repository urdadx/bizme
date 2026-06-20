import { db } from "@better-comments/db";
import { desc } from "drizzle-orm";

import { protectedProcedure, router } from "../index";
import { getActiveWorkspaceId } from "./utils";

type LocationStat = {
  title: string;
  value: number;
  countryCode?: string;
};

function incrementStat(map: Map<string, LocationStat>, title: string | null, countryCode?: string | null) {
  if (!title) return;

  const existing = map.get(title);

  if (existing) {
    existing.value += 1;
    return;
  }

  map.set(title, {
    title,
    value: 1,
    countryCode: countryCode ?? undefined,
  });
}

function toSortedStats(map: Map<string, LocationStat>) {
  return Array.from(map.values()).sort((a, b) => b.value - a.value || a.title.localeCompare(b.title));
}

export const analyticsRouter = router({
  locations: protectedProcedure.query(async ({ ctx }) => {
    const workspaceId = getActiveWorkspaceId(ctx.session);
    const rows = await db.query.comment.findMany({
      where: (table, { and, eq, ne }) =>
        and(eq(table.workspaceId, workspaceId), ne(table.status, "deleted")),
      orderBy: (table) => [desc(table.createdAt)],
    });
    const countries = new Map<string, LocationStat>();
    const cities = new Map<string, LocationStat>();
    const continents = new Map<string, LocationStat>();

    for (const row of rows) {
      incrementStat(countries, row.locationCountry, row.locationCountryCode);
      incrementStat(cities, row.locationCity, row.locationCountryCode);
      incrementStat(continents, row.locationContinent);
    }

    return {
      countries: toSortedStats(countries),
      cities: toSortedStats(cities),
      continents: toSortedStats(continents),
    };
  }),
});
