import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

import { CommentWidget } from "@/components/widget/comment-widget";

const widgetSearchSchema = z.object({
  installKey: z.string().optional(),
  apiUrl: z.string().optional(),
  pageUrl: z.string().optional(),
  pageTitle: z.string().optional(),
  hostColorScheme: z.enum(["light", "dark"]).optional(),
});

export const Route = createFileRoute("/widget")({
  validateSearch: widgetSearchSchema,
  component: WidgetRoute,
});

function WidgetRoute() {
  const search = Route.useSearch();

  if (!search.installKey || !search.apiUrl) {
    return (
      <p className="bizme-widget__status" style={{ padding: "16px" }}>
        Missing widget install key or API URL.
      </p>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl p-4">
      <CommentWidget
        installKey={search.installKey}
        apiUrl={search.apiUrl}
        pageUrl={search.pageUrl}
        pageTitle={search.pageTitle}
        hostColorScheme={search.hostColorScheme}
      />
    </div>
  );
}