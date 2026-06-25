import { AppSidebar } from "@/components/app-sidebar";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(admin)")({
	ssr: false,
	component: RouteComponent,
	beforeLoad: async ({ context, location }) => {
		const session = await context.queryClient
			.fetchQuery(context.trpc.getSession.queryOptions())
			.catch(() => null);

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
