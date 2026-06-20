import { TrashBinLinear } from "@/assets/icons/trash-icon";
import { useTRPC } from "@/utils/trpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { BlockUserDialog } from "./block-user-dialog";
import { Button } from "../ui/button";
import { PopoverContent, Popover, PopoverTrigger } from "../ui/popover";
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "../ui/table";

export const BlockedUsers = () => {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [blockUserOpen, setBlockUserOpen] = useState(false);
	const blockedUsersQuery = useQuery(trpc.blockedUsers.list.queryOptions());
	const unblockUser = useMutation(trpc.blockedUsers.unblock.mutationOptions());
	const blockedUsers = blockedUsersQuery.data ?? [];

	async function handleUnblock(email: string) {
		await unblockUser.mutateAsync({ email });
		await queryClient.invalidateQueries({
			queryKey: trpc.blockedUsers.list.queryOptions().queryKey,
		});
	}

	return (
		<div className="max-w-xs p-3 px-4 sm:px-6 md:max-w-full rounded-3xl border">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-xl font-semibold text-foreground">Blocked users</h3>
				<Button size="sm" onClick={() => setBlockUserOpen(true)}>
					Block a user
				</Button>
			</div>
			<BlockUserDialog open={blockUserOpen} onOpenChange={setBlockUserOpen} />
			<Table className=" ">
				<TableHeader className="w-full text-muted-foreground ">
					<TableRow className="hover:bg-transparent text-muted-foreground text-xs">
						<TableHead>Name</TableHead>
						<TableHead>Email</TableHead>
						<TableHead>Action</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{blockedUsersQuery.isPending ? (
						<TableRow>
							<TableCell colSpan={3} className="h-20 text-center text-sm text-muted-foreground">
								Loading blocked users...
							</TableCell>
						</TableRow>
					) : blockedUsers.length === 0 ? (
						<TableRow>
							<TableCell colSpan={3} className="h-20 text-center text-sm text-muted-foreground">
								No blocked users.
							</TableCell>
						</TableRow>
					) : (
						blockedUsers.map((user) => (
							<TableRow key={user.id} className="w-full">
								<TableCell>
									<div className="flex items-center gap-3">
										<div>
											<div className="font-medium">{user.name ?? "Unknown user"}</div>
											<span className="mt-0.5 text-muted-foreground text-xs">
												{user.joinedAt}
											</span>
										</div>
									</div>
								</TableCell>
								<TableCell>{user.email}</TableCell>
								<TableCell>
									<Popover>
										<PopoverTrigger>
											<Button variant="outline" size="sm">
												<MoreHorizontal className="size-4" />
											</Button>
										</PopoverTrigger>
										<PopoverContent align="end" className="w-40 p-1">
											<Button
												variant="ghost"
												size="sm"
												disabled={unblockUser.isPending}
												onClick={() => void handleUnblock(user.email)}
												className="justify-start h-8 px-2 text-red-600 hover:text-red-600 hover:bg-red-50">
												<TrashBinLinear
													className="mr-2 h-3.5 w-3.5"
													color="currentColor"
												/>
												Unblock
											</Button>
										</PopoverContent>
									</Popover>
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</div>
	);
};
