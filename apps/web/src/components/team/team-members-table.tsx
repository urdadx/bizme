import { PenLinear } from "@/assets/icons/pen-icon";
import { Button } from "../ui/button";
import { TrashBinLinear } from "@/assets/icons/trash-icon";
import { MoreHorizontal } from "lucide-react";
import { PopoverContent, Popover, PopoverTrigger } from "../ui/popover";
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "../ui/table";
import { authClient } from "@/lib/auth-client";
import { Skeleton } from "../ui/skeleton";

export const TeamMembersTable = () => {
	const { data: organization, isPending } = authClient.useActiveOrganization();
	const members = organization?.members ?? [];

	const handleRemoveMember = async (memberId: string) => {
		if (!organization) {
			return;
		}

		await authClient.organization.removeMember({
			memberIdOrEmail: memberId,
			organizationId: organization.id,
		});
	};

	if (isPending) {
		return <Skeleton className="h-48 w-full rounded-3xl" />;
	}

	return (
		<div className="max-w-xs p-3 px-4 sm:px-6 md:max-w-full rounded-3xl border">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-xl font-semibold text-foreground">Team members</h3>
				<Button size="sm">Add member</Button>
			</div>
			<Table className=" ">
				<TableHeader className="w-full text-muted-foreground ">
					<TableRow className="hover:bg-transparent text-muted-foreground text-xs">
						<TableHead>Name</TableHead>
						<TableHead>Email</TableHead>
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
												disabled>
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
												Remove
											</Button>
										</div>
									</PopoverContent>
								</Popover>
							</TableCell>
						</TableRow>
					))}
					{members.length === 0 && (
						<TableRow>
							<TableCell colSpan={3} className="text-muted-foreground">
								No team members found.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
};
