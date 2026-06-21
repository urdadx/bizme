import { ChartLinear } from "@/assets/icons/chart-icon";
import { GlobeLinear } from "@/assets/icons/globe-icon";
import { LocationLinear } from "@/assets/icons/location-icon";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Clock3, CopyIcon, Monitor, Trash2, UsersRound } from "lucide-react";
import { type ComponentType, useState } from "react";

export const Route = createFileRoute("/(admin)/polls/$pollId")({
	component: RouteComponent,
});

type PollStatus = "draft" | "active" | "closed";

function getStatusLabel(status: PollStatus) {
	return status.charAt(0).toUpperCase() + status.slice(1);
}

function getStatusClassName(status: PollStatus) {
	if (status === "active") return "border-green-200 bg-green-50 text-green-700";
	if (status === "closed") return "border-stone-200 bg-stone-100 text-stone-700";
	return "border-amber-200 bg-amber-50 text-amber-700";
}

function getPollShareLink(row: { workspaceId: string; id: string }) {
	const url = new URL("/poll-widget", window.location.origin);
	url.searchParams.set("installKey", row.workspaceId);
	url.searchParams.set("apiUrl", env.VITE_SERVER_URL);
	url.searchParams.set("pollId", row.id);
	return url.toString();
}

function getPollEmbedScript(row: { workspaceId: string; id: string }) {
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

function RouteComponent() {
	const { pollId } = Route.useParams();
	const trpc = useTRPC();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const pollQuery = useQuery(trpc.polls.detail.queryOptions({ id: pollId }));
	const updateStatus = useMutation(trpc.polls.updateStatus.mutationOptions());
	const deletePoll = useMutation(trpc.polls.delete.mutationOptions());
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	async function invalidatePoll() {
		await Promise.all([
			queryClient.invalidateQueries({
				queryKey: trpc.polls.detail.queryOptions({ id: pollId }).queryKey,
			}),
			queryClient.invalidateQueries({
				queryKey: trpc.polls.list.queryOptions().queryKey,
			}),
		]);
	}

	async function handleStatusChange(status: PollStatus) {
		await updateStatus.mutateAsync({ id: pollId, status });
		await invalidatePoll();
	}

	async function handleDelete() {
		await deletePoll.mutateAsync({ id: pollId });
		await queryClient.invalidateQueries({
			queryKey: trpc.polls.list.queryOptions().queryKey,
		});
		await navigate({ to: "/polls" });
	}

	if (pollQuery.isLoading) {
		return (
			<div className="flex h-full items-center justify-center p-5 text-sm text-muted-foreground">
				<Loader />
			</div>
		);
	}

	if (pollQuery.error || !pollQuery.data) {
		return (
			<div className="p-5 text-sm text-destructive">
				{pollQuery.error?.message ?? "Poll not found."}
			</div>
		);
	}

	const { poll, options, votes, breakdowns } = pollQuery.data;
	const winningOption = [...options].sort((a, b) => b.votes - a.votes)[0];
	const metaCards = [
		{ label: "Total votes", value: poll.totalVotes, icon: ChartLinear },
		{ label: "Unique voters", value: poll.uniqueVisitors, icon: UsersRound },
		{ label: "Time left", value: poll.timeLeftLabel, icon: Clock3 },
		{ label: "Top choice", value: winningOption?.label ?? "None", icon: ChartLinear },
	];

	return (
		<>
			<DeleteConfirmationDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				onConfirm={() => void handleDelete()}
				isDeleting={deletePoll.isPending}
			/>
			<div className="flex h-full min-h-0 w-full flex-col overflow-hidden lg:flex-row">
				<div className="min-h-0 flex-1 overflow-hidden">
					<aside className="no-scrollbar relative flex h-full min-h-0 flex-col overflow-y-auto bg-white">
						<div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white/95 p-5 backdrop-blur">
							<Button variant="outline" size="sm" onClick={() => void navigate({ to: "/polls" })}>
								<ArrowLeft />
								Back
							</Button>
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => void navigator.clipboard.writeText(getPollShareLink(poll))}>
									<CopyIcon />
									Share link
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => void navigator.clipboard.writeText(getPollEmbedScript(poll))}>
									<CopyIcon />
									Embed
								</Button>
							</div>
						</div>

						<div className="min-h-0 flex-1 space-y-6 p-5">
							<div className="rounded-2xl border bg-gradient-to-br from-white to-slate-50 p-5 shadow-xs">
								<div className="mb-4 flex flex-wrap items-start justify-between gap-4">
									<div className="max-w-3xl">
										<div className="mb-3 flex flex-wrap items-center gap-2">
											<span
												className={cn(
													"inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
													getStatusClassName(poll.effectiveStatus),
												)}>
												{getStatusLabel(poll.effectiveStatus)}
											</span>
											<span className="text-xs text-muted-foreground">
												Created {poll.createdAtLabel}
											</span>
										</div>
										<h1 className="text-2xl font-semibold leading-tight text-foreground">
											{poll.question}
										</h1>
									</div>
									<div className="flex gap-2">
										{poll.status !== "active" ? (
											<Button
												size="sm"
												disabled={updateStatus.isPending}
												onClick={() => void handleStatusChange("active")}>
												Publish
											</Button>
										) : (
											<Button
												variant="outline"
												size="sm"
												disabled={updateStatus.isPending}
												onClick={() => void handleStatusChange("closed")}>
												Close
											</Button>
										)}
									</div>
								</div>

								<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
									{metaCards.map((item) => {
										const Icon = item.icon;

										return (
											<div key={item.label} className="rounded-xl border bg-white p-4">
												<div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
													<Icon className="size-4" />
												</div>
												<p className="text-xs text-muted-foreground">{item.label}</p>
												<p className="mt-1 truncate text-lg font-semibold">{item.value}</p>
											</div>
										);
									})}
								</div>
							</div>

							<div className="rounded-2xl border bg-white p-5 shadow-xs">
								<div className="mb-5 flex items-center justify-between">
									<div>
										<h2 className="text-lg font-semibold">Results</h2>
										<p className="text-sm text-muted-foreground">Vote distribution by option</p>
									</div>
									<p className="text-sm font-medium text-muted-foreground">{poll.totalVotes} total</p>
								</div>
								<div className="space-y-4">
									{options.map((option) => (
										<div key={option.id} className="rounded-xl border p-4">
											<div className="mb-3 flex items-center gap-3">
												{option.imageUrl ? (
													<img
														src={option.imageUrl}
														alt=""
														className="size-12 rounded-lg object-cover"
													/>
												) : (
													<div className="flex size-12 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
														<ChartLinear className="size-5" />
													</div>
												)}
												<div className="min-w-0 flex-1">
													<div className="flex items-center justify-between gap-3">
														<p className="truncate font-medium">{option.label}</p>
														<p className="shrink-0 text-sm font-semibold">{option.percentage}%</p>
													</div>
													<div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
														<div className="h-full rounded-full bg-[#6170F8]" style={{ width: `${option.percentage}%` }} />
													</div>
													<p className="mt-2 text-xs text-muted-foreground">
														{option.votes} {option.votes === 1 ? "vote" : "votes"}
													</p>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>

							<div className="rounded-2xl border bg-white p-5 shadow-xs">
								<div className="mb-5">
									<h2 className="text-lg font-semibold">Voters</h2>
									<p className="text-sm text-muted-foreground">Visitor metadata captured when people vote</p>
								</div>
								<div className="overflow-hidden rounded-xl border">
									<Table>
										<TableHeader className="bg-gray-50">
											<TableRow>
												<TableHead>Choice</TableHead>
												<TableHead>Location</TableHead>
												<TableHead>Device</TableHead>
												<TableHead>Browser</TableHead>
												<TableHead>Voted</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{votes.length === 0 ? (
												<TableRow>
													<TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
														No votes yet.
													</TableCell>
												</TableRow>
											) : (
												votes.map((vote) => (
													<TableRow key={vote.id}>
														<TableCell className="font-medium">{vote.optionLabel}</TableCell>
														<TableCell className="text-muted-foreground">
															{[vote.locationCity, vote.locationCountry].filter(Boolean).join(", ") || "Unknown"}
														</TableCell>
														<TableCell className="text-muted-foreground">{vote.deviceType ?? "Unknown"}</TableCell>
														<TableCell className="text-muted-foreground">{vote.browser ?? "Unknown"}</TableCell>
														<TableCell className="text-muted-foreground">{vote.date}</TableCell>
													</TableRow>
												))
											)}
										</TableBody>
									</Table>
								</div>
							</div>
						</div>
					</aside>
				</div>

				<div className="min-h-0 lg:flex lg:w-90 lg:shrink-0 lg:border-l lg:bg-background">
					<div className="flex h-full min-h-0 w-full flex-col overflow-y-auto p-5">
						<div className="mb-5 flex items-center justify-between">
							<div>
								<h2 className="text-lg font-semibold">Poll meta</h2>
								<p className="text-sm text-muted-foreground">Status and audience context</p>
							</div>
							<Button variant="outline" size="sm" onClick={() => setDeleteDialogOpen(true)} disabled={deletePoll.isPending}>
								<Trash2 className="text-red-500" />
								<span className="text-red-500">Delete</span>
							</Button>
						</div>

						<div className="space-y-3 rounded-2xl border bg-white p-4">
							<MetaRow label="Status" value={getStatusLabel(poll.effectiveStatus)} icon={Clock3} />
							<MetaRow label="Closes" value={poll.closesAtLabel ?? "Manual"} icon={Clock3} />
							<MetaRow label="Last activity" value={poll.lastActivity} icon={Clock3} />
							<MetaRow label="Poll id" value={poll.id} icon={CopyIcon} />
						</div>

						<BreakdownCard title="Countries" icon={LocationLinear} items={breakdowns.countries} />
						<BreakdownCard title="Devices" icon={Monitor} items={breakdowns.devices} />
						<BreakdownCard title="Browsers" icon={GlobeLinear} items={breakdowns.browsers} />
					</div>
				</div>
			</div>
		</>
	);
}

function MetaRow({
	label,
	value,
	icon: Icon,
}: {
	label: string;
	value: string;
	icon: ComponentType<{ className?: string }>;
}) {
	return (
		<div className="flex items-center justify-between gap-4">
			<div className="flex min-w-0 items-center gap-3">
				<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
					<Icon className="size-4" />
				</div>
				<p className="text-sm text-muted-foreground">{label}</p>
			</div>
			<p className="truncate text-right text-sm font-medium">{value}</p>
		</div>
	);
}

function BreakdownCard({
	title,
	items,
	icon: Icon,
}: {
	title: string;
	items: { label: string; value: number }[];
	icon: ComponentType<{ className?: string }>;
}) {
	const total = items.reduce((sum, item) => sum + item.value, 0);

	return (
		<div className="mt-4 rounded-2xl border bg-white p-4">
			<div className="mb-4 flex items-center gap-2">
				<div className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
					<Icon className="size-4" />
				</div>
				<h3 className="text-sm font-semibold">{title}</h3>
			</div>
			{items.length === 0 ? (
				<p className="text-sm text-muted-foreground">No data yet.</p>
			) : (
				<div className="space-y-3">
					{items.slice(0, 5).map((item) => {
						const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;

						return (
							<div key={item.label}>
								<div className="mb-1 flex items-center justify-between gap-3 text-sm">
									<span className="truncate text-muted-foreground">{item.label}</span>
									<span className="font-medium">{item.value}</span>
								</div>
								<div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
									<div className="h-full rounded-full bg-slate-700" style={{ width: `${percentage}%` }} />
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
