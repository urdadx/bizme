import { DesktopIconLinear } from "@/assets/icons/desktop-icon";
import { ExternalLink } from "@/assets/icons/link-icon";
import { GlobeLinear } from "@/assets/icons/globe-icon";
import { InProgressIcon } from "@/assets/icons/in-progress-icon";
import { LocationLinear } from "@/assets/icons/location-icon";
import { TrashLines } from "@/assets/icons/trash-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { CopyIcon } from "lucide-react";

const commentMetaDetails = [
	{
		label: "Device",
		value: "MacBook Pro",
		icon: DesktopIconLinear,
	},
	{
		label: "Location",
		value: "USA, San Francisco",
		icon: LocationLinear,
	},

	{
		label: "Browser",
		value: "Chrome 124",
		icon: GlobeLinear,
	},
	{
		label: "Last activity",
		value: "3 weeks ago",
		icon: InProgressIcon,
	},
];

export const CommentsMeta = () => {
	return (
		<>
			<div className="flex-1 overflow-y-auto smooth-div p-5">
				<div className="flex justify-between items-center">
					<div className="flex items-center gap-2">
						<Button variant="outline" size="sm">
							<ExternalLink color="black" />
						</Button>

						<Button variant="outline" size="sm">
							<CopyIcon />
						</Button>
					</div>
					<Button variant="outline" size="sm">
						<TrashLines color="red" />
						<span className="text-red-500">Delete </span>
					</Button>
				</div>
				<div className="flex items-center gap-3 py-6 first:pt-0  border-b">
					<Avatar size="lg">
						<AvatarImage
							src={
								"https://avatars.githubusercontent.com/u/70736338?v=4"
							}
							alt={"Jane Smith"}
						/>
						<AvatarFallback>JS</AvatarFallback>
					</Avatar>
					<div className="min-w-0">
						<h3 className="truncate text-sm font-semibold">Jane Smith</h3>
						<p className="text-xs text-muted-foreground">3 weeks ago</p>
					</div>
				</div>
				<div className="flex flex-col space-y-4 py-6 border-b">
					<div className="flex items-center justify-between">
						<p className="w-full text-sm leading-6 text-muted-foreground">
							Comment status
						</p>
						<Badge
							className="bg-amber-100 text-amber-700 rounded-sm shadow-none border-0"
							variant="outline">
							<div className="w-1.5 h-1.5 rounded-full bg-amber-700" />
							Pending
						</Badge>
					</div>
					<div className="flex items-center justify-between">
						<p className="w-full text-sm leading-6 text-muted-foreground">
							Block user{" "}
						</p>
						<Select>
							<SelectTrigger size="sm" className="w-45">
								<SelectValue placeholder="No" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="yes">Yes</SelectItem>
								<SelectItem value="no">No</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
				<div className="flex flex-col space-y-4 py-6">
					{commentMetaDetails.map((item) => {
						const Icon = item.icon;

						return (
							<div
								key={item.label}
								className="flex items-center justify-between gap-4">
								<div className="flex min-w-0 items-center gap-3">
									<div className="flex size-8 shrink-0 items-center justify-center text-muted-foreground">
										<Icon className="size-4" />
									</div>
									<p className="text-sm text-muted-foreground">
										{item.label}
									</p>
								</div>
								<p className="truncate text-right text-sm font-medium">
									{item.value}
								</p>
							</div>
						);
					})}
				</div>
			</div>
		</>
	);
};
