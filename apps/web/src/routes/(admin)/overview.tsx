import { MostRecentComments } from "@/components/analytics/most-recent-comments";
import { PagesOverview } from "@/components/analytics/pages-overview";
import { AnalyticsOverview } from "@/components/overview/analytics-overview";
import { Metrics } from "@/components/overview/metrics";
import { createFileRoute } from "@tanstack/react-router";

const metricsData = {
	totalComments: 892,
	spamComments: 21,
	totalVotes: 124,
	engagementRate: 68.4,
	uniqueUsers: 241,
	totalReactions: 376,
};

const overviewData = {
	totalComments: 1482,
	totalVotes: 327,
};

const chartData = [
	{ date: "2026-05-11", comments: 100, votes: 142 },
	{ date: "2026-05-12", comments: 205, votes: 51 },
	{ date: "2026-05-13", comments: 20, votes: 96 },
	{ date: "2026-05-14", comments: 84, votes: 68 },
	{ date: "2026-05-15", comments: 60, votes: 49 },
	{ date: "2026-05-16", comments: 79, votes: 121 },
	{ date: "2026-05-17", comments: 40, votes: 55 },
];

const pagesData = [
	{
		id: "page_1",
		pageName: "Pricing",
		url: "/pricing",
		comments: 84,
	},
	{
		id: "page_2",
		pageName: "Docs Installation",
		url: "/docs/install",
		comments: 68,
	},
	{
		id: "page_3",
		pageName: "Feature Overview",
		url: "/features/comments",
		comments: 51,
	},
	{
		id: "page_4",
		pageName: "Launch Week Blog",
		url: "/blog/launch-week",
		comments: 39,
	},
	{
		id: "page_5",
		pageName: "API Reference",
		url: "/docs/api",
		comments: 27,
	},
];

export const Route = createFileRoute("/(admin)/overview")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="relative mx-auto w-full max-w-7xl space-y-6 overflow-x-hidden p-4 md:p-6">
			<Metrics
				totalComments={metricsData.totalComments}
				spamComments={metricsData.spamComments}
				totalVotes={metricsData.totalVotes}
				engagementRate={metricsData.engagementRate}
				uniqueUsers={metricsData.uniqueUsers}
				totalReactions={metricsData.totalReactions}
			/>
			<div className="flex flex-col lg:flex-row gap-6 w-full items-stretch">
				<div className="w-full lg:w-[60%] flex">
					<AnalyticsOverview
						overviewQuery={{
							data: overviewData,
						}}
						chartQuery={{
							data: chartData,
						}}
					/>
				</div>
				<div className="w-full lg:w-[40%] flex">
					<PagesOverview pagesData={pagesData} />
				</div>
			</div>
			<div className="w-full min-w-0">
				<MostRecentComments />
			</div>
		</div>
	);
}
