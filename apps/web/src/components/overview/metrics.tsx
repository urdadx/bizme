import { HeartIcon, StarIcon } from "lucide-react";
import { MetricCard } from "./metrics-card";
import { ChatFeedback } from "@/assets/icons/chat-feedback";

interface MetricsProps {
	totalComments: number;
	engagementRate: number;
	uniqueUsers: number;
}

export function Metrics({
	totalComments,
	engagementRate,
	uniqueUsers,
}: MetricsProps) {
	const metrics = [
		{
			icon: ChatFeedback,
			title: "Total comments",
			value: totalComments,
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
	];

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
			{metrics.map((metric) => (
				<MetricCard key={metric.title} {...metric} />
			))}
		</div>
	);
}
