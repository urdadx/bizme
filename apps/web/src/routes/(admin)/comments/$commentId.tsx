import { LikeIcon } from "@/assets/icons/like-icon";
import { CommentActivityTabs } from "@/components/comments/comment-detail/comment-activity-tabs";
import { CommentsMeta } from "@/components/comments/comment-detail/comments-meta";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/utils/trpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ChevronsDown, ChevronsUp } from "lucide-react";

export const Route = createFileRoute("/(admin)/comments/$commentId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { commentId } = Route.useParams();
	const trpc = useTRPC();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const commentQuery = useQuery(trpc.comments.detail.queryOptions({ id: commentId }));
	const deleteComment = useMutation(trpc.comments.delete.mutationOptions());
	const replyComment = useMutation(trpc.comments.reply.mutationOptions());
	const likeComment = useMutation(trpc.comments.like.mutationOptions());

	async function handleDelete() {
		await deleteComment.mutateAsync({ id: commentId });
		await queryClient.invalidateQueries({
			queryKey: trpc.comments.list.queryOptions().queryKey,
		});
		await navigate({ to: "/comments" });
	}

	async function handleReply(body: string) {
		await replyComment.mutateAsync({ id: commentId, body });
		await queryClient.invalidateQueries({
			queryKey: trpc.comments.detail.queryOptions({ id: commentId }).queryKey,
		});
	}

	async function handleLike() {
		await likeComment.mutateAsync({ id: commentId });
		await queryClient.invalidateQueries({
			queryKey: trpc.comments.detail.queryOptions({ id: commentId }).queryKey,
		});
	}

	if (commentQuery.isLoading) {
		return <div className="p-5 text-sm text-muted-foreground">Loading comment...</div>;
	}

	if (commentQuery.error || !commentQuery.data) {
		return (
			<div className="p-5 text-sm text-destructive">
				{commentQuery.error?.message ?? "Comment not found."}
			</div>
		);
	}

	const { comment, page, replies, reactions } = commentQuery.data;

	return (
		<div className="flex h-full min-h-0 w-full flex-col overflow-hidden lg:flex-row lg:gap-0">
			<div className="min-h-0 flex-1 overflow-hidden">
				<aside
					className="no-scrollbar relative flex h-full min-h-0 flex-1 flex-col overflow-y-auto bg-white"
					aria-label="Comment panel">
					<div className="sticky top-0 z-10 flex items-center justify-between bg-white p-5 pb-4">
						<Button variant="outline" size="sm" onClick={() => void navigate({ to: "/comments" })}>
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
									{comment.author}
								</h2>
								<Button
									variant="outline"
									size="sm"
									disabled={likeComment.isPending}
									onClick={() => void handleLike()}>
									<LikeIcon />
									<span className="text-[#888888]">{comment.likes}</span>
								</Button>
							</div>
							<p className="w-full text-sm leading-6 text-muted-foreground">
								{comment.content}
							</p>{" "}
							<CommentActivityTabs
								comments={replies}
								reactions={reactions}
								rootCommentId={comment.id}
								onSubmitReply={handleReply}
								isSubmittingReply={replyComment.isPending}
							/>
						</div>
					</div>
				</aside>
			</div>
			<div className="min-h-0 lg:flex lg:w-90 lg:shrink-0 lg:border-l lg:bg-background">
				<div className="flex h-full min-h-0 w-full flex-col">
					<CommentsMeta
						comment={comment}
						page={page}
						onDelete={() => void handleDelete()}
						isDeleting={deleteComment.isPending}
					/>
				</div>
			</div>
		</div>
	);
}
