import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(admin)/comments")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex h-full w-full">
			<div className="w-full bg-background px-4 sm:px-8 py-6">
				<div className="max-w-7xl mx-auto ">
					<h1 className="text-2xl font-semibold mb-2">All Comments</h1>
					{/* <PagesTable /> */}
				</div>
				<div className="h-10" />
			</div>
		</div>
	);
}
