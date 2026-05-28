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
import { useState } from "react";
import { MoreHorizontal } from "lucide-react";

import { ChartLinear } from "@/assets/icons/chart-icon";
import { SearchLinear } from "@/assets/icons/search-icon";
import { CuteIconWrapper } from "@/components/cute-icon-wrapper";
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

type PollRow = {
	id: string;
	question: string;
	page: string;
	votes: number;
	status: "Active" | "Closed" | "Draft";
	created: string;
};

const dummyPolls: PollRow[] = [
	{
		id: "poll_1",
		question: '"What\'s your fav stack?"',
		page: "/posts/hello",
		votes: 120,
		status: "Active",
		created: "2 days ago",
	},
	{
		id: "poll_2",
		question: '"Did you enjoy this?"',
		page: "/posts/my-story",
		votes: 45,
		status: "Closed",
		created: "1 week ago",
	},
	{
		id: "poll_3",
		question: '"Rate this tutorial"',
		page: "/posts/review",
		votes: 8,
		status: "Draft",
		created: "3 days ago",
	},
];

type PollStatusFilter = "all" | PollRow["status"];

const pollStatusFilterItems = [
	{ label: "All statuses", value: "all" },
	{ label: "Active", value: "Active" },
	{ label: "Closed", value: "Closed" },
	{ label: "Draft", value: "Draft" },
] satisfies { label: string; value: PollStatusFilter }[];

const columns: ColumnDef<PollRow>[] = [
	{
		accessorKey: "question",
		header: "Poll Question",
		cell: ({ row }) => (
			<div className="flex items-center gap-2">
				<CuteIconWrapper icon={ChartLinear} color="#22c55e" />
				<span className="block max-w-48 truncate font-medium md:max-w-72">
					{row.getValue("question")}
				</span>
			</div>
		),
		minSize: 300,
	},
	{
		accessorKey: "page",
		header: "Page",
		cell: ({ row }) => (
			<span className="text-muted-foreground">{row.getValue("page")}</span>
		),
		minSize: 180,
	},
	{
		accessorKey: "votes",
		header: "Votes",
		cell: ({ row }) => <span>{row.getValue("votes")}</span>,
	},
	{
		accessorKey: "status",
		header: "Status",
		filterFn: "equalsString",
		cell: ({ row }) => {
			const status = row.getValue("status") as PollRow["status"];

			return (
				<span
					className={cn(
						"inline-flex rounded-sm border px-2 py-0.5 text-xs",
						status === "Active" &&
							"border-green-500/20 bg-green-50 text-green-600",
						status === "Closed" &&
							"border-stone-500/20 bg-stone-100 text-stone-600",
						status === "Draft" &&
							"border-amber-500/20 bg-amber-50 text-amber-600",
					)}>
					{status}
				</span>
			);
		},
	},
	{
		accessorKey: "created",
		header: "Created",
		cell: ({ row }) => (
			<span className="text-muted-foreground">{row.getValue("created")}</span>
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
					<DropdownMenuItem render={<a href={row.original.page} />}>
						Open page
					</DropdownMenuItem>
					<DropdownMenuItem>View poll</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		),
		enableSorting: false,
		size: 88,
	},
];

export function PollsTable() {
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [globalFilter, setGlobalFilter] = useState("");
	const [sorting, setSorting] = useState<SortingState>([
		{
			id: "votes",
			desc: true,
		},
	]);

	const table = useReactTable({
		data: dummyPolls,
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
				row.original.question.toLowerCase().includes(value) ||
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
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex w-full flex-col gap-3 sm:max-w-xl sm:flex-row sm:items-center">
					<div className="relative w-full sm:max-w-sm">
						<Input
							placeholder="Search polls..."
							className="h-9 w-full pl-9"
							value={globalFilter}
							onChange={(event) => table.setGlobalFilter(event.target.value)}
						/>
						<SearchLinear className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					</div>
					<Select
						items={pollStatusFilterItems}
						defaultValue="all"
						modal={false}
						onValueChange={(value) => {
							if (typeof value === "string") {
								table
									.getColumn("status")
									?.setFilterValue(value === "all" ? undefined : value);
							}
						}}>
						<SelectTrigger className="w-full sm:w-40">
							<SelectValue placeholder="All statuses" />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>Status</SelectLabel>
								{pollStatusFilterItems.map((item) => (
									<SelectItem key={item.value} value={item.value}>
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
						{table.getRowModel().rows.map((row) => (
							<TableRow key={row.id}>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id} className="h-14">
										{flexRender(
											cell.column.columnDef.cell,
											cell.getContext(),
										)}
									</TableCell>
								))}
							</TableRow>
						))}
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
