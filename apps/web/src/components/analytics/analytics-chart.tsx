import { Area } from "@/components/dither-kit/area";
import { AreaChart } from "@/components/dither-kit/area-chart";
import type { ChartConfig } from "@/components/dither-kit/chart-context";
import { Grid } from "@/components/dither-kit/grid";
import { Tooltip } from "@/components/dither-kit/tooltip";
import { XAxis } from "@/components/dither-kit/x-axis";
import { YAxis } from "@/components/dither-kit/y-axis";
import { cn } from "@/lib/utils";

export type AnalyticsChartDatum = {
  date: string;
  comments: number;
  reactions?: number;
};

export const EMPTY_ANALYTICS_CHART_DATA: AnalyticsChartDatum[] = [
  { date: "2026-01-03", comments: 124, reactions: 82 },
  { date: "2026-01-04", comments: 71, reactions: 46 },
  { date: "2026-01-05", comments: 88, reactions: 61 },
  { date: "2026-01-06", comments: 36, reactions: 24 },
  { date: "2026-01-07", comments: 42, reactions: 31 },
];

interface AnalyticsChartProps {
  config: ChartConfig;
  data: AnalyticsChartDatum[];
  hasData: boolean;
  className?: string;
  showComments?: boolean;
  showReactions?: boolean;
  emptyText?: string;
}

const formatDateLabel = (value: string) => {
  const date = new Date(value);

  if (value.includes("T")) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
    });
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export function AnalyticsChart({
  config,
  data,
  hasData,
  className,
  showComments = true,
  showReactions = false,
  emptyText = "No data available yet",
}: AnalyticsChartProps) {
  const displayedData = hasData ? data : EMPTY_ANALYTICS_CHART_DATA;

  return (
    <div className="relative h-full">
      <AreaChart
        data={displayedData}
        config={config}
        bloom="low"
        className={cn(
          "aspect-auto h-full w-full",
          !hasData && "pointer-events-none select-none blur-[3px] opacity-60",
          className,
        )}
      >
        <Grid />
        <XAxis
          dataKey="date"
          maxTicks={6}
          tickFormatter={(value) => formatDateLabel(String(value))}
        />
        <YAxis />
        <Tooltip labelKey="date" />
        {showComments && <Area dataKey="comments" variant="gradient" />}
        {showReactions && <Area dataKey="reactions" variant="dotted" />}
      </AreaChart>
      {!hasData && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className=" px-4 py-2 text-sm font-medium text-foreground ">{emptyText}</div>
        </div>
      )}
    </div>
  );
}
