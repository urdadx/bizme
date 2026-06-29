import { useState } from "react";

import { FetchJsonError, type createEmbedApi } from "./embed-api";
import {
  removeComment,
  replaceReplyList,
  updateComment,
  type AuthProvider,
  type CommentItem,
  type StoredComment,
} from "./comment-store";

const BLOCKED_COMMENTER_MESSAGE = "This commenter is blocked";

export function useCommentActions({
  apiUrl,
  embedApi,
  installKey,
  pageUrl,
  pageTitle,
  provider,
  ensureAnonymousVisitor,
  getCurrentVisitorId,
  openAuthDialog,
  setStatusMessage,
  getReplyListKey,
}: {
  apiUrl: string;
  embedApi: ReturnType<typeof createEmbedApi>;
  installKey: string | undefined;
  pageUrl: string;
  pageTitle: string;
  provider: AuthProvider | null;
  ensureAnonymousVisitor: () => Promise<string>;
  getCurrentVisitorId: () => string | null;
  openAuthDialog: () => void;
  setStatusMessage: (message: string | null) => void;
  getReplyListKey: (parentId: string) => string;
}) {
  const [isReplying, setIsReplying] = useState(false);
  const [loadingRepliesCommentId, setLoadingRepliesCommentId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingBody, setEditingBody] = useState("");
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");

  const getCommentActionPayload = async () => {
    if (!provider) {
      openAuthDialog();
      throw new Error("Login to continue.");
    }

    if (!apiUrl || !installKey) {
      throw new Error("Missing widget install key or API URL.");
    }

    return {
      installKey,
      pageUrl,
      visitorId: provider === "anonymous" ? await ensureAnonymousVisitor() : undefined,
      authorProvider: provider,
    };
  };

  const fetchComments = async (parentId?: string) => {
    if (!apiUrl || !installKey) return;

    const response = await embedApi.fetchComments({
      installKey,
      pageUrl,
      parentId,
      visitorId: provider === "anonymous" ? (getCurrentVisitorId() ?? undefined) : undefined,
      authorProvider: provider ?? undefined,
    });
    return sortPinnedComments(response.comments ?? []);
  };

  const loadReplies = async (commentId: string) => {
    setLoadingRepliesCommentId(commentId);
    setStatusMessage(null);

    try {
      const replies = await fetchComments(commentId);

      if (replies) replaceReplyList(commentId, getReplyListKey(commentId), replies);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Unable to load replies.");
    } finally {
      setLoadingRepliesCommentId(null);
    }
  };

  const startEditingComment = (comment: StoredComment) => {
    setEditingCommentId(comment.id);
    setEditingBody(comment.content);
    setStatusMessage(null);
  };

  const cancelEditingComment = () => {
    setEditingCommentId(null);
    setEditingBody("");
  };

  const handleUpdateComment = async (comment: StoredComment) => {
    const body = editingBody.trim();

    if (!body || body === comment.content) {
      cancelEditingComment();
      return;
    }

    setStatusMessage(null);

    let payload: Awaited<ReturnType<typeof getCommentActionPayload>>;

    try {
      payload = await getCommentActionPayload();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Unable to update comment.");
      return;
    }

    const previousContent = comment.content;
    updateComment(comment.id, { content: body });
    cancelEditingComment();

    try {
      await embedApi.updateComment(comment.id, payload, body);
    } catch (error) {
      updateComment(comment.id, { content: previousContent });
      setStatusMessage(error instanceof Error ? error.message : "Unable to update comment.");
    }
  };

  const handleDeleteComment = async (comment: StoredComment) => {
    setStatusMessage(null);

    try {
      const payload = await getCommentActionPayload();
      await embedApi.deleteComment(comment.id, payload);
      removeComment(comment.id);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Unable to delete comment.");
    }
  };

  const handleLikeComment = async (comment: StoredComment) => {
    setStatusMessage(null);

    let payload: Awaited<ReturnType<typeof getCommentActionPayload>>;

    try {
      payload = await getCommentActionPayload();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Unable to update like.");
      return;
    }

    const previousLikes = comment.likes;
    const previousLiked = comment.liked;
    const nextLiked = !previousLiked;
    updateComment(comment.id, {
      liked: nextLiked,
      likes: Math.max(0, previousLikes + (nextLiked ? 1 : -1)),
    });

    try {
      const result = await embedApi.likeComment(comment.id, payload);
      updateComment(comment.id, { liked: result.liked, likes: result.likes });
    } catch (error) {
      updateComment(comment.id, { liked: previousLiked, likes: previousLikes });
      setStatusMessage(error instanceof Error ? error.message : "Unable to update like.");
    }
  };

  const startReplyingToComment = (comment: StoredComment) => {
    if (!provider) {
      openAuthDialog();
      return;
    }

    setReplyingCommentId(comment.id);
    setReplyBody("");
    setStatusMessage(null);
  };

  const cancelReply = () => {
    setReplyingCommentId(null);
    setReplyBody("");
  };

  const handleSubmitReply = async (comment: StoredComment) => {
    const body = replyBody.trim();

    if (!body) return;

    setIsReplying(true);
    setStatusMessage(null);

    try {
      const payload = await getCommentActionPayload();
      await embedApi.createComment({
        payload,
        pageTitle,
        body,
        parentId: comment.id,
      });
      await loadReplies(comment.id);
      cancelReply();
    } catch (error) {
      if (isBlockedCommenterError(error)) {
        setStatusMessage("You can no longer comment on this site.");
        return;
      }

      setStatusMessage(error instanceof Error ? error.message : "Unable to submit reply.");
    } finally {
      setIsReplying(false);
    }
  };

  return {
    editingCommentId,
    editingBody,
    replyingCommentId,
    replyBody,
    isReplying,
    loadingRepliesCommentId,
    onEditingBodyChange: setEditingBody,
    onReplyBodyChange: setReplyBody,
    onEdit: startEditingComment,
    onCancelEdit: cancelEditingComment,
    onSaveEdit: handleUpdateComment,
    onDelete: (comment: StoredComment) => void handleDeleteComment(comment),
    onLike: handleLikeComment,
    onReply: startReplyingToComment,
    onCancelReply: cancelReply,
    onSubmitReply: handleSubmitReply,
    onLoadReplies: loadReplies,
  };
}

function isBlockedCommenterError(error: unknown) {
  return (
    error instanceof FetchJsonError &&
    error.status === 403 &&
    error.message === BLOCKED_COMMENTER_MESSAGE
  );
}

function sortPinnedComments(items: CommentItem[]): CommentItem[] {
  return [...items]
    .sort((first, second) => Number(second.isPinned) - Number(first.isPinned))
    .map((item) => ({
      ...item,
      children: sortPinnedComments(item.children),
    }));
}
