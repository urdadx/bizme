import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Link } from "@tanstack/react-router";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, MoreHorizontal } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type RecentComment = {
	id: string;
	date: string;
	user: string;
	comment: string;
};

function CommentsTable({ comments }: { comments: RecentComment[] }) {
	const columns: ColumnDef<RecentComment>[] = [
		{
			accessorKey: "date",
			header: "Date",
			cell: ({ row }) => (
				<span className="font-medium truncate capitalize max-w-24 md:max-w-52 block">
					{row.getValue("date")}
				</span>
			),
		},
		{
			accessorKey: "user",
			header: "User",
			cell: ({ row }) => (
				<span className="font-medium truncate max-w-24 md:max-w-52 block">
					{row.getValue("user")}
				</span>
			),
		},
		{
			accessorKey: "comment",
			header: "Comments",
			cell: ({ row }) => (
				<span className="block max-w-[16rem] truncate text-muted-foreground md:max-w-md">
					{row.getValue("comment")}
				</span>
			),
		},
		{
			id: "actions",
			header: "Action",
			cell: () => (
				<DropdownMenu>
					<DropdownMenuTrigger>
						<Button variant="outline" className="h-8 w-8 p-0">
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem>
							<Link to="/comments" className="w-full">
								View details
							</Link>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			),
		},
	];

	const table = useReactTable({
		columns,
		data: comments,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div className="rounded-xl max-w-sm md:max-w-full border bg-background overflow-hidden">
			<Table>
				<TableHeader className="bg-gray-50">
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id} className="hover:bg-transparent">
							{headerGroup.headers.map((header) => (
								<TableHead
									key={header.id}
									className="h-10 text-sm text-muted-foreground">
									{flexRender(
										header.column.columnDef.header,
										header.getContext(),
									)}
								</TableHead>
							))}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows.length === 0 ? (
						<TableRow>
							<TableCell
								colSpan={columns.length}
								className="text-center py-4">
								No comments yet.
							</TableCell>
						</TableRow>
					) : (
						table.getRowModel().rows.map((row) => (
							<TableRow key={row.id}>
								{row.getVisibleCells().map((cell) => (
									<TableCell
										key={cell.id}
										className="py-3 px-2 md:px-4 h-14">
										{flexRender(
											cell.column.columnDef.cell,
											cell.getContext(),
										)}
									</TableCell>
								))}
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</div>
	);
}

interface MostRecentCommentsProps {
	comments?: unknown[];
	onCommentsId?: () => void;
}

export function MostRecentComments({
	comments: _comments,
	onCommentsId: _onCommentsId,
}: MostRecentCommentsProps) {
	return (
		<div className="space-y-4 w-full">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold">Recent comments</h2>
				<Link to="/comments">
					<Button
						variant="ghost"
						size="sm"
						className="text-muted-foreground cursor-pointer">
						View all
						<ArrowUpRight className="h-3 w-3" />
					</Button>
				</Link>
			</div>

			<CommentsTable comments={[]} />
		</div>
	);
}
