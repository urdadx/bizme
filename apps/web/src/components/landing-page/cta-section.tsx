import heroBackground from "@/assets/hero-balloon.webp";
import { ChatLinear } from "@/assets/icons/chat-icon";
import { LikeIcon } from "@/assets/icons/like-icon";
import { CommentComposer } from "@/components/comments/comment-detail/comment-composer";
import { CommentReplyThread } from "@/components/comments/comment-reply-thread";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type PreviewComment = {
  id: string;
  author: string;
  date: string;
  content: string;
  likes: number;
  replies: PreviewComment[];
  avatar: string;
};

const previewComments: PreviewComment[] = [
  {
    id: "maya",
    author: "Jack Maaye",
    date: "2 min ago",
    content:
      "This is exactly what I wanted for my blog. Looks good, easily customizable and integrates seamlessly.",
    likes: 18,
    avatar: "https://avatars.githubusercontent.com/u/70736338?v=4",
    replies: [
      {
        id: "jonah",
        author: "Jonah Park",
        date: "just now",
        content: "Same. The moderation tools are what sold it for me.",
        likes: 7,
        avatar: "https://avatars.githubusercontent.com/u/88161157?v=4",
        replies: [],
      },
    ],
  },
];

const composerPlaceholders = [
  "Join the conversation...",
  "What's on your mind?",
  "Is this free and opensource?",
  "How can I get started!",
] as const;

export const CTASession = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="relative pt-16 md:pt-24">
        <div className="relative z-1 mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mt-8 text-balance text-4xl font-semibold md:text-5xl xl:text-6xl xl:leading-[1.3] instrument-serif-regular">
              Beautiful comment section for your{" "}
              <span className="relative z-1 inline-block rounded bg-primary/10 px-1 text-primary">
                blog
              </span>
            </h1>

            <p className="mx-auto mt-8 hidden max-w-xl text-wrap text-lg sm:block">
              Bizme gives you a complete engagement infrastructure for building and deploying
              beautiful comment sections for your blog.
            </p>
            <p className="mx-auto mt-6 block max-w-xl text-wrap text-lg sm:hidden"></p>
          </div>
        </div>

        <div className="relative z-1 mt-12 w-full mx-auto max-w-7xl px-3 sm:px-6">
          <div className="relative overflow-hidden rounded-2xl px-4 pt-20 pb-12 sm:px-16 sm:pt-40 sm:pb-20">
            <img
              src={heroBackground}
              alt=""
              aria-hidden
              className="pointer-events-none absolute inset-0 size-full object-cover select-none"
            />
            <div className="relative mx-auto max-w-3xl rounded-2xl bg-white/90 p-3 shadow-xl shadow-black/10 ring-1 ring-black/5 backdrop-blur sm:p-4">
              <div className="[&_textarea]:text-base [&_textarea]:placeholder:text-neutral-600">
                <CommentComposer
                  uploadId="landing-comment-file-upload"
                  animatedPlaceholders={composerPlaceholders}
                  alwaysEnableSubmit
                />
              </div>
              <div className="mt-4 hidden sm:block">
                {previewComments.map((comment) => (
                  <PreviewCommentItem key={comment.id} comment={comment} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

function PreviewCommentItem({ comment }: { comment: PreviewComment }) {
  return (
    <div className="relative flex gap-3">
      <Avatar size="lg">
        <AvatarImage src={comment.avatar} alt={comment.author} />
        <AvatarFallback>{comment.author.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-sans text-sm font-semibold text-[#444242]">
            {comment.author}
          </h3>
          <span className="text-xs text-muted-foreground">{comment.date}</span>
        </div>
        <p className="mt-0.5 text-sm leading-6 text-muted-foreground">{comment.content}</p>

        <div className="mt-1.5 flex items-center gap-4 text-xs text-[#888888]">
          <span className="inline-flex items-center gap-1">
            <LikeIcon className="size-3.5" />
            {comment.likes}
          </span>
          <span className="inline-flex items-center gap-1">
            <ChatLinear className="size-3.5" />
            {comment.replies.length}
          </span>
        </div>

        {comment.replies.length > 0 ? (
          <CommentReplyThread className="ml-0">
            {comment.replies.map((reply) => (
              <PreviewCommentItem key={reply.id} comment={reply} />
            ))}
          </CommentReplyThread>
        ) : null}
      </div>
    </div>
  );
}
