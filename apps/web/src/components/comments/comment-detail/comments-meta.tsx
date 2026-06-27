import { DesktopIconLinear } from "@/assets/icons/desktop-icon";
import { ExternalLink } from "@/assets/icons/link-icon";
import { GlobeLinear } from "@/assets/icons/globe-icon";
import { InProgressIcon } from "@/assets/icons/in-progress-icon";
import { LocationLinear } from "@/assets/icons/location-icon";
import { TrashLines } from "@/assets/icons/trash-icon";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PinIcon } from "lucide-react";
import { useState } from "react";
import { SquareIcon } from "@/assets/icons/square-icon";
import { AtSignIcon } from "@/assets/icons/at-sign-icon";

type CommentClassification = "legitimate" | "spam";

const classificationConfig = {
	legitimate: {
		label: "Legitimate",
		dotClassName: "bg-green-700",
		className: "border-0 bg-green-100 text-green-700 hover:bg-green-100",
	},
	spam: {
		label: "Spam",
		dotClassName: "bg-amber-700",
		className: "border-0 bg-amber-100 text-amber-700 hover:bg-amber-100",
	},
} satisfies Record<
	CommentClassification,
	{ label: string; dotClassName: string; className: string }
>;

function ClassificationBadge({ classification }: { classification: CommentClassification }) {
	const config = classificationConfig[classification];

	return (
		<span className="flex items-center gap-1.5">
			<span className={cn("size-1.5 rounded-full", config.dotClassName)} />
			{config.label}
		</span>
	);
}

function cleanLocationPart(value: string | null | undefined) {
	const trimmed = value?.trim();

	if (!trimmed || trimmed.toLowerCase() === "unknown") return undefined;

	try {
		return decodeURIComponent(trimmed);
	} catch {
		return trimmed;
	}
}

function getCountryDisplayName(countryCode: string | null) {
	const code = cleanLocationPart(countryCode);

	if (!code || code.length !== 2) return undefined;

	return new Intl.DisplayNames(["en"], { type: "region" }).of(code.toUpperCase());
}

function formatLocation(comment: CommentsMetaProps["comment"]) {
	const city = cleanLocationPart(comment.locationCity);
	const country = cleanLocationPart(comment.locationCountry) ??
		getCountryDisplayName(comment.locationCountryCode);

	return [city, country].filter(Boolean).join(", ") || "Unknown";
}

type CommentsMetaProps = {
	comment: {
		author: string;
		authorEmail: string | null;
		authorProvider: string;
		avatar: string;
		date: string;
		status: string;
		classification: CommentClassification;
		isPinned: boolean;
		isBlocked: boolean;
		locationCity: string | null;
		locationCountry: string | null;
		locationCountryCode: string | null;
		locationContinent: string | null;
		deviceType: string | null;
		browser: string | null;
	};
	page: {
		path: string;
		url: string;
	};
	onDelete?: () => void;
	isDeleting?: boolean;
	onPinChange?: (pinned: boolean) => void;
	isPinning?: boolean;
	onClassificationChange?: (classification: CommentClassification) => void;
	isClassifying?: boolean;
	onBlockedChange?: (blocked: boolean) => void;
	isBlocking?: boolean;
};

export const CommentsMeta = ({
	comment,
	page,
	onDelete,
	isDeleting = false,
	onPinChange,
	isPinning = false,
	onClassificationChange,
	isClassifying = false,
	onBlockedChange,
	isBlocking = false,
}: CommentsMetaProps) => {
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const commentMetaDetails = [
		{
			label: "Page",
			value: page.path,
			icon: SquareIcon,
		},
		{
			label: "Provider",
			value: comment.authorProvider,
			icon: AtSignIcon,
		},
		{
			label: "Location",
			value: formatLocation(comment),
			icon: LocationLinear,
		},
		{
			label: "Device",
			value: comment.deviceType ?? "Unknown",
			icon: DesktopIconLinear,
		},
		{
			label: "Browser",
			value: comment.browser ?? "Unknown",
			icon: GlobeLinear,
		},

		{
			label: "Last activity",
			value: comment.date,
			icon: InProgressIcon,
		},
	];

	return (
		<>
			<DeleteConfirmationDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				onConfirm={() => onDelete?.()}
				isDeleting={isDeleting}
				disabled={!onDelete}
			/>
			<div className="flex-1 overflow-y-auto smooth-div p-5">
				<div className="flex justify-between items-center">
					<div className="flex items-center gap-2">
						<a href={page.url} target="_blank" rel="noreferrer">
							<Button variant="outline" size="sm">
								<ExternalLink color="black" />
							</Button>
						</a>

						<Button
							variant="outline"
							size="sm"
							disabled={isPinning || !onPinChange}
							onClick={() => onPinChange?.(!comment.isPinned)}>
							<PinIcon
								className={cn(
									"size-4",
									comment.isPinned && "fill-current",
								)}
							/>
							<span>{comment.isPinned ? "Pinned" : "Pin"}</span>
						</Button>
					</div>
					<Button
						variant="outline"
						size="sm"
						disabled={isDeleting}
						onClick={() => setDeleteDialogOpen(true)}>
						<TrashLines color="red" />
						<span className="text-red-500">Delete </span>
					</Button>
				</div>
				<div className="flex items-center gap-3 py-6 first:pt-0  border-b">
					<Avatar size="lg">
						<AvatarImage src={comment.avatar} alt={comment.author} />
						<AvatarFallback>
							{comment.author.slice(0, 2).toUpperCase()}
						</AvatarFallback>
					</Avatar>
					<div className="min-w-0">
						<h3 className="truncate text-sm font-semibold">
							{comment.author}
						</h3>
						<p className="text-xs text-muted-foreground">
							{comment.authorEmail ?? comment.date}
						</p>
					</div>
				</div>
				<div className="flex flex-col space-y-4 py-6 border-b">
					<div className="flex items-center justify-between gap-4">
						<p className="w-full text-sm leading-6 text-muted-foreground">
							Comment status
						</p>
						<Select
							value={comment.classification}
							onValueChange={(value) => {
								if (value === "legitimate" || value === "spam") {
									onClassificationChange?.(value);
								}
							}}
							disabled={isClassifying || !onClassificationChange}>
							<SelectTrigger
								size="sm"
								className={cn(
									"w-34 rounded-sm shadow-none",
									classificationConfig[comment.classification]
										.className,
								)}>
								<ClassificationBadge
									classification={comment.classification}
								/>
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="legitimate">
									<ClassificationBadge classification="legitimate" />
								</SelectItem>
								<SelectItem value="spam">
									<ClassificationBadge classification="spam" />
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="flex items-center justify-between gap-4">
						<p className="w-full text-sm leading-6 text-muted-foreground">
							Blocked
						</p>
						<Select
							value={comment.isBlocked ? "yes" : "no"}
							disabled={
								isBlocking ||
								!comment.authorEmail ||
								!onBlockedChange
							}
							onValueChange={(value) => {
								if (value === "yes" || value === "no") {
									onBlockedChange?.(value === "yes");
								}
							}}>
							<SelectTrigger size="sm" className="w-45">
								<span>{comment.isBlocked ? "Yes" : "No"}</span>
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
								className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] items-center gap-4">
								<div className="flex min-w-0 items-center gap-3">
									<div className="flex size-8 shrink-0 items-center justify-center text-muted-foreground">
										<Icon className="size-4" />
									</div>
									<p className="truncate text-sm text-muted-foreground">
										{item.label}
									</p>
								</div>
								<p className="min-w-0 truncate text-right text-sm font-medium">
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
