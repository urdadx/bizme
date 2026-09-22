import {
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { QueryClient, QueryClientProvider, useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { GoogleMarkIcon } from "@/components/shadow-widget/icons";
import { ShadowCommentComposer } from "@/components/shadow-widget/comment-composer";
import { uploadCommentImages } from "@/lib/comment-attachments";

import { CommentFeed } from "./comment-feed";
import { createEmbedApi, FetchJsonError, type ColorScheme } from "./embed-api";
import {
  createCommentListKey,
  prependComment,
  syncFetchedCommentList,
  type AuthProvider,
  type CommentItem,
} from "./comment-store";
import { useCommentActions } from "./use-comment-actions";
import { WidgetCommentProvider } from "./widget-context";

import "./widget.css";

const DEFAULT_BRAND_COLOR = "#6170F8";
const DEFAULT_TEXT_COLOR = "#1F2937";
const DEFAULT_DARK_TEXT_COLOR = "#F8FAFC";
const VISITOR_STORAGE_KEY = "bizme_visitor_id";
const BLOCKED_COMMENTER_MESSAGE = "This commenter is blocked";
const COMMENTS_PAGE_SIZE = 20;

export type CommentWidgetProps = {
  installKey: string;
  apiUrl: string;
  pageUrl?: string;
  pageTitle?: string;
  hostColorScheme?: "light" | "dark";
};

export function CommentWidget({ installKey, apiUrl, ...rest }: CommentWidgetProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <WidgetRoot installKey={installKey} apiUrl={apiUrl} {...rest} />
    </QueryClientProvider>
  );
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

  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }

  return "light";
}

function getCurrentPageUrl() {
  return typeof window === "undefined" ? "" : window.location.href;
}

