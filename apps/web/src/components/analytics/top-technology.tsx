import { Monitor, Smartphone, Tablet } from "lucide-react";
import type { ReactNode } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTRPC } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import BarList from "./bar-list";

type TechnologyStat = {
	title: string;
	value: number;
};

const browserIcons: Record<string, string> = {
	brave: "/browser/brave.png",
	chrome: "/browser/chrome.png",
	chromium: "/browser/chromium.png",
	edge: "/browser/edge.png",
	firefox: "/browser/firefox.png",
	opera: "/browser/opera.png",
	safari: "/browser/safari.png",
};

const osIcons: Record<string, string> = {
	android: "/os/AND.png",
	ios: "/os/IOS.png",
	linux: "/os/LIN.png",
	macos: "/os/macos.png",
	windows: "/os/WIN.png",
};

function getImageIcon(src: string | undefined, title: string) {
	if (!src) return null;

	return <img src={src} className="size-4 object-contain" alt={title} />;
}

function getBrowserIcon(title: string) {
	return getImageIcon(browserIcons[title.toLowerCase().replaceAll(" ", "_")], title);
}

function getOSIcon(title: string) {
	return getImageIcon(osIcons[title.toLowerCase().replaceAll(" ", "")], title);
}

function getDeviceIcon(title: string) {
	const className = "size-4 text-muted-foreground";

	if (title === "Mobile") return <Smartphone className={className} />;
	if (title === "Tablet") return <Tablet className={className} />;
	return <Monitor className={className} />;
}

function mapStats(data: TechnologyStat[], icon: (title: string) => ReactNode) {
	return data.map((item) => ({
		icon: icon(item.title),
		title: item.title,
		value: item.value,
		href: "",
		linkId: item.title,
	}));
}

type TechnologyCardProps = {
	type: "technology" | "devices";
};

export function TopTechnology({ type }: TechnologyCardProps) {
	const trpc = useTRPC();
	const technologyQuery = useQuery(trpc.analytics.technology.queryOptions());
	const technology = technologyQuery.data ?? {
		browsers: [],
		operatingSystems: [],
		devices: [],
	};

	const browsers = mapStats(technology.browsers, getBrowserIcon);
	const operatingSystems = mapStats(technology.operatingSystems, getOSIcon);
	const devices = mapStats(technology.devices, getDeviceIcon);
	const maxBrowserCount = Math.max(0, ...browsers.map((item) => item.value));
	const maxOSCount = Math.max(0, ...operatingSystems.map((item) => item.value));
	const maxDeviceCount = Math.max(0, ...devices.map((item) => item.value));

	if (type === "devices") {
		const hasData = devices.length > 0;

		return (
			<div className="h-87.5 w-full z-0 rounded-xl border bg-white flex flex-col overflow-hidden">
				<Tabs defaultValue="devices" className="flex flex-col h-full">
					<div className="flex items-center justify-between px-4 pt-3 shrink-0">
						<TabsList className="h-auto pb-0 gap-2 rounded-none border-border bg-transparent px-0 text-foreground">
							<TabsTrigger
								value="devices"
								className="text-muted-foreground hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none">
								Top devices
							</TabsTrigger>
						</TabsList>
					</div>

					<div className="flex-1 min-h-0 overflow-hidden">
						<TabsContent value="devices" className="h-full m-0 p-0">
							<div className="h-full flex flex-col">
								<div className="flex-1 min-h-0 px-4 overflow-hidden">
									<div className="relative h-full">
										<div
											className={
												hasData
													? undefined
													: "hidden"
											}>
											<BarList
												tab="Devices"
												unit="visits"
												data={devices}
												barBackground="bg-orange-200/60"
												hoverBackground="hover:bg-orange-50"
												maxValue={maxDeviceCount}
												limit={5}
											/>
										</div>
										{!hasData && (
											<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
												<div className=" text-sm font-medium text-foreground shadow-sm">
													No data available yet
												</div>
											</div>
										)}
									</div>
								</div>
							</div>
						</TabsContent>
					</div>
				</Tabs>
			</div>
		);
	}

	const hasBrowserData = browsers.length > 0;
	const hasOSData = operatingSystems.length > 0;

	return (
		<div className="h-87.5 w-full z-0 rounded-xl border bg-white flex flex-col overflow-hidden">
			<Tabs defaultValue="browsers" className="flex flex-col h-full">
				<div className="flex items-center justify-between px-4 pt-3 shrink-0">
					<TabsList className="h-auto pb-0 gap-2 rounded-none border-border bg-transparent px-0 text-foreground">
						<TabsTrigger
							value="browsers"
							className="relative text-muted-foreground after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent">
							Browsers
						</TabsTrigger>
						<TabsTrigger
							value="os"
							className="relative text-muted-foreground after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent">
							OS
						</TabsTrigger>
					</TabsList>
				</div>

				<div className="flex-1 min-h-0 overflow-hidden">
					<TabsContent value="browsers" className="h-full m-0 p-0 pt-2">
						<div className="h-full flex flex-col">
							<div className="flex-1 min-h-0 px-4 overflow-hidden">
								<div className="relative h-full">
									<div
										className={
											hasBrowserData
												? undefined
												: "hidden"
										}>
										<BarList
											tab="Browsers"
											unit="visits"
											data={browsers}
											barBackground="bg-sky-200/60"
											hoverBackground="hover:bg-sky-50"
											maxValue={maxBrowserCount}
											limit={5}
										/>
									</div>
									{!hasBrowserData && (
										<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
											<div className=" text-sm font-medium text-foreground shadow-sm">
												No data available yet
											</div>
										</div>
									)}
								</div>
							</div>
						</div>
					</TabsContent>

					<TabsContent value="os" className="h-full m-0 p-0 pt-2">
						<div className="h-full flex flex-col">
							<div className="flex-1 min-h-0 px-4 overflow-hidden">
								<div className="relative h-full">
									<div
										className={
											hasOSData ? undefined : "hidden"
										}>
										<BarList
											tab="OS"
											unit="visits"
											data={operatingSystems}
											barBackground="bg-violet-200/60"
											hoverBackground="hover:bg-violet-50"
											maxValue={maxOSCount}
											limit={5}
										/>
									</div>
									{!hasOSData && (
										<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
											<div className=" text-sm font-medium text-foreground shadow-sm">
												No data available yet
											</div>
										</div>
									)}
								</div>
							</div>
						</div>
					</TabsContent>
				</div>
			</Tabs>
		</div>
	);
}
