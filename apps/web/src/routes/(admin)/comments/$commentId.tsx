import { LikeIcon } from "@/assets/icons/like-icon";
import { CommentActivityTabs } from "@/components/comments/comment-detail/comment-activity-tabs";
import { CommentsMeta } from "@/components/comments/comment-detail/comments-meta";
import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ChevronsDown, ChevronsUp } from "lucide-react";

export const Route = createFileRoute("/(admin)/comments/$commentId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { commentId } = Route.useParams();

	return (
		<div className="flex h-full min-h-0 w-full flex-col overflow-hidden lg:flex-row lg:gap-0">
			<div className="min-h-0 flex-1 overflow-hidden">
				<aside
					className="no-scrollbar relative flex h-full min-h-0 flex-1 flex-col overflow-y-auto bg-white"
					aria-label="Comment panel">
					<div className="sticky top-0 z-10 flex items-center justify-between bg-white p-5 pb-4">
						<Button variant="outline" size="sm">
							<ArrowLeft />
							Back
						</Button>
						<div className="flex items-center gap-2">
							<Button variant="outline" size="sm">
								<ChevronsUp />
							</Button>
							<Button variant="outline" size="sm">
								<ChevronsDown />
							</Button>
						</div>
					</div>

					<div className="min-h-0 flex-1 px-5 pb-5 pt-2">
						<div className="flex w-full flex-col gap-4">
							<div className="flex justify-between items-center">
								<h2 className="text-xl font-semibold">
									Comment #{commentId}
								</h2>
								<Button variant="outline" size="sm">
									<LikeIcon />
									<span className="text-[#888888]">12</span>
								</Button>
							</div>
							<p className="w-full text-sm leading-6 text-muted-foreground">
								Lorem ipsum dolor sit amet, consectetur adipiscing
								elit, sed do eiusmod tempor incididunt ut labore et
								dolore magna aliqua. Ut enim ad minim veniam, quis
								nostrud exercitation ullamco.
							</p>{" "}
							<CommentActivityTabs />
						</div>
					</div>
				</aside>
			</div>
			<div className="min-h-0 lg:flex lg:w-90 lg:shrink-0 lg:border-l lg:bg-background">
				<div className="flex h-full min-h-0 w-full flex-col">
					<CommentsMeta />
				</div>
			</div>
		</div>
	);
}
