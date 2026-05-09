import * as React from "react";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarInset,
	SidebarProvider,
} from "@/components/ui/sidebar";
import { Outlet } from "@tanstack/react-router";
import { Navbar } from "./navbar";
import { HomeLinear } from "@/assets/icons/home-duotone";
import { ChartLinear } from "@/assets/icons/chart-icon";
import { SettingsLinear } from "@/assets/icons/settings-duotone";

import { NavMain } from "./nav-main";
import { PaletteRoundLinear } from "@/assets/icons/palette-icon";
import { PlaneLinear } from "@/assets/icons/plane-icon";
import { SiteSwitcher } from "./site-switcher";
import { NavUser } from "./nav-user";

const data = {
	overview: [
		{
			title: "Overview",
			url: "/overview",
			icon: HomeLinear,
		},
		{
			title: "Customize",
			url: "/customize",
			icon: PaletteRoundLinear,
		},
		{
			title: "Comments",
			url: "/comments",
			icon: PlaneLinear,
		},
		{
			title: "Polls",
			url: "/polls",
			icon: ChartLinear,
		},
		{
			title: "Settings",
			url: "/settings",
			icon: SettingsLinear,
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<SidebarProvider>
			<Sidebar collapsible="icon" {...props}>
				<SidebarHeader>
					<SiteSwitcher />
				</SidebarHeader>
				<SidebarContent className="">
					<NavMain items={data.overview} />
				</SidebarContent>
				<SidebarFooter>
					<NavUser />
				</SidebarFooter>
			</Sidebar>
			<SidebarInset className="min-h-0 min-w-0 flex flex-col overflow-x-hidden">
				<Navbar />
				<div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden">
					<Outlet />
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
