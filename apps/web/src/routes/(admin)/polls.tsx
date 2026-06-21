import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(admin)/polls")({
	component: RouteComponent,
});

function RouteComponent() {
	return <Outlet />;
}
