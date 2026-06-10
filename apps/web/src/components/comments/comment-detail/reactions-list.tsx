import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const reactions = [
	{
		id: "reaction-1",
		name: "Jane Smith",
		date: "reacted 3 weeks ago",
		avatar: "https://avatars.githubusercontent.com/u/70736338?v=4",
	},
	{
		id: "reaction-2",
		name: "John Doe",
		date: "reacted 2 weeks ago",
		avatar: "https://avatars.githubusercontent.com/u/124599?v=4",
	},
	{
		id: "reaction-3",
		name: "Anonymous",
		date: "reacted 5 days ago",
		avatar: "",
	},
];

export function ReactionsList() {
	return (
		<div className="flex flex-col divide-y">
			{reactions.map((reaction) => (
				<div key={reaction.id} className="flex items-center gap-3 py-4 first:pt-0">
					<Avatar size="lg">
						<AvatarImage
							src={reaction.avatar}
							alt={reaction.name}
							className="grayscale"
						/>
						<AvatarFallback>{reaction.name.slice(0, 2).toUpperCase()}</AvatarFallback>
					</Avatar>
					<div className="min-w-0">
						<h3 className="truncate text-sm font-semibold">{reaction.name}</h3>
						<p className="text-xs text-muted-foreground">{reaction.date}</p>
					</div>
				</div>
			))}
		</div>
	);
}
