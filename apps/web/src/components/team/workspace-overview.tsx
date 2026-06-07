import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Avatar, AvatarImage } from "../ui/avatar";
import { UploadLinear } from "@/assets/icons/upload-icon";
import { useRef, useState } from "react";

export function WorkspaceOverview() {
	return <AccountForm />;
}

function AccountForm() {
	const [username, setUsername] = useState("Abdul Wahab");
	const [updatedImage, setUpdatedImage] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (event) => {
			setUpdatedImage(event.target?.result as string);
		};
		reader.readAsDataURL(file);
	};

	return (
		<div className="rounded-2xl border bg-card text-card-foreground">
			<div className="p-3 px-4 sm:px-6">
				<div className="flex items-center justify-between">
					<h3 className="text-xl font-semibold text-foreground">Overview</h3>
					{/* <Button>Create new workspace</Button> */}
				</div>
				<div className="space-y-0 relative">
					<div className="flex flex-col gap-2 py-2">
						<Label className="text-sm text-muted-foreground">Avatar</Label>

						<div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
							<Avatar className="h-16 w-16 rounded-2xl border">
								<AvatarImage
									className="rounded-2xl object-cover"
									src={
										updatedImage ||
										"https://api.dicebear.com/9.x/glass/svg?seed=Jack"
									}
								/>
							</Avatar>
							<input
								type="file"
								ref={fileInputRef}
								className="hidden"
								accept="image/*"
								onChange={handleImageUpload}
							/>
							<Button
								className="font-normal text-gray-800"
								variant="outline"
								size="sm"
								onClick={() => fileInputRef.current?.click()}>
								<UploadLinear className="mr-1 h-4 w-4" />
								Change avatar
							</Button>
						</div>
					</div>
					<div className="flex flex-col gap-2 py-4">
						<Label className="text-sm text-muted-foreground">
							Workspace name
						</Label>
						<Input
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							className="h-8 w-full bg-white outline-2"
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
