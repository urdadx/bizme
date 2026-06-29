import {
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
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
import LoadingDots from "@/components/loading-dots";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CommentImageDialog } from "@/components/widget/comment-image-dialog";
import {
  createEmbedApi,
  FetchJsonError,
  type ColorScheme,
} from "@/components/widget/embed-api";
import {
  useWidgetCommentContext,
  WidgetCommentProvider,
} from "@/components/widget/widget-context";
import {
  createCommentListKey,
  prependComment,
  syncFetchedCommentList,
  useComment,
  useCommentIds,
  type AuthProvider,
  type CommentItem,
} from "@/components/widget/comment-store";
import { useCommentActions } from "@/components/widget/use-comment-actions";
import { uploadCommentImages } from "@/lib/comment-attachments";
import {
  Dialog,
  DialogContent,
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
  const embedApi = useMemo(() => createEmbedApi(apiUrl), [apiUrl]);
  const pageUrl = search.pageUrl ?? getCurrentPageUrl();
  const pageTitle = search.pageTitle ?? getCurrentPageTitle();
  const rootListKey = createCommentListKey({
    apiUrl,
    installKey: search.installKey,
    pageUrl,
  });
  const getReplyListKey = (parentId: string) =>
    createCommentListKey({
      apiUrl,
      installKey: search.installKey,
      pageUrl,
      parentId,
    });
  const [provider, setProvider] = useState<AuthProvider | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const visitorIdRef = useRef<string | null>(getStoredVisitorId());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [hostColorScheme, setHostColorScheme] = useState<"light" | "dark">(
    () => search.hostColorScheme ?? "light",
  );
  const [dialogTop, setDialogTop] = useState("50vh");
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const widgetRootRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const loadAuthSession = useEffectEvent(async () => {
    if (!apiUrl) return null;

    const response = await embedApi.getAuthSession();
    setProvider(
      response.session?.provider ?? (visitorIdRef.current ? "anonymous" : null),
    );
    return response.session;
  });

  const missingWidgetConfig = !apiUrl || !search.installKey;
  const configQuery = useQuery({
    queryKey: ["embed-config", apiUrl, search.installKey],
    enabled: !missingWidgetConfig,
    queryFn: () => {
      if (!search.installKey) {
        throw new Error("Missing widget install key.");
      }

      return embedApi.getConfig(search.installKey);
    },
  });
  const brandColor =
    configQuery.data?.customization?.brandColor ?? DEFAULT_BRAND_COLOR;
  const textColor =
    configQuery.data?.customization?.textColor ?? DEFAULT_TEXT_COLOR;
  const colorSchemePreference =
    configQuery.data?.customization?.colorScheme ?? "system";
  const resolvedColorScheme = resolveColorScheme(
    colorSchemePreference,
    hostColorScheme,
  );

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
          setHostColorScheme(data.colorScheme);
        }
        return;
      }

      if (data?.type === "bizme:viewport") {
        if (
          typeof data.iframeTop === "number" &&
          typeof data.viewportHeight === "number"
        ) {
          setDialogTop(
            `${Math.max(24, data.viewportHeight / 2 - data.iframeTop)}px`,
          );
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

  const {
    data: commentsData,
    error: commentsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isCommentsLoading,
  } = useInfiniteQuery({
    queryKey: [
      "embed-comments",
      apiUrl,
      search.installKey,
      pageUrl,
      provider,
      provider === "anonymous" ? visitorIdRef.current : null,
    ],
    initialPageParam: 0,
    enabled: Boolean(apiUrl && search.installKey),
    queryFn: ({ pageParam }) => {
      if (!search.installKey) {
        throw new Error("Missing widget install key.");
      }

      return embedApi.fetchComments({
        installKey: search.installKey,
        pageUrl,
        limit: COMMENTS_PAGE_SIZE,
        offset: pageParam,
        visitorId:
          provider === "anonymous"
            ? (visitorIdRef.current ?? undefined)
            : undefined,
        authorProvider: provider ?? undefined,
      });
    },
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
  });

  const isLoading = configQuery.isLoading || isCommentsLoading;
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

  useEffect(() => {
    syncFetchedCommentList(rootListKey, fetchedComments);
  }, [fetchedComments, rootListKey]);

  const visibleStatusMessage =
    statusMessage ??
    (missingWidgetConfig ? "Missing widget install key or API URL." : null) ??
    (configQuery.error
      ? configQuery.error instanceof Error
        ? configQuery.error.message
        : "Unable to load comments."
      : null) ??
    (commentsError
      ? commentsError instanceof Error
        ? commentsError.message
        : "Unable to load comments."
      : null);

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
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const effectiveTextColor =
    resolvedColorScheme === "dark" && textColor === DEFAULT_TEXT_COLOR
      ? DEFAULT_DARK_TEXT_COLOR
      : textColor;

  const ensureAnonymousVisitor = async () => {
    if (visitorIdRef.current) {
      return visitorIdRef.current;
    }

    if (!apiUrl) {
      throw new Error("Missing API URL.");
    }

    const response = await embedApi.createAnonymousVisitor();

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
      const response = await embedApi.createComment({
        payload: {
          installKey: search.installKey,
          pageUrl,
          visitorId: anonymousVisitorId,
          authorProvider: provider,
        },
        pageTitle,
        body,
      });

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

      prependComment(rootListKey, createdComment);
      setInput("");
      setFiles([]);

      if (uploadInputRef.current) {
        uploadInputRef.current.value = "";
      }
    } catch (error) {
      if (isBlockedCommenterError(error)) {
        setStatusMessage("You can no longer comment on this site.");
        return;
      }

      setStatusMessage(
        error instanceof Error ? error.message : "Unable to submit comment.",
      );
    } finally {
      setIsSubmitting(false);
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

  const commentActions = useCommentActions({
    apiUrl,
    embedApi,
    installKey: search.installKey,
    pageUrl,
    pageTitle,
    provider,
    ensureAnonymousVisitor,
    getCurrentVisitorId: () => visitorIdRef.current,
    openAuthDialog: () => setAuthOpen(true),
    setStatusMessage,
    getReplyListKey,
  });

  return (
    <div
      ref={widgetRootRef}
      className={cn(
        "bizme-widget w-full bg-background p-0 text-sm",
        resolvedColorScheme === "dark" && "dark",
      )}
      style={{
        color: effectiveTextColor,
        colorScheme: resolvedColorScheme,
      }}
    >
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
          <p
            className={cn(
              "text-xs",
              visibleStatusMessage === "You can no longer comment on this site."
                ? "font-medium text-red-600"
                : "text-muted-foreground",
            )}
          >
            {visibleStatusMessage}
          </p>
        ) : null}

        <WidgetCommentProvider
          value={{
            brandColor,
            getReplyListKey,
            ...commentActions,
          }}
        >
          <CommentList
            listKey={rootListKey}
            isLoading={isLoading}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            loadMoreRef={loadMoreRef}
          />
        </WidgetCommentProvider>
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
    </div>
  );
}

