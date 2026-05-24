import { HeartIcon, OctagonAlertIcon, SmileIcon, StarIcon, ThumbsUpIcon } from "lucide-react";
import { MetricCard } from "./metrics-card";
import { ChatFeedback } from "@/assets/icons/chat-feedback";

interface MetricsProps {
	totalComments: number;
	spamComments: number;
	totalVotes: number;
	engagementRate: number;
	uniqueUsers: number;
	totalReactions: number;
}

export function Metrics({
	totalComments,
	spamComments,
	totalVotes,
	engagementRate,
	uniqueUsers,
	totalReactions,
}: MetricsProps) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
			<MetricCard
				icon={ChatFeedback}
				title="Total comments"
				value={totalComments}
				gradientFrom="slate-50"
				gradientVia="slate-25"
				href="/chat-logs"
			/>
			<MetricCard
				icon={OctagonAlertIcon}
				title="Spam comments"
				value={spamComments}
				gradientFrom="red-50"
				gradientVia="red-25"
			/>
			<MetricCard
				icon={ThumbsUpIcon}
				title="Total votes"
				value={totalVotes}
				gradientFrom="purple-50"
				gradientVia="purple-25"
				href="/data-sources"
			/>

			<MetricCard
				icon={HeartIcon}
				title="Engagement rate"
				value={engagementRate}
				gradientFrom="orange-50"
				gradientVia="orange-25"
				href="/settings?tab=billing"
			/>

			<MetricCard
				icon={StarIcon}
				title="Unique users"
				value={uniqueUsers}
				gradientFrom="blue-50"
				gradientVia="blue-25"
				href="/analytics"
			/>

			<MetricCard
				icon={SmileIcon}
				title="Total reactions"
				value={totalReactions}
				gradientFrom="green-50"
				gradientVia="green-25"
			/>
		</div>
	);
}
