import { useId } from "react";
import { Area, CartesianGrid, ComposedChart, XAxis, YAxis } from "recharts";

import { cn } from "@/lib/utils";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";

export type AnalyticsChartDatum = {
	date: string;
	comments: number;
};

export const EMPTY_ANALYTICS_CHART_DATA: AnalyticsChartDatum[] = [
	{ date: "2026-01-03", comments: 124 },
	{ date: "2026-01-04", comments: 71 },
	{ date: "2026-01-05", comments: 88 },
	{ date: "2026-01-06", comments: 36 },
	{ date: "2026-01-07", comments: 42 },
];

interface AnalyticsChartProps {
	config: ChartConfig;
	data: AnalyticsChartDatum[];
	hasData: boolean;
	className?: string;
	showComments?: boolean;
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
	emptyText = "No data available yet",
}: AnalyticsChartProps) {
	const fillCommentsId = useId().replace(/:/g, "");
	const displayedData = hasData ? data : EMPTY_ANALYTICS_CHART_DATA;

	return (
		<div className="relative h-full">
			<ChartContainer
				config={config}
				className={cn(
					"aspect-auto h-full w-full",
					!hasData && "pointer-events-none select-none blur-[3px] opacity-60",
					className,
				)}>
				<ComposedChart data={displayedData}>
					<defs>
						<linearGradient id={fillCommentsId} x1="0" y1="0" x2="0" y2="1">
							<stop
								offset="5%"
								stopColor="var(--chart-4)"
								stopOpacity={0.8}
							/>
							<stop
								offset="95%"
								stopColor="var(--chart-4)"
								stopOpacity={0.1}
							/>
						</linearGradient>
					</defs>
					<CartesianGrid vertical={false} />
					<XAxis
						dataKey="date"
						tickLine={false}
						axisLine={false}
						tickMargin={8}
						minTickGap={32}
						tickFormatter={formatDateLabel}
					/>
					<YAxis tickLine={false} axisLine={false} />
					<ChartTooltip
						cursor={false}
						content={
							<ChartTooltipContent
								labelFormatter={(value) =>
									formatDateLabel(String(value))
								}
								indicator="dot"
							/>
						}
					/>
					{showComments && (
						<Area
							dataKey="comments"
							type="natural"
							fill={`url(#${fillCommentsId})`}
							stroke="var(--chart-4)"
							fillOpacity={0.3}
						/>
					)}
				</ComposedChart>
			</ChartContainer>
			{!hasData && (
				<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
					<div className=" px-4 py-2 text-sm font-medium text-foreground ">
						{emptyText}
					</div>
				</div>
			)}
		</div>
	);
}
