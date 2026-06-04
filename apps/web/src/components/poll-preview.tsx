import { ReactIcon } from "@/assets/icons/react-icon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const options = [
	{ label: "React", votes: 64, percent: 53, icon: ReactIcon },
	{ label: "Vue", votes: 34, percent: 28, icon: ReactIcon },
	{ label: "Svelte", votes: 22, percent: 19, icon: ReactIcon },
];

export function PollPreview() {
	return (
		<div className="h-fit pb-4 w-full max-w-lg z-0 rounded-xl border bg-white flex flex-col overflow-hidden text-sm text-zinc-900">
			<Tabs defaultValue="poll" className="flex h-full flex-col">
				<div className="flex shrink-0 items-center justify-between px-4 pt-3">
					<TabsList className="h-auto gap-2 rounded-none border-border bg-transparent px-0 pb-0 text-foreground">
						<TabsTrigger
							value="poll"
							className="text-muted-foreground hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none">
							What&apos;s your fav stack?
						</TabsTrigger>
					</TabsList>
				</div>

				<div className="min-h-0 flex-1 overflow-hidden">
					<TabsContent value="poll" className="m-0 h-full p-0">
						<div className="flex h-full flex-col">
							<div className="min-h-0 flex-1 px-4 pt-2">
								<h3 className="mb-3 px-1 text-base font-semibold"></h3>
								<div className="grid gap-2">
									{options.map((option) => (
										<div
											key={option.label}
											className="rounded transition-all hover:bg-blue-50">
											<div className="group flex items-center justify-between px-1 py-1">
												<div className="relative z-10 flex h-9 w-full min-w-0 max-w-[calc(100%-5rem)] items-center">
													<div className="z-10 flex w-full min-w-0 items-center gap-2 px-2 text-black">
														<option.icon />
														<span className="truncate text-[14px] text-black">
															{
																option.label
															}
														</span>
													</div>
													<div
														className="absolute h-full origin-left rounded-md bg-blue-200/40"
														style={{
															width: `${option.percent}%`,
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
