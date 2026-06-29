import { useSyncExternalStore } from "react";

export type AuthProvider = "anonymous" | "google" | "github";

export type CommentItem = {
  id: string;
  author: string;
  authorProvider: AuthProvider | "email";
  date: string;
  content: string;
  likes: number;
  liked: boolean;
  replies: number;
  isPinned: boolean;
  avatar: string | null;
  attachments: {
    id: string;
    url: string;
    filename: string;
    mimeType: string;
    size: number;
  }[];
  children: CommentItem[];
};

export type StoredComment = Omit<CommentItem, "children"> & {
  children: string[];
};

const EMPTY_IDS: string[] = [];
const comments = new Map<string, StoredComment>();
const lists = new Map<string, string[]>();
const deletedIds = new Set<string>();
const listeners = new Set<() => void>();
let version = 0;

function emit() {
  version++;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return version;
}

export function createCommentListKey({
  apiUrl,
  installKey,
  pageUrl,
  parentId,
}: {
  apiUrl: string;
  installKey: string | undefined;
  pageUrl: string;
  parentId?: string;
}) {
  return `${apiUrl}\n${installKey ?? ""}\n${pageUrl}\n${parentId ?? "root"}`;
}

export function useCommentIds(listKey: string): string[] {
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return lists.get(listKey) ?? EMPTY_IDS;
}

export function useComment(commentId: string): StoredComment | undefined {
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return comments.get(commentId);
}

export function replaceCommentList(listKey: string, items: CommentItem[]) {
  lists.set(listKey, syncCommentTree(items));
  emit();
}

export function syncFetchedCommentList(listKey: string, items: CommentItem[]) {
  const fetchedIds = syncCommentTree(items);
  const fetchedIdSet = new Set(fetchedIds);
  const existingLocalIds = (lists.get(listKey) ?? EMPTY_IDS).filter((id) => !fetchedIdSet.has(id));

  lists.set(listKey, mergeIds(existingLocalIds, fetchedIds));
  emit();
}

export function appendCommentList(listKey: string, items: CommentItem[]) {
  const nextIds = syncCommentTree(items);
  const existing = lists.get(listKey) ?? EMPTY_IDS;
  lists.set(listKey, mergeIds(existing, nextIds));
  emit();
}

export function prependComment(listKey: string, item: CommentItem) {
  deletedIds.delete(item.id);
  const [id] = syncCommentTree([item]);
  const existing = lists.get(listKey) ?? EMPTY_IDS;
  lists.set(listKey, mergeIds(id ? [id] : [], existing));
  emit();
}

export function replaceReplyList(parentId: string, listKey: string, items: CommentItem[]) {
  const childIds = syncCommentTree(items);
  const parent = comments.get(parentId);

  lists.set(listKey, childIds);

  if (parent) {
    comments.set(parentId, {
      ...parent,
      replies: Math.max(parent.replies, childIds.length),
    });
  }

  emit();
}

export function updateComment(
  commentId: string,
  update: Partial<Pick<StoredComment, "content" | "likes" | "liked" | "replies" | "isPinned">>,
) {
  const current = comments.get(commentId);
  if (!current) return;

  comments.set(commentId, { ...current, ...update });
  emit();
}

export function removeComment(commentId: string) {
  deletedIds.add(commentId);
  comments.delete(commentId);

  for (const [key, ids] of lists) {
    const nextIds = ids.filter((id) => id !== commentId);
    if (nextIds.length !== ids.length) {
      lists.set(key, nextIds);

      const parentId = getParentIdFromListKey(key);
      const parent = parentId ? comments.get(parentId) : undefined;
      if (parentId && parent)
        comments.set(parentId, { ...parent, replies: Math.max(0, parent.replies - 1) });
    }
  }

  for (const [id, comment] of comments) {
    if (!comment.children.includes(commentId)) continue;
    comments.set(id, {
      ...comment,
      children: comment.children.filter((childId) => childId !== commentId),
      replies: Math.max(0, comment.replies - 1),
    });
  }

  emit();
}

function syncCommentTree(items: CommentItem[]): string[] {
  const ids: string[] = [];

  for (const item of items) {
    if (deletedIds.has(item.id)) continue;

    const children = syncCommentTree(item.children);
    comments.set(item.id, { ...item, children });
    ids.push(item.id);
  }

  return ids;
}

function mergeIds(first: string[], second: string[]) {
  const seen = new Set<string>();
  const merged: string[] = [];

  for (const id of [...first, ...second]) {
    if (seen.has(id)) continue;
    seen.add(id);
    merged.push(id);
  }

  return merged;
}

function getParentIdFromListKey(key: string) {
  const parts = key.split("\n");
  const parentId = parts[parts.length - 1];
  return parentId && parentId !== "root" ? parentId : null;
}
