import { ChevronsUpDown } from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { LogoutLinear } from "@/assets/icons/logout-icon";
import { UserLinear } from "@/assets/icons/user-icon";
import { useNavigate } from "@tanstack/react-router";
import { LetterLinear } from "@/assets/icons/letter";
import { authClient } from "@/lib/auth-client";
import { Skeleton } from "./ui/skeleton";
import { useSessionQuery } from "@/hooks/use-auth-queries";

export function NavUser() {
	const navigate = useNavigate();
	const { data: session, isPending } = useSessionQuery();
	const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

	const user = session?.user;

	const handleLogout = () => {
		authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					navigate({
						to: "/login",
					});
				},
			},
		});
	};

	if (isPending) {
		return <Skeleton className="h-12 w-full rounded-md" />;
	}

	if (!user) {
		return null;
	}

	return (
		<>
			<SidebarMenu>
				<SidebarMenuItem className="w-full">
					<DropdownMenu>
						<DropdownMenuTrigger
							render={
								<SidebarMenuButton
									size="lg"
									className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground rounded-md w-full">
									<Avatar className="h-8 w-8 rounded-lg">
										<AvatarImage
											src={
												user.image ||
												`https://api.dicebear.com/9.x/glass/svg?seed=${user.name}`
											}
											alt={user.name}
											className="rounded-lg w-full h-full"
										/>
									</Avatar>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-medium">
											{user.name}
										</span>
										<span className="text-xs text-muted-foreground">
											{user.email}
										</span>
									</div>
									<ChevronsUpDown className="ml-auto size-4" />
								</SidebarMenuButton>
							}
						/>
						<DropdownMenuContent
							className="w-(--radix-dropdown-menu-trigger-width) space-y-1  min-w-58 rounded-sm"
							align="end"
							sideOffset={4}>
							<DropdownMenuItem
								onClick={() =>
									navigate({
										to: "/settings",
									})
								}
								className="text-sm">
								<UserLinear />
								My Account
							</DropdownMenuItem>

							<DropdownMenuItem
								onClick={() => setIsInviteDialogOpen(true)}
								className="text-sm">
								<LetterLinear />
								{isInviteDialogOpen
									? "Invite dialog coming soon"
									: "Invite Team"}
							</DropdownMenuItem>

							<DropdownMenuItem
								onClick={handleLogout}
								className="text-sm">
								<LogoutLinear color="red" />
								<span className="text-red-500 hover:text-red-500">
									Logout
								</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</SidebarMenuItem>
			</SidebarMenu>
		</>
	);
}
