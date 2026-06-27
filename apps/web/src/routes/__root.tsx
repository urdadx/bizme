import type { AppRouter } from "@better-comments/api/routers/index";
import { Toaster } from "@/components/ui/sonner";
import type { QueryClient } from "@tanstack/react-query";
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query";

import favicon from "@/assets/bizme-logo.png";
import appCss from "../index.css?url";
export interface RouterAppContext {
	trpc: TRPCOptionsProxy<AppRouter>;
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Bizme | Better audience engagement for your content.",
			},
		],
		links: [
			{
				rel: "icon",
				type: "image/png",
				href: favicon,
			},
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),

	component: RootDocument,
});

function RootDocument() {
	return (
		<html lang="en" className="light">
			<head>
				<HeadContent />
			</head>
			<body>
				<div className="grid h-svh grid-rows-[auto_1fr]">
					<Outlet />
				</div>
				<Toaster theme="light" />
				{/* <TanStackRouterDevtools position="bottom-left" /> */}
				{/* <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" /> */}
				<Scripts />
			</body>
		</html>
	);
}
