import { WidgetIcon } from "@/assets/icons/widget-icon";
import { WidgetInstructions } from "./widget-instructions";
import { HugeRocket } from "@/assets/icons/rocket";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSession } from "@/lib/auth-client";
import { Button } from "../ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTrigger } from "../ui/drawer";
import { DialogContent, Dialog, DialogTrigger } from "../ui/dialog";

const DeployTriggerButton = () => (
	<Button className="text-white hover:text-white" variant="default">
		<HugeRocket color="white" />
		<span className="flex sm:hidden">Deploy</span>
		<span className="hidden sm:flex">Deploy to your site</span>
	</Button>
);

export const DeployAgentDialog = () => {
	const isMobile = useIsMobile();
	const { data: session } = useSession();
	const [isOpen, setIsOpen] = useState(false);
	const installKey = session?.session.activeOrganizationId ?? null;

	const NavButtons = (
		<div
			className={cn(
				"flex gap-2",
				isMobile
					? "flex-row overflow-x-auto pb-4 pt-1 px-4 scrollbar-hide -mx-4 border-b border-gray-100"
					: "flex-col -mx-3 gap-4",
			)}>
			<button
				type="button"
				className={cn(
					"group relative flex items-center gap-2.5 rounded-lg px-4 py-2 text-left transition-all",
					isMobile ? "shrink-0 min-w-max border" : "w-full",
					"bg-white text-gray-900 shadow-sm ring-1 ring-gray-200 border-purple-100 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700",
				)}>
				<div
					className={cn(
						"bg-purple-800",
						isMobile
							? "absolute -bottom-px left-0 right-0 h-0.5"
							: "absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full",
					)}></div>
				<div className="flex h-4 w-4 shrink-0 items-center justify-center">
					<WidgetIcon color="purple" />
				</div>
				<span className="text-sm font-medium whitespace-nowrap">Widget</span>
			</button>
		</div>
	);

	if (isMobile) {
		return (
			<Drawer open={isOpen} onOpenChange={setIsOpen}>
				<DrawerTrigger>
					<DeployTriggerButton />
				</DrawerTrigger>
				<DrawerContent className="max-h-[90vh] bg-gray-50 flex flex-col">
					<DrawerHeader className="shrink-0 pb-2"></DrawerHeader>
					<div className="sticky top-0 z-10 bg-gray-50 pt-0 pb-2 px-4 shadow-sm">
						{NavButtons}
					</div>
					<div className="flex-1 overflow-y-auto px-4 pb-8 pt-4">
						<div className="bg-white rounded-xl shadow-xs ring-1 ring-gray-200 p-1">
							<WidgetInstructions
								installKey={installKey}
								onClose={() => setIsOpen(false)}
							/>
						</div>
					</div>
				</DrawerContent>
			</Drawer>
		);
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger>
				<DeployTriggerButton />
			</DialogTrigger>
			<DialogContent
				showCloseButton={false}
				className="w-full p-0 max-w-4xl! onboarding-height bg-gray-50 rounded-xl overflow-visible">
				<div className="flex ">
					<div className="flex w-75 flex-col px-8 py-10">
						<div className="mb-9">
							<h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
								Deploy comments
							</h2>
							<p className="text-sm text-gray-600 dark:text-gray-400">
								Install Bizme comments on your site and start
								collecting feedback today.
							</p>
						</div>
						<div className="flex-1">{NavButtons}</div>
					</div>
					<WidgetInstructions
						installKey={installKey}
						onClose={() => setIsOpen(false)}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
};
