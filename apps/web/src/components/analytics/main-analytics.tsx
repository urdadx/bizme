import * as React from "react";
import { Area, Bar, CartesianGrid, ComposedChart, XAxis, YAxis } from "recharts";

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import NumberFlow from "@number-flow/react";
import { Checkbox } from "../ui/checkbox";
import { useNavigate, useSearch } from "@tanstack/react-router";

const DUMMY_CHART_DATA = [
	{ date: "2024-03-01", visitors: 250, chats: 850 },
	{ date: "2024-03-02", visitors: 520, chats: 450 },
	{ date: "2024-03-03", visitors: 280, chats: 290 },
	{ date: "2024-03-04", visitors: 610, chats: 560 },
	{ date: "2024-03-05", visitors: 290, chats: 980 },
	{ date: "2024-03-06", visitors: 720, chats: 250 },
	{ date: "2024-03-07", visitors: 210, chats: 180 },
];

const DUMMY_REALTIME = {
	totalVisits: 4082,
	totalChats: 1310,
	averageSessionTime: 245,
	bounceRate: 10,
	activeVisitors: 12,
};

const TIME_RANGE_ITEMS = [
	{ label: "Last 24 hours", value: "24h" },
	{ label: "Last 7 days", value: "7d" },
	{ label: "Last 30 days", value: "30d" },
	{ label: "Last 3 months", value: "90d" },
] as const;

const formatDuration = (seconds: number) => {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins}m ${secs}s`;
};

const chartConfig = {
	visitors: {
		label: "Visitors",
		color: "var(--chart-4)",
	},
	chats: {
		label: "Chats",
		color: "var(--chart-1)",
	},
} satisfies ChartConfig;

export function MainAnalytics() {
	const [showChats, setShowChats] = React.useState(true);
	const [showVisitors, setShowVisitors] = React.useState(true);
	const navigate = useNavigate({ from: "/analytics" });
	const { timeRange } = useSearch({ from: "/(admin)/analytics" });
	const selectedTimeRange = (timeRange as "24h" | "7d" | "30d" | "90d") || "24h";

	return (
		<div className="mt-4 flex flex-col space-y-4 w-full">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold">Analytics</h1>
				<Select
					items={TIME_RANGE_ITEMS}
					value={selectedTimeRange}
					onValueChange={(value) => {
						if (value !== null) {
							navigate({
								search: {
									timeRange: value as
										| "24h"
										| "7d"
										| "30d"
										| "90d",
								},
							});
						}
					}}>
					<SelectTrigger
						className="w-fit sm:w-62.5 rounded-lg sm:ml-auto sm:flex"
						aria-label="Select a value">
						<SelectValue placeholder="Last 3 months" />
					</SelectTrigger>
					<SelectContent className="rounded-xl">
						{TIME_RANGE_ITEMS.map((item) => (
							<SelectItem
								key={item.value}
								value={item.value}
								className="rounded-lg">
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
								<span>Total visits</span>
							</div>
							<Checkbox
								checked={showVisitors}
								onCheckedChange={(checked) =>
									setShowVisitors(checked === true)
								}
							/>
						</CardTitle>
						<CardDescription className="text-xl md:text-2xl font-semibold text-black">
							<NumberFlow value={DUMMY_REALTIME.totalVisits} />
						</CardDescription>
					</div>

					<div className="flex flex-col gap-1 text-left min-w-24">
						<CardTitle className="flex items-center gap-3 text-muted-foreground text-xs">
							<div className="flex items-center gap-1">
								<div className="inset-0 size-2 items-center justify-center rounded-full bg-purple-500" />
								<span>Total chats</span>
							</div>
							<Checkbox
								checked={showChats}
								onCheckedChange={(checked) =>
									setShowChats(checked === true)
								}
							/>
						</CardTitle>
						<CardDescription className="text-xl md:text-2xl font-semibold text-black">
							<NumberFlow value={DUMMY_REALTIME.totalChats} />
						</CardDescription>
					</div>

					<div className="flex flex-col gap-1 text-left min-w-24">
						<CardTitle className="flex items-center gap-3 text-muted-foreground text-xs">
							<div className="flex items-center gap-1">
								<div className="inset-0 size-2 items-center justify-center rounded-full bg-gray-500" />
								<span>Bounce rate</span>
							</div>
						</CardTitle>
						<CardDescription className="text-xl md:text-2xl font-semibold text-black">
							10%
						</CardDescription>
					</div>
					<div className="flex flex-col gap-1 text-left min-w-24">
						<CardTitle className="flex items-center gap-3 text-muted-foreground text-xs">
							<div className="flex items-center gap-1">
								<div className="inset-0 size-2 items-center justify-center rounded-full bg-orange-500" />
								<span>Avg. session time </span>
							</div>
						</CardTitle>
						<CardDescription className="text-xl md:text-2xl font-semibold text-black">
							{formatDuration(DUMMY_REALTIME.averageSessionTime)}
						</CardDescription>
					</div>

					<div className="flex flex-col gap-1 text-left min-w-24">
						<CardTitle className="flex items-center gap-3 text-muted-foreground text-xs">
							<div className="flex items-center gap-1">
								<div className="inset-0 size-2 animate-pulse rounded-full bg-green-500" />
								<span>Live users </span>
							</div>
						</CardTitle>
						<CardDescription className="text-xl md:text-2xl font-semibold text-black">
							<NumberFlow value={DUMMY_REALTIME.activeVisitors} />
						</CardDescription>
					</div>
				</CardHeader>

				<CardContent className=" pt-4 sm:pt-6">
					<ChartContainer
						config={chartConfig}
						className="aspect-auto h-75 w-full">
						<ComposedChart data={DUMMY_CHART_DATA}>
							<defs>
								<linearGradient
									id="fillChats"
									x1="0"
									y1="0"
									x2="0"
									y2="1">
									<stop
										offset="5%"
										stopColor="var(--chart-1)"
										stopOpacity={0.8}
									/>
									<stop
										offset="95%"
										stopColor="var(--chart-1)"
										stopOpacity={0.1}
									/>
								</linearGradient>
								<linearGradient
									id="fillVisitors"
									x1="0"
									y1="0"
									x2="0"
									y2="1">
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
								tickFormatter={(value) => {
									const date = new Date(value);
									return date.toLocaleDateString("en-US", {
										month: "short",
										day: "numeric",
									});
								}}
							/>
							<YAxis tickLine={false} axisLine={false} />
							<ChartTooltip
								cursor={false}
								content={
									<ChartTooltipContent
										labelFormatter={(value) => {
											return new Date(
												value,
											).toLocaleDateString("en-US", {
												month: "short",
												day: "numeric",
											});
										}}
										indicator="dot"
									/>
								}
							/>

							{showVisitors && (
								<Area
									dataKey="visitors"
									type="natural"
									fill="url(#fillVisitors)"
									stroke="var(--chart-4)"
									fillOpacity={0.3}
								/>
							)}

							{showChats && (
								<Bar
									dataKey="chats"
									fill="var(--chart-1)"
									radius={[8, 8, 0, 0]}
									barSize={24}
									fillOpacity={0.8}
								/>
							)}
						</ComposedChart>
					</ChartContainer>
				</CardContent>
			</div>
		</div>
	);
}
