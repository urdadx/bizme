export type BizmePollCommand = "init" | "destroy" | "open" | "close";

export interface BizmePollInitOptions {
  installKey: string;
  selector?: string;
  apiUrl?: string;
  pageUrl?: string;
  pageTitle?: string;
  pollId?: string;
  serverUrl?: string;
}

export type BizmePollQueuedCall = [BizmePollCommand, BizmePollInitOptions?];

export interface BizmePollGlobal {
  (command: "init", options: BizmePollInitOptions): void;
  (command: Exclude<BizmePollCommand, "init">): void;
  q?: BizmePollQueuedCall[];
}

declare global {
  interface Window {
    BizmePoll?: BizmePollGlobal;
  }
}
