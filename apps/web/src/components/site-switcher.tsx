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
import { authClient } from "@/lib/auth-client";
import { Skeleton } from "./ui/skeleton";
import { useOrganizationsQuery, useSessionQuery } from "@/hooks/use-auth-queries";

export function SiteSwitcher() {
  const [_isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingSiteId, setPendingSiteId] = useState<string | null>(null);
  const { data: session } = useSessionQuery();
  const { data: sites, isPending } = useOrganizationsQuery();

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

    setPendingSiteId(null);
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
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground rounded-md w-full"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      className="w-full h-full rounded-md"
                      src={activeSite?.logo ?? ""}
                      alt={activeSite?.name ?? ""}
                    />
                    {!activeSite?.logo && (
                      <AvatarFallback className="rounded-md h-full w-full bg-primary text-white font-semibold">
                        {activeSite?.name?.charAt(0) || "B"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate ">{activeSite?.name || "Select site"}</span>
                </div>
                <ArrowDownLinear className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width)  min-w-56 rounded-sm"
              side={"bottom"}
              align="end"
              sideOffset={4}
            >
              <>
                {sites?.map((site) => (
                  <DropdownMenuItem
                    key={site.id}
                    className="text-sm flex items-center"
                    onClick={() => handleSwitchSite(site.id)}
                  >
                    <div
                      className="rounded-full w-2 h-2"
                      style={{
                        backgroundColor: "#6366f1",
                      }}
                    />
                    {site.name}
                    {site.id === activeSiteId && (
                      <CheckMarkIcon color="green" className="w-4 h-4 ml-auto" />
                    )}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem className="text-sm" onClick={() => setIsDialogOpen(true)}>
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
