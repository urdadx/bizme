import { ChatBold } from "@/assets/icons/chat-icon";
import { HeartBold } from "@/assets/icons/heart-icon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommentComposer } from "./comment-composer";
import { CommentsList } from "./comments-list";
import { ReactionsList } from "./reactions-list";

export function CommentActivityTabs() {
	return (
		<Tabs defaultValue="comments" className="w-full">
			<TabsList className="h-auto w-full justify-start gap-6 rounded-none border-b bg-transparent p-0 text-sm">
				<TabsTrigger
					value="comments"
					className="rounded-none flex items-center  border-b-2 border-transparent px-0 pt-1 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
					<ChatBold />
					<span className="ml-1">Comments</span>
				</TabsTrigger>
				<TabsTrigger
					value="reactions"
					className="rounded-none flex items-center border-b-2 border-transparent px-0 pt-1 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
					<HeartBold />
					<span className="ml-1">Reactions</span>
				</TabsTrigger>
			</TabsList>

			<TabsContent value="comments" className="mt-4">
				<div className="flex flex-col gap-6">
					<CommentComposer />
					<CommentsList />
				</div>
			</TabsContent>

			<TabsContent value="reactions" className="mt-4">
				<ReactionsList />
			</TabsContent>
		</Tabs>
	);
}
