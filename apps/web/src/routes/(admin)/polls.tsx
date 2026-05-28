import { PollsTable } from "@/components/polls/polls-table";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(admin)/polls")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex h-full w-full">
			<div className="w-full bg-background px-4 py-6 sm:px-8">
				<div className="mx-auto max-w-7xl">
					<h1 className="mb-2 text-2xl font-semibold">Polls</h1>
					<PollsTable />
				</div>
				<div className="h-10" />
			</div>
		</div>
	);
}
