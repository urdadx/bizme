import {
	type ColumnFiltersState,
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type PaginationState,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { MoreHorizontal } from "lucide-react";

import { SearchLinear } from "@/assets/icons/search-icon";
import { UserLinear } from "@/assets/icons/user-icon";
import { CuteIconWrapper } from "@/components/cute-icon-wrapper";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { EyeLinear } from "@/assets/icons/eye-icon";
import { TrashLines } from "@/assets/icons/trash-icon";
import { useTRPC } from "@/utils/trpc";
import { Link } from "@tanstack/react-router";

type CommentRow = {
	id: string;
	commenter: string;
	authorProvider: "anonymous" | "google" | "github" | "email";
	preview: string;
	page: string;
	pageUrl: string | null;
	likes: number;
	replies: number;
	status: "visible" | "pending" | "hidden" | "deleted";
	isPinned: boolean;
	lastActivity: string;
};

type CommenterFilter = "all" | "github" | "google" | "anonymous";
type CommentPageFilter = "all" | CommentRow["page"];

const commenterFilterItems = [
	{ label: "All commenters", value: "all" },
	{ label: "GitHub", value: "github" },
	{ label: "Google", value: "google" },
	{ label: "Anonymous", value: "anonymous" },
] satisfies { label: string; value: CommenterFilter }[];

function getColumns({
	onDelete,
	isDeleting,
}: {
	onDelete: (id: string) => void;
	isDeleting: boolean;
}): ColumnDef<CommentRow>[] {
	return [
		{
			accessorKey: "commenter",
			header: "Commenter",
			filterFn: (row, filterValue) => row.original.authorProvider === filterValue,
			cell: ({ row }) => (
				<div className="flex items-center gap-2">
					<CuteIconWrapper icon={UserLinear} color="#0ea5e9" />
					<span className="block max-w-44 truncate font-medium md:max-w-56">
						{row.getValue("commenter")}
					</span>
				</div>
			),
			minSize: 220,
		},
		{
			accessorKey: "preview",
			header: "Preview",
			cell: ({ row }) => (
				<span className="block max-w-56 truncate text-muted-foreground md:max-w-80">
					{row.getValue("preview")}
				</span>
			),
			minSize: 280,
		},
		{
			accessorKey: "likes",
			header: "Likes",
			cell: ({ row }) => (
				<span className="text-muted-foreground">{row.getValue("likes")}</span>
			),
			minSize: 100,
		},
		{
			accessorKey: "replies",
			header: "Replies",
			cell: ({ row }) => (
				<span className="text-muted-foreground">{row.getValue("replies")}</span>
			),
			minSize: 100,
		},
		{
			accessorKey: "lastActivity",
			header: "Last activity",
			cell: ({ row }) => (
				<span className="text-muted-foreground">
					{row.getValue("lastActivity")}
				</span>
			),
			minSize: 140,
		},
		{
			id: "actions",
			header: "Actions",
			cell: ({ row }) => (
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<Button
								variant="outline"
								size="icon-sm"
								aria-label="Open actions"
							/>
						}>
						<MoreHorizontal className="h-4 w-4" />
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-40 min-w-40">
						<DropdownMenuItem
							render={<Link to="/comments/$commentId" params={{ commentId: row.original.id }} />}>
							<EyeLinear />
							View details
						</DropdownMenuItem>
						<DropdownMenuItem
							disabled={isDeleting}
							className="text-red-500"
							onClick={() => onDelete(row.original.id)}>
							<TrashLines color="red" />
							Delete comment
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			),
			enableSorting: false,
			size: 88,
		},
	];
}

