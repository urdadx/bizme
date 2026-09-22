export type BizmeCommand = "init" | "destroy" | "open" | "close";

export interface BizmeInitOptions {
  installKey: string;
  selector?: string;
  apiUrl?: string;
  pageUrl?: string;
  pageTitle?: string;
  colorScheme?: "system" | "light" | "dark";
  serverUrl?: string;
}

export type BizmeQueuedCall = [BizmeCommand, BizmeInitOptions?];

export interface BizmeGlobal {
  (command: "init", options: BizmeInitOptions): void;
  (command: Exclude<BizmeCommand, "init">): void;
  q?: BizmeQueuedCall[];
}

export interface BizmeWidgetMountOptions {
  installKey: string;
  apiUrl: string;
  pageUrl?: string;
  pageTitle?: string;
  hostColorScheme?: "light" | "dark";
}

export interface BizmeWidgetApi {
  mount(container: Element, options: BizmeWidgetMountOptions): void;
  unmount(container: Element): void;
}

declare global {
  interface Window {
    Bizme?: BizmeGlobal;
    BizmeWidget?: BizmeWidgetApi;
  }
}
