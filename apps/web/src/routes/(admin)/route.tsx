import { AppSidebar } from "@/components/app-sidebar";
import { getUser } from "@/functions/get-user";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(admin)")({
	component: RouteComponent,
	beforeLoad: async ({ location }) => {
		const session = await getUser();
		if (!session) {
			throw redirect({
				to: "/login",
				search: location.search,
			});
		}
		if (
			session.session.isOnboarded === false ||
			session.session.activeOrganizationId === null
		) {
			throw redirect({
				to: "/onboarding",
				search: location.search,
			});
		}
	},
});

function RouteComponent() {
	return <AppSidebar />;
}
