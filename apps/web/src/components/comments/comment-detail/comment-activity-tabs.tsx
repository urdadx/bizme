import { ChatBold } from "@/assets/icons/chat-icon";
import { HeartBold } from "@/assets/icons/heart-icon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommentComposer } from "./comment-composer";
import { CommentsList } from "./comments-list";
import type { CommentReply } from "./comment-list-item";
import { ReactionsList, type CommentReaction } from "./reactions-list";

export function CommentActivityTabs({
  comments,
  reactions,
  rootCommentId,
  onSubmitReply,
  isSubmittingReply,
}: {
  comments: CommentReply[];
  reactions: CommentReaction[];
  rootCommentId: string;
  onSubmitReply: (body: string, images: File[]) => Promise<void> | void;
  isSubmittingReply?: boolean;
}) {
  return (
    <Tabs defaultValue="comments" className="w-full">
      <TabsList className="h-auto w-full justify-start gap-6 rounded-none border-b bg-transparent p-0 text-sm">
        <TabsTrigger
          value="comments"
          className="rounded-none flex items-center  border-b-2 border-transparent px-0 pt-1 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
        >
          <ChatBold />
          <span className="ml-1">Comments</span>
        </TabsTrigger>
        <TabsTrigger
          value="reactions"
          className="rounded-none flex items-center border-b-2 border-transparent px-0 pt-1 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
        >
          <HeartBold />
          <span className="ml-1">Reactions</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="comments" className="mt-4">
        <div className="flex flex-col gap-6">
          <CommentComposer onSubmit={onSubmitReply} isSubmitting={isSubmittingReply} />
          <CommentsList comments={comments} rootCommentId={rootCommentId} />
        </div>
      </TabsContent>

      <TabsContent value="reactions" className="mt-4">
        <ReactionsList reactions={reactions} />
      </TabsContent>
    </Tabs>
  );
}