function getCurrentPageTitle() {
  return typeof document === "undefined" ? "" : document.title;
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

function isBlockedCommenterError(error: unknown) {
  return (
    error instanceof FetchJsonError &&
    error.status === 403 &&
    error.message === BLOCKED_COMMENTER_MESSAGE
  );
}

function buildThemeTokens(
  scheme: "light" | "dark",
  brandColor: string,
  textColor: string,
): CSSProperties {
  const isDark = scheme === "dark";
  const anchor = isDark ? "#ffffff" : "#000000";
  const tokens: Record<string, string> = {
    "--bizme-accent": brandColor,
    "--bizme-accent-hover": `color-mix(in srgb, ${brandColor} 84%, ${anchor})`,
    "--bizme-surface": isDark ? "#1b1d22" : "#ffffff",
    "--bizme-surface-soft": isDark ? "#262930" : "#f6f7f9",
    "--bizme-text": textColor,
    "--bizme-muted": isDark ? "#9aa1ad" : "#717784",
    "--bizme-border": isDark ? "#353941" : "#dfe2e7",
    "--bizme-danger": isDark ? "#e06f63" : "#c9362b",
  };

  return tokens as CSSProperties;
}

function WidgetRoot({
  installKey,
  apiUrl,
  pageUrl,
  pageTitle,
  hostColorScheme,
}: CommentWidgetProps) {
  const normalizedApiUrl = apiUrl.replace(/\/$/, "");
  const embedApi = useMemo(() => createEmbedApi(normalizedApiUrl), [normalizedApiUrl]);
  const currentPageUrl = pageUrl ?? getCurrentPageUrl();
  const currentPageTitle = pageTitle ?? getCurrentPageTitle();
  const rootListKey = createCommentListKey({
    apiUrl: normalizedApiUrl,
    installKey,
    pageUrl: currentPageUrl,
  });
  const getReplyListKey = (parentId: string) =>
    createCommentListKey({
      apiUrl: normalizedApiUrl,
      installKey,
      pageUrl: currentPageUrl,
      parentId,
    });

  const [provider, setProvider] = useState<AuthProvider | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [hostScheme, setHostScheme] = useState<"light" | "dark">(hostColorScheme ?? "light");
  const visitorIdRef = useRef<string | null>(getStoredVisitorId());
  const loadMoreRef = useRef<HTMLParagraphElement>(null);

  const missingWidgetConfig = !normalizedApiUrl || !installKey;

  const loadAuthSession = useEffectEvent(async () => {
    if (!normalizedApiUrl) return null;

    const response = await embedApi.getAuthSession();
    setProvider(response.session?.provider ?? null);
    return response.session;
  });

  const configQuery = useQuery({
    queryKey: ["embed-config", normalizedApiUrl, installKey],
    enabled: !missingWidgetConfig,
    queryFn: () => embedApi.getConfig(installKey),
  });

  const brandColor = configQuery.data?.customization?.brandColor ?? DEFAULT_BRAND_COLOR;
  const textColor = configQuery.data?.customization?.textColor ?? DEFAULT_TEXT_COLOR;
  const colorSchemePreference = configQuery.data?.customization?.colorScheme ?? "system";
  const allowAnonymousComments = configQuery.data?.settings?.allowAnonymousComments ?? false;
  const activeProvider: AuthProvider | null =
    provider ?? (allowAnonymousComments ? "anonymous" : null);
  const resolvedColorScheme = resolveColorScheme(colorSchemePreference, hostScheme);
  const effectiveTextColor =
    resolvedColorScheme === "dark" && textColor === DEFAULT_TEXT_COLOR
      ? DEFAULT_DARK_TEXT_COLOR
      : textColor;

  useEffect(() => {
    function handleHostTheme(event: Event) {
      const detail = (event as CustomEvent<{ colorScheme?: "light" | "dark" }>).detail;
      if (detail?.colorScheme === "light" || detail?.colorScheme === "dark") {
        setHostScheme(detail.colorScheme);
      }
    }

    window.addEventListener("bizme:host-theme", handleHostTheme);
    return () => window.removeEventListener("bizme:host-theme", handleHostTheme);
  }, []);

  useEffect(() => {
    void loadAuthSession().catch(() => {
      setProvider(null);
    });

    function handleAuthMessage(event: MessageEvent) {
      let originMatches = true;

      if (normalizedApiUrl) {
        try {
          originMatches = event.origin === new URL(normalizedApiUrl).origin;
        } catch {
          originMatches = false;
        }
      }

      if (!originMatches) return;

      const data = event.data as { type?: string; ok?: boolean; message?: string } | null;
      if (data?.type !== "bizme:auth") return;

      if (!data.ok) {
        setProvider(null);
        setStatusMessage(data.message ?? "Unable to complete login.");
        return;
      }

      void loadAuthSession()
        .then((session) => {
          setStatusMessage(session ? `Commenting as ${session.name}.` : "Login completed.");
        })
        .catch((error) => {
          setProvider(null);
          setStatusMessage(
            error instanceof Error ? error.message : "Unable to load login session.",
          );
        });
    }

    window.addEventListener("message", handleAuthMessage);
    return () => window.removeEventListener("message", handleAuthMessage);
  }, [normalizedApiUrl]);

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
      normalizedApiUrl,
      installKey,
      currentPageUrl,
      activeProvider,
      activeProvider === "anonymous" ? visitorIdRef.current : null,
    ],
    initialPageParam: 0,
    enabled: Boolean(normalizedApiUrl && installKey),
    queryFn: ({ pageParam }) =>
      embedApi.fetchComments({
        installKey,
        pageUrl: currentPageUrl,
        limit: COMMENTS_PAGE_SIZE,
        offset: pageParam,
        visitorId: activeProvider === "anonymous" ? (visitorIdRef.current ?? undefined) : undefined,
        authorProvider: activeProvider ?? undefined,
      }),
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

    return nextComments;
  }, [commentsData]);

  useEffect(() => {
    syncFetchedCommentList(rootListKey, fetchedComments);
  }, [fetchedComments, rootListKey]);

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

  const ensureAnonymousVisitor = async () => {
    if (visitorIdRef.current) {
      return visitorIdRef.current;
    }

    if (!normalizedApiUrl) {
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

  const startGoogleAuth = () => {
    setStatusMessage(null);

    if (!normalizedApiUrl) {
      setStatusMessage("Missing API URL.");
      return;
    }

    const url = new URL("/embed/auth/google/start", normalizedApiUrl);
    url.searchParams.set("installKey", installKey);
    url.searchParams.set("pageUrl", currentPageUrl);

    window.open(url.toString(), "bizme-auth", "popup=yes,width=520,height=640");
  };

  const handleComposerSubmit = async (body: string, files: File[]) => {
    if (!activeProvider) {
      startGoogleAuth();
      throw new Error("Login required.");
    }

    if (!normalizedApiUrl || !installKey) {
      setStatusMessage("Missing widget install key or API URL.");
      throw new Error("Missing widget config.");
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const anonymousVisitorId =
        activeProvider === "anonymous" ? await ensureAnonymousVisitor() : undefined;
      const response = await embedApi.createComment({
        payload: {
          installKey,
          pageUrl: currentPageUrl,
          visitorId: anonymousVisitorId,
          authorProvider: activeProvider,
        },
        pageTitle: currentPageTitle,
        body,
      });

      if (!response.comment) {
        throw new Error("Comment endpoint did not return a comment.");
      }

      const attachments = await uploadCommentImages(response.comment.id, files, {
        visitorId: anonymousVisitorId,
        baseUrl: normalizedApiUrl,
      });
      prependComment(rootListKey, {
        ...response.comment,
        attachments,
      } as CommentItem);
    } catch (error) {
      if (isBlockedCommenterError(error)) {
        setStatusMessage("You can no longer comment on this site.");
        throw error;
      }

      setStatusMessage(error instanceof Error ? error.message : "Unable to submit comment.");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const commentActions = useCommentActions({
    apiUrl: normalizedApiUrl,
    embedApi,
    installKey,
    pageUrl: currentPageUrl,
    pageTitle: currentPageTitle,
    provider: activeProvider,
    ensureAnonymousVisitor,
    getCurrentVisitorId: () => visitorIdRef.current,
    openAuthDialog: startGoogleAuth,
    setStatusMessage,
    getReplyListKey,
  });

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

  return (
    <div
      className={`bizme-widget${resolvedColorScheme === "dark" ? " dark" : ""}`}
      data-color-scheme={resolvedColorScheme}
      style={{
        ...buildThemeTokens(resolvedColorScheme, brandColor, effectiveTextColor),
        colorScheme: resolvedColorScheme,
        color: effectiveTextColor,
      }}
    >
      <div className="bizme-widget__body">
        <ShadowCommentComposer
          disabled={missingWidgetConfig}
          isSubmitting={isSubmitting}
          submitLabel={
            activeProvider ? (
              "Comment"
            ) : (
              <>
                <GoogleMarkIcon className="bizme-composer__icon" />
                Login to comment
              </>
            )
          }
          onSubmit={handleComposerSubmit}
        />

        {visibleStatusMessage ? (
          <p
            className={`bizme-widget__status${
              visibleStatusMessage === "You can no longer comment on this site."
                ? " bizme-widget__status--error"
                : ""
            }`}
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
          <CommentFeed
            listKey={rootListKey}
            isLoading={isLoading}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            loadMoreRef={loadMoreRef}
          />
        </WidgetCommentProvider>
      </div>
    </div>
  );
}