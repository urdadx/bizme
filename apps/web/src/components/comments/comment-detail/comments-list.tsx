import { useState } from "react";
import { CommentListItem, type CommentReply } from "./comment-list-item";

const replies: CommentReply[] = [
	{
		id: "reply-1",
		author: "Jane Smith",
		date: "2 hours ago",
		content: "Thanks for sharing this. The setup was easy to follow.",
		likes: 8,
		replies: 2,
		avatar: "https://avatars.githubusercontent.com/u/70736338?v=4",
		children: [
			{
				id: "reply-1-child-1",
				author: "Abdul Wahab",
				date: "1 hour ago",
				content: "Appreciate the feedback. I will add that to the docs.",
				likes: 2,
				replies: 0,
				avatar: "https://avatars.githubusercontent.com/u/70736338?v=4",
				children: [],
			},
		],
	},
	{
		id: "reply-2",
		author: "John Doe",
		date: "Yesterday",
		content: "I ran into the same issue and this helped clarify the behavior.",
		likes: 3,
		replies: 1,
		avatar: "https://avatars.githubusercontent.com/u/124599?v=4",
		children: [],
	},
	{
		id: "reply-3",
		author: "John Doe",
		date: "Yesterday",
		content: "I ran into the same issue and this helped clarify the behavior.",
		likes: 3,
		replies: 1,
		avatar: "https://avatars.githubusercontent.com/u/124599?v=4",
		children: [],
	},
	{
		id: "reply-4",
		author: "John Doe",
		date: "Yesterday",
		content: "I ran into the same issue and this helped clarify the behavior.",
		likes: 3,
		replies: 1,
		avatar: "https://avatars.githubusercontent.com/u/124599?v=4",
		children: [],
	},
];

export function CommentsList() {
	const [replyingTo, setReplyingTo] = useState<string | null>(null);

	return (
		<div className="flex flex-col">
			{replies.map((reply) => (
				<CommentListItem
					key={reply.id}
					comment={reply}
					isReplying={replyingTo === reply.id}
					onReply={() =>
						setReplyingTo((current) => (current === reply.id ? null : reply.id))
					}
				/>
			))}
		</div>
	);
}
