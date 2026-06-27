import { MostRecentComments } from "@/components/analytics/most-recent-comments";
import { PagesOverview } from "@/components/analytics/pages-overview";
import { AnalyticsOverview } from "@/components/overview/analytics-overview";
import { Metrics } from "@/components/overview/metrics";
import { useTRPC } from "@/utils/trpc";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(admin)/overview")({
	component: RouteComponent,
});

function RouteComponent() {
	const trpc = useTRPC();
	const { data: overviewData } = useSuspenseQuery(
		trpc.analytics.overview.queryOptions()
	);

	return (
		<div className="relative mx-auto w-full max-w-7xl space-y-6 overflow-x-hidden p-4 md:p-6">
			<Metrics
				totalComments={overviewData.metrics.totalComments}
				spamComments={overviewData.metrics.spamComments}
				totalVotes={overviewData.metrics.totalVotes}
				engagementRate={overviewData.metrics.engagementRate}
				uniqueUsers={overviewData.metrics.uniqueUsers}
				totalReactions={overviewData.metrics.totalReactions}
			/>
			<div className="flex flex-col lg:flex-row gap-6 w-full items-stretch">
				<div className="w-full lg:w-[60%] flex">
					<AnalyticsOverview
						overviewQuery={{
							data: overviewData.overview,
						}}
						chartQuery={{
							data: overviewData.chartData,
						}}
					/>
				</div>
				<div className="w-full lg:w-[40%] flex">
					<PagesOverview pagesData={overviewData.pagesData} />
				</div>
			</div>
			<div className="w-full min-w-0">
				<MostRecentComments comments={overviewData.recentComments} />
			</div>
		</div>
	);
}
