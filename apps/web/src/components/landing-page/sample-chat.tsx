import { RiHeart3Line, RiReplyLine } from "@remixicon/react";

export const SampleChat = () => {
  return (
    <>
      <div className="overflow-hidden border-t p-6 md:border-0 dark:bg-transparent">
        <div
          aria-hidden
          className="rounded-2xl border bg-white p-4 dark:bg-gray-950"
        >
          <div className="mb-4 flex items-center justify-between border-b pb-3">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Comments
              </div>
              <div className="text-xs text-gray-500">3 live comments</div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {[
              {
                name: "Maya Chen",
                initials: "MC",
                avatar: "https://i.pravatar.cc/96?img=47",
                message: "This walkthrough made the setup feel effortless.",
                likes: 12,
                time: "2m ago",
              },
              {
                name: "Jon Bell",
                initials: "JB",
                avatar: "https://i.pravatar.cc/96?img=12",
                message: "Can you share the framework integration guide too?",
                likes: 5,
                time: "8m ago",
              },
              {
                name: "Ari Lane",
                initials: "AL",
                avatar: "https://i.pravatar.cc/96?img=32",
                message: "Love seeing active discussions right below the post.",
                likes: 9,
                time: "14m ago",
              },
            ].map((comment) => (
              <div key={comment.name} className="flex gap-3">
                <img
                  src={comment.avatar}
                  alt={`${comment.name} avatar`}
                  className="size-8 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                      {comment.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {comment.time}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                    {comment.message}
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1.5">
                      <RiHeart3Line className="size-3.5" />
                      {comment.likes}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <RiReplyLine className="size-3.5" />
                      Reply
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
