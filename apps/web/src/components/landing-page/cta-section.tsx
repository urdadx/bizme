import { ChatLinear } from "@/assets/icons/chat-icon";
import { LikeIcon } from "@/assets/icons/like-icon";
import { CommentComposer } from "@/components/comments/comment-detail/comment-composer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreVerticalIcon } from "lucide-react";

type PreviewComment = {
	id: string;
	author: string;
	date: string;
	content: string;
	likes: number;
	replies: PreviewComment[];
	avatar: string;
};

const previewComments: PreviewComment[] = [
	{
		id: "maya",
		author: "Jack Maaye",
		date: "2 min ago",
		content: "This is exactly what I wanted for my blog. Looks good, easily customizable and integrates seamlessly.",
		likes: 18,
		avatar: "https://avatars.githubusercontent.com/u/70736338?v=4",
		replies: [
			{
				id: "jonah",
				author: "Jonah Park",
				date: "just now",
				content: "Same. The moderation tools are what sold it for me.",
				likes: 7,
				avatar: "https://avatars.githubusercontent.com/u/88161157?v=4",
				replies: [],
			},
		],
	},
];

export const CTASession = () => {
	return (
		<section>
			<div className="relative pt-16 md:pt-32">
				<div className="mx-auto max-w-7xl px-6">
					<div className="max-w-3xl text-center sm:mx-auto lg:mr-auto lg:mt-0 lg:w-4/5">
						<h1 className="mt-8 text-balance text-4xl font-semibold md:text-5xl xl:text-6xl xl:leading-[1.3] instrument-serif-regular">
							Beautiful comment section for your{" "}
							<span className="relative z-1 inline-block rounded bg-primary/10 px-1 text-primary">
								blog
							</span>
						</h1>

						<p className="mx-auto mt-8 hidden max-w-xl text-wrap text-lg sm:block">
							Bizme gives you a complete engagement infrastructure for
							building and deploying beautiful comment sections for your
							blog.
						</p>
						<p className="mx-auto mt-6 block max-w-xl text-wrap text-lg sm:hidden"></p>
					</div>
				</div>

				<div className=" my-12 w-full mx-auto max-w-5xl px-3 sm:px-6">
					<div className="relative overflow-visible rounded-xl border bg-gray-50 p-2 shadow-sm ring-muted ">
						<div className="rounded-lg border bg-white p-4 sm:p-6">
							<div className="flex flex-col gap-6">
								<CommentComposer uploadId="landing-comment-file-upload" />
								<div className=" flex-col hidden sm:flex">
									{previewComments.map((comment) => (
										<PreviewCommentItem
											key={comment.id}
											comment={comment}
										/>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

function PreviewCommentItem({
	comment,
	isChild = false,
}: {
	comment: PreviewComment;
	isChild?: boolean;
}) {
	return (
		<div className={isChild ? "py-2" : "border-b py-4 first:pt-0 last:border-b-0"}>
			<div className="flex gap-3">
				<Avatar size="lg">
					<AvatarImage src={comment.avatar} alt={comment.author} />
					<AvatarFallback>
						{comment.author.slice(0, 2).toUpperCase()}
					</AvatarFallback>
				</Avatar>

				<div className="min-w-0 flex-1">
					<div className="flex items-start justify-between gap-3">
						<div className="min-w-0">
							<div className="flex flex-wrap items-center gap-2">
								<h3 className="truncate font-sans text-sm font-semibold text-[#444242]">
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

						<button
							type="button"
							className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-black hover:bg-secondary"
							aria-label="Open comment options">
							<MoreVerticalIcon className="h-4 w-4" />
						</button>
					</div>

					<div className="mt-2 flex items-center gap-4">
						<button
							type="button"
							className="inline-flex h-8 items-center rounded-md px-2 text-sm hover:bg-secondary">
							<LikeIcon />
							<span className="ml-1 text-[#888888]">
								{comment.likes}
							</span>
						</button>
						<button
							type="button"
							className="inline-flex h-8 items-center rounded-md px-2 text-sm hover:bg-secondary">
							<ChatLinear />
							<span className="ml-1 text-[#888888]">
								{comment.replies.length}
							</span>
						</button>
					</div>

					{comment.replies.length > 0 ? (
						<div className="mt-4 border-l border-border pl-6">
							{comment.replies.map((reply) => (
								<PreviewCommentItem
									key={reply.id}
									comment={reply}
									isChild
								/>
							))}
						</div>
					) : null}
				</div>
			</div>
		</div>
	);
}
