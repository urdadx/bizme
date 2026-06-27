import * as React from "react";

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig } from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTRPC } from "@/utils/trpc";
import NumberFlow from "@number-flow/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Checkbox } from "../ui/checkbox";
import { useNavigate } from "@tanstack/react-router";
import { AnalyticsChart } from "./analytics-chart";

type TimeRange = "24h" | "7d" | "30d" | "90d";

const TIME_RANGE_ITEMS = [
  { label: "Last 24 hours", value: "24h" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 3 months", value: "90d" },
] as const;

const chartConfig = {
  comments: {
    label: "Comments",
    color: "var(--chart-4)",
  },
  votes: {
    label: "Votes",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function MainAnalytics({ timeRange }: { timeRange: TimeRange }) {
  const [showComments, setShowComments] = React.useState(true);
  const [showVotes, setShowVotes] = React.useState(true);
  const trpc = useTRPC();
  const { data: overviewData } = useSuspenseQuery(
    trpc.analytics.overview.queryOptions({ timeRange })
  );
  const chartData = overviewData.chartData;
  const hasData =
    overviewData.metrics.totalComments > 0 ||
    overviewData.metrics.totalVotes > 0 ||
    chartData.some((item) => item.comments > 0 || item.votes > 0);
  const navigate = useNavigate({ from: "/analytics" });

  return (
    <div className="mt-4 flex flex-col space-y-4 w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <Select
          items={TIME_RANGE_ITEMS}
          value={timeRange}
          onValueChange={(value) => {
            if (value !== null) {
              navigate({
                search: {
                  timeRange: value as "24h" | "7d" | "30d" | "90d",
                },
              });
            }
          }}
        >
          <SelectTrigger
            className="w-fit sm:w-62.5 rounded-lg sm:ml-auto sm:flex"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {TIME_RANGE_ITEMS.map((item) => (
              <SelectItem key={item.value} value={item.value} className="rounded-lg">
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="px-1 py-5 w-full rounded-xl border bg-white">
        <CardHeader className=" flex flex-row flex-wrap justify-between gap-4">
          <div className="flex flex-col gap-1 text-left min-w-24">
            <CardTitle className="flex items-center gap-3 text-muted-foreground text-xs">
              <div className="flex items-center gap-1">
                <div className="inset-0 size-2 items-center justify-center rounded-full bg-yellow-500" />
                <span>Total comments</span>
              </div>
              <Checkbox
                checked={showComments}
                onCheckedChange={(checked) => setShowComments(checked === true)}
              />
            </CardTitle>
            <CardDescription className="text-xl md:text-2xl font-semibold text-black">
              <NumberFlow value={overviewData.metrics.totalComments} />
            </CardDescription>
          </div>

          <div className="flex flex-col gap-1 text-left min-w-24">
            <CardTitle className="flex items-center gap-3 text-muted-foreground text-xs">
              <div className="flex items-center gap-1">
                <div className="inset-0 size-2 items-center justify-center rounded-full bg-purple-500" />
                <span>Total votes</span>
              </div>
              <Checkbox
                checked={showVotes}
                onCheckedChange={(checked) => setShowVotes(checked === true)}
              />
            </CardTitle>
            <CardDescription className="text-xl md:text-2xl font-semibold text-black">
              <NumberFlow value={overviewData.metrics.totalVotes} />
            </CardDescription>
          </div>

          <div className="flex flex-col gap-1 text-left min-w-24">
            <CardTitle className="flex items-center gap-3 text-muted-foreground text-xs">
              <div className="flex items-center gap-1">
                <div className="inset-0 size-2 items-center justify-center rounded-full bg-gray-500" />
                <span>Engagement rate</span>
              </div>
            </CardTitle>
            <CardDescription className="text-xl md:text-2xl font-semibold text-black">
              <NumberFlow value={overviewData.metrics.engagementRate} />%
            </CardDescription>
          </div>

          <div className="flex flex-col gap-1 text-left min-w-24">
            <CardTitle className="flex items-center gap-3 text-muted-foreground text-xs">
              <div className="flex items-center gap-1">
                <div className="inset-0 size-2 items-center justify-center rounded-full bg-orange-500" />
                <span>Unique users</span>
              </div>
            </CardTitle>
            <CardDescription className="text-xl md:text-2xl font-semibold text-black">
              <NumberFlow value={overviewData.metrics.uniqueUsers} />
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className=" pt-4 sm:pt-6">
          <AnalyticsChart
            config={chartConfig}
            data={chartData}
            hasData={hasData}
            className="h-75"
            showComments={showComments}
            showVotes={showVotes}
          />
        </CardContent>
      </div>
    </div>
  );
}
