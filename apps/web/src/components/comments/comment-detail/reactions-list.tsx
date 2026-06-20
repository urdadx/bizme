import { HeartBold } from "@/assets/icons/heart-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type CommentReaction = {
	id: string;
	type: string;
	visitorId: string;
	name: string;
	avatar: string | null;
	date: string;
};

export function ReactionsList({ reactions }: { reactions: CommentReaction[] }) {
	if (reactions.length === 0) {
		return (
			<div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
				No reactions yet.
			</div>
		);
	}

	return (
		<div className="flex flex-col divide-y">
			{reactions.map((reaction) => (
				<div key={reaction.id} className="flex items-center gap-3 py-4 first:pt-0">
					<div className="relative shrink-0">
						<Avatar size="lg">
							<AvatarImage
								src={reaction.avatar ?? undefined}
								alt={reaction.name}
							/>
							<AvatarFallback>
								{reaction.name.slice(0, 2).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<div className="absolute -right-0.5 -bottom-0.5 flex size-4 items-center justify-center rounded-full border-2 border-background bg-red-500 text-white">
							<HeartBold className="size-2" />
						</div>
					</div>
					<div className="min-w-0">
						<h3 className="truncate text-sm font-semibold">
							{reaction.name}
						</h3>
						<p className="text-xs text-muted-foreground">
							reacted {reaction.date}
						</p>
					</div>
				</div>
			))}
		</div>
	);
}
