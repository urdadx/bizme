import { ChatLinear } from "@/assets/icons/chat-icon";
import { LikeIcon } from "@/assets/icons/like-icon";
import { TrashBinLinear } from "@/assets/icons/trash-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVerticalIcon, PinIcon } from "lucide-react";
import { CommentComposer } from "./comment-composer";

export type CommentReply = {
	id: string;
	author: string;
	date: string;
	content: string;
	likes: number;
	replies: number;
	avatar: string;
	children: CommentReply[];
};

export function CommentListItem({
	comment,
	isReplying,
	onReply,
}: {
	comment: CommentReply;
	isReplying: boolean;
	onReply: () => void;
}) {
	return (
		<div className="border-b py-4 last:border-b-0 first:pt-0">
			<div className="relative">
				{comment.children.length > 0 && (
					<div className="absolute top-10 bottom-5 left-5 w-px bg-border" />
				)}

				<div className="relative flex gap-3">
					<Avatar size="lg">
						<AvatarImage
							src={comment.avatar}
							alt={comment.author}
							className="grayscale"
						/>
						<AvatarFallback>
							{comment.author.slice(0, 2).toUpperCase()}
						</AvatarFallback>
					</Avatar>

					<div className="min-w-0 flex-1">
						<div className="flex items-start justify-between gap-3">
							<div className="min-w-0">
								<div className="flex flex-wrap items-center gap-2">
									<h3 className="truncate text-sm font-semibold">
										{comment.author}
									</h3>
									<span className="text-xs text-muted-foreground">
										{comment.date}
									</span>
								</div>
								<p className="mt-1 text-sm leading-6 text-muted-foreground">
									{comment.content}
								</p>
							</div>

							<DropdownMenu>
								<DropdownMenuTrigger
									render={
										<Button
											variant="ghost"
											size="sm"
											className="h-8 w-8 shrink-0"
											aria-label="Open comment options"
										/>
									}>
									<MoreVerticalIcon className="h-4 w-4" />
								</DropdownMenuTrigger>
								<DropdownMenuContent
									align="end"
									className="w-32 min-w-32">
									<DropdownMenuItem>
										<PinIcon className="size-4" />
										Pin
									</DropdownMenuItem>
									<DropdownMenuItem className="text-destructive">
										<TrashBinLinear
											color="red"
											className="size-4"
										/>
										<span className="text-red-600">
											Delete
										</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>

						<div className="mt-2 flex items-center gap-4">
							<Button variant="ghost" size="sm">
								<LikeIcon />{" "}
								<span className="ml-1 text-[#888888]">
									{comment.likes}
								</span>
							</Button>
							<Button variant="ghost" size="sm" onClick={onReply}>
								<ChatLinear />{" "}
								<span className="ml-1 text-[#888888]">
									{comment.replies}
								</span>
							</Button>
						</div>
					</div>
				</div>

				{isReplying && (
					<div className="mt-3 ml-13">
						<CommentComposer uploadId={`reply-file-upload-${comment.id}`} />
					</div>
				)}

				{comment.children.length > 0 && (
					<div className="mt-4 flex flex-col gap-4">
						{comment.children.map((child) => (
							<div key={child.id} className="relative flex gap-3">
								<Avatar size="lg">
									<AvatarImage
										src={child.avatar}
										alt={child.author}
										className="grayscale"
									/>
									<AvatarFallback>
										{child.author.slice(0, 2).toUpperCase()}
									</AvatarFallback>
								</Avatar>
								<div className="min-w-0 flex-1">
									<div className="flex flex-wrap items-center gap-2">
										<h3 className="truncate text-sm font-semibold">
											{child.author}
										</h3>
										<span className="text-xs text-muted-foreground">
											{child.date}
										</span>
									</div>
									<p className="mt-1 text-sm leading-6 text-muted-foreground">
										{child.content}
									</p>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