export function CommentsTable() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const commentsQuery = useQuery(trpc.comments.list.queryOptions());
	const deleteComment = useMutation(trpc.comments.delete.mutationOptions());
	const [error, setError] = useState<string | null>(null);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [globalFilter, setGlobalFilter] = useState("");
	const [sorting, setSorting] = useState<SortingState>([
		{
			id: "lastActivity",
			desc: false,
		},
	]);

	async function handleDelete(id: string) {
		try {
			setError(null);
			await deleteComment.mutateAsync({ id });
			await queryClient.invalidateQueries({
				queryKey: trpc.comments.list.queryOptions().queryKey,
			});
		} catch (error) {
			setError(error instanceof Error ? error.message : "Unable to delete comment.");
		}
	}

	const data = commentsQuery.data ?? [];
	const commentPageFilterItems = [
		{ label: "All pages", value: "all" },
		...Array.from(new Set(data.map((comment) => comment.page))).map((page) => ({
			label: page,
			value: page,
		})),
	] satisfies { label: string; value: CommentPageFilter }[];

	const columns = getColumns({
		onDelete: (id) => void handleDelete(id),
		isDeleting: deleteComment.isPending,
	});

	const table = useReactTable({
		data,
		columns,
		enableSortingRemoval: false,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		globalFilterFn: (row, _columnId, filterValue) => {
			const value = String(filterValue).trim().toLowerCase();

			if (!value) {
				return true;
			}

			return (
				row.original.commenter.toLowerCase().includes(value) ||
				row.original.preview.toLowerCase().includes(value) ||
				row.original.page.toLowerCase().includes(value)
			);
		},
		onColumnFiltersChange: setColumnFilters,
		onGlobalFilterChange: setGlobalFilter,
		onPaginationChange: setPagination,
		onSortingChange: setSorting,
		state: {
			columnFilters,
			globalFilter,
			pagination,
			sorting,
		},
	});

	return (
		<div className="space-y-4">
			{error ? <p className="text-sm text-destructive">{error}</p> : null}
			{commentsQuery.error ? (
				<p className="text-sm text-destructive">{commentsQuery.error.message}</p>
			) : null}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex w-full flex-col gap-3 sm:max-w-3xl sm:flex-row sm:items-center">
					<div className="relative w-full sm:max-w-sm">
						<Input
							placeholder="Search comments..."
							className="h-9 w-full pl-9"
							value={globalFilter}
							onChange={(event) =>
								table.setGlobalFilter(event.target.value)
							}
						/>
						<SearchLinear className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					</div>
					<Select
						items={commentPageFilterItems}
						defaultValue="all"
						modal={false}
						onValueChange={(value) => {
							if (typeof value === "string") {
								table.getColumn("page")?.setFilterValue(
									value === "all" ? undefined : value,
								);
							}
						}}>
						<SelectTrigger className="w-full sm:w-44">
							<SelectValue placeholder="All pages" />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>Page</SelectLabel>
								{commentPageFilterItems.map((item) => (
									<SelectItem
										key={item.value}
										value={item.value}>
										{item.label}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
					<Select
						items={commenterFilterItems}
						defaultValue="all"
						modal={false}
						onValueChange={(value) => {
							if (typeof value === "string") {
								table.getColumn("commenter")?.setFilterValue(
									value === "all" ? undefined : value,
								);
							}
						}}>
						<SelectTrigger className="w-full sm:w-44">
							<SelectValue placeholder="All commenters" />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>Commenter</SelectLabel>
								{commenterFilterItems.map((item) => (
									<SelectItem
										key={item.value}
										value={item.value}>
										{item.label}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>
			</div>
			<div className="max-w-sm overflow-hidden rounded-xl border md:max-w-full">
				<Table>
					<TableHeader className="bg-gray-50">
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow
								key={headerGroup.id}
								className="hover:bg-transparent">
								{headerGroup.headers.map((header) => (
									<TableHead
										key={header.id}
										className="h-11"
										style={{
											width: `${header.getSize()}px`,
										}}>
										{header.isPlaceholder ? null : header.column.getCanSort() ? (
											<div
												className={cn(
													"flex h-full select-none items-center justify-between gap-2",
													header.column.getCanSort() &&
														"cursor-pointer",
												)}
												onClick={header.column.getToggleSortingHandler()}
												onKeyDown={(event) => {
													if (
														event.key ===
															"Enter" ||
														event.key ===
															" "
													) {
														event.preventDefault();
														header.column.getToggleSortingHandler()?.(
															event,
														);
													}
												}}
												tabIndex={0}>
												{flexRender(
													header.column
														.columnDef
														.header,
													header.getContext(),
												)}
											</div>
										) : (
											flexRender(
												header.column.columnDef
													.header,
												header.getContext(),
											)
										)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{commentsQuery.isPending ? (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-14 text-center">
									<Loader />
								</TableCell>
							</TableRow>
						) : (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id}>
									{row.getVisibleCells().map((cell) => (
										<TableCell
											key={cell.id}
											className="h-14">
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

			<div className="flex items-center justify-between gap-3">
				<p className="text-sm text-muted-foreground">
					Page {table.getState().pagination.pageIndex + 1} of{" "}
					{table.getPageCount()}
				</p>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}>
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
}
