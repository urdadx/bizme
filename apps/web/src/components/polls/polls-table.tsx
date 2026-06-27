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
import { Code2, Eye, LinkIcon, MoreHorizontal, PauseCircle, PlayCircle } from "lucide-react";

import { ChartLinear } from "@/assets/icons/chart-icon";
import { SearchLinear } from "@/assets/icons/search-icon";
import { TrashLines } from "@/assets/icons/trash-icon";
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
import { useTRPC } from "@/utils/trpc";
import { env } from "@better-comments/env/web";
import { CreatePollDialog } from "./create-poll-dialog";
import { PollDetailsSheet, type PollRow } from "./poll-details-sheet";

type PollStatusFilter = "all" | PollRow["status"];

const pollStatusFilterItems = [
	{ label: "All statuses", value: "all" },
	{ label: "Active", value: "active" },
	{ label: "Closed", value: "closed" },
	{ label: "Draft", value: "draft" },
] satisfies { label: string; value: PollStatusFilter }[];

function getStatusLabel(status: PollRow["status"]) {
	return status.charAt(0).toUpperCase() + status.slice(1);
}

function getPollShareLink(row: PollRow) {
	const url = new URL("/poll-widget", window.location.origin);
	url.searchParams.set("installKey", row.workspaceId);
	url.searchParams.set("apiUrl", env.VITE_SERVER_URL);
	url.searchParams.set("pollId", row.id);
	return url.toString();
}

function getPollEmbedScript(row: PollRow) {
	const sdkUrl = `${env.VITE_FRONTEND_ORIGIN}/poll-sdk.js`;

	return `<div id="bizme-poll-${row.id}"></div>
<script>
(function(w,d){if(w.self!==w.top) return;
if(w.location.pathname==="/poll-widget") return;
if(typeof w.BizmePoll!=="function"){
  var q=[];
  var stub=function(){q.push(arguments)};
  stub.q=q;
  w.BizmePoll=stub;
}
var s=d.createElement("script");
s.src="${sdkUrl}";
s.async=true;
d.head.appendChild(s);
})(window,document);
</script>
<script>
if(window.self===window.top&&window.location.pathname!=="/poll-widget"){
  window.BizmePoll("init",{
    installKey:"${row.workspaceId}",
    apiUrl:"${env.VITE_SERVER_URL}",
    pollId:"${row.id}",
    selector:"#bizme-poll-${row.id}"
  });
}
</script>`;
}

function getColumns({
	onViewDetails,
	onStatusChange,
	onDelete,
	onCopyShareLink,
	onCopyEmbedScript,
	isMutating,
}: {
	onViewDetails: (row: PollRow) => void;
	onStatusChange: (id: string, status: PollRow["status"]) => void;
	onDelete: (id: string) => void;
	onCopyShareLink: (row: PollRow) => void;
	onCopyEmbedScript: (row: PollRow) => void;
	isMutating: boolean;
}): ColumnDef<PollRow>[] {
	return [
		{
			accessorKey: "question",
			header: "Question",
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
			accessorKey: "votes",
			header: "Votes",
			cell: ({ row }) => <span>{row.getValue("votes")}</span>,
			minSize: 90,
		},
		{
			accessorKey: "status",
			header: "Status",
			filterFn: "equalsString",
			cell: ({ row }) => {
				const status = row.getValue("status") as PollRow["status"];

				return (
					<div className="flex items-center gap-2">
						<div
							className={cn(
								"h-2 w-2 rounded-full",
								status === "active" && "bg-green-500",
								status === "closed" && "bg-stone-500",
								status === "draft" && "bg-amber-500",
							)}></div>
						{getStatusLabel(status)}
					</div>
				);
			},
		},
		{
			accessorKey: "closesAtLabel",
			header: "Closes",
			cell: ({ row }) => (
				<span className="text-muted-foreground">
					{row.original.closesAtLabel ?? "Manual"}
				</span>
			),
			minSize: 120,
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
					<DropdownMenuContent align="end" className="w-44 min-w-44">
						<DropdownMenuItem onClick={() => onViewDetails(row.original)}>
							<Eye className="size-4" />
							View details
						</DropdownMenuItem>
						{row.original.status !== "active" ? (
							<DropdownMenuItem
								disabled={isMutating}
								onClick={() =>
									onStatusChange(row.original.id, "active")
								}>
								<PlayCircle className="size-4 text-[#888888]" />
								Publish
							</DropdownMenuItem>
						) : null}
						{row.original.status === "active" ? (
							<DropdownMenuItem
								disabled={isMutating}
								onClick={() =>
									onStatusChange(row.original.id, "closed")
								}>
								<PauseCircle className="size-4" />
								Unpublish
							</DropdownMenuItem>
						) : null}
						<DropdownMenuItem onClick={() => onCopyShareLink(row.original)}>
							<LinkIcon className="size-4" />
							Copy share link
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => onCopyEmbedScript(row.original)}>
							<Code2 className="size-4" />
							Copy embed script
						</DropdownMenuItem>
						<DropdownMenuItem
							disabled={isMutating}
							className="text-red-500"
							onClick={() => onDelete(row.original.id)}>
							<TrashLines color="red" />
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			),
			enableSorting: false,
			size: 88,
		},
	];
}

