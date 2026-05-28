import { createFileRoute } from "@tanstack/react-router";

import { CommentsTable } from "@/components/comments/comments-table";

export const Route = createFileRoute("/(admin)/comments")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex h-full w-full">
			<div className="w-full bg-background px-4 py-6 sm:px-8">
				<div className="mx-auto max-w-7xl">
					<h1 className="text-2xl font-semibold mb-2">All Comments</h1>
					<CommentsTable />
				</div>
				<div className="h-10" />
			</div>
		</div>
	);
}
