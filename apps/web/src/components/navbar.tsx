import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "./ui/sidebar";

export const Navbar = () => {
	return (
		<header className="px-5 sticky top-0 flex justify-between h-14 shrink-0 items-center bg-background/50 backdrop-blur-lg border-b transition-[width,height] ease-linear z-10 group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
			<div className="flex items-center">
				<SidebarTrigger className="w-7 h-7 text-muted-foreground" />
			</div>
			<div className="flex gap-1 sm:gap-2 items-center ml-auto">
				<Button>Deploy your agent</Button>
			</div>
		</header>
	);
};
