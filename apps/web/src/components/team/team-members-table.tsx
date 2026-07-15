import { PenLinear } from "@/assets/icons/pen-icon";
import { Button } from "../ui/button";
import { TrashBinLinear } from "@/assets/icons/trash-icon";
import { MoreHorizontal } from "lucide-react";
import { PopoverContent, Popover, PopoverTrigger } from "../ui/popover";
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "../ui/table";
import { authClient } from "@/lib/auth-client";
import { Skeleton } from "../ui/skeleton";
import { useState } from "react";
import { toast } from "sonner";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { cn } from "@/lib/utils";
import LoadingDots from "../loading-dots";
import { InviteTeamDialog } from "./invite-team-dialog";

type InviteRole = "member" | "admin";

function getStatusLabel(status: string) {
	return status.charAt(0).toUpperCase() + status.slice(1);
}

export const TeamMembersTable = () => {
	const { data: organization, isPending, refetch } = authClient.useActiveOrganization();
	const members = organization?.members ?? [];
	const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
	const [editingMember, setEditingMember] = useState<(typeof members)[number] | null>(null);
	const [editRole, setEditRole] = useState<InviteRole>("member");
	const [isUpdatingRole, setIsUpdatingRole] = useState(false);

	const handleRemoveMember = async (memberId: string) => {
		if (!organization) {
			return;
		}

		const { error } = await authClient.organization.removeMember({
			memberIdOrEmail: memberId,
			organizationId: organization.id,
		});

		if (error) {
			toast.error(error.message ?? "Unable to remove member");
			return;
		}

		toast.success("Member removed");
		await refetch();
	};

	const handleEditRole = (member: (typeof members)[number]) => {
		setEditingMember(member);
		setEditRole(member.role === "admin" ? "admin" : "member");
	};

	const handleUpdateRole = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!organization || !editingMember) {
			return;
		}

		setIsUpdatingRole(true);

		try {
			const { error } = await authClient.organization.updateMemberRole({
				memberId: editingMember.id,
				organizationId: organization.id,
				role: editRole,
			});

			if (error) {
				toast.error(error.message ?? "Unable to update role");
				return;
			}

			toast.success("Role updated");
			setEditingMember(null);
			await refetch();
		} finally {
			setIsUpdatingRole(false);
		}
	};

	if (isPending) {
		return <Skeleton className="h-48 w-full rounded-3xl" />;
	}

	if (!organization) {
		return (
			<div className="max-w-xs p-3 px-4 sm:px-6 md:max-w-full rounded-3xl border text-sm text-muted-foreground">
				No active workspace found.
			</div>
		);
	}

	return (
		<div className="max-w-xs p-3 px-4 sm:px-6 md:max-w-full rounded-3xl border">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-xl font-semibold text-foreground">Team members</h3>
				<Button size="sm" onClick={() => setIsInviteDialogOpen(true)}>
					Add new member
				</Button>
			</div>
			<InviteTeamDialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen} />
			<Dialog
				open={editingMember !== null}
				onOpenChange={(open) => !open && setEditingMember(null)}>
				<DialogContent>
					<form className="space-y-5" onSubmit={handleUpdateRole}>
						<DialogHeader>
							<DialogTitle className="text-xl font-semibold">
								Edit role
							</DialogTitle>
							<DialogDescription>
								Update {editingMember?.user.name}'s role in{" "}
								{organization.name}.
							</DialogDescription>
						</DialogHeader>
						<RadioGroup
							value={editRole}
							onValueChange={(value) =>
								setEditRole(value as InviteRole)
							}
							className="grid gap-4 pt-1 sm:grid-row-2">
							<Label className="flex cursor-pointer items-start gap-3">
								<RadioGroupItem value="member" />
								<span>
									<span className="block font-medium">
										Member
									</span>
									<span className="text-xs text-muted-foreground">
										Can view and manage comments.
									</span>
								</span>
							</Label>
							<Label className="flex cursor-pointer items-start gap-3">
								<RadioGroupItem value="admin" />
								<span>
									<span className="block font-medium">
										Admin
									</span>
									<span className="text-xs text-muted-foreground">
										Can manage workspace settings.
									</span>
								</span>
							</Label>
						</RadioGroup>
						<DialogFooter>
							<Button
								type="submit"
								disabled={isUpdatingRole}
								className="min-w-28">
								{isUpdatingRole ? (
									<LoadingDots color="#fffff" />
								) : (
									"Save changes"
								)}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
			<Table className=" ">
				<TableHeader className="w-full text-muted-foreground ">
					<TableRow className="hover:bg-transparent text-muted-foreground text-xs">
						<TableHead>Name</TableHead>
						<TableHead>Email</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Action</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{members.map((member) => (
						<TableRow key={member.id} className="w-full">
							<TableCell>
								<div className="flex items-center gap-3">
									<div>
										<div className="font-medium">
											{member.user.name}
										</div>
										<span className="mt-0.5 text-muted-foreground text-xs">
											{member.role}
										</span>
									</div>
								</div>
							</TableCell>
							<TableCell>{member.user.email}</TableCell>
							<TableCell>
								<div className="flex items-center gap-2">
									<div
										className={cn(
											"h-2 w-2 rounded-full",
											"bg-green-500",
										)}></div>
									{getStatusLabel("active")}
								</div>
							</TableCell>
							<TableCell>
								<Popover>
									<PopoverTrigger>
										<Button variant="outline" size="sm">
											<MoreHorizontal className="size-4" />
										</Button>
									</PopoverTrigger>
									<PopoverContent
										align="end"
										className="w-40 p-1">
										<div className="flex flex-col gap-1">
											<Button
												variant="ghost"
												size="sm"
												className="justify-start h-8 px-2"
												disabled={
													member.role ===
													"owner"
												}
												onClick={() =>
													handleEditRole(member)
												}>
												<PenLinear className="mr-2 h-3.5 w-3.5" />
												Edit role
											</Button>

											<Button
												variant="ghost"
												size="sm"
												className="justify-start h-8 px-2 text-red-600 hover:text-red-600 hover:bg-red-50"
												onClick={() =>
													handleRemoveMember(
														member.id,
													)
												}>
												<TrashBinLinear
													className="mr-2 h-3.5 w-3.5"
													color="currentColor"
												/>
												Remove member
											</Button>
										</div>
									</PopoverContent>
								</Popover>
							</TableCell>
						</TableRow>
					))}
					{members.length === 0 && (
						<TableRow>
							<TableCell colSpan={4} className="text-muted-foreground">
								No team members found.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
};
