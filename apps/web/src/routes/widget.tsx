import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { MoreVerticalIcon, PencilIcon, PinIcon, X } from "lucide-react";
import z from "zod";

import { AnonymousIcon } from "@/assets/icons/anonymous";
import { ChatLinear } from "@/assets/icons/chat-icon";
import { GalleryLinear } from "@/assets/icons/gallery-icon";
import { GithubSVG } from "@/assets/icons/github-svg";
import { GoogleSVG } from "@/assets/icons/google-svg";
import { LikeIcon } from "@/assets/icons/like-icon";
import { TrashBinLinear } from "@/assets/icons/trash-icon";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import LoadingDots from "@/components/loading-dots";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CommentImageDialog } from "@/components/widget/comment-image-dialog";
import { uploadCommentImages } from "@/lib/comment-attachments";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";
import { cn } from "@/lib/utils";

type AuthProvider = "anonymous" | "google" | "github";

type CommentItem = {
  id: string;
  author: string;
  authorProvider: AuthProvider | "email";
  date: string;
  content: string;
  likes: number;
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

type EmbedConfigResponse = {
  customization?: {
    brandColor?: string;
    textColor?: string;
    colorScheme?: ColorScheme;
  };
};

type ColorScheme = "system" | "light" | "dark";

type EmbedCommentsResponse = {
  comments?: CommentItem[];
  nextOffset?: number | null;
};

type EmbedCommentResponse = {
  comment?: CommentItem;
};

type AnonymousAuthResponse = {
  visitorId?: string;
};

type EmbedAuthSession = {
  provider: Exclude<AuthProvider, "anonymous">;
  name: string;
  email: string | null;
  avatar: string | null;
  expiresAt: number;
};

type EmbedAuthSessionResponse = {
  session: EmbedAuthSession | null;
};

type LocalCommentState = {
  key: string;
  created: CommentItem[];
  deletedIds: string[];
  loadedReplies: Record<string, CommentItem[]>;
  updated: Record<string, Partial<Pick<CommentItem, "content" | "likes">>>;
};

const widgetSearchSchema = z.object({
  installKey: z.string().optional(),
  apiUrl: z.string().optional(),
  pageUrl: z.string().optional(),
  pageTitle: z.string().optional(),
  hostOrigin: z.string().optional(),
  hostColorScheme: z.enum(["light", "dark"]).optional(),
});

const DEFAULT_BRAND_COLOR = "#6170F8";
const DEFAULT_TEXT_COLOR = "#1F2937";
const DEFAULT_DARK_TEXT_COLOR = "#F8FAFC";
const VISITOR_STORAGE_KEY = "bizme_visitor_id";
const BLOCKED_COMMENTER_MESSAGE = "This commenter is blocked";
const COMMENTS_PAGE_SIZE = 20;

export const Route = createFileRoute("/widget")({
  validateSearch: widgetSearchSchema,
  component: WidgetRoute,
});

class FetchJsonError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "FetchJsonError";
    this.status = status;
  }
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

function resolveColorScheme(
  colorScheme: ColorScheme | undefined,
  hostColorScheme: "light" | "dark" | undefined,
) {
  if (colorScheme === "light" || colorScheme === "dark") {
    return colorScheme;
  }

  if (hostColorScheme) {
    return hostColorScheme;
  }

  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }

  return "light";
}

function postHeight(target?: HTMLElement | null) {
  const height = target
    ? target.getBoundingClientRect().height
    : document.documentElement.scrollHeight;

  window.parent.postMessage(
    {
      type: "bizme:resize",
      height,
    },
    "*",
  );
}

function normalizeApiUrl(apiUrl: string | undefined) {
  return apiUrl?.replace(/\/$/, "") ?? "";
}

function getCurrentPageUrl() {
  return typeof window === "undefined" ? "" : window.location.href;
}

function getCurrentPageTitle() {
  return typeof document === "undefined" ? "" : document.title;
}

async function fetchJson<T>(apiUrl: string, path: string, init?: RequestInit) {
  const response = await fetch(`${apiUrl}${path}`, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message =
      payload?.error?.message ?? `Request failed with ${response.status}`;
    throw new FetchJsonError(message, response.status);
  }

  return response.json() as Promise<T>;
}

