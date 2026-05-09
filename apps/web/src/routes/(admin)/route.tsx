import { AppSidebar } from "@/components/app-sidebar";
import { GlobalLoader } from "@/components/global-loader";
import Loader from "@/components/loader";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Suspense } from "react";

export const Route = createFileRoute("/(admin)")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<Suspense fallback={<Loader />}>
				<AppSidebar />
			</Suspense>
		</>
	);
}
