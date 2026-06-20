import { useTRPC } from "@/utils/trpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

export function CommentsModeration() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const settingsQuery = useQuery(trpc.workspaceSettings.get.queryOptions());
	const updateSettings = useMutation(trpc.workspaceSettings.update.mutationOptions());
	const [allowAnonymousComments, setAllowAnonymousComments] = useState(false);
	const [allowImageUploads, setAllowImageUploads] = useState(true);
	const settings = settingsQuery.data;

	useEffect(() => {
		if (settings) {
			setAllowAnonymousComments(settings.allowAnonymousComments);
			setAllowImageUploads(settings.allowImageUploads);
		}
	}, [settings]);

	async function updateModerationSettings({
		allowAnonymousComments: nextAllowAnonymousComments = allowAnonymousComments,
		allowImageUploads: nextAllowImageUploads = allowImageUploads,
	}: {
		allowAnonymousComments?: boolean;
		allowImageUploads?: boolean;
	}) {
		if (!settings) {
			return;
		}

		await updateSettings.mutateAsync({
			allowAnonymousComments: nextAllowAnonymousComments,
			allowImageUploads: nextAllowImageUploads,
			bannedWords: settings.bannedWords,
		});
		await queryClient.invalidateQueries({
			queryKey: trpc.workspaceSettings.get.queryOptions().queryKey,
		});
		toast.success("Moderation setting updated");
	}

	function handleAnonymousCommentsChange(checked: boolean) {
		setAllowAnonymousComments(checked);
		void updateModerationSettings({ allowAnonymousComments: checked });
	}

	function handleImageUploadsChange(checked: boolean) {
		setAllowImageUploads(checked);
		void updateModerationSettings({ allowImageUploads: checked });
	}

	return (
		<div className=" border rounded-3xl bg-card text-card-foreground">
			<div className=" p-3 px-4 sm:px-6">
				<h3 className="text-xl font-semibold text-foreground">Moderation</h3>

				<div className=" divide-y">
					<div className="flex items-center justify-between gap-4 py-4">
						<div className="space-y-1">
							<Label
								htmlFor="allow-anonymous-comments"
								className="font-medium text-foreground">
								Allow anonymous comments
							</Label>
							<p className="text-sm text-muted-foreground">
								Let people comment without signing in.
							</p>
						</div>
						<Switch
							id="allow-anonymous-comments"
							checked={allowAnonymousComments}
							disabled={settingsQuery.isPending || updateSettings.isPending}
							onCheckedChange={handleAnonymousCommentsChange}
						/>
					</div>

					<div className="flex items-center justify-between gap-4 py-4">
						<div className="space-y-1">
							<Label
								htmlFor="allow-image-uploads"
								className="font-medium text-foreground">
								Allow image upload in comments
							</Label>
							<p className="text-sm text-muted-foreground">
								Allow commenters to attach images to their replies.
							</p>
						</div>
						<Switch
							id="allow-image-uploads"
							checked={allowImageUploads}
							disabled={settingsQuery.isPending || updateSettings.isPending}
							onCheckedChange={handleImageUploadsChange}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