function CommentList({
  listKey,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  loadMoreRef,
  isChildList = false,
}: {
  listKey: string;
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  loadMoreRef?: RefObject<HTMLDivElement | null>;
  isChildList?: boolean;
}) {
  const commentIds = useCommentIds(listKey);

  return (
    <div
      className={
        isChildList
          ? "mt-4 flex flex-col gap-4"
          : "flex flex-col rounded-lg border bg-background p-4"
      }
    >
      {isLoading ? (
        <div className="py-4 text-sm text-center text-muted-foreground">
          Loading comments...
        </div>
      ) : null}
      {!isChildList && !isLoading && commentIds.length === 0 ? (
        <div className="py-4 text-sm text-muted-foreground">
          No comments yet. Start the conversation.
        </div>
      ) : null}
      {!isLoading
        ? commentIds.map((commentId) => (
            <CommentCard
              key={commentId}
              commentId={commentId}
              isChild={isChildList}
            />
          ))
        : null}
      {!isChildList && !isLoading && commentIds.length > 0 ? (
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
  );
}

function CommentCard({
  commentId,
  isChild = false,
}: {
  commentId: string;
  isChild?: boolean;
}) {
  const comment = useComment(commentId);
  const {
    brandColor,
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
  const replyListKey = getReplyListKey(commentId);
  const replyIds = useCommentIds(replyListKey);

  if (!comment) return null;

  const isEditing = editingCommentId === comment.id;
  const isReplyingToComment = replyingCommentId === comment.id;
  const hiddenRepliesCount = Math.max(0, comment.replies - replyIds.length);
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
        {replyIds.length > 0 ? (
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

        {replyIds.length > 0 ? (
          <CommentList listKey={replyListKey} isChildList />
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
