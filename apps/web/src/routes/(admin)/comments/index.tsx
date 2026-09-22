import { createFileRoute } from "@tanstack/react-router";

import { CommentsTable } from "@/components/comments/comments-table";

export const Route = createFileRoute("/(admin)/comments/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-full min-w-0 w-full">
      <div className="min-w-0 w-full bg-background px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <div className="mx-auto min-w-0 max-w-7xl">
          <h1 className="mb-4 text-2xl font-semibold sm:mb-2">All Comments</h1>
          <CommentsTable />
        </div>
        <div className="h-10" />
      </div>
    </div>
  );
}
