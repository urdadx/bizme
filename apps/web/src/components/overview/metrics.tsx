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
	const metrics = [
		{
			icon: ChatFeedback,
			title: "Total comments",
			value: totalComments,
			href: "/comments",
		},
		{
			icon: OctagonAlertIcon,
			title: "Spam comments",
			value: spamComments,
			href: "/moderation",
		},
		{
			icon: ThumbsUpIcon,
			title: "Total votes",
			value: totalVotes,
			href: "/comments",
		},
		{
			icon: HeartIcon,
			title: "Engagement rate",
			value: engagementRate,
			suffix: "%",
			href: "/analytics",
		},
		{
			icon: StarIcon,
			title: "Unique users",
			value: uniqueUsers,
			href: "/analytics",
		},
		{
			icon: SmileIcon,
			title: "Total reactions",
			value: totalReactions,
			href: "/analytics",
		},
	];

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
			{metrics.map((metric) => (
				<MetricCard key={metric.title} {...metric} />
			))}
		</div>
	);
}
