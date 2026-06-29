import { createContext, useContext, type ReactNode } from "react";

import type { StoredComment } from "./comment-store";

export type WidgetCommentContextValue = {
  brandColor: string;
  getReplyListKey: (parentId: string) => string;
  editingCommentId: string | null;
  editingBody: string;
  replyingCommentId: string | null;
  replyBody: string;
  isReplying: boolean;
  loadingRepliesCommentId: string | null;
  onEditingBodyChange: (body: string) => void;
  onReplyBodyChange: (body: string) => void;
  onEdit: (comment: StoredComment) => void;
  onCancelEdit: () => void;
  onSaveEdit: (comment: StoredComment) => void;
  onDelete: (comment: StoredComment) => void;
  onLike: (comment: StoredComment) => void;
  onReply: (comment: StoredComment) => void;
  onCancelReply: () => void;
  onSubmitReply: (comment: StoredComment) => void;
  onLoadReplies: (commentId: string) => void;
};

const WidgetCommentContext = createContext<WidgetCommentContextValue | null>(null);

export function WidgetCommentProvider({
  value,
  children,
}: {
  value: WidgetCommentContextValue;
  children: ReactNode;
}) {
  return <WidgetCommentContext.Provider value={value}>{children}</WidgetCommentContext.Provider>;
}

export function useWidgetCommentContext() {
  const context = useContext(WidgetCommentContext);

  if (!context)
    throw new Error("Widget comment components must be wrapped in WidgetCommentProvider");
  return context;
}
