import { LikeIcon } from "@/assets/icons/like-icon";
import { CommentActivityTabs } from "@/components/comments/comment-detail/comment-activity-tabs";
import { CommentsMeta } from "@/components/comments/comment-detail/comments-meta";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";
import { CommentImageDialog } from "@/components/widget/comment-image-dialog";
import { uploadCommentImages } from "@/lib/comment-attachments";
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
	const {
		data: commentData,
		error: commentError,
		isLoading: isCommentLoading,
	} = useQuery(trpc.comments.detail.queryOptions({ id: commentId }));
	const { data: neighborsData } = useQuery(
		trpc.comments.neighbors.queryOptions({ id: commentId })
	);
	const { data: customizationData } = useQuery(
		trpc.workspaceCustomization.get.queryOptions()
	);
	const deleteComment = useMutation(trpc.comments.delete.mutationOptions());
	const replyComment = useMutation(trpc.comments.reply.mutationOptions());
	const likeComment = useMutation(trpc.comments.like.mutationOptions());
	const pinComment = useMutation(trpc.comments.pin.mutationOptions());
	const classifyComment = useMutation(trpc.comments.classify.mutationOptions());
	const blockUser = useMutation(trpc.blockedUsers.block.mutationOptions());
	const unblockUser = useMutation(trpc.blockedUsers.unblock.mutationOptions());

	async function handleDelete() {
		await deleteComment.mutateAsync({ id: commentId });
		await queryClient.invalidateQueries({
			queryKey: trpc.comments.list.queryOptions().queryKey,
		});
		await navigate({ to: "/comments" });
	}

	async function handleReply(body: string, _images: File[]) {
		const reply = await replyComment.mutateAsync({ id: commentId, body });
		await Promise.all([
			uploadCommentImages(reply.id, _images),
			queryClient.invalidateQueries({
				queryKey: trpc.comments.detail.queryOptions({ id: commentId }).queryKey,
			}),
		]);
	}

	async function handleLike() {
		await likeComment.mutateAsync({ id: commentId });
		await queryClient.invalidateQueries({
			queryKey: trpc.comments.detail.queryOptions({ id: commentId }).queryKey,
		});
	}

	async function handlePinChange(isPinned: boolean) {
		await pinComment.mutateAsync({ id: commentId, isPinned });
		await Promise.all([
			queryClient.invalidateQueries({
				queryKey: trpc.comments.detail.queryOptions({ id: commentId }).queryKey,
			}),
			queryClient.invalidateQueries({
				queryKey: trpc.comments.list.queryOptions().queryKey,
			}),
			queryClient.invalidateQueries({
				queryKey: trpc.comments.neighbors.queryOptions({ id: commentId }).queryKey,
			}),
		]);
	}

	async function handleClassificationChange(classification: "legitimate" | "spam") {
		await classifyComment.mutateAsync({ id: commentId, classification });
		await Promise.all([
			queryClient.invalidateQueries({
				queryKey: trpc.comments.detail.queryOptions({ id: commentId }).queryKey,
			}),
			queryClient.invalidateQueries({
				queryKey: trpc.comments.list.queryOptions().queryKey,
			}),
		]);
	}

	async function handleBlockedChange(blocked: boolean) {
		if (!commentData?.comment.authorEmail) return;

		if (blocked) {
			await blockUser.mutateAsync({
				name: commentData.comment.author,
				email: commentData.comment.authorEmail,
				reason: "Blocked from comment detail",
			});
		} else {
			await unblockUser.mutateAsync({
				email: commentData.comment.authorEmail,
			});
		}

		await Promise.all([
			queryClient.invalidateQueries({
				queryKey: trpc.comments.detail.queryOptions({ id: commentId }).queryKey,
			}),
			queryClient.invalidateQueries({
				queryKey: trpc.comments.list.queryOptions().queryKey,
			}),
			queryClient.invalidateQueries({
				queryKey: trpc.blockedUsers.list.queryOptions().queryKey,
			}),
		]);
	}

	if (isCommentLoading) {
		return (
			<div className="max-w-5xl lg:max-w-6xl w-full min-h-screen mx-auto p-2 sm:p-6">
				<div className="flex items-center justify-center h-96">
					<Spinner size={30} />
				</div>
			</div>
		);
	}

	if (commentError || !commentData) {
		return (
			<div className="p-5 text-sm text-destructive">
				{commentError?.message ?? "Comment not found."}
			</div>
		);
	}

	const { comment, page, replies, reactions } = commentData;
	const previousCommentId = neighborsData?.previousId ?? null;
	const nextCommentId = neighborsData?.nextId ?? null;
	const customization = customizationData
		? {
				brandColor: customizationData.brandColor,
				textColor: customizationData.textColor,
			}
		: undefined;

	return (
		<div className="flex h-full min-h-0 w-full flex-col overflow-hidden lg:flex-row lg:gap-0">
			<div className="min-h-0 flex-1 overflow-hidden">
				<aside
					className="no-scrollbar relative flex h-full min-h-0 flex-1 flex-col overflow-y-auto bg-white"
					aria-label="Comment panel">
					<div className="sticky top-0 z-10 flex items-center justify-between bg-white p-5 pb-4">
						<Button
							variant="outline"
							size="sm"
							onClick={() => void navigate({ to: "/comments" })}>
							<ArrowLeft />
							Back
						</Button>
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								disabled={!previousCommentId}
								onClick={() =>
									previousCommentId
										? void navigate({
												to: "/comments/$commentId",
												params: { commentId: previousCommentId },
											})
										: undefined
								}>
								<ChevronsUp />
								Prev
							</Button>
							<Button
								variant="outline"
								size="sm"
								disabled={!nextCommentId}
								onClick={() =>
									nextCommentId
										? void navigate({
												to: "/comments/$commentId",
												params: { commentId: nextCommentId },
											})
										: undefined
								}>
								<ChevronsDown />
								Next
							</Button>
						</div>
					</div>

					<div className="min-h-0 flex-1 px-5 pb-5 pt-2">
						<div className="flex w-full flex-col gap-4">
							<div className="flex justify-between items-center">
								<h2 className="text-xl font-semibold">
									Comment #{comment.commentNumber}
								</h2>
								<Button
									variant="outline"
									size="sm"
									disabled={likeComment.isPending}
									onClick={() => void handleLike()}>
									<LikeIcon />
									<span className="text-[#888888]">
										{comment.likes}
									</span>
								</Button>
							</div>
							<p className="w-full text-sm leading-6 text-muted-foreground">
								{comment.content}
							</p>
							{comment.attachments.length > 0 ? (
								<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
									{comment.attachments.map((attachment) => (
										<CommentImageDialog
											key={attachment.id}
											image={attachment}
										/>
									))}
								</div>
							) : null}
							<CommentActivityTabs
								comments={replies}
								reactions={reactions}
								rootCommentId={comment.id}
								onSubmitReply={handleReply}
								isSubmittingReply={replyComment.isPending}
								customization={customization}
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
						onPinChange={(isPinned) => void handlePinChange(isPinned)}
						isPinning={pinComment.isPending}
						onClassificationChange={(classification) =>
							void handleClassificationChange(classification)
						}
						isClassifying={classifyComment.isPending}
						onBlockedChange={(blocked) => void handleBlockedChange(blocked)}
						isBlocking={blockUser.isPending || unblockUser.isPending}
					/>
				</div>
			</div>
		</div>
	);
}
