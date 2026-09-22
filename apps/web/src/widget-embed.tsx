import { createRoot, type Root } from "react-dom/client";

import { CommentWidget, type CommentWidgetProps } from "@/components/widget/comment-widget";

export type EmbedMountOptions = CommentWidgetProps;

const mounts = new Map<Element, Root>();

export function mount(container: Element, options: EmbedMountOptions) {
  mounts.get(container)?.unmount();
  const root = createRoot(container);
  root.render(<CommentWidget {...options} />);
  mounts.set(container, root);
}

export function unmount(container: Element) {
  mounts.get(container)?.unmount();
  mounts.delete(container);
}

declare global {
  interface Window {
    BizmeWidget?: {
      mount: typeof mount;
      unmount: typeof unmount;
    };
  }
}

if (typeof window !== "undefined") {
  window.BizmeWidget = {
    mount,
    unmount,
  };
}
