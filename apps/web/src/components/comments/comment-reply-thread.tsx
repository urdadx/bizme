import { Children, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export function CommentReplyThread({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-7 left-5 top-10 border-l border-border"
      />
      <div className={cn("ml-13 mt-4 flex flex-col gap-4", className)}>
        {Children.map(children, (child) => (
          <div className="relative before:pointer-events-none before:absolute before:-left-8 before:top-3 before:h-4 before:w-8 before:rounded-bl-xl before:border-b before:border-l before:border-border">
            {child}
          </div>
        ))}
      </div>
    </>
  );
}
