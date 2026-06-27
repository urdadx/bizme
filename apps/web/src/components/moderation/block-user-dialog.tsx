import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTRPC } from "@/utils/trpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BanIcon } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

type BlockUserDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function BlockUserDialog({ open, onOpenChange }: BlockUserDialogProps) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [email, setEmail] = useState("");
	const [error, setError] = useState<string | null>(null);
	const { data: candidatesData } = useQuery({
		...trpc.blockedUsers.candidates.queryOptions(),
		enabled: open,
	});
	const blockUser = useMutation(trpc.blockedUsers.block.mutationOptions());
	const candidates = candidatesData ?? [];

	async function refreshBlockedUsers() {
		await Promise.all([
			queryClient.invalidateQueries({
				queryKey: trpc.blockedUsers.list.queryOptions().queryKey,
			}),
			queryClient.invalidateQueries({
				queryKey: trpc.blockedUsers.candidates.queryOptions().queryKey,
			}),
		]);
	}

	async function handleBlock(input: { email: string; name?: string | null }) {
		setError(null);

		try {
			await blockUser.mutateAsync({
				email: input.email,
				name: input.name,
				reason: "Blocked from moderation settings",
			});
			await refreshBlockedUsers();
			setEmail("");
			toast.success("User blocked");
		} catch (error) {
			setError(error instanceof Error ? error.message : "Unable to block user.");
		}
	}

	async function handleManualBlock(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (!email.trim()) {
			setError("Enter an email address.");
			return;
		}

		await handleBlock({ email });
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-xl">
				<DialogHeader>
					<DialogTitle className="text-xl font-semibold">
						Block a user
					</DialogTitle>
					<DialogDescription>
						Enter an email address, or block someone who has already
						commented.
					</DialogDescription>
				</DialogHeader>

				<form
					className="space-y-3"
					onSubmit={(event) => void handleManualBlock(event)}>
					<div className="space-y-2">
						<Label htmlFor="block-user-email">Email address</Label>
						<div className="flex gap-2">
							<Input
								id="block-user-email"
								type="email"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								placeholder="person@example.com"
							/>
							<Button type="submit" disabled={blockUser.isPending}>
								<BanIcon />
								Block
							</Button>
						</div>
					</div>
					{error ? <p className="text-sm text-destructive">{error}</p> : null}
				</form>

				<div className="space-y-3">
					{candidates.length > 0 && (
						<>
							<div>
								<h4 className="text-lg font-semibold text-foreground">
									Users
								</h4>
							</div>
							<div className="max-h-72 overflow-y-auto rounded-md border">
								{candidates.map((candidate) => (
									<div
										key={candidate.email}
										className="flex items-center justify-between gap-3 border-b p-3 last:border-b-0">
										<div className="min-w-0">
											<div className="truncate text-sm font-medium">
												{candidate.name ??
													"Unknown user"}
											</div>
											<div className="truncate text-xs text-muted-foreground">
												{candidate.email}
											</div>
										</div>
										<Button
											variant="outline"
											size="sm"
											disabled={blockUser.isPending}
											onClick={() =>
												void handleBlock(candidate)
											}>
											Block
										</Button>
									</div>
								))}
							</div>
						</>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
