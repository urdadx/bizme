import type { RefObject } from "react";

import { ShadowCommentComposer } from "@/components/shadow-widget/comment-composer";
import { DeleteIcon, EditIcon, EmptyIcon, LikeIcon, MenuIcon, ReplyIcon } from "@/components/shadow-widget/icons";
import { ShadowPopover } from "@/components/shadow-widget/popover";

import "@/components/shadow-widget/comment-section.css";

import { useComment, useCommentIds, type StoredComment } from "./comment-store";
import { useWidgetCommentContext } from "./widget-context";

export function CommentFeed({
  listKey,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  loadMoreRef,
}: {
  listKey: string;
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  loadMoreRef?: RefObject<HTMLParagraphElement | null>;
}) {
  const commentIds = useCommentIds(listKey);

  return (
    <section className="bizme-comments" aria-labelledby="bizme-feed-title">
      <header className="bizme-comments__header">
        <h2 className="bizme-comments__title" id="bizme-feed-title">
          Comments <span className="bizme-comments__count">{commentIds.length}</span>
        </h2>
      </header>

      {isLoading ? (
        <div className="bizme-comments__state">
          <div>
            <p className="bizme-comments__state-title">Loading comments...</p>
          </div>
        </div>
      ) : commentIds.length === 0 ? (
        <div className="bizme-comments__state">
          <div>
            <EmptyIcon className="bizme-comments__state-icon" width="34" height="34" />
            <p className="bizme-comments__state-title">No comments yet</p>
          </div>
        </div>
      ) : (
        <ol className="bizme-comments__list" aria-label="Comments">
          {commentIds.map((commentId) => (
            <CommentCard key={commentId} commentId={commentId} />
          ))}
        </ol>
      )}

      {!isLoading && commentIds.length > 0 ? (
        <p ref={loadMoreRef} className="bizme-comments__foot">
          {isFetchingNextPage
            ? "Loading more comments..."
            : hasNextPage
              ? "\u200b"
              : "You're all caught up."}
        </p>
      ) : null}
    </section>
  );
}

function CommentCard({ commentId, isChild = false }: { commentId: string; isChild?: boolean }) {
  const comment = useComment(commentId);
  const {
    getReplyListKey,
    editingCommentId,
    editingBody,
    replyingCommentId,
    replyBody,
    isReplying,
    loadingRepliesCommentId,
    onEditingBodyChange,
    onReplyBodyChange,
    onEdit,
    onCancelEdit,
    onSaveEdit,
    onDelete,
    onLike,
    onReply,
    onCancelReply,
    onSubmitReply,
    onLoadReplies,
  } = useWidgetCommentContext();

  if (!comment) return null;

  const replyListKey = getReplyListKey(commentId);
  const replyIds = useCommentIds(replyListKey);
  const isEditing = editingCommentId === comment.id;
  const isReplyingToComment = replyingCommentId === comment.id;
  const hiddenRepliesCount = Math.max(0, comment.replies - replyIds.length);
  const isLoadingReplies = loadingRepliesCommentId === comment.id;

  return (
    <li
      className={`${isChild ? "bizme-comments__reply" : "bizme-comments__item"}${
        replyIds.length > 0 ? " bizme-comments__item--threaded" : ""
      }`}
    >
      <article className="bizme-comments__comment">
        <Avatar comment={comment} />

        <div className="bizme-comments__content">
          <div className="bizme-comments__meta">
            <span className="bizme-comments__author">{comment.author}</span>
            <time className="bizme-comments__date">{comment.date}</time>
            {comment.isPinned ? <span className="bizme-comments__badge">Pinned</span> : null}
          </div>

          {isEditing ? (
            <div className="bizme-comments__edit">
              <textarea
                className="bizme-comments__edit-textarea"
                value={editingBody}
                onChange={(event) => onEditingBodyChange(event.target.value)}
                aria-label="Edit comment"
              />
              <div className="bizme-comments__edit-actions">
                <button
                  type="button"
                  className="bizme-comments__button bizme-comments__button--primary"
                  onClick={() => onSaveEdit(comment)}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="bizme-comments__button"
                  onClick={onCancelEdit}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="bizme-comments__message">{comment.content}</p>

              {comment.attachments.length > 0 ? (
                <div className="bizme-comments__attachment-grid" aria-label="Attachments">
                  {comment.attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img src={attachment.url} alt={attachment.filename} loading="lazy" />
                    </a>
                  ))}
                </div>
              ) : null}
            </>
          )}

          {!isEditing ? (
            <div className="bizme-comments__actions">
              <button
                type="button"
                className={`bizme-comments__action${comment.liked ? " bizme-comments__action--active" : ""}`}
                onClick={() => onLike(comment)}
                aria-pressed={comment.liked}
              >
                <LikeIcon />
                {comment.likes}
              </button>
              <button type="button" className="bizme-comments__action" onClick={() => onReply(comment)}>
                <ReplyIcon />
                {comment.replies}
              </button>
            </div>
          ) : null}
        </div>

        {!isEditing ? (
          <div className="bizme-comments__menu">
            <ShadowPopover
              triggerLabel="Comment options"
              trigger={
                <span className="bizme-comments__icon-button">
                  <MenuIcon />
                </span>
              }
            >
              <button type="button" className="bizme-popover__item" onClick={() => onEdit(comment)}>
                <EditIcon />
                Edit
              </button>
              <button
                type="button"
                className="bizme-popover__item bizme-popover__item--danger"
                onClick={() => onDelete(comment)}
              >
                <DeleteIcon />
                Delete
              </button>
            </ShadowPopover>
          </div>
        ) : null}
      </article>

      {isReplyingToComment ? (
        <div className="bizme-comments__reply-composer">
          <ShadowCommentComposer
            value={replyBody}
            onValueChange={onReplyBodyChange}
            isSubmitting={isReplying}
            hideAttachments
            submitLabel="Reply"
            onSubmit={() => onSubmitReply(comment)}
          />
          <button type="button" className="bizme-comments__more" onClick={onCancelReply} disabled={isReplying}>
            Cancel
          </button>
        </div>
      ) : null}

      {replyIds.length > 0 ? (
        <ol className="bizme-comments__replies bizme-comments__thread">
          {replyIds.map((replyId) => (
            <CommentCard key={replyId} commentId={replyId} isChild />
          ))}
        </ol>
      ) : null}

      {hiddenRepliesCount > 0 ? (
        <button
          type="button"
          className="bizme-comments__more"
          disabled={isLoadingReplies}
          onClick={() => onLoadReplies(comment.id)}
        >
          {isLoadingReplies
            ? "Loading replies..."
            : `View ${hiddenRepliesCount} ${hiddenRepliesCount === 1 ? "reply" : "replies"}`}
        </button>
      ) : null}
    </li>
  );
}

function Avatar({ comment }: { comment: StoredComment }) {
  return (
    <span className="bizme-comments__avatar">
      {comment.avatar ? (
        <img src={comment.avatar} alt="" />
      ) : (
        getInitials(comment.author)
      )}
    </span>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
