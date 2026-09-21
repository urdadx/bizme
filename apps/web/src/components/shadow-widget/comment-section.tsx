import { useState } from "react";

import "./comment-section.css";
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
          <EmptyIcon />
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

  return (
    <li className={isReply ? "bizme-comments__reply" : "bizme-comments__item"}>
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

function EmptyIcon() {
  return (
    <svg className="bizme-comments__state-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M22 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
      <path
        d="M15.612 2.038C14.59 2 13.399 2 12 2 7.286 2 4.929 2 3.464 3.464 2 4.93 2 7.286 2 12s0 7.071 1.464 8.535C4.93 22 7.286 22 12 22s7.071 0 8.535-1.465C22 19.072 22 16.714 22 12c0-1.399 0-2.59-.038-3.612a4.5 4.5 0 0 1-6.35-6.35"
        opacity=".5"
      />
      <path d="M3.465 20.536C4.929 22 7.286 22 12 22s7.072 0 8.536-1.465C21.893 19.179 21.993 17.056 22 13h-3.16c-.905 0-1.358 0-1.755.183-.398.183-.693.527-1.282 1.214l-.605.706c-.59.687-.884 1.031-1.282 1.214s-.85.183-1.755.183h-.321c-.905 0-1.358 0-1.756-.183s-.692-.527-1.281-1.214l-.606-.706c-.589-.687-.883-1.031-1.281-1.214S6.066 13 5.16 13H2c.007 4.055.107 6.179 1.465 7.535" />
    </svg>
  );
}

function LikeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7.5 10v10H4.8A1.8 1.8 0 0 1 3 18.2v-6.4A1.8 1.8 0 0 1 4.8 10h2.7Zm0 0 3.3-6.1a1.5 1.5 0 0 1 2.8 1v3.2h4.2a2.2 2.2 0 0 1 2.1 2.8l-2 7.4a2.3 2.3 0 0 1-2.2 1.7H7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ReplyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <g stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12c0 1.6.376 3.112 1.043 4.453c.178.356.237.763.134 1.148l-.595 2.226a1.3 1.3 0 0 0 1.591 1.592l2.226-.596a1.63 1.63 0 0 1 1.149.133A9.96 9.96 0 0 0 12 22Z" />
        <path d="M8 10.5h8M8 14h5.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <g stroke="currentColor" strokeWidth="1.5">
        <path d="m15.287 3.152-.927.927-8.521 8.52c-.577.578-.866.867-1.114 1.185a6.6 6.6 0 0 0-.749 1.211c-.173.364-.302.752-.56 1.526l-1.094 3.281-.268.802a1.06 1.06 0 0 0 1.342 1.342l.802-.268 3.281-1.094c.775-.258 1.162-.387 1.526-.56q.647-.308 1.211-.749c.318-.248.607-.537 1.184-1.114l8.521-8.521.927-.927a3.932 3.932 0 0 0-5.561-5.561Z" />
        <path d="M14.36 4.078s.116 1.97 1.854 3.708 3.707 1.853 3.707 1.853M4.198 21.678l-1.876-1.876" opacity=".5" />
      </g>
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9.17 4a3.001 3.001 0 0 1 5.66 0m5.67 2h-17m15.333 2.5-.46 6.9c-.177 2.654-.265 3.981-1.13 4.79s-2.196.81-4.856.81h-.774c-2.66 0-3.991 0-4.856-.81-.865-.809-.954-2.136-1.13-4.79l-.46-6.9M9.5 11l.5 5m4.5-5-.5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  );
}
