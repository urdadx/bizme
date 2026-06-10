import { CustomDomainsTable } from "@/components/domain/custom-domains-table";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(admin)/domain")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex min-h-0 h-full w-full flex-col">
			<div className="flex-1 overflow-y-auto smooth-div p-5">
				<h2 className="text-2xl font-semibold mb-4">Domain</h2>
				<CustomDomainsTable />
			</div>
		</div>
	);
}
