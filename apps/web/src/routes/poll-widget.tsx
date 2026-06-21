import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

type PollWidgetSearch = {
	installKey?: string;
	apiUrl?: string;
	pageUrl?: string;
	pageTitle?: string;
	pollId?: string;
	hostOrigin?: string;
};

type PollOption = {
	id: string;
	label: string;
	imageUrl: string | null;
	votes: number;
};

type PollItem = {
	id: string;
	question: string;
	status: "draft" | "active" | "closed";
	closesAt: string | null;
	totalVotes: number;
	selectedOptionId: string | null;
	options: PollOption[];
};

type EmbedPollResponse = {
	poll: PollItem | null;
};

type EmbedConfigResponse = {
	workspace?: {
		name?: string | null;
	};
	customization?: {
		brandColor?: string;
		textColor?: string;
	};
};

const DEFAULT_BRAND_COLOR = "#6170F8";
const DEFAULT_TEXT_COLOR = "#1F2937";
const VISITOR_STORAGE_KEY = "bizme_poll_visitor_id";

export const Route = createFileRoute("/poll-widget")({
	validateSearch: (search: Record<string, unknown>): PollWidgetSearch => ({
		installKey: typeof search.installKey === "string" ? search.installKey : undefined,
		apiUrl: typeof search.apiUrl === "string" ? search.apiUrl : undefined,
		pageUrl: typeof search.pageUrl === "string" ? search.pageUrl : undefined,
		pageTitle: typeof search.pageTitle === "string" ? search.pageTitle : undefined,
		pollId: typeof search.pollId === "string" ? search.pollId : undefined,
		hostOrigin: typeof search.hostOrigin === "string" ? search.hostOrigin : undefined,
	}),
	component: PollWidgetRoute,
});

function normalizeApiUrl(apiUrl: string | undefined) {
	return apiUrl?.replace(/\/$/, "") ?? "";
}

function getCurrentPageUrl() {
	return typeof window === "undefined" ? "" : window.location.href;
}

function getVisitorId() {
	try {
		const existing = window.localStorage.getItem(VISITOR_STORAGE_KEY);

		if (existing) {
			return existing;
		}

		const created = crypto.randomUUID();
		window.localStorage.setItem(VISITOR_STORAGE_KEY, created);
		return created;
	} catch {
		return crypto.randomUUID();
	}
}

function postHeight() {
	window.parent.postMessage(
		{
			type: "bizme:resize",
			height: document.documentElement.scrollHeight,
		},
		"*",
	);
}

async function fetchJson<T>(apiUrl: string, path: string, init?: RequestInit) {
	const response = await fetch(`${apiUrl}${path}`, {
		credentials: "include",
		...init,
		headers: {
			"Content-Type": "application/json",
			...init?.headers,
		},
	});

	if (!response.ok) {
		const payload = await response.json().catch(() => null);
		throw new Error(payload?.error?.message ?? `Request failed with ${response.status}`);
	}

	return response.json() as Promise<T>;
}

