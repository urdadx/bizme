import { useState } from "react";

import "./comment-section.css";
import { DeleteIcon, EditIcon, EmptyIcon, LikeIcon, MenuIcon, ReplyIcon } from "./icons";
import { ShadowPopover } from "./popover";
import { ShadowSelect } from "./select";

export type ShadowComment = {
  id: string;
  author: string;
  date: string;
  message: string;
  avatar?: string;
  likes: number;
  liked?: boolean;
  badge?: string;
  replies?: ShadowComment[];
};

export function ShadowCommentSection({ comments }: { comments: ShadowComment[] }) {
  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "popular", label: "Popular" },
  ] as const;

  return (
    <section className="bizme-comments" aria-labelledby="bizme-comments-title">
      <header className="bizme-comments__header">
        <h2 className="bizme-comments__title" id="bizme-comments-title">
          Comments <span className="bizme-comments__count">{comments.length}</span>
        </h2>
        <ShadowSelect label="Sort comments" options={sortOptions} defaultValue="newest" />
      </header>

      <ol className="bizme-comments__list">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </ol>
    </section>
  );
}

export function ShadowCommentEmptyState() {
  return (
    <section className="bizme-comments">
      <div className="bizme-comments__state">
        <div>
          <EmptyIcon className="bizme-comments__state-icon" />
          <p className="bizme-comments__state-title">No comments yet</p>
          <p className="bizme-comments__state-copy">
            Start the conversation with the first comment.
          </p>
        </div>
      </div>
    </section>
  );
}

function CommentItem({ comment, isReply = false }: { comment: ShadowComment; isReply?: boolean }) {
  const [liked, setLiked] = useState(comment.liked ?? false);
  const [showReplies, setShowReplies] = useState(true);
  const replies = comment.replies ?? [];
  const isThreaded = replies.length > 0 && showReplies;

  return (
    <li
      className={`${isReply ? "bizme-comments__reply" : "bizme-comments__item"}${
        isThreaded ? " bizme-comments__item--threaded" : ""
      }`}
    >
      <article className="bizme-comments__comment">
        <Avatar comment={comment} />
        <div className="bizme-comments__content">
          <div className="bizme-comments__meta">
            <span className="bizme-comments__author">{comment.author}</span>
            <time className="bizme-comments__date">{comment.date}</time>
            {comment.badge ? <span className="bizme-comments__badge">{comment.badge}</span> : null}
          </div>
          <p className="bizme-comments__message">{comment.message}</p>
          <div className="bizme-comments__actions">
            <button
              type="button"
              className={`bizme-comments__action${liked ? " bizme-comments__action--active" : ""}`}
              onClick={() => setLiked((current) => !current)}
              aria-pressed={liked}
            >
              <LikeIcon />
              {comment.likes + (liked && !comment.liked ? 1 : !liked && comment.liked ? -1 : 0)}
            </button>
            <button type="button" className="bizme-comments__action">
              <ReplyIcon />
              Reply
            </button>
          </div>
        </div>
        <div className="bizme-comments__menu">
          <ShadowPopover
            triggerLabel="Comment options"
            trigger={
              <span className="bizme-comments__icon-button">
                <MenuIcon />
              </span>
            }
          >
            <button type="button" className="bizme-popover__item">
              <EditIcon />
              Edit
            </button>
            <button type="button" className="bizme-popover__item bizme-popover__item--danger">
              <DeleteIcon />
              Delete
            </button>
          </ShadowPopover>
        </div>
      </article>

      {replies.length > 0 && showReplies ? (
        <ol className="bizme-comments__replies bizme-comments__thread">
          {replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} isReply />
          ))}
        </ol>
      ) : null}

      {replies.length > 0 ? (
        <button
          type="button"
          className="bizme-comments__more"
          onClick={() => setShowReplies((current) => !current)}
        >
          {showReplies
            ? "Hide replies"
            : `View ${replies.length} ${replies.length === 1 ? "reply" : "replies"}`}
        </button>
      ) : null}
    </li>
  );
}

function Avatar({ comment }: { comment: ShadowComment }) {
  return (
    <span className="bizme-comments__avatar">
      {comment.avatar ? (
        <img src={comment.avatar} alt="" />
      ) : (
        comment.author.slice(0, 2).toUpperCase()
      )}
    </span>
  );
}
