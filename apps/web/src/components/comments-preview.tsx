import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "./ui/button";
import { LikeIcon } from "@/assets/icons/like-icon";
import { ChatLinear } from "@/assets/icons/chat-icon";
import { MoreVertical } from "lucide-react";

export function CommentsPreview() {
	return (
		<div className="w-full max-w-3xl rounded-lg bg-white px-4 py-4 text-sm border">
			<div className="flex gap-3">
				<Avatar size="lg">
					<AvatarImage
						src="https://avatars.githubusercontent.com/u/70736338?v=4"
						alt="@shadcn"
						className="grayscale"
					/>
					<AvatarFallback>CN</AvatarFallback>
				</Avatar>
				<div className="flex-1">
					<div className="flex flex-col gap-2">
						<div className="flex items-center justify-between gap-2">
							<div className="flex items-center gap-2">
								<h3 className="text-base font-semibold">
									Abdul Wahab
								</h3>
								<span className="text-xs text-muted-foreground">
									2 hours ago
								</span>
							</div>
							<Button variant="ghost" size="icon" className="h-8 w-8">
								<MoreVertical className="h-4 w-4" />
							</Button>
						</div>
						<p className="text-sm text-muted-foreground">
							Lorem ipsum dolor sit amet, consectetur adipiscing elit,
							sed do eiusmod tempor incididunt ut labore et dolore magna
							aliqua. Ut enim ad minim veniam, quis nostrud exercitation
							ullamco
						</p>
						<div className="flex items-center gap-4">
							<Button variant="ghost" size="icon">
								<LikeIcon />{" "}
								<span className="text-[#888888] ml-1">12</span>
							</Button>
							<Button variant="ghost" size="icon">
								<ChatLinear />{" "}
								<span className="text-[#888888] ml-1">5</span>
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
