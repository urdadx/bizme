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

import { GlobeLinear } from "@/assets/icons/globe-icon";
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

type PageRow = {
	id: string;
	name: string;
	url: string;
	totalComments: number;
	totalVotes: number;
	lastActivity: string;
};

const dummyPages: PageRow[] = [
	{
		id: "page_1",
		name: "Pricing",
		url: "/pricing",
		totalComments: 248,
		totalVotes: 913,
		lastActivity: "2 minutes ago",
	},
	{
		id: "page_2",
		name: "Docs: Installation",
		url: "/docs/installation",
		totalComments: 126,
		totalVotes: 401,
		lastActivity: "18 minutes ago",
	},
	{
		id: "page_3",
		name: "Launch Week Blog Post",
		url: "/blog/launch-week",
		totalComments: 89,
		totalVotes: 267,
		lastActivity: "1 hour ago",
	},
	{
		id: "page_4",
		name: "Feature Overview",
		url: "/features/comments",
		totalComments: 174,
		totalVotes: 622,
		lastActivity: "3 hours ago",
	},
	{
		id: "page_5",
		name: "Changelog",
		url: "/changelog",
		totalComments: 42,
		totalVotes: 138,
		lastActivity: "Yesterday",
	},
	{
		id: "page_6",
		name: "API Reference",
		url: "/docs/api",
		totalComments: 61,
		totalVotes: 205,
		lastActivity: "2 days ago",
	},
];

type LastActivityFilter = "all" | "today" | "last-24h" | "last-7d" | "older";
type CommentVolumeFilter = "all" | "high" | "medium" | "low";

const lastActivityFilterLabels: Record<LastActivityFilter, string> = {
	all: "All activity",
	today: "Today",
	"last-24h": "Last 24 hours",
	"last-7d": "Last 7 days",
	older: "Older",
};

const lastActivityFilterItems = [
	{ label: "All activity", value: "all" },
	{ label: "Today", value: "today" },
	{ label: "Last 24 hours", value: "last-24h" },
	{ label: "Last 7 days", value: "last-7d" },
	{ label: "Older", value: "older" },
] satisfies { label: string; value: LastActivityFilter }[];

const commentVolumeFilterItems = [
	{ label: "All comments", value: "all" },
	{ label: "100+ comments", value: "high" },
	{ label: "50-99 comments", value: "medium" },
	{ label: "Under 50 comments", value: "low" },
] satisfies { label: string; value: CommentVolumeFilter }[];

function matchesLastActivityFilter(value: string, filter: LastActivityFilter) {
	if (filter === "all") {
		return true;
	}

	const normalized = value.toLowerCase();
	const isToday = normalized.includes("minute") || normalized.includes("hour");
	const isLast24Hours = isToday || normalized === "yesterday";
	const isLast7Days = isLast24Hours || normalized.includes("day");

	if (filter === "today") {
		return isToday;
	}

	if (filter === "last-24h") {
		return isLast24Hours;
	}

	if (filter === "last-7d") {
		return isLast7Days;
	}

	return !isLast7Days;
}

function matchesCommentVolumeFilter(value: number, filter: CommentVolumeFilter) {
	if (filter === "all") {
		return true;
	}

	if (filter === "high") {
		return value >= 100;
	}

	if (filter === "medium") {
		return value >= 50 && value < 100;
	}

	return value < 50;
}

const columns: ColumnDef<PageRow>[] = [
	{
		accessorKey: "name",
		header: "Page name",
		cell: ({ row }) => (
			<div className="flex items-center gap-2">
				<CuteIconWrapper icon={GlobeLinear} color="#22c55e" />
				<span className="block max-w-44 truncate font-medium md:max-w-56">
					{row.getValue("name")}
				</span>
			</div>
		),
		minSize: 220,
	},
	{
		accessorKey: "url",
		header: "URL",
		cell: ({ row }) => (
			<span className="block max-w-40 truncate text-muted-foreground md:max-w-56">
				{row.getValue("url")}
			</span>
		),
		minSize: 180,
	},
	{
		accessorKey: "totalComments",
		header: "Total comments",
		cell: ({ row }) => <span>{row.getValue("totalComments")}</span>,
		filterFn: (row, columnId, filterValue) =>
			matchesCommentVolumeFilter(
				row.getValue(columnId) as number,
				filterValue as CommentVolumeFilter,
			),
	},
	{
		accessorKey: "totalVotes",
		header: "Total votes",
		cell: ({ row }) => <span>{row.getValue("totalVotes")}</span>,
	},
	{
		accessorKey: "lastActivity",
		header: "Last activity",
		cell: ({ row }) => (
			<span className="text-muted-foreground">{row.getValue("lastActivity")}</span>
		),
		filterFn: (row, columnId, filterValue) =>
			matchesLastActivityFilter(
				row.getValue(columnId) as string,
				filterValue as LastActivityFilter,
			),
		minSize: 160,
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
					<DropdownMenuItem render={<a href={row.original.url} />}>
						Open page
					</DropdownMenuItem>
					<DropdownMenuItem
						render={
							<a
								href={`/comments?page=${encodeURIComponent(row.original.url)}`}
							/>
						}>
						View comments
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		),
		enableSorting: false,
		size: 88,
	},
];

export function PagesTable() {
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 6,
	});
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [globalFilter, setGlobalFilter] = useState("");
	const [sorting, setSorting] = useState<SortingState>([
		{
			id: "totalComments",
			desc: true,
		},
	]);

	const table = useReactTable({
		data: dummyPages,
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
				row.original.name.toLowerCase().includes(value) ||
				row.original.url.toLowerCase().includes(value)
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
				<div className="flex w-full flex-col gap-3 sm:max-w-3xl sm:flex-row sm:items-center">
					<div className="relative w-full sm:max-w-sm">
						<Input
							placeholder="Search pages..."
							className="h-9 w-full pl-9"
							value={globalFilter}
							onChange={(event) => table.setGlobalFilter(event.target.value)}
						/>
						<SearchLinear className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					</div>
					<Select
						items={lastActivityFilterItems}
						defaultValue="all"
						modal={false}
						onValueChange={(value) => {
							if (typeof value === "string") {
								table
									.getColumn("lastActivity")
									?.setFilterValue(value === "all" ? undefined : value);
							}
						}}>
						<SelectTrigger className="w-full sm:w-44">
							<SelectValue placeholder={lastActivityFilterLabels.all} />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>Last activity</SelectLabel>
								{lastActivityFilterItems.map((item) => (
									<SelectItem key={item.value} value={item.value}>
										{item.label}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
					<Select
						items={commentVolumeFilterItems}
						defaultValue="all"
						modal={false}
						onValueChange={(value) => {
							if (typeof value === "string") {
								table
									.getColumn("totalComments")
									?.setFilterValue(value === "all" ? undefined : value);
							}
						}}>
						<SelectTrigger className="w-full sm:w-44">
							<SelectValue placeholder="All comments" />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>Comments</SelectLabel>
								{commentVolumeFilterItems.map((item) => (
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
						{table.getRowModel().rows.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-40 text-center text-muted-foreground">
									No pages match your search.
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
