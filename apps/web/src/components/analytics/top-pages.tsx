import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import BarList from "./bar-list";
import { GlobeLinear } from "@/assets/icons/globe-icon";
import { useTRPC } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";

export const EMPTY_PAGES = [];

type TimeRange = "24h" | "7d" | "30d" | "90d";

interface PagesOverviewProps {
	timeRange: TimeRange;
	pagesData?: {
		id?: string;
		pageName?: string | null;
		title?: string;
		url?: string | null;
		href?: string;
		comments?: number;
		value?: number;
	}[];
}

export function TopPages({ timeRange, pagesData }: PagesOverviewProps) {
	const navigate = useNavigate();
	const trpc = useTRPC();
	const overviewQuery = useQuery(trpc.analytics.overview.queryOptions({ timeRange }));
	const commentPages = pagesData ?? overviewQuery.data?.pagesData ?? EMPTY_PAGES;

	const mapPages = useMemo(() => {
		return commentPages.map((page) => {
			return {
				icon: <GlobeLinear color="black" className="w-4 h-4" />,
				title:
					page.pageName ||
					page.title ||
					page.url ||
					page.href ||
					"Unknown page",
				value: page.comments ?? page.value ?? 0,
				href: page.url || page.href || "",
				linkId: page.id,
			};
		});
	}, [commentPages]);

	const topPages = mapPages.slice(0, 5);
	const maxPageCount = Math.max(...mapPages.map((s) => s.value), 0);
	const hasData = mapPages.length > 0;
	const displayedPages = hasData ? topPages : [];
	const displayedMaxPageCount = hasData ? maxPageCount : 0;

	return (
		<div className="h-87.5 w-full z-0 rounded-xl border bg-white flex flex-col overflow-hidden">
			<Tabs defaultValue="pages" className="flex flex-col h-full">
				<div className="flex items-center justify-between px-4 pt-3 shrink-0">
					<TabsList className="h-auto pb-0 gap-2 rounded-none border-border bg-transparent px-0 text-foreground">
						<TabsTrigger
							value="pages"
							className="text-muted-foreground hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none">
							Top comment pages
						</TabsTrigger>
					</TabsList>
				</div>

				<div className="flex-1 min-h-0 overflow-hidden">
					<TabsContent value="pages" className="h-full m-0 p-0">
						<div className="h-full flex flex-col">
							<div className="flex-1 min-h-0 px-4 overflow-hidden">
								<div className="relative h-full">
									<div
										className={
											hasData ? undefined : "hidden"
										}>
										<BarList
											tab="Pages"
											unit="comments"
											data={displayedPages}
											barBackground="bg-blue-200/40"
											hoverBackground="hover:bg-blue-50"
											maxValue={displayedMaxPageCount}
											limit={5}
										/>
									</div>
									{!hasData && (
										<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
											<div className=" px-4 py-2 text-sm font-medium text-foreground">
												No data available yet
											</div>
										</div>
									)}
								</div>
							</div>
							{hasData && mapPages.length > 5 && (
								<div className="shrink-0 px-4 py-3 ">
									<div className="flex items-center justify-center">
										<Button
											variant="outline"
											size="sm"
											onClick={() =>
												navigate({
													to: "/analytics",
												})
											}
											className="text-muted-foreground">
											View all
											<ArrowUpRight className="h-4 w-4" />
										</Button>
									</div>
								</div>
							)}
						</div>
					</TabsContent>
				</div>
			</Tabs>
		</div>
	);
}
