import { MostRecentComments } from "@/components/analytics/most-recent-comments";
import { PagesOverview } from "@/components/analytics/pages-overview";
import { AnalyticsOverview } from "@/components/overview/analytics-overview";
import { Metrics } from "@/components/overview/metrics";
import { useTRPC } from "@/utils/trpc";
import { useSuspenseQueries } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";

export const Route = createFileRoute("/(admin)/overview")({
	component: RouteComponent,
});

function getValidDate(value: string) {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
}

function getDateKey(value: string) {
	const date = getValidDate(value);
	return date?.toISOString().slice(0, 10);
}

function RouteComponent() {
	const trpc = useTRPC();
	const [commentsQuery] = useSuspenseQueries({
		queries: [
			{
				...trpc.comments.list.queryOptions(),
			},
		],
	});
	const comments = commentsQuery.data;
	const overviewData = useMemo(() => {
		const latestCommentDate = comments.reduce<Date | null>((latest, comment) => {
			const createdAt = getValidDate(comment.createdAt);
			if (!createdAt) return latest;
			return !latest || createdAt > latest ? createdAt : latest;
		}, null);
		const endDate = latestCommentDate ?? new Date();
		endDate.setHours(0, 0, 0, 0);
		const days = Array.from({ length: 7 }, (_, index) => {
			const date = new Date(endDate);
			date.setDate(endDate.getDate() - (6 - index));
			return date.toISOString().slice(0, 10);
		});
		const chartData = days.map((date) => ({ date, comments: 0, votes: 0 }));
		const chartDataByDate = new Map(chartData.map((item) => [item.date, item]));
		const pages = new Map<
			string,
			{ id: string; pageName: string; url: string | null; comments: number }
		>();
		const users = new Set<string>();

		for (const comment of comments) {
			const date = getDateKey(comment.createdAt) ?? days[days.length - 1];
			const day = date ? chartDataByDate.get(date) : undefined;
			if (day) {
				day.comments += 1;
				day.votes += comment.likes;
			}

			const pageKey = comment.pageUrl ?? comment.page;
			const page = pages.get(pageKey) ?? {
				id: pageKey,
				pageName: comment.page,
				url: comment.pageUrl,
				comments: 0,
			};
			page.comments += 1;
			pages.set(pageKey, page);
			users.add(comment.commenter);
		}

		const totalComments = comments.length;
		const totalVotes = comments.reduce((total, comment) => total + comment.likes, 0);

		return {
			metrics: {
				totalComments,
				spamComments: comments.filter(
					(comment) => comment.classification === "spam",
				).length,
				totalVotes,
				engagementRate:
					totalComments > 0
						? Math.round((totalVotes / totalComments) * 1000) / 10
						: 0,
				uniqueUsers: users.size,
				totalReactions: totalVotes,
			},
			overview: {
				totalComments,
				totalVotes,
			},
			chartData,
			pagesData: Array.from(pages.values()).sort(
				(a, b) => b.comments - a.comments || a.pageName.localeCompare(b.pageName),
			),
		};
	}, [comments]);
	const recentComments = comments.slice(0, 5).map((comment) => ({
		id: comment.id,
		date: comment.date ?? comment.lastActivity,
		user: comment.commenter,
		comment: comment.preview,
	}));

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
				<MostRecentComments comments={recentComments} />
			</div>
		</div>
	);
}
