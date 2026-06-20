import { ChatLinear } from "@/assets/icons/chat-icon";
import { LikeIcon } from "@/assets/icons/like-icon";
import { TrashBinLinear } from "@/assets/icons/trash-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVerticalIcon, PencilIcon, PinIcon } from "lucide-react";
import { useState } from "react";
import { CommentComposer } from "./comment-composer";

export type CommentReply = {
  id: string;
  author: string;
  date: string;
  content: string;
  likes: number;
  replies: number;
  avatar: string;
  isPinned?: boolean;
  children: CommentReply[];
};

export type CommentMenuRole = "admin" | "commenter";

export function CommentListItem({
  comment,
  isReplying,
  onReply,
  viewerRole = "admin",
  onEdit,
  onDelete,
  onPin,
  onLike,
  onSubmitReply,
  isPending = false,
}: {
  comment: CommentReply;
  isReplying: boolean;
  onReply: () => void;
  viewerRole?: CommentMenuRole;
  onEdit?: (id: string, body: string) => Promise<void> | void;
  onDelete?: (id: string) => Promise<void> | void;
  onPin?: (id: string, isPinned: boolean) => Promise<void> | void;
  onLike?: (id: string) => Promise<void> | void;
  onSubmitReply?: (id: string, body: string) => Promise<void> | void;
  isPending?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content);

  async function handleSaveEdit() {
    const body = draft.trim();

    if (!body) return;

    await onEdit?.(comment.id, body);
    setIsEditing(false);
  }

  return (
    <div className="border-b py-4 last:border-b-0 first:pt-0">
      <div className="relative">
        {comment.children.length > 0 && (
          <div className="absolute top-10 bottom-5 left-5 w-px bg-border" />
        )}

        <div className="relative flex gap-3">
          <Avatar size="lg">
            <AvatarImage src={comment.avatar} alt={comment.author} />
            <AvatarFallback>{comment.author.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-sm font-semibold">{comment.author}</h3>
                  <span className="text-xs text-muted-foreground">{comment.date}</span>
                </div>
                {isEditing ? (
                  <div className="mt-2 flex flex-col gap-2">
                    <textarea
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      className="min-h-20 rounded-md border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={handleSaveEdit} disabled={isPending}>
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isPending}
                        onClick={() => {
                          setDraft(comment.content);
                          setIsEditing(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{comment.content}</p>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 shrink-0"
                      aria-label="Open comment options"
                    />
                  }
                >
                  <MoreVerticalIcon className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32 min-w-32">
                  {viewerRole === "admin" ? (
                    <DropdownMenuItem
                      disabled={isPending}
                      onClick={() => onPin?.(comment.id, !comment.isPinned)}
                    >
                      <PinIcon className="size-4" />
                      {comment.isPinned ? "Unpin" : "Pin"}
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem disabled={isPending} onClick={() => setIsEditing(true)}>
                      <PencilIcon className="size-4" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    disabled={isPending}
                    className="text-destructive"
                    onClick={() => onDelete?.(comment.id)}
                  >
                    <TrashBinLinear color="red" className="size-4" />
                    <span className="text-red-600">Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mt-2 flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                disabled={isPending}
                onClick={() => onLike?.(comment.id)}
              >
                <LikeIcon /> <span className="ml-1 text-[#888888]">{comment.likes}</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={onReply}>
                <ChatLinear /> <span className="ml-1 text-[#888888]">{comment.replies}</span>
              </Button>
            </div>
          </div>
        </div>

        {isReplying && (
          <div className="mt-3 ml-13">
            <CommentComposer
              uploadId={`reply-file-upload-${comment.id}`}
              isSubmitting={isPending}
              onSubmit={(body) => onSubmitReply?.(comment.id, body)}
            />
          </div>
        )}

        {comment.children.length > 0 && (
          <div className="mt-4 flex flex-col gap-4">
            {comment.children.map((child) => (
              <CommentListItem
                key={child.id}
                comment={child}
                isReplying={false}
                onReply={() => undefined}
                viewerRole={viewerRole}
                onEdit={onEdit}
                onDelete={onDelete}
                onPin={onPin}
                onLike={onLike}
                onSubmitReply={onSubmitReply}
                isPending={isPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
