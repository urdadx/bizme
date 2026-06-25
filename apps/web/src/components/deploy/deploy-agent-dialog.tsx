import { WidgetIcon } from "@/assets/icons/widget-icon";
import { WordPressIcon } from "@/assets/icons/wordpress";
import { WidgetInstructions } from "./widget-instructions";
import { HugeRocket } from "@/assets/icons/rocket";
import { type ComponentProps, useState } from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSession } from "@/lib/auth-client";
import { Button } from "../ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTrigger } from "../ui/drawer";
import { DialogContent, Dialog, DialogTrigger } from "../ui/dialog";
import { JSIcon } from "@/assets/icons/js-icon";

type DeployInstructionType = "widget" | "frameworks" | "wordpress";

const DeployTriggerButton = ({ className, ...props }: ComponentProps<typeof Button>) => (
	<Button className={cn("text-white hover:text-white", className)} variant="default" {...props}>
		<HugeRocket color="white" />
		<span className="flex sm:hidden">Deploy</span>
		<span className="hidden sm:flex">Deploy to your site</span>
	</Button>
);

export const DeployAgentDialog = () => {
	const isMobile = useIsMobile();
	const { data: session } = useSession();
	const [isOpen, setIsOpen] = useState(false);
	const [instructionType, setInstructionType] = useState<DeployInstructionType>("frameworks");
	const installKey = session?.session.activeOrganizationId ?? null;

	const getNavButtonClassName = (type: DeployInstructionType) =>
		cn(
			"group relative flex items-center gap-2.5 rounded-lg px-4 py-2 text-left transition-all",
			isMobile ? "shrink-0 min-w-max border" : "w-full",
			instructionType === type
				? cn(
						"bg-white text-gray-900 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700",
						type === "frameworks"
							? "border-blue-100"
							: type === "wordpress"
								? "border-sky-100"
								: "border-purple-100",
					)
				: "text-gray-600 hover:bg-white hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100",
		);

	const getNavIndicatorClassName = (type: DeployInstructionType) =>
		cn(
			type === "frameworks"
				? "bg-yellow-500"
				: type === "wordpress"
					? "bg-sky-600"
					: "bg-purple-800",
			instructionType === type ? "opacity-100" : "opacity-0",
			isMobile
				? "absolute -bottom-px left-0 right-0 h-0.5"
				: "absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full",
		);

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
				onClick={() => setInstructionType("frameworks")}
				className={getNavButtonClassName("frameworks")}>
				<div className={getNavIndicatorClassName("frameworks")}></div>
				<div className="flex h-4 w-4 shrink-0 items-center justify-center text-yellow-500">
					<JSIcon className="size-5" />
				</div>
				<span className="text-sm font-medium whitespace-nowrap">JS Frameworks</span>
			</button>
			<button
				type="button"
				onClick={() => setInstructionType("widget")}
				className={getNavButtonClassName("widget")}>
				<div className={getNavIndicatorClassName("widget")}></div>
				<div className="flex h-4 w-4 shrink-0 items-center justify-center">
					<WidgetIcon color="purple" />
				</div>
				<span className="text-sm font-medium whitespace-nowrap">
					Standard HTML site
				</span>
			</button>

			<button
				type="button"
				onClick={() => setInstructionType("wordpress")}
				className={getNavButtonClassName("wordpress")}>
				<div className={getNavIndicatorClassName("wordpress")}></div>
				<div className="flex h-4 w-4 shrink-0 items-center justify-center text-sky-600">
					<WordPressIcon className="size-5" />
				</div>
				<span className="text-sm font-medium whitespace-nowrap">WordPress</span>
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
								type={instructionType}
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
			<DialogTrigger render={<DeployTriggerButton />} />
			<DialogContent
				showCloseButton={false}
				className="w-full p-0 max-w-4xl! max-h-[90vh] bg-gray-50 rounded-xl overflow-hidden">
				<div className="flex max-h-[90vh] min-h-0">
					<div className="flex w-75 shrink-0 flex-col px-8 py-10">
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
						type={instructionType}
						onClose={() => setIsOpen(false)}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
};
