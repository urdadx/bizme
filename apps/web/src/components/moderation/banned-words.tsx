import { Button } from "@/components/ui/button";
import { InputTags } from "@/components/input-tags";

const bannedWordTags = [
	{
		id: "spam",
		text: "spam",
	},
	{
		id: "scam",
		text: "scam",
	},
];

export function BannedWords() {
	return (
		<div className="rounded-2xl border bg-card text-card-foreground">
			<div className="p-3 px-4 sm:px-6">
				<h3 className="text-xl font-semibold text-foreground">Banned words</h3>
				<div className="space-y-0 relative">
					<div className="flex flex-col gap-4 pt-1">
						<div className="text-sm flex items-center gap-2 text-muted-foreground">
							<span>
								Comments containing these words will be held for
								review.
							</span>
						</div>
						<InputTags
							defaultTags={bannedWordTags}
							label="Words"
							showAttribution={false}
						/>
					</div>
				</div>
			</div>
			<div className="border-t border-border bg-gray-50 p-3 px-4 sm:px-6 rounded-b-2xl">
				<Button size="sm">Save changes</Button>
			</div>
		</div>
	);
}