export function PollsTable() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const {
		data: pollsData,
		error: pollsError,
		isPending: arePollsPending,
	} = useQuery(trpc.polls.list.queryOptions());
	const updateStatus = useMutation(trpc.polls.updateStatus.mutationOptions());
	const deletePoll = useMutation(trpc.polls.delete.mutationOptions());
	const [error, setError] = useState<string | null>(null);
	const [selectedPoll, setSelectedPoll] = useState<PollRow | null>(null);
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

	async function invalidatePolls(id?: string) {
		await Promise.all([
			queryClient.invalidateQueries({
				queryKey: trpc.polls.list.queryOptions().queryKey,
			}),
			id
				? queryClient.invalidateQueries({
						queryKey: trpc.polls.detail.queryOptions({ id }).queryKey,
					})
				: Promise.resolve(),
		]);
	}

	async function handleStatusChange(id: string, status: PollRow["status"]) {
		try {
			setError(null);
			await updateStatus.mutateAsync({ id, status });
			await invalidatePolls(id);
		} catch (error) {
			setError(error instanceof Error ? error.message : "Unable to update poll.");
		}
	}

	async function handleDelete(id: string) {
		try {
			setError(null);
			await deletePoll.mutateAsync({ id });
			if (selectedPoll?.id === id) setSelectedPoll(null);
			await invalidatePolls();
		} catch (error) {
			setError(error instanceof Error ? error.message : "Unable to delete poll.");
		}
	}

	const data = pollsData ?? [];
	const columns = getColumns({
		onViewDetails: setSelectedPoll,
		onStatusChange: (id, status) => void handleStatusChange(id, status),
		onDelete: (id) => void handleDelete(id),
		onCopyShareLink: (row) => {
			void navigator.clipboard.writeText(getPollShareLink(row));
		},
		onCopyEmbedScript: (row) => {
			void navigator.clipboard.writeText(getPollEmbedScript(row));
		},
		isMutating: updateStatus.isPending || deletePoll.isPending,
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

			return row.original.question.toLowerCase().includes(value);
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
			<PollDetailsSheet
				poll={selectedPoll}
				open={selectedPoll !== null}
				onOpenChange={(open) => {
					if (!open) setSelectedPoll(null);
				}}
				onStatusChange={(id, status) => void handleStatusChange(id, status)}
				isMutating={updateStatus.isPending || deletePoll.isPending}
			/>
			{error ? <p className="text-sm text-destructive">{error}</p> : null}
			{pollsError ? (
				<p className="text-sm text-destructive">{pollsError.message}</p>
			) : null}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex w-full flex-col gap-3 sm:max-w-3xl sm:flex-row sm:items-center">
					<div className="relative w-full sm:max-w-sm">
						<Input
							placeholder="Search polls..."
							className="h-9 w-full pl-9"
							value={globalFilter}
							onChange={(event) =>
								table.setGlobalFilter(event.target.value)
							}
						/>
						<SearchLinear className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					</div>
					<Select
						items={pollStatusFilterItems}
						defaultValue="all"
						modal={false}
						onValueChange={(value) => {
							if (typeof value === "string") {
								table.getColumn("status")?.setFilterValue(
									value === "all" ? undefined : value,
								);
							}
						}}>
						<SelectTrigger className="w-full sm:w-40">
							<SelectValue placeholder="All statuses" />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>Status</SelectLabel>
								{pollStatusFilterItems.map((item) => (
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
				<CreatePollDialog />
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
						{arePollsPending ? (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-14 text-center">
									<Loader />
								</TableCell>
							</TableRow>
						) : table.getRowModel().rows.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center text-sm text-muted-foreground">
									{data.length === 0
										? "No polls yet."
										: "No polls match your filters."}
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
