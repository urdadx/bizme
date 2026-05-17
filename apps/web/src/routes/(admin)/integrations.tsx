import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(admin)/integrations")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/(admin)/integration"!</div>;
}
