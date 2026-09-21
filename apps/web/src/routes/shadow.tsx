import { ShadowCommentComposer } from "@/components/shadow-widget/comment-composer";
import {
  ShadowCommentEmptyState,
  ShadowCommentSection,
  type ShadowComment,
} from "@/components/shadow-widget/comment-section";
import { ShadowDialog } from "@/components/shadow-widget/dialog";
import { createFileRoute } from "@tanstack/react-router";
import type { CSSProperties, ReactNode } from "react";

export const Route = createFileRoute("/shadow")({
  component: ShadowComposerPreview,
});

const sampleAttachments = [
  {
    name: "comment-preview.jpg",
    url: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=520&q=80",
  },
];

const sampleComments: ShadowComment[] = [
  {
    id: "maya",
    author: "Maya Chen",
    date: "2 min ago",
    message: "The setup was much smoother than I expected. The theme variables are a great touch.",
    avatar: "https://i.pravatar.cc/96?img=47",
    likes: 12,
    liked: true,
    badge: "Author",
    replies: [
      {
        id: "jon",
        author: "Jon Bell",
        date: "just now",
        message:
          "Agreed. It already feels like part of the publication rather than an embedded widget.",
        avatar: "https://i.pravatar.cc/96?img=12",
        likes: 4,
      },
    ],
  },
  {
    id: "ari",
    author: "Ari Lane",
    date: "14 min ago",
    message: "Will the final version automatically follow the host site's dark mode?",
    avatar: "https://i.pravatar.cc/96?img=32",
    likes: 8,
  },
];

function ShadowComposerPreview() {
  return (
    <main className="min-h-screen overflow-auto bg-[#f3f0e9] px-5 py-12 text-[#171816] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="max-w-2xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.22em] text-[#6f7169]">
            Shadow DOM groundwork / 01
          </p>
          <h1 className="instrument-serif-regular text-5xl leading-[0.95] sm:text-7xl">
            A composer that carries its own visual language.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-[#62645d]">
            Native controls, plain CSS, and theme variables. No application UI primitives or utility
            classes are used inside the composer.
          </p>
        </header>

        <section className="mt-14 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <PreviewPanel
            label="Default / interactive"
            className="bg-[#fffdf8] text-[#171816] lg:row-span-2"
          >
            <div className="mx-auto max-w-2xl">
              <p className="mb-5 max-w-lg text-sm leading-6 text-[#74766e]">
                Try typing, pressing Enter, or adding local images. Shift + Enter creates a new
                line.
              </p>
              <ShadowCommentComposer />
            </div>
          </PreviewPanel>

          <PreviewPanel label="Brand inherited" className="bg-[#15261f] text-[#e9f5ed]">
            <div
              style={
                {
                  "--bizme-accent": "#e9ff70",
                  "--bizme-accent-hover": "#d5ed54",
                  "--bizme-surface": "#20362d",
                  "--bizme-surface-soft": "#294439",
                  "--bizme-text": "#f1f8f3",
                  "--bizme-muted": "#a9b9af",
                  "--bizme-border": "#3e5a4d",
                } as CSSProperties
              }
            >
              <ShadowCommentComposer defaultValue="This feels native to the publication." />
            </div>
          </PreviewPanel>

          <PreviewPanel label="Uploading" className="bg-[#dce8ff] text-[#17284a]">
            <div
              style={
                {
                  "--bizme-accent": "#8a3ffc",
                  "--bizme-accent-hover": "#7027dc",
                  "--bizme-ring": "rgb(138 63 252 / 22%)",
                } as CSSProperties
              }
            >
              <ShadowCommentComposer
                defaultValue="Here is the screenshot I mentioned."
                previewAttachments={sampleAttachments}
                isSubmitting
              />
            </div>
          </PreviewPanel>
        </section>

        <section className="mt-5 grid gap-5 sm:grid-cols-2">
          <PreviewPanel label="Attachment state" className="bg-[#f7d8ca] text-[#4c2418]">
            <ShadowCommentComposer
              defaultValue="The image adds useful context to this reply."
              previewAttachments={sampleAttachments}
            />
          </PreviewPanel>
          <PreviewPanel label="Disabled state" className="bg-[#ebe7df] text-[#4b4c48]">
            <ShadowCommentComposer defaultValue="Comments are closed for this post." disabled />
          </PreviewPanel>
        </section>

        <section className="mt-5 rounded-[28px] border border-black/10 bg-[#fffdf8] p-5 sm:p-8">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#777970]">
                Native dialog
              </p>
              <h2 className="mt-2 text-lg font-medium">Plain CSS modal surface</h2>
              <p className="mt-1 max-w-xl text-sm leading-6 text-[#74766e]">
                Uses the browser dialog element for focus management, escape handling, and a
                top-layer backdrop.
              </p>
            </div>
            <ShadowDialog
              triggerLabel="Open dialog"
              title="Publish this comment?"
              description="Your reply will be visible to everyone reading this page."
            >
              <p className="m-0 text-sm leading-6 text-[#5f625b]">
                This area accepts any content needed by authentication, moderation, or confirmation
                flows.
              </p>
            </ShadowDialog>
          </div>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <PreviewPanel
            label="Comment thread / interactive"
            className="bg-[#fffdf8] text-[#171816]"
          >
            <ShadowCommentSection comments={sampleComments} />
          </PreviewPanel>
          <PreviewPanel label="Empty state" className="bg-[#e5e1f3] text-[#29243a]">
            <ShadowCommentEmptyState />
          </PreviewPanel>
        </section>
      </div>
    </main>
  );
}

function PreviewPanel({
  label,
  className,
  children,
}: {
  label: string;
  className: string;
  children: ReactNode;
}) {
  return (
    <article className={`rounded-[28px] border border-black/10 p-5 sm:p-8 ${className}`}>
      <div className="mb-8 flex items-center gap-3">
        <span className="size-2 rounded-full bg-current opacity-55" />
        <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] opacity-65">{label}</h2>
      </div>
      {children}
    </article>
  );
}
