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
		</div>
	);
}
