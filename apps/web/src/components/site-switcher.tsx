import { PlusIcon } from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { ArrowDownLinear } from "@/assets/icons/arrow-down";
import { CheckMarkIcon } from "@/assets/icons/checkmark-icon";

const dummySites = [
	{
		id: "better-comments",
		name: "Bizme",
		image: "",
		primaryColor: "#6366f1",
	},
	{
		id: "docs",
		name: "Docs Hub",
		image: "",
		primaryColor: "#8b5cf6",
	},
	{
		id: "studio",
		name: "Creator Studio",
		image: "",
		primaryColor: "#0ea5e9",
	},
];

export function SiteSwitcher() {
	const [_isDialogOpen, setIsDialogOpen] = useState(false);
	const [activeSiteId, setActiveSiteId] = useState(dummySites[0].id);

	const activeSite = dummySites.find((site) => site.id === activeSiteId);

	const handleSwitchSite = (siteId: string) => {
		setActiveSiteId(siteId);
	};

	return (
		<>
			<SidebarMenu>
				<SidebarMenuItem className="w-full">
					<DropdownMenu>
						<DropdownMenuTrigger className="w-full">
							<SidebarMenuButton
								size="lg"
								className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground rounded-md w-full">
								<div className="flex aspect-square size-8 items-center justify-center rounded-lg">
									<Avatar className="h-8 w-8 rounded-lg">
										<AvatarImage
											className="w-full h-full rounded-md"
											src={activeSite?.image ?? ""}
											alt={activeSite?.name ?? ""}
										/>
										{!activeSite?.image && (
											<AvatarFallback className="rounded-md h-full w-full bg-primary text-white font-semibold">
												{activeSite?.name?.charAt(
													0,
												) || "B"}
											</AvatarFallback>
										)}
									</Avatar>
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate ">
										{activeSite?.name || "Select site"}
									</span>
								</div>
								<ArrowDownLinear className="ml-auto size-4" />
							</SidebarMenuButton>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							className="w-(--radix-dropdown-menu-trigger-width)  min-w-56 rounded-sm"
							side={"bottom"}
							align="end"
							sideOffset={4}>
							<>
								{dummySites.map((site) => (
									<DropdownMenuItem
										key={site.id}
										className="text-sm flex items-center"
										onClick={() =>
											handleSwitchSite(site.id)
										}>
										<div
											className="rounded-full w-2 h-2"
											style={{
												backgroundColor:
													site.primaryColor ||
													"#6366f1",
											}}
										/>
										{site.name}
										{site.id === activeSiteId && (
											<CheckMarkIcon
												color="green"
												className="w-4 h-4 ml-auto"
											/>
										)}
									</DropdownMenuItem>
								))}
								<DropdownMenuItem
									className="text-sm"
									onClick={() => setIsDialogOpen(true)}>
									<PlusIcon className="size-4 text-muted-foreground" />
									Create a new site
								</DropdownMenuItem>
							</>
						</DropdownMenuContent>
					</DropdownMenu>
				</SidebarMenuItem>
			</SidebarMenu>
		</>
	);
}
