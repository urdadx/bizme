type BizmePollCommand = "init" | "destroy" | "open" | "close";

type BizmePollInitOptions = {
  installKey: string;
  selector?: string;
  apiUrl?: string;
  pageUrl?: string;
  pageTitle?: string;
  pollId?: string;
  serverUrl?: string;
};

type BizmePollQueuedCall = [BizmePollCommand, BizmePollInitOptions?];

type BizmePollGlobal = {
  (command: "init", options: BizmePollInitOptions): void;
  (command: Exclude<BizmePollCommand, "init">): void;
  q?: BizmePollQueuedCall[];
};

const ROOT_ID = "bizme-poll-root";
const IFRAME_ID = "bizme-poll-iframe";
const DEFAULT_HEIGHT = 360;

let root: HTMLDivElement | null = null;
let iframe: HTMLIFrameElement | null = null;
let onMessage: ((event: MessageEvent) => void) | null = null;

function inferDefaultServerUrl() {
  const currentScript = document.currentScript as HTMLScriptElement | null;

  if (currentScript?.src) {
    return new URL(currentScript.src, window.location.href).origin;
  }

  const candidate = document.querySelector('script[src*="/poll-sdk.js"]') as HTMLScriptElement | null;

  if (candidate?.src) {
    return new URL(candidate.src, window.location.href).origin;
  }

  return window.location.origin;
}

function normalizeUrl(url: string | undefined, fallback: string) {
  if (url?.trim()) {
    return url.replace(/\/$/, "");
  }

  return fallback.replace(/\/$/, "");
}

function getTarget(initOptions: BizmePollInitOptions) {
  if (!initOptions.selector) {
    return document.body;
  }

  return document.querySelector(initOptions.selector) ?? document.body;
}

function buildWidgetUrl(initOptions: BizmePollInitOptions) {
  const serverUrl = normalizeUrl(initOptions.serverUrl, inferDefaultServerUrl());
  const apiUrl = normalizeUrl(initOptions.apiUrl, serverUrl);
  const url = new URL("/poll-widget", serverUrl);

  url.searchParams.set("installKey", initOptions.installKey);
  url.searchParams.set("apiUrl", apiUrl);
  url.searchParams.set("pageUrl", initOptions.pageUrl ?? window.location.href);
  url.searchParams.set("pageTitle", initOptions.pageTitle ?? document.title);
  url.searchParams.set("hostOrigin", window.location.origin);

  if (initOptions.pollId) {
    url.searchParams.set("pollId", initOptions.pollId);
  }

  return url.toString();
}

function createIframe(initOptions: BizmePollInitOptions) {
  const nextRoot = document.createElement("div");
  const nextIframe = document.createElement("iframe");

  nextRoot.id = ROOT_ID;
  nextRoot.style.width = "100%";
  nextRoot.style.minWidth = "0";

  nextIframe.id = IFRAME_ID;
  nextIframe.title = "Bizme poll";
  nextIframe.src = buildWidgetUrl(initOptions);
  nextIframe.loading = "lazy";
  nextIframe.referrerPolicy = "strict-origin-when-cross-origin";
  nextIframe.style.display = "block";
  nextIframe.style.width = "100%";
  nextIframe.style.height = `${DEFAULT_HEIGHT}px`;
  nextIframe.style.border = "0";
  nextIframe.style.overflow = "hidden";

  nextRoot.appendChild(nextIframe);
  getTarget(initOptions).appendChild(nextRoot);

  return { nextRoot, nextIframe };
}

function init(initOptions: BizmePollInitOptions) {
  if (!initOptions.installKey) {
    throw new Error("BizmePoll init requires installKey");
  }

  destroy();

  const dom = createIframe(initOptions);
  root = dom.nextRoot;
  iframe = dom.nextIframe;

  onMessage = (event) => {
    if (event.source !== iframe?.contentWindow) {
      return;
    }

    const data = event.data as { type?: string; height?: number } | null;

    if (data?.type === "bizme:resize" && typeof data.height === "number") {
      iframe.style.height = `${Math.max(DEFAULT_HEIGHT, Math.ceil(data.height))}px`;
    }
  };

  window.addEventListener("message", onMessage);
}

function destroy() {
  if (onMessage) {
    window.removeEventListener("message", onMessage);
    onMessage = null;
  }

  root?.remove();
  root = null;
  iframe = null;
}

function open() {
  root?.removeAttribute("hidden");
}

function close() {
  root?.setAttribute("hidden", "");
}

function dispatch(command: BizmePollCommand, initOptions?: BizmePollInitOptions) {
  if (command === "init") {
    if (!initOptions) {
      throw new Error("BizmePoll init requires options");
    }

    init(initOptions);
    return;
  }

  if (command === "destroy") {
    destroy();
    return;
  }

  if (command === "open") {
    open();
    return;
  }

  if (command === "close") {
    close();
    return;
  }

  throw new Error(`Unknown BizmePoll command: ${command}`);
}

const queuedCalls = window.BizmePoll?.q ?? [];

const BizmePoll: BizmePollGlobal = (command: BizmePollCommand, initOptions?: BizmePollInitOptions) => {
  dispatch(command, initOptions);
};

window.BizmePoll = BizmePoll;

for (const [command, initOptions] of queuedCalls) {
  dispatch(command, initOptions);
}

export {};
