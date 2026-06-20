import { LikeIcon } from "@/assets/icons/like-icon";

export type CommentReaction = {
  id: string;
  type: string;
  visitorId: string;
  date: string;
};

export function ReactionsList({ reactions }: { reactions: CommentReaction[] }) {
  if (reactions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        No reactions yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y rounded-lg border">
      {reactions.map((reaction) => (
        <div key={reaction.id} className="flex items-center justify-between gap-4 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <LikeIcon />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{reaction.visitorId}</p>
              <p className="text-xs capitalize text-muted-foreground">{reaction.type}</p>
            </div>
          </div>
          <p className="shrink-0 text-xs text-muted-foreground">{reaction.date}</p>
        </div>
      ))}
    </div>
  );
}
