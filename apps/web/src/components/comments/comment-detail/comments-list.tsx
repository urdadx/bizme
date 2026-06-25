import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { uploadCommentImages } from "@/lib/comment-attachments";
import { useTRPC } from "@/utils/trpc";
import { CommentListItem, type CommentReply } from "./comment-list-item";

export function CommentsList({ comments, rootCommentId }: { comments: CommentReply[]; rootCommentId: string }) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [replyingTo, setReplyingTo] = useState<string | null>(null);
	const [items, setItems] = useState(comments);
	const [error, setError] = useState<string | null>(null);
	const updateComment = useMutation(trpc.comments.update.mutationOptions());
	const deleteComment = useMutation(trpc.comments.delete.mutationOptions());
	const pinComment = useMutation(trpc.comments.pin.mutationOptions());
	const replyComment = useMutation(trpc.comments.reply.mutationOptions());
	const likeComment = useMutation(trpc.comments.like.mutationOptions());
	const isPending =
		updateComment.isPending ||
		deleteComment.isPending ||
		pinComment.isPending ||
		replyComment.isPending ||
		likeComment.isPending;

	useEffect(() => {
		setItems(comments);
	}, [comments]);

	function updateLocalComment(id: string, updater: (comment: CommentReply) => CommentReply | null) {
		function visit(comment: CommentReply): CommentReply | null {
			if (comment.id === id) {
				return updater(comment);
			}

			const children = comment.children
				.map(visit)
				.filter((child): child is CommentReply => child !== null);
			return { ...comment, children };
		}

		setItems((current) =>
			current.map(visit).filter((comment): comment is CommentReply => comment !== null),
		);
	}

	async function handleEdit(id: string, body: string) {
		try {
			setError(null);
			await updateComment.mutateAsync({ id, body });
			await invalidateDetail();
			updateLocalComment(id, (comment) => ({ ...comment, content: body }));
		} catch (error) {
			setError(error instanceof Error ? error.message : "Unable to edit comment.");
			throw error;
		}
	}

	async function handleDelete(id: string) {
		try {
			setError(null);
			await deleteComment.mutateAsync({ id });
			await queryClient.invalidateQueries({
				queryKey: trpc.comments.list.queryOptions().queryKey,
			});
			updateLocalComment(id, () => null);
		} catch (error) {
			setError(error instanceof Error ? error.message : "Unable to delete comment.");
		}
	}

	async function handlePin(id: string, isPinned: boolean) {
		try {
			setError(null);
			await pinComment.mutateAsync({ id, isPinned });
			await invalidateDetail();
			updateLocalComment(id, (comment) => ({ ...comment, isPinned }));
		} catch (error) {
			setError(error instanceof Error ? error.message : "Unable to update pinned state.");
		}
	}

	async function invalidateDetail() {
		await queryClient.invalidateQueries({
			queryKey: trpc.comments.detail.queryOptions({ id: rootCommentId }).queryKey,
		});
	}

	async function handleReply(id: string, body: string, images: File[]) {
		try {
			setError(null);
			const reply = await replyComment.mutateAsync({ id, body });
			await uploadCommentImages(reply.id, images);
			await invalidateDetail();
			setReplyingTo(null);
		} catch (error) {
			setError(error instanceof Error ? error.message : "Unable to submit reply.");
			throw error;
		}
	}

	async function handleLike(id: string) {
		try {
			setError(null);
			const result = await likeComment.mutateAsync({ id });
			updateLocalComment(id, (comment) => ({ ...comment, likes: result.likes }));
		} catch (error) {
			setError(error instanceof Error ? error.message : "Unable to update like.");
		}
	}

	return (
		<div className="flex flex-col">
			{error ? <p className="pb-2 text-sm text-destructive">{error}</p> : null}
			{items.length === 0 ? (
				<p className="text-sm text-muted-foreground">No replies yet.</p>
			) : null}
			{items.map((reply) => (
				<CommentListItem
					key={reply.id}
					comment={reply}
					isReplying={replyingTo === reply.id}
					viewerRole="admin"
					isPending={isPending}
					onEdit={handleEdit}
					onDelete={handleDelete}
					onPin={handlePin}
					onLike={handleLike}
					onSubmitReply={handleReply}
					onReply={() =>
						setReplyingTo((current) => (current === reply.id ? null : reply.id))
					}
				/>
			))}
		</div>
	);
}
