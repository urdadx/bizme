import { CustomizeSettings } from "@/components/customization/customize-settings";
import { ComposerPreview } from "@/components/composer-preview";
import { CommentsPreview } from "@/components/comments-preview";
import { PollPreview } from "@/components/poll-preview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(admin)/customize")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<Tabs
			defaultValue="settings"
			className="flex h-full min-h-0 w-full overflow-hidden flex-col lg:flex-row lg:gap-0">
			<div className="hidden min-h-0 lg:flex lg:w-100 lg:shrink-0 lg:border-r lg:bg-background">
				<div className="flex min-h-0 h-full w-full flex-col">
					<div className="flex-1 overflow-y-auto smooth-div p-5">
						<h2 className="text-2xl font-semibold mb-4">Customize</h2>
						<CustomizeSettings />
					</div>
				</div>
			</div>

			<div className="flex min-h-0 flex-1 flex-col lg:hidden">
				<div className="sticky pt-2 top-0 z-10 border-b bg-background px-6">
					<TabsList className="h-auto w-full justify-start gap-6 rounded-none border-b-0 bg-transparent p-0 text-sm">
						<TabsTrigger
							value="settings"
							className="rounded-none border-b-2 border-transparent px-0 pb-4 pt-1 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
							Settings
						</TabsTrigger>
						<TabsTrigger
							value="preview"
							className="rounded-none border-b-2 border-transparent px-0 pb-4 pt-1 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
							Preview
						</TabsTrigger>
					</TabsList>
				</div>

				<TabsContent
					value="settings"
					className="mt-0 flex min-h-0 flex-1 flex-col overflow-y-auto bg-background">
					<div className="flex-1 p-5"></div>
				</TabsContent>

				<TabsContent
					value="preview"
					className="mt-0 min-h-0 flex-1 overflow-hidden">
					<aside
						className="relative flex h-full min-h-0 flex-1 items-center justify-center overflow-hidden bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[28px_28px] p-5"
						aria-label="Preview panel">
						<PreviewTabs />
					</aside>
				</TabsContent>
			</div>

			<div className="hidden min-h-0 flex-1 overflow-hidden lg:flex">
				<aside
					className="relative flex h-full min-h-0 flex-1 items-center justify-center overflow-hidden bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[28px_28px] p-8"
					aria-label="Preview panel">
					<PreviewTabs />
				</aside>
			</div>
		</Tabs>
	);
}

function PreviewTabs() {
	return (
		<Tabs
			defaultValue="composer"
			className="flex h-full w-full flex-col items-center justify-center gap-6">
			<TabsList className="h-auto gap-2 rounded-3xl">
				<TabsTrigger className="rounded-3xl" value="composer">
					Composer
				</TabsTrigger>
				<TabsTrigger className="rounded-3xl" value="comments">
					Comments
				</TabsTrigger>
				<TabsTrigger className="rounded-3xl" value="poll">
					Polls
				</TabsTrigger>
			</TabsList>

			<div className="flex w-full flex-1 items-center justify-center">
				<TabsContent value="composer" className="mt-0 flex w-full justify-center">
					<ComposerPreview />
				</TabsContent>
				<TabsContent value="comments" className="mt-0 flex w-full justify-center">
					<CommentsPreview />
				</TabsContent>
				<TabsContent value="poll" className="mt-0 flex w-full justify-center">
					<PollPreview />
				</TabsContent>
			</div>
		</Tabs>
	);
}