function isBlockedCommenterError(error: unknown) {
  return (
    error instanceof FetchJsonError &&
    error.status === 403 &&
    error.message === BLOCKED_COMMENTER_MESSAGE
  );
}

function getStoredVisitorId() {
  try {
    return window.localStorage.getItem(VISITOR_STORAGE_KEY);
  } catch {
    return null;
  }
}

function setStoredVisitorId(visitorId: string) {
  try {
    window.localStorage.setItem(VISITOR_STORAGE_KEY, visitorId);
  } catch {
    // Storage can be blocked inside embeds. The in-memory value still works.
  }
}

function sortPinnedComments(items: CommentItem[]): CommentItem[] {
  return [...items]
    .sort((first, second) => Number(second.isPinned) - Number(first.isPinned))
    .map((item) => ({
      ...item,
      children: sortPinnedComments(item.children),
    }));
}

function createLocalCommentState(key: string): LocalCommentState {
  return {
    key,
    created: [],
    deletedIds: [],
    loadedReplies: {},
    updated: {},
  };
}

function applyLocalCommentState(
  items: CommentItem[],
  state: LocalCommentState | null,
) {
  if (!state) return items;

  const activeState = state;
  const deletedIds = new Set(activeState.deletedIds);

  function applyItems(nextItems: CommentItem[]): CommentItem[] {
    const next: CommentItem[] = [];

    for (const item of nextItems) {
      if (deletedIds.has(item.id)) continue;

      const replyOverride = activeState.loadedReplies[item.id];
      const sourceChildren = replyOverride ?? item.children;
      const children = applyItems(sourceChildren);
      const directDeletedCount = sourceChildren.length - children.length;

      next.push({
        ...item,
        ...activeState.updated[item.id],
        replies: replyOverride
          ? Math.max(item.replies, children.length)
          : Math.max(0, item.replies - directDeletedCount),
        children,
      });
    }

    return sortPinnedComments(next);
  }

  return applyItems([...state.created, ...items]);
}

function useObjectUrls(files: File[]) {
  const [urls, setUrls] = useState<string[]>([]);

  useEffect(() => {
    const nextUrls = files.map((file) => URL.createObjectURL(file));
    setUrls(nextUrls);

    return () => {
      for (const url of nextUrls) {
        URL.revokeObjectURL(url);
      }
    };
  }, [files]);

  return urls;
}

function runMenuAction(event: React.MouseEvent, action: () => void) {
  event.preventDefault();
  action();
}

