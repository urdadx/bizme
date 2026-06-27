import type { AppRouter } from "@better-comments/api/routers/index";
import { Toaster } from "@/components/ui/sonner";
import type { QueryClient } from "@tanstack/react-query";
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query";

import favicon from "@/assets/bizme-logo.png";
import ogImage from "@/assets/og-image.png";
import appCss from "../index.css?url";
export interface RouterAppContext {
	trpc: TRPCOptionsProxy<AppRouter>;
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
		head: () => ({
		meta: [
			{
				title: "Bizme | Better audience engagement for your content.",
			},
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				name: "description",
				content:
					"Bizme helps creators drive meaningful engagement through comments and polls fostering a vibrant community.",
			},
			{
				property: "og:title",
				content: "Bizme | Better audience engagement for your content.",
			},
			{
				property: "og:description",
				content:
					"Bizme helps creators drive meaningful engagement through comments and polls fostering a vibrant community.",
			},
			{
				property: "og:type",
				content: "website",
			},
			{
				property: "og:image",
				content: ogImage,
			},
			{
				property: "og:image:width",
				content: "1334",
			},
			{
				property: "og:image:height",
				content: "644",
			},
			{
				name: "twitter:card",
				content: "summary_large_image",
			},
			{
				name: "twitter:title",
				content: "Bizme | Better audience engagement for your content.",
			},
			{
				name: "twitter:description",
				content:
					"Bizme helps creators drive meaningful engagement through comments and polls fostering a vibrant community.",
			},
			{
				name: "twitter:image",
				content: ogImage,
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
