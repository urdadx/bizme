import { AwardIcon } from "@/assets/icons/award-icon";
import { ChartLinear } from "@/assets/icons/chart-icon";
import { ClockIcon } from "@/assets/icons/clock-icon";
import { UsersIcon } from "@/assets/icons/users-icon";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTRPC } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";

export type PollRow = {
	id: string;
	workspaceId: string;
	question: string;
	votes: number;
	options: number;
	status: "active" | "closed" | "draft";
	closesAtLabel: string | null;
	lastActivity: string;
};

export function PollDetailsSheet({
	poll,
	open,
	onOpenChange,
	onStatusChange,
	isMutating,
}: {
	poll: PollRow | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onStatusChange: (id: string, status: PollRow["status"]) => void;
	isMutating: boolean;
}) {
	const trpc = useTRPC();
	const {
		data: pollData,
		error: pollError,
		isLoading: isPollLoading,
	} = useQuery({
		...trpc.polls.detail.queryOptions({ id: poll?.id ?? "" }),
		enabled: !!poll?.id && open,
	});

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent
				showCloseButton={false}
				className="w-full gap-0 overflow-y-auto p-0 sm:max-w-3xl!">
				{poll && (
					<>
						<SheetHeader className="p-5 pr-5">
							<div className="flex items-start justify-between gap-4">
								<div className="flex-1">
									<SheetTitle className="text-2xl font-semibold leading-tight tracking-tight">
										{poll.question}
									</SheetTitle>
								</div>
								<div className="flex items-center gap-2">
									{poll.status !== "active" ? (
										<Button
											size="sm"
											disabled={isMutating}
											onClick={() =>
												onStatusChange(
													poll.id,
													"active",
												)
											}>
											Publish
										</Button>
									) : (
										<Button
											variant="outline"
											size="sm"
											disabled={isMutating}
											onClick={() =>
												onStatusChange(
													poll.id,
													"closed",
												)
											}>
											Unpublish
										</Button>
									)}
								</div>
							</div>
							<SheetDescription className="flex items-center gap-2">
								Current status:
								<span className="flex items-center gap-1.5 font-medium capitalize text-zinc-900">
									<div
										className={`h-2 w-2 rounded-full ${
											poll.status === "active"
												? "bg-green-500"
												: poll.status === "draft"
													? "bg-amber-500"
													: "bg-red-500"
										}`}
									/>
									{poll.status}
								</span>
							</SheetDescription>
						</SheetHeader>

						{isPollLoading ? (
							<div className="flex h-48 items-center justify-center">
								<Loader />
							</div>
						) : pollError || !pollData ? (
							<div className="p-5 text-sm text-destructive">
								{pollError?.message ?? "Poll not found."}
							</div>
						) : (
							<PollDetailsSheetContent
								pollRow={poll}
								poll={pollData.poll}
								options={pollData.options}
							/>
						)}
					</>
				)}
			</SheetContent>
		</Sheet>
	);
}

function PollDetailsSheetContent({
	poll,
	options,
}: {
	pollRow: PollRow;
	poll: {
		question: string;
		status: PollRow["status"];
		effectiveStatus: PollRow["status"];
		createdAtLabel: string;
		totalVotes: number;
		uniqueVisitors: number;
		timeLeftLabel: string;
	};
	options: {
		id: string;
		label: string;
		imageUrl: string | null;
		votes: number;
		percentage: number;
	}[];
}) {
	const winningOption = options.reduce<(typeof options)[number] | undefined>(
		(current, option) => (!current || option.votes > current.votes ? option : current),
		undefined,
	);
	const metaCards = [
		{ label: "Total votes", value: poll.totalVotes, icon: ChartLinear },
		{ label: "Unique voters", value: poll.uniqueVisitors, icon: UsersIcon },
		{ label: "Time left", value: poll.timeLeftLabel, icon: ClockIcon },
		{ label: "Top choice", value: winningOption?.label ?? "None", icon: AwardIcon },
	];

	return (
		<div className="space-y-5 p-5 pt-0">
			<div className="">
				<div className="grid gap-3 sm:grid-cols-2">
					{metaCards.map((item) => {
						const Icon = item.icon;

						return (
							<div
								key={item.label}
								className="rounded-xl border bg-white p-4">
								<div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
									<Icon className="size-4" />
								</div>
								<p className="text-xs text-muted-foreground">
									{item.label}
								</p>
								<p className="mt-1 truncate text-lg font-semibold">
									{item.value}
								</p>
							</div>
						);
					})}
				</div>
			</div>

			<PollResultsPreview
				question={poll.question}
				totalVotes={poll.totalVotes}
				options={options}
			/>
		</div>
	);
}

function PollResultsPreview({
	totalVotes,
	options,
}: {
	question: string;
	totalVotes: number;
	options: {
		id: string;
		label: string;
		imageUrl: string | null;
		votes: number;
		percentage: number;
	}[];
}) {
	return (
		<div className="h-fit w-full rounded-xl border bg-white pb-4 text-sm text-zinc-900">
			<Tabs defaultValue="poll" className="flex h-full flex-col">
				<div className="flex shrink-0 items-center justify-between px-4 pt-3">
					<TabsList className="h-auto max-w-[calc(100%-5rem)] gap-2 rounded-none border-border bg-transparent px-0 pb-0 text-foreground">
						<TabsTrigger
							value="poll"
							className="min-w-0 max-w-full text-muted-foreground hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none">
							<span className="font-semibold">Poll Choices</span>
						</TabsTrigger>
					</TabsList>
					<p className="shrink-0 text-sm tabular-nums text-muted-foreground">
						{totalVotes} {totalVotes === 1 ? "vote" : "votes"}
					</p>
				</div>

				<div className="min-h-0 flex-1 overflow-hidden">
					<TabsContent value="poll" className="m-0 h-full p-0">
						<div className="flex h-full flex-col">
							<div className="min-h-0 flex-1 px-4 pt-2">
								<div className="grid gap-2">
									{options.map((option) => (
										<div
											key={option.id}
											className="rounded transition-all hover:bg-blue-50">
											<div className="group flex items-center justify-between px-1 py-1">
												<div className="relative z-10 flex h-9 w-full min-w-0 max-w-[calc(100%-5rem)] items-center">
													<div className="z-10 flex w-full min-w-0 items-center gap-2 px-2 text-black">
														{option.imageUrl ? (
															<img
																src={
																	option.imageUrl
																}
																alt=""
																className="size-6 rounded object-cover"
															/>
														) : (
															<ChartLinear className="size-5 shrink-0" />
														)}
														<span className="truncate text-[14px] text-black">
															{
																option.label
															}
														</span>
													</div>
													<div
														className="absolute h-full origin-left rounded-md bg-[#bfdbfe] opacity-25"
														style={{
															width: `${option.percentage}%`,
														}}
													/>
												</div>
												<div className="z-10 ml-2 shrink-0 text-sm tabular-nums text-black-500">
													{option.votes}
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</TabsContent>
				</div>
			</Tabs>
		</div>
	);
}
