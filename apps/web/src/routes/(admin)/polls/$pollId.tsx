import { ChartLinear } from "@/assets/icons/chart-icon";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/utils/trpc";
import { env } from "@better-comments/env/web";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Clock3, CopyIcon, Trash2, UsersRound } from "lucide-react";
import { useState } from "react";

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
  const {
    data: pollData,
    error: pollError,
    isLoading: isPollLoading,
  } = useQuery(trpc.polls.detail.queryOptions({ id: pollId }));
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

  if (isPollLoading) {
    return (
      <div className="flex h-full items-center justify-center p-5 text-sm text-muted-foreground">
        <Loader />
      </div>
    );
  }

  if (pollError || !pollData) {
    return (
      <div className="p-5 text-sm text-destructive">
        {pollError?.message ?? "Poll not found."}
      </div>
    );
  }

  const { poll, options } = pollData;
  const winningOption = options.reduce<(typeof options)[number] | undefined>(
    (current, option) => (!current || option.votes > current.votes ? option : current),
    undefined,
  );
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
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
        <div className="min-h-0 flex-1 overflow-hidden">
          <main className="no-scrollbar relative flex h-full min-h-0 flex-col overflow-y-auto bg-white">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white/95 p-5 backdrop-blur">
              <Button variant="outline" size="sm" onClick={() => void navigate({ to: "/polls" })}>
                <ArrowLeft />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void navigator.clipboard.writeText(getPollShareLink(poll))}
                >
                  <CopyIcon />
                  Share link
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void navigator.clipboard.writeText(getPollEmbedScript(poll))}
                >
                  <CopyIcon />
                  Embed
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={deletePoll.isPending}
                >
                  <Trash2 className="text-red-500" />
                  <span className="text-red-500">Delete</span>
                </Button>
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-6 p-5">
              <div className="rounded-2xl border bg-gradient-to-br from-white to-slate-50 p-5">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-3xl">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
                          getStatusClassName(poll.effectiveStatus),
                        )}
                      >
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
                        onClick={() => void handleStatusChange("active")}
                      >
                        Publish
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={updateStatus.isPending}
                        onClick={() => void handleStatusChange("closed")}
                      >
                        Unpublish
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

              <PollResultsPreview
                question={poll.question}
                totalVotes={poll.totalVotes}
                options={options}
              />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

function PollResultsPreview({
  question,
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
              className="min-w-0 max-w-full text-muted-foreground hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <span className="truncate">{question}</span>
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
                    <div key={option.id} className="rounded transition-all hover:bg-blue-50">
                      <div className="group flex items-center justify-between px-1 py-1">
                        <div className="relative z-10 flex h-9 w-full min-w-0 max-w-[calc(100%-5rem)] items-center">
                          <div className="z-10 flex w-full min-w-0 items-center gap-2 px-2 text-black">
                            {option.imageUrl ? (
                              <img
                                src={option.imageUrl}
                                alt=""
                                className="size-6 rounded object-cover"
                              />
                            ) : (
                              <ChartLinear className="size-5 shrink-0" />
                            )}
                            <span className="truncate text-[14px] text-black">{option.label}</span>
                          </div>
                          <div
                            className="absolute h-full origin-left rounded-md bg-[#bfdbfe] opacity-25"
                            style={{ width: `${option.percentage}%` }}
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
