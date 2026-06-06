import { useState } from "react";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

export function CommentsModeration() {
	const [allowAnonymousComments, setAllowAnonymousComments] = useState(false);
	const [allowImageUploads, setAllowImageUploads] = useState(true);

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
							onCheckedChange={setAllowAnonymousComments}
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
							onCheckedChange={setAllowImageUploads}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
