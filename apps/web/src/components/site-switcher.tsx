import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { ArrowDownLinear } from "@/assets/icons/arrow-down";
import { CheckMarkIcon } from "@/assets/icons/checkmark-icon";
import { authClient } from "@/lib/auth-client";
import { Skeleton } from "./ui/skeleton";
import { useOrganizationsQuery, useSessionQuery } from "@/hooks/use-auth-queries";
import { useTRPC } from "@/utils/trpc";

export function SiteSwitcher() {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [siteName, setSiteName] = useState("");
	const [websiteUrl, setWebsiteUrl] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [pendingSiteId, setPendingSiteId] = useState<string | null>(null);
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { data: session } = useSessionQuery();
	const { data: sites, isPending } = useOrganizationsQuery();
	const createSite = useMutation(trpc.sites.create.mutationOptions());

	const activeSiteId = pendingSiteId ?? session?.session.activeOrganizationId;
	const activeSite = sites?.find((site) => site.id === activeSiteId) ?? sites?.[0];

	const handleSwitchSite = async (siteId: string) => {
		setPendingSiteId(siteId);

		const { error } = await authClient.organization.setActive({
			organizationId: siteId,
		});

		if (error) {
			setPendingSiteId(null);
			return;
		}

		await queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
		setPendingSiteId(null);
	};

	const handleCreateSite = async () => {
		const name = siteName.trim();

		if (!name) {
			setError("Site name is required.");
			return;
		}

		setError(null);

		try {
			const site = await createSite.mutateAsync({
				name,
				websiteUrl: websiteUrl.trim(),
			});

			setPendingSiteId(site.id);
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ["auth", "organizations"] }),
				queryClient.invalidateQueries({ queryKey: ["auth", "session"] }),
			]);
			setSiteName("");
			setWebsiteUrl("");
			setIsDialogOpen(false);
			setPendingSiteId(null);
		} catch (error) {
			setError(error instanceof Error ? error.message : "Unable to create site.");
			setPendingSiteId(null);
		}
	};

	if (isPending) {
		return <Skeleton className="h-12 w-full rounded-md" />;
	}

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
											src={activeSite?.logo ?? ""}
											alt={activeSite?.name ?? ""}
										/>
										{!activeSite?.logo && (
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
								{sites?.map((site) => (
									<DropdownMenuItem
										key={site.id}
										className="text-sm flex items-center"
										onClick={() =>
											handleSwitchSite(site.id)
										}>
										<div
											className="rounded-full w-2 h-2"
											style={{
												backgroundColor: "#6366f1",
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
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="max-w-md!">
					<DialogHeader>
						<DialogTitle className="text-xl font-semibold">
							Create a new site
						</DialogTitle>
						<DialogDescription>
							Enter the name and URL of your new site.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4">
						<div className="grid gap-2">
							<Label htmlFor="site-name">Site name</Label>
							<Input
								id="site-name"
								value={siteName}
								onChange={(event) =>
									setSiteName(event.target.value)
								}
								placeholder="Acme Blog"
								disabled={createSite.isPending}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="site-url">Website URL</Label>
							<Input
								id="site-url"
								type="url"
								value={websiteUrl}
								onChange={(event) =>
									setWebsiteUrl(event.target.value)
								}
								placeholder="https://example.com"
								disabled={createSite.isPending}
							/>
						</div>
						{error ? (
							<p className="text-sm text-destructive">{error}</p>
						) : null}
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsDialogOpen(false)}
							disabled={createSite.isPending}>
							Cancel
						</Button>
						<Button
							onClick={handleCreateSite}
							disabled={createSite.isPending}>
							{createSite.isPending ? "Creating..." : "Create site"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
