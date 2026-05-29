import { MoreVertical } from "lucide-react";

const comments = [
	{
		id: "comment-1",
		author: "Rogue Shinobi",
		date: "last week",
		body: "this is a test comment",
	},
	{
		id: "comment-2",
		author: "Rogue Shinobi",
		date: "5 hours ago",
		body: "yeah that is crazy bug",
	},
];

export function CommentsPreview() {
	return (
		<div className="w-full max-w-3xl rounded-lg bg-white px-4 py-2 text-sm border">
			{comments.map((comment) => (
				<div key={comment.id} className="relative flex gap-3 py-3">
					<div className="absolute bottom-0 left-2.75 top-10 w-px bg-zinc-200" />
					<div className="relative mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-black text-[11px] font-semibold text-white">
						R
					</div>
					<div className="min-w-0 flex-1 pr-8">
						<div className="flex items-center gap-2">
							<span className="font-semibold">{comment.author}</span>
							<span className="text-xs text-zinc-500">
								{comment.date}
							</span>
						</div>
						<p className="mt-2 text-zinc-700">{comment.body}</p>
					</div>
					<button
						className="absolute right-0 top-3 text-zinc-400"
						aria-label="Comment actions">
						<MoreVertical className="size-4" />
					</button>
					<button className="absolute bottom-3 right-0 rounded-full border border-zinc-200 px-3 py-0.5 text-xs text-zinc-700">
						0
					</button>
				</div>
			))}
		</div>
	);
}
