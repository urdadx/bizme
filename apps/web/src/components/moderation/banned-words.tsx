import { Button } from "@/components/ui/button";
import { InputTags } from "@/components/input-tags";
import { useTRPC } from "@/utils/trpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Tag } from "emblor";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const bannedWordTags = [
	{
		id: "fuck",
		text: "fuck",
	},
	{
		id: "nude",
		text: "nude",
	},
	{
		id: "crap",
		text: "crap",
	},
];

function wordsToTags(words: string[]) {
	return words.map((word) => ({ id: word, text: word }));
}

function normalizeTags(tags: Tag[]) {
	return Array.from(
		new Set(
			tags.flatMap((tag) => {
				const text = tag.text.trim().toLowerCase();
				return text ? [text] : [];
			}),
		),
	);
}

export function BannedWords() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { data: settings, isPending: areSettingsPending } = useQuery(
		trpc.workspaceSettings.get.queryOptions()
	);
	const updateSettings = useMutation(trpc.workspaceSettings.update.mutationOptions());
	const [tags, setTags] = useState<Tag[]>(bannedWordTags);

	useEffect(() => {
		if (settings) {
			setTags(wordsToTags(settings.bannedWords));
		}
	}, [settings]);

	async function handleSave() {
		if (!settings) {
			return;
		}

		await updateSettings.mutateAsync({
			allowAnonymousComments: settings.allowAnonymousComments,
			allowImageUploads: settings.allowImageUploads,
			bannedWords: normalizeTags(tags),
		});
		await queryClient.invalidateQueries({
			queryKey: trpc.workspaceSettings.get.queryOptions().queryKey,
		});
		toast.success("Banned words saved");
	}

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
							label="Words"
							tags={tags}
							onTagsChange={setTags}
							showAttribution={false}
						/>
					</div>
				</div>
			</div>
			<div className="border-t border-border bg-gray-50 p-3 px-4 sm:px-6 rounded-b-2xl">
				<Button
					size="sm"
					disabled={areSettingsPending || updateSettings.isPending}
					onClick={() => void handleSave()}>
					{updateSettings.isPending ? "Saving..." : "Save changes"}
				</Button>
			</div>
		</div>
	);
}
