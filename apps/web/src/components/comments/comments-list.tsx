import { ChatBold } from "@/assets/icons/chat-icon";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { HeartBold } from "@/assets/icons/heart-icon";

export const CommentsList = () => {
	return (
		<div className="flex w-full">
			<div className="w-full flex justify-between border border-x-0 border-muted bg-popover px-8 p-3">
				<div className="flex gap-3 items-center">
					<Avatar>
						<AvatarImage
							src="https://github.com/shadcn.png"
							alt="@shadcn"
							className=""
						/>
						<AvatarFallback>CN</AvatarFallback>
					</Avatar>
					<p className="font-normal text-sm">
						Cannot send a message on the widget
					</p>
				</div>
				<div className="flex items-center gap-6">
					<p className="text-sm text-muted-foreground">May 25</p>

					<div className="w-fit cursor-pointer flex gap-2 p-2 rounded-md bg-muted text-muted-foreground text-xs hover:bg-muted/80">
						<div className="flex items-center gap-1">
							<ChatBold className="w-4 h-4" />2
						</div>
						<div className="flex items-center gap-1">
							<HeartBold className="w-4 h-4" />5
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
