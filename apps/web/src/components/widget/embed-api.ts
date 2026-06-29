import type { AuthProvider, CommentItem } from "./comment-store";

export type ColorScheme = "system" | "light" | "dark";

export type EmbedConfigResponse = {
  customization?: {
    brandColor?: string;
    textColor?: string;
    colorScheme?: ColorScheme;
  };
};

export type EmbedCommentsResponse = {
  comments?: CommentItem[];
  nextOffset?: number | null;
};

export type EmbedCommentResponse = {
  comment?: CommentItem;
};

export type AnonymousAuthResponse = {
  visitorId?: string;
};

export type EmbedAuthSession = {
  provider: Exclude<AuthProvider, "anonymous">;
  name: string;
  email: string | null;
  avatar: string | null;
  expiresAt: number;
};

export type EmbedAuthSessionResponse = {
  session: EmbedAuthSession | null;
};

export type CommentActionPayload = {
  installKey: string;
  pageUrl: string;
  visitorId?: string;
  authorProvider: AuthProvider;
};

export class FetchJsonError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "FetchJsonError";
    this.status = status;
  }
}

export function createEmbedApi(apiUrl: string) {
  return {
    getConfig(installKey: string) {
      return fetchJson<EmbedConfigResponse>(
        apiUrl,
        `/embed/config?installKey=${encodeURIComponent(installKey)}`,
      );
    },
    getAuthSession() {
      return fetchJson<EmbedAuthSessionResponse>(apiUrl, "/embed/auth/session");
    },
    createAnonymousVisitor() {
      return fetchJson<AnonymousAuthResponse>(apiUrl, "/embed/auth/anonymous", {
        method: "POST",
        body: JSON.stringify({}),
      });
    },
    fetchComments({
      installKey,
      pageUrl,
      parentId,
      limit,
      offset,
      visitorId,
      authorProvider,
    }: {
      installKey: string;
      pageUrl: string;
      parentId?: string;
      limit?: number;
      offset?: number;
      visitorId?: string;
      authorProvider?: AuthProvider;
    }) {
      const params = new URLSearchParams({
        installKey,
        pageUrl,
      });

      if (parentId) params.set("parentId", parentId);
      if (typeof limit === "number") params.set("limit", String(limit));
      if (typeof offset === "number") params.set("offset", String(offset));
      if (visitorId) params.set("visitorId", visitorId);
      if (authorProvider) params.set("authorProvider", authorProvider);

      return fetchJson<EmbedCommentsResponse>(apiUrl, `/embed/comments?${params.toString()}`);
    },
    createComment({
      payload,
      pageTitle,
      body,
      parentId,
    }: {
      payload: CommentActionPayload;
      pageTitle: string;
      body: string;
      parentId?: string;
    }) {
      return fetchJson<EmbedCommentResponse>(apiUrl, "/embed/comments", {
        method: "POST",
        body: JSON.stringify({
          ...payload,
          pageTitle,
          body,
          parentId,
        }),
      });
    },
    updateComment(commentId: string, payload: CommentActionPayload, body: string) {
      return fetchJson<EmbedCommentResponse>(apiUrl, `/embed/comments/${commentId}`, {
        method: "PATCH",
        body: JSON.stringify({ ...payload, body }),
      });
    },
    deleteComment(commentId: string, payload: CommentActionPayload) {
      return fetchJson<{ id: string }>(apiUrl, `/embed/comments/${commentId}`, {
        method: "DELETE",
        body: JSON.stringify(payload),
      });
    },
    likeComment(commentId: string, payload: CommentActionPayload) {
      return fetchJson<{ liked: boolean; likes: number }>(
        apiUrl,
        `/embed/comments/${commentId}/like`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );
    },
  };
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
    const message = payload?.error?.message ?? `Request failed with ${response.status}`;
    throw new FetchJsonError(message, response.status);
  }

  return response.json() as Promise<T>;
}
