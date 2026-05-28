import { createFileRoute } from "@tanstack/react-router";

import { CommentsList } from "@/components/comments/comments-list";

export const Route = createFileRoute("/(admin)/comments")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex h-full w-full">
			<div className="w-full bg-background py-4">
				<div className=" px-4 sm:px-8  ">
					<h1 className="text-2xl font-semibold mb-2">All Comments</h1>
				</div>
				<CommentsList />
				<div className="h-10" />
			</div>
		</div>
	);
}
