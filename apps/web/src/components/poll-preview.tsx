import { Button } from "@/components/ui/button";

const options = [
	{ label: "React", votes: 64, percent: 53 },
	{ label: "Vue", votes: 34, percent: 28 },
	{ label: "Svelte", votes: 22, percent: 19 },
];

export function PollPreview() {
	return (
		<div className="w-full max-w-xl rounded-xl border bg-white p-4 text-sm text-zinc-900 shadow-sm">
			<div className="flex items-start justify-between gap-4">
				<div>
					<p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Poll</p>
					<h3 className="mt-1 text-base font-semibold">What&apos;s your fav stack?</h3>
				</div>
				<span className="rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs text-green-700">
					Active
				</span>
			</div>

			<div className="mt-4 space-y-3">
				{options.map((option) => (
					<div key={option.label} className="space-y-1.5">
						<div className="flex items-center justify-between text-sm">
							<span className="font-medium">{option.label}</span>
							<span className="text-zinc-500">{option.votes} votes</span>
						</div>
						<div className="h-2 overflow-hidden rounded-full bg-zinc-100">
							<div
								className="h-full rounded-full bg-primary"
								style={{ width: `${option.percent}%` }}
							/>
						</div>
					</div>
				))}
			</div>

			<div className="mt-4 flex items-center justify-between">
				<span className="text-xs text-zinc-500">120 total votes</span>
				<Button size="sm">Vote</Button>
			</div>
		</div>
	);
}