function WidgetRoute() {
  const search = Route.useSearch();
  const apiUrl = normalizeApiUrl(search.apiUrl);
  const pageUrl = search.pageUrl ?? getCurrentPageUrl();
  const pageTitle = search.pageTitle ?? getCurrentPageTitle();
  const commentsKey = `${apiUrl}\n${search.installKey ?? ""}\n${pageUrl}`;
  const [localCommentState, setLocalCommentState] = useState<LocalCommentState>(
    () => createLocalCommentState(commentsKey),
  );
  const [provider, setProvider] = useState<AuthProvider | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [bannedOpen, setBannedOpen] = useState(false);
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const visitorIdRef = useRef<string | null>(getStoredVisitorId());
  const [isConfigLoading, setIsConfigLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [loadingRepliesCommentId, setLoadingRepliesCommentId] = useState<
    string | null
  >(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingBody, setEditingBody] = useState("");
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(
    null,
  );
  const [replyBody, setReplyBody] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<CommentItem | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [brandColor, setBrandColor] = useState(DEFAULT_BRAND_COLOR);
  const [textColor, setTextColor] = useState(DEFAULT_TEXT_COLOR);
  const [colorSchemePreference, setColorSchemePreference] = useState<ColorScheme>("system");
  const [resolvedColorScheme, setResolvedColorScheme] = useState<
    "light" | "dark"
  >(() => search.hostColorScheme ?? "light");
  const [dialogTop, setDialogTop] = useState("50vh");
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const widgetRootRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const loadAuthSession = useEffectEvent(async () => {
    if (!apiUrl) return null;

    const response = await fetchJson<EmbedAuthSessionResponse>(
      apiUrl,
      "/embed/auth/session",
    );
    setProvider(response.session?.provider ?? (visitorIdRef.current ? "anonymous" : null));
    return response.session;
  });

  useEffect(() => {
    const target = widgetRootRef.current;

    postHeight(target);

    if (!target) {
      return;
    }

    const observer = new ResizeObserver(() => {
      postHeight(target);
    });
    observer.observe(target);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    void loadAuthSession().catch(() => {
      setProvider(visitorIdRef.current ? "anonymous" : null);
    });

    function handleAuthMessage(event: MessageEvent) {
      const data = event.data as {
        type?: string;
        ok?: boolean;
        message?: string;
        colorScheme?: "light" | "dark";
        iframeTop?: number;
        viewportHeight?: number;
      } | null;

      if (data?.type === "bizme:theme") {
        if (
          colorSchemePreference === "system" &&
          (data.colorScheme === "light" || data.colorScheme === "dark")
        ) {
          setResolvedColorScheme(data.colorScheme);
        }
        return;
      }

      if (data?.type === "bizme:viewport") {
        if (
          typeof data.iframeTop === "number" &&
          typeof data.viewportHeight === "number"
        ) {
          setDialogTop(`${Math.max(24, data.viewportHeight / 2 - data.iframeTop)}px`);
        }
        return;
      }

      if (data?.type !== "bizme:auth") return;

      if (!data.ok) {
        setProvider(null);
        setStatusMessage(data.message ?? "Unable to complete login.");
        return;
      }

      void loadAuthSession()
        .then((session) => {
          setStatusMessage(
            session ? `Commenting as ${session.name}.` : "Login completed.",
          );
        })
        .catch((error) => {
          setProvider(null);
          setStatusMessage(
            error instanceof Error
              ? error.message
              : "Unable to load login session.",
          );
        });
    }

    window.addEventListener("message", handleAuthMessage);
    return () => window.removeEventListener("message", handleAuthMessage);
  }, [apiUrl, colorSchemePreference]);

  useEffect(() => {
    let cancelled = false;

    async function loadWidgetConfig() {
      if (!search.installKey || !apiUrl) {
        setStatusMessage("Missing widget install key or API URL.");
        setIsConfigLoading(false);
        return;
      }

      setIsConfigLoading(true);
      setStatusMessage(null);

      try {
        const configResponse = await fetchJson<EmbedConfigResponse>(
          apiUrl,
          `/embed/config?installKey=${encodeURIComponent(search.installKey)}`,
        );

        if (cancelled) return;

        setBrandColor(
          configResponse.customization?.brandColor ?? DEFAULT_BRAND_COLOR,
        );
        setTextColor(
          configResponse.customization?.textColor ?? DEFAULT_TEXT_COLOR,
        );
        const nextColorScheme = configResponse.customization?.colorScheme ?? "system";
        setColorSchemePreference(nextColorScheme);
        setResolvedColorScheme(resolveColorScheme(nextColorScheme, search.hostColorScheme));
      } catch (error) {
        if (cancelled) return;

        setStatusMessage(
          error instanceof Error ? error.message : "Unable to load comments.",
        );
      } finally {
        if (!cancelled) {
          setIsConfigLoading(false);
        }
      }
    }

    void loadWidgetConfig();

    return () => {
      cancelled = true;
    };
  }, [apiUrl, search.hostColorScheme, search.installKey]);

  const {
    data: commentsData,
    error: commentsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isCommentsLoading,
  } = useInfiniteQuery({
    queryKey: ["embed-comments", apiUrl, search.installKey, pageUrl],
    initialPageParam: 0,
    enabled: Boolean(apiUrl && search.installKey),
    queryFn: ({ pageParam }) => {
      if (!search.installKey) {
        throw new Error("Missing widget install key.");
      }

      const params = new URLSearchParams({
        installKey: search.installKey,
        pageUrl,
        limit: String(COMMENTS_PAGE_SIZE),
        offset: String(pageParam),
      });

      return fetchJson<EmbedCommentsResponse>(
        apiUrl,
        `/embed/comments?${params.toString()}`,
      );
    },
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
  });

  const isLoading = isConfigLoading || isCommentsLoading;
  const activeLocalCommentState =
    localCommentState.key === commentsKey ? localCommentState : null;
  const fetchedComments = useMemo(() => {
    const pages = commentsData?.pages ?? [];
    const existingIds = new Set<string>();
    const nextComments: CommentItem[] = [];

    for (const page of pages) {
      for (const comment of page.comments ?? []) {
        if (existingIds.has(comment.id)) continue;
        existingIds.add(comment.id);
        nextComments.push(comment);
      }
    }

    return sortPinnedComments(nextComments);
  }, [commentsData]);
  const comments = useMemo(
    () => applyLocalCommentState(fetchedComments, activeLocalCommentState),
    [activeLocalCommentState, fetchedComments],
  );
  const visibleStatusMessage =
    statusMessage ??
    (commentsError
      ? commentsError instanceof Error
        ? commentsError.message
        : "Unable to load comments."
      : null);

  const updateLocalComments = (
    updater: (state: LocalCommentState) => LocalCommentState,
  ) => {
    setLocalCommentState((current) =>
      updater(
        current.key === commentsKey ? current : createLocalCommentState(commentsKey),
      ),
    );
  };

  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: "160px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  ]);

  const effectiveTextColor =
    resolvedColorScheme === "dark" && textColor === DEFAULT_TEXT_COLOR
      ? DEFAULT_DARK_TEXT_COLOR
      : textColor;
  const widgetBackgroundColor =
    resolvedColorScheme === "dark" ? "oklch(0.145 0 0)" : "oklch(1 0 0)";

  const ensureAnonymousVisitor = async () => {
    if (visitorIdRef.current) {
      return visitorIdRef.current;
    }

    if (!apiUrl) {
      throw new Error("Missing API URL.");
    }

    const response = await fetchJson<AnonymousAuthResponse>(
      apiUrl,
      "/embed/auth/anonymous",
      {
        method: "POST",
        body: JSON.stringify({}),
      },
    );

    if (!response.visitorId) {
      throw new Error("Anonymous auth did not return a visitor id.");
    }

    visitorIdRef.current = response.visitorId;
    setStoredVisitorId(response.visitorId);
    return response.visitorId;
  };

  const handleProvider = async (nextProvider: AuthProvider) => {
    setAuthOpen(false);
    setStatusMessage(null);

    if (nextProvider === "anonymous") {
      setProvider(nextProvider);

      try {
        await ensureAnonymousVisitor();
        setStatusMessage("Commenting anonymously.");
      } catch (error) {
        setProvider(null);
        setStatusMessage(
          error instanceof Error
            ? error.message
            : "Unable to start anonymous session.",
        );
      }

      return;
    }

    if (search.apiUrl) {
      const url = new URL(`/embed/auth/${nextProvider}/start`, search.apiUrl);
      if (search.installKey)
        url.searchParams.set("installKey", search.installKey);
      if (search.pageUrl) url.searchParams.set("pageUrl", search.pageUrl);
      window.open(
        url.toString(),
        "bizme-auth",
        "popup=yes,width=520,height=640",
      );
      setStatusMessage("Complete login in the popup to comment.");
    }
  };

  const handleSubmit = async () => {
    if (!provider) {
      setAuthOpen(true);
      return;
    }

    const body = input.trim();
    if (!body) return;

    if (!apiUrl || !search.installKey) {
      setStatusMessage("Missing widget install key or API URL.");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const selectedFiles = files;
      const anonymousVisitorId =
        provider === "anonymous" ? await ensureAnonymousVisitor() : undefined;
      const response = await fetchJson<EmbedCommentResponse>(
        apiUrl,
        "/embed/comments",
        {
          method: "POST",
          body: JSON.stringify({
            installKey: search.installKey,
            pageUrl,
            pageTitle,
            body,
            visitorId: anonymousVisitorId,
            authorProvider: provider,
          }),
        },
      );

      if (!response.comment) {
        throw new Error("Comment endpoint did not return a comment.");
      }

      const attachments = await uploadCommentImages(
        response.comment.id,
        selectedFiles,
        {
          visitorId: anonymousVisitorId,
        },
      );
      const createdComment = {
        ...response.comment,
        attachments,
      } as CommentItem;

      updateLocalComments((current) => ({
        ...current,
        created: [createdComment, ...current.created],
      }));
      setInput("");
      setFiles([]);

      if (uploadInputRef.current) {
        uploadInputRef.current.value = "";
      }
    } catch (error) {
      if (isBlockedCommenterError(error)) {
        setBannedOpen(true);
        return;
      }

      setStatusMessage(
        error instanceof Error ? error.message : "Unable to submit comment.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchComments = async (parentId?: string) => {
    if (!apiUrl || !search.installKey) return;

    const params = new URLSearchParams({
      installKey: search.installKey,
      pageUrl,
    });

    if (parentId) {
      params.set("parentId", parentId);
    }

    const response = await fetchJson<EmbedCommentsResponse>(
      apiUrl,
      `/embed/comments?${params.toString()}`,
    );
    return sortPinnedComments(response.comments ?? []);
  };

  const loadReplies = async (commentId: string) => {
    setLoadingRepliesCommentId(commentId);
    setStatusMessage(null);

    try {
      const replies = await fetchComments(commentId);

      if (replies) {
        updateLocalComments((current) => ({
          ...current,
          loadedReplies: {
            ...current.loadedReplies,
            [commentId]: replies,
          },
        }));
      }
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Unable to load replies.",
      );
    } finally {
      setLoadingRepliesCommentId(null);
    }
  };

  const getCommentActionPayload = async () => {
    if (!provider) {
      setAuthOpen(true);
      throw new Error("Login to continue.");
    }

    if (!apiUrl || !search.installKey) {
      throw new Error("Missing widget install key or API URL.");
    }

    return {
      installKey: search.installKey,
      pageUrl,
      visitorId:
        provider === "anonymous" ? await ensureAnonymousVisitor() : undefined,
      authorProvider: provider,
    };
  };

  const startEditingComment = (comment: CommentItem) => {
    setEditingCommentId(comment.id);
    setEditingBody(comment.content);
    setStatusMessage(null);
  };

  const cancelEditingComment = () => {
    setEditingCommentId(null);
    setEditingBody("");
  };

  const handleUpdateComment = async (comment: CommentItem) => {
    const body = editingBody.trim();

    if (!body || body === comment.content) {
      cancelEditingComment();
      return;
    }

    setStatusMessage(null);

    try {
      const payload = await getCommentActionPayload();
      await fetchJson<EmbedCommentResponse>(
        apiUrl,
        `/embed/comments/${comment.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ ...payload, body }),
        },
      );
      updateLocalComments((current) => ({
        ...current,
        updated: {
          ...current.updated,
          [comment.id]: {
            ...current.updated[comment.id],
            content: body,
          },
        },
      }));
      cancelEditingComment();
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Unable to update comment.",
      );
    }
  };

  const handleDeleteComment = async (comment: CommentItem) => {
    setStatusMessage(null);
    setIsDeleting(true);

    try {
      const payload = await getCommentActionPayload();
      await fetchJson<{ id: string }>(apiUrl, `/embed/comments/${comment.id}`, {
        method: "DELETE",
        body: JSON.stringify(payload),
      });
      updateLocalComments((current) => ({
        ...current,
        created: current.created.filter((item) => item.id !== comment.id),
        deletedIds: current.deletedIds.includes(comment.id)
          ? current.deletedIds
          : [...current.deletedIds, comment.id],
      }));
      setDeleteTarget(null);
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Unable to delete comment.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLikeComment = async (comment: CommentItem) => {
    setStatusMessage(null);

    try {
      const payload = await getCommentActionPayload();
      const result = await fetchJson<{ liked: boolean; likes: number }>(
        apiUrl,
        `/embed/comments/${comment.id}/like`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );
      updateLocalComments((current) => ({
        ...current,
        updated: {
          ...current.updated,
          [comment.id]: {
            ...current.updated[comment.id],
            likes: result.likes,
          },
        },
      }));
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Unable to update like.",
      );
    }
  };

  const startReplyingToComment = (comment: CommentItem) => {
    if (!provider) {
      setAuthOpen(true);
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

  const handleSubmitReply = async (comment: CommentItem) => {
    const body = replyBody.trim();

    if (!body) return;

    setIsReplying(true);
    setStatusMessage(null);

    try {
      const payload = await getCommentActionPayload();
      await fetchJson<EmbedCommentResponse>(apiUrl, "/embed/comments", {
        method: "POST",
        body: JSON.stringify({
          ...payload,
          pageTitle,
          body,
          parentId: comment.id,
        }),
      });
      await loadReplies(comment.id);
      cancelReply();
    } catch (error) {
      if (isBlockedCommenterError(error)) {
        setBannedOpen(true);
        return;
      }

      setStatusMessage(
        error instanceof Error ? error.message : "Unable to submit reply.",
      );
    } finally {
      setIsReplying(false);
    }
  };

  const previews = useObjectUrls(files);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles((current) => [
        ...current,
        ...Array.from(event.target.files ?? []),
      ]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );

    if (uploadInputRef.current) {
      uploadInputRef.current.value = "";
    }
  };

  return (
    <div
      ref={widgetRootRef}
      className={cn(
        "w-full bg-background p-0 text-sm",
        resolvedColorScheme === "dark" && "dark",
      )}
      style={{
        backgroundColor: widgetBackgroundColor,
        color: effectiveTextColor,
        colorScheme: resolvedColorScheme,
      }}
    >
      <style>{`html,body{margin:0;min-height:0;overflow:hidden;background:${widgetBackgroundColor};color-scheme:${resolvedColorScheme};}`}</style>
      <style>{`[data-slot="dialog-content"]{top:${dialogTop};}`}</style>
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4 p-1">
        <PromptInput
          value={input}
          onValueChange={setInput}
          isLoading={isSubmitting}
          onSubmit={handleSubmit}
          style={{ color: effectiveTextColor }}
          className="flex flex-col min-h-25 w-full max-w-xl rounded-xl shadow-none"
        >
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 pb-2">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="group relative h-20 w-20 overflow-hidden rounded-lg border bg-secondary"
                  onClick={(event) => event.stopPropagation()}
                >
                  <img
                    src={previews[index]}
                    alt={file.name}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <PromptInputTextarea
            placeholder="Write a comment..."
            className="flex-1 text-foreground"
          />

          <PromptInputActions className="flex items-center justify-between gap-2 pt-2">
            <PromptInputAction tooltip="Attach files">
              <label
                htmlFor="bizme-file-upload"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-2xl hover:bg-secondary-foreground/10"
              >
                <input
                  ref={uploadInputRef}
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="bizme-file-upload"
                />
                <GalleryLinear
                  color={brandColor}
                  className="size-5 text-primary"
                />
              </label>
            </PromptInputAction>

            <PromptInputAction
              tooltip={provider ? "Submit comment" : "Login to comment"}
            >
              <Button
                variant="default"
                size="sm"
                className="min-w-25 text-white hover:text-white"
                style={{ backgroundColor: brandColor }}
                onClick={handleSubmit}
                disabled={
                  isSubmitting || Boolean(provider && input.trim().length === 0)
                }
              >
                {isSubmitting ? (
                  <LoadingDots color="#fff" />
                ) : provider ? (
                  "Comment"
                ) : (
                  "Login to comment"
                )}
              </Button>
            </PromptInputAction>
          </PromptInputActions>
        </PromptInput>

        {visibleStatusMessage ? (
          <p className="text-xs text-muted-foreground">{visibleStatusMessage}</p>
        ) : null}

        <div className="flex flex-col rounded-lg border bg-background p-4">
          {isLoading ? (
            <div className="py-4 text-sm text-center text-muted-foreground">
              Loading comments...
            </div>
          ) : null}
          {!isLoading && comments.length === 0 ? (
            <div className="py-4 text-sm text-muted-foreground">
              No comments yet. Start the conversation.
            </div>
          ) : null}
          {!isLoading
            ? comments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  brandColor={brandColor}
                  editingCommentId={editingCommentId}
                  editingBody={editingBody}
                  replyingCommentId={replyingCommentId}
                  replyBody={replyBody}
                  isReplying={isReplying}
                  loadingRepliesCommentId={loadingRepliesCommentId}
                  onEditingBodyChange={setEditingBody}
                  onReplyBodyChange={setReplyBody}
                  onEdit={startEditingComment}
                  onCancelEdit={cancelEditingComment}
                  onSaveEdit={handleUpdateComment}
                  onDelete={setDeleteTarget}
                  onLike={handleLikeComment}
                  onReply={startReplyingToComment}
                  onCancelReply={cancelReply}
                  onSubmitReply={handleSubmitReply}
                  onLoadReplies={loadReplies}
                />
              ))
            : null}
          {!isLoading && comments.length > 0 ? (
            <div
              ref={loadMoreRef}
              className="py-3 text-center text-xs text-muted-foreground"
            >
              {isFetchingNextPage
                ? "Loading more comments..."
                : hasNextPage
                  ? ""
                  : "You're all caught up."}
            </div>
          ) : null}
        </div>
      </div>

      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Login to comment
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            <Button variant="outline" onClick={() => handleProvider("google")}>
              <GoogleSVG />
              Continue with Google
            </Button>
            <Button variant="outline" onClick={() => handleProvider("github")}>
              <GithubSVG />
              Continue with Github
            </Button>
            <Button
              variant="outline"
              onClick={() => handleProvider("anonymous")}
            >
              <AnonymousIcon />
              Comment as a guest
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={bannedOpen} onOpenChange={setBannedOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              You have been banned
            </DialogTitle>
            <DialogDescription>
              You can no longer comment on this site. If you think this is a
              mistake, contact the site owner.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setBannedOpen(false)}>
              Ok, I understand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDeleteComment(deleteTarget)}
        isDeleting={isDeleting}
        disabled={!deleteTarget}
      />
    </div>
  );
}

function CommentCard({
  comment,
  brandColor,
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
  isChild = false,
}: {
  comment: CommentItem;
  brandColor: string;
  editingCommentId: string | null;
  editingBody: string;
  replyingCommentId: string | null;
  replyBody: string;
  isReplying: boolean;
  loadingRepliesCommentId: string | null;
  onEditingBodyChange: (body: string) => void;
  onReplyBodyChange: (body: string) => void;
  onEdit: (comment: CommentItem) => void;
  onCancelEdit: () => void;
  onSaveEdit: (comment: CommentItem) => void;
  onDelete: (comment: CommentItem) => void;
  onLike: (comment: CommentItem) => void;
  onReply: (comment: CommentItem) => void;
  onCancelReply: () => void;
  onSubmitReply: (comment: CommentItem) => void;
  onLoadReplies: (commentId: string) => void;
  isChild?: boolean;
}) {
  const isEditing = editingCommentId === comment.id;
  const isReplyingToComment = replyingCommentId === comment.id;
  const hiddenRepliesCount = Math.max(
    0,
    comment.replies - comment.children.length,
  );
  const isLoadingReplies = loadingRepliesCommentId === comment.id;

  return (
    <div
      className={
        isChild
          ? "relative flex gap-3"
          : "border-b py-4 first:pt-0 last:border-b-0"
      }
    >
      <div className="relative w-full">
        {comment.children.length > 0 ? (
          <div className="absolute top-10 bottom-5 left-5 w-px bg-border" />
        ) : null}

        <div className="relative flex gap-3">
          <Avatar size="lg">
            {comment.avatar ? (
              <AvatarImage src={comment.avatar} alt={comment.author} />
            ) : null}
            <AvatarFallback>{getInitials(comment.author)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate font-sans text-sm font-semibold text-foreground">
                    {comment.author}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {comment.date}
                  </span>
                  {comment.isPinned ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      <PinIcon className="size-3 fill-current" />
                      Pinned
                    </span>
                  ) : null}
                </div>
                {isEditing ? (
                  <div className="mt-2 space-y-2">
                    <textarea
                      value={editingBody}
                      onChange={(event) =>
                        onEditingBodyChange(event.target.value)
                      }
                      aria-label="Edit comment"
                      className="min-h-20 w-full resize-y rounded-lg border bg-background px-3 py-2 text-sm leading-6 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        style={{
                          backgroundColor: brandColor,
                        }}
                        className="text-white hover:text-white"
                        onClick={() => onSaveEdit(comment)}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-white hover:text-white"
                        onClick={onCancelEdit}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {comment.content}
                    </p>
                    {comment.attachments.length > 0 ? (
                      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {comment.attachments.map((attachment) => (
                          <CommentImageDialog
                            key={attachment.id}
                            image={attachment}
                          />
                        ))}
                      </div>
                    ) : null}
                  </>
                )}
              </div>

              {isEditing ? null : (
                <CommentMenu
                  onEdit={() => onEdit(comment)}
                  onDelete={() => onDelete(comment)}
                />
              )}
            </div>

            <div className="mt-2 flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => onLike(comment)}>
                <LikeIcon color={brandColor} />
                <span className="ml-1 text-[#888888]">{comment.likes}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReply(comment)}
              >
                <ChatLinear color={brandColor} />
                <span className="ml-1 text-[#888888]">{comment.replies}</span>
              </Button>
            </div>

            {isReplyingToComment ? (
              <div className="mt-3 space-y-2">
                <textarea
                  value={replyBody}
                  onChange={(event) => onReplyBodyChange(event.target.value)}
                  placeholder="Write a reply..."
                  aria-label="Write a reply"
                  className="min-h-20 w-full resize-y rounded-lg border bg-background px-3 py-2 text-sm leading-6 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="min-w-14 text-white hover:text-white"
                    style={{ backgroundColor: brandColor }}
                    disabled={isReplying || replyBody.trim().length === 0}
                    onClick={() => onSubmitReply(comment)}
                  >
                    {isReplying ? <LoadingDots color="#fff" /> : "Reply"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onCancelReply}
                    disabled={isReplying}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : null}

            {hiddenRepliesCount > 0 ? (
              <button
                type="button"
                className="mt-3 text-xs font-medium text-muted-foreground hover:text-foreground"
                disabled={isLoadingReplies}
                onClick={() => onLoadReplies(comment.id)}
              >
                {isLoadingReplies
                  ? "Loading replies..."
                  : `Show ${hiddenRepliesCount} ${hiddenRepliesCount === 1 ? "reply" : "replies"}`}
              </button>
            ) : null}
          </div>
        </div>

        {comment.children.length > 0 ? (
          <div className="mt-4 flex flex-col gap-4">
            {comment.children.map((child) => (
              <CommentCard
                key={child.id}
                comment={child}
                brandColor={brandColor}
                editingCommentId={editingCommentId}
                editingBody={editingBody}
                replyingCommentId={replyingCommentId}
                replyBody={replyBody}
                isReplying={isReplying}
                loadingRepliesCommentId={loadingRepliesCommentId}
                onEditingBodyChange={onEditingBodyChange}
                onReplyBodyChange={onReplyBodyChange}
                onEdit={onEdit}
                onCancelEdit={onCancelEdit}
                onSaveEdit={onSaveEdit}
                onDelete={onDelete}
                onLike={onLike}
                onReply={onReply}
                onCancelReply={onCancelReply}
                onSubmitReply={onSubmitReply}
                onLoadReplies={onLoadReplies}
                isChild
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function CommentMenu({
  viewerRole = "commenter",
  onEdit,
  onDelete,
}: {
  viewerRole?: "admin" | "commenter";
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 shrink-0"
            aria-label="Open comment options"
          />
        }
      >
        <MoreVerticalIcon className="h-4 w-4 text-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-32 min-w-32 border bg-background text-foreground shadow-lg"
      >
        {viewerRole === "admin" ? (
          <DropdownMenuItem className="focus:bg-muted focus:text-foreground">
            <PinIcon className="size-4" />
            Pin
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            className="focus:bg-muted focus:text-foreground"
            onClick={onEdit}
            onMouseDown={(event) => runMenuAction(event, onEdit)}
          >
            <PencilIcon className="size-4" />
            Edit
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          className="text-destructive focus:bg-muted focus:text-destructive"
          onClick={onDelete}
          onMouseDown={(event) => runMenuAction(event, onDelete)}
        >
          <TrashBinLinear color="red" className="size-4" />
          <span className="text-red-600">Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
