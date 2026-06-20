import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "./ui/sidebar";
import { BellLinear } from "@/assets/icons/notification-icon";
import { DeployAgentDialog } from "./deploy/deploy-agent-dialog";

export const Navbar = () => {
	return (
		<header className="px-5 sticky top-0 flex justify-between h-14 shrink-0 items-center bg-background/50 backdrop-blur-lg border-b transition-[width,height] ease-linear z-10 group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
			<div className="flex items-center">
				<SidebarTrigger className="w-7 h-7 text-muted-foreground" />
			</div>
			<div className="flex gap-1 sm:gap-2 items-center ml-auto">
				<Button className="relative" variant="outline">
					<BellLinear className="size-4" color="currentColor" />
					<span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-white text-xs font-semibold z-10">
						{9 > 99 ? "99+" : 9}
					</span>
				</Button>
				<DeployAgentDialog />
			</div>
		</header>
	);
};