function PollWidgetRoute() {
	const search = Route.useSearch();
	const apiUrl = normalizeApiUrl(search.apiUrl);
	const pageUrl = search.pageUrl ?? getCurrentPageUrl();
	const [poll, setPoll] = useState<PollItem | null>(null);
	const [brandColor, setBrandColor] = useState(DEFAULT_BRAND_COLOR);
	const [textColor, setTextColor] = useState(DEFAULT_TEXT_COLOR);
	const [workspaceName, setWorkspaceName] = useState("Bizme");
	const [visitorId] = useState(getVisitorId);
	const [statusMessage, setStatusMessage] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isVoting, setIsVoting] = useState(false);

	useEffect(() => {
		let cancelled = false;

		async function loadPoll() {
			if (!search.installKey || !apiUrl) {
				setStatusMessage("Missing poll widget install key or API URL.");
				setIsLoading(false);
				return;
			}

			setIsLoading(true);
			setStatusMessage(null);

			try {
				const params = new URLSearchParams({
					installKey: search.installKey,
					visitorId,
				});

				if (search.pollId) {
					params.set("pollId", search.pollId);
				} else {
					params.set("pageUrl", pageUrl);
				}

				const [configResponse, pollResponse] = await Promise.all([
					fetchJson<EmbedConfigResponse>(
						apiUrl,
						`/embed/config?installKey=${encodeURIComponent(search.installKey)}`,
					).catch(() => ({})),
					fetchJson<EmbedPollResponse>(apiUrl, `/embed/polls?${params.toString()}`),
				]);

				if (cancelled) return;

				setWorkspaceName(configResponse.workspace?.name ?? "Bizme");
				setBrandColor(configResponse.customization?.brandColor ?? DEFAULT_BRAND_COLOR);
				setTextColor(configResponse.customization?.textColor ?? DEFAULT_TEXT_COLOR);
				setPoll(pollResponse.poll);
			} catch (error) {
				if (cancelled) return;
				setStatusMessage(error instanceof Error ? error.message : "Unable to load poll.");
			} finally {
				if (!cancelled) {
					setIsLoading(false);
				}
			}
		}

		void loadPoll();

		return () => {
			cancelled = true;
		};
	}, [apiUrl, pageUrl, search.installKey, search.pollId, visitorId]);

	useEffect(() => {
		postHeight();
	}, [poll, statusMessage, isLoading]);

	async function vote(optionId: string) {
		if (!poll || !search.installKey || !apiUrl || isVoting) return;

		setIsVoting(true);
		setStatusMessage(null);

		try {
			const response = await fetchJson<EmbedPollResponse>(
				apiUrl,
				`/embed/polls/${poll.id}/vote`,
				{
					method: "POST",
					body: JSON.stringify({
						installKey: search.installKey,
						optionId,
						visitorId,
					}),
				},
			);

			setPoll(response.poll);
		} catch (error) {
			setStatusMessage(error instanceof Error ? error.message : "Unable to vote.");
		} finally {
			setIsVoting(false);
		}
	}

	const hasVoted = Boolean(poll?.selectedOptionId);
	const isClosed = poll?.status !== "active" || (poll.closesAt ? new Date(poll.closesAt) <= new Date() : false);

	return (
		<div className="min-h-screen bg-background p-4 font-sans text-sm" style={{ color: textColor }}>
			<div className="mx-auto max-w-xl rounded-2xl border bg-background p-5 shadow-sm">
				<div className="mb-4 flex items-center justify-between gap-3">
					<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
						{workspaceName} poll
					</p>
					{poll?.totalVotes ? (
						<p className="text-xs text-muted-foreground">
							{poll.totalVotes} {poll.totalVotes === 1 ? "vote" : "votes"}
						</p>
					) : null}
				</div>

				{isLoading ? (
					<p className="text-muted-foreground">Loading poll...</p>
				) : poll ? (
					<div className="space-y-4">
						<h1 className="text-xl font-semibold leading-tight">{poll.question}</h1>
						<div className="space-y-3">
							{poll.options.map((option) => {
								const percentage = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0;
								const selected = poll.selectedOptionId === option.id;

								return (
									<button
										key={option.id}
										type="button"
										disabled={isVoting || isClosed}
										onClick={() => vote(option.id)}
										className="group relative flex w-full overflow-hidden rounded-xl border bg-background text-left transition hover:border-foreground/30 disabled:cursor-default">
										{hasVoted ? (
											<div
												className="absolute inset-y-0 left-0 opacity-15 transition-all"
												style={{ width: `${percentage}%`, backgroundColor: brandColor }}
											/>
										) : null}
										{option.imageUrl ? (
											<img
												src={option.imageUrl}
												alt=""
												className="relative h-16 w-16 shrink-0 object-cover"
											/>
										) : null}
										<span className="relative flex min-w-0 flex-1 items-center justify-between gap-3 px-4 py-3">
											<span className="font-medium">{option.label}</span>
											{hasVoted || isClosed ? (
												<span className="shrink-0 text-xs text-muted-foreground">
													{selected ? "Selected" : `${percentage}%`}
												</span>
											) : null}
										</span>
									</button>
								);
							})}
						</div>
						{isClosed ? (
							<p className="text-xs text-muted-foreground">This poll is closed.</p>
						) : hasVoted ? (
							<p className="text-xs text-muted-foreground">Vote saved. You can change your vote.</p>
						) : null}
					</div>
				) : (
					<p className="text-muted-foreground">No active poll is available for this page.</p>
				)}

				{statusMessage ? <p className="mt-4 text-sm text-destructive">{statusMessage}</p> : null}
			</div>
		</div>
	);
}
