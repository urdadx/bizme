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
import { SiteSwitcher } from "./site-switcher";
import { NavUser } from "./nav-user";
import { MessageIcon } from "@/assets/icons/message-icon";
import { NavCustomize } from "./nav-customize";
import { NavSettings } from "./nav-settings";
import { ChatLogsIcon } from "@/assets/icons/chatlogs-icon";
import { NavActivity } from "./nav-activity";
import { GlobeLinear } from "@/assets/icons/globe-icon";

const data = {
	overview: [
		{
			title: "Overview",
			url: "/overview",
			icon: HomeLinear,
		},
	],

	activity: [
		// {
		// 	title: "Pages",
		// 	url: "/pages",
		// 	icon: WindowIcon,
		// },
		{
			title: "Comments",
			url: "/comments",
			icon: MessageIcon,
		},
		{
			title: "Polls",
			url: "/polls",
			icon: ChatLogsIcon,
		},
	],
	customize: [
		{
			title: "Customize",
			url: "/customize",
			icon: PaletteRoundLinear,
		},
	],
	settings: [
		{
			title: "Analytics",
			url: "/analytics",
			icon: ChartLinear,
		},
		{
			title: "Settings",
			url: "/settings",
			icon: SettingsLinear,
		},

		{
			title: "Domain",
			url: "/domain",
			icon: GlobeLinear,
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<SidebarProvider>
			<Sidebar collapsible="icon" className="bg-[#FCFCFC]" {...props}>
				<SidebarHeader>
					<SiteSwitcher />
				</SidebarHeader>
				<SidebarContent className="bg-[#FCFCFC]">
					<NavMain items={data.overview} />
					<NavCustomize items={data.customize} />
					<NavActivity items={data.activity} />
					<NavSettings items={data.settings} />
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
