type BizmeCommand = "init" | "destroy" | "open" | "close";

type BizmeInitOptions = {
  installKey: string;
  selector?: string;
  apiUrl?: string;
  pageUrl?: string;
  pageTitle?: string;
  colorScheme?: "system" | "light" | "dark";
  serverUrl?: string;
};

type BizmeQueuedCall = [BizmeCommand, BizmeInitOptions?];

type BizmeGlobal = {
  (command: "init", options: BizmeInitOptions): void;
  (command: Exclude<BizmeCommand, "init">): void;
  q?: BizmeQueuedCall[];
};

const ROOT_ID = "bizme-comments-root";

let root: HTMLDivElement | null = null;
let mountContainer: HTMLDivElement | null = null;
let themeObserver: MutationObserver | null = null;
let themeMediaQuery: MediaQueryList | null = null;
let themeMediaListener: (() => void) | null = null;
let activeInitOptions: BizmeInitOptions | null = null;
let lastHostColorScheme: "light" | "dark" = "light";
let embedScriptPromise: Promise<void> | null = null;

function inferDefaultServerUrl() {
  const currentScript = document.currentScript as HTMLScriptElement | null;

  if (currentScript?.src) {
    return new URL(currentScript.src, window.location.href).origin;
  }

  const candidate = document.querySelector('script[src*="/sdk.js"]') as HTMLScriptElement | null;

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

function getTarget(initOptions: BizmeInitOptions) {
  if (!initOptions.selector) {
    return document.body;
  }

  return document.querySelector(initOptions.selector) ?? document.body;
}

function getHostColorScheme(initOptions: BizmeInitOptions) {
  if (initOptions.colorScheme === "light" || initOptions.colorScheme === "dark") {
    return initOptions.colorScheme;
  }

  const root = document.documentElement;
  const body = document.body;
  const explicitTheme =
    root.dataset.theme ||
    root.dataset.colorScheme ||
    root.getAttribute("data-mode") ||
    body?.dataset.theme ||
    body?.dataset.colorScheme ||
    body?.getAttribute("data-mode");

  if (explicitTheme === "light" || explicitTheme === "dark") {
    return explicitTheme;
  }

  if (root.classList.contains("dark")) return "dark";
  if (root.classList.contains("light")) return "light";
  if (body?.classList.contains("dark")) return "dark";
  if (body?.classList.contains("light")) return "light";

  const cssColorScheme = window.getComputedStyle(root).colorScheme;

  if (cssColorScheme.includes("dark") && !cssColorScheme.includes("light")) return "dark";
  if (cssColorScheme.includes("light") && !cssColorScheme.includes("dark")) return "light";

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function notifyHostTheme() {
  if (!activeInitOptions) return;

  const nextColorScheme = getHostColorScheme(activeInitOptions);

  if (nextColorScheme === lastHostColorScheme) return;

  lastHostColorScheme = nextColorScheme;
  window.dispatchEvent(
    new CustomEvent("bizme:host-theme", { detail: { colorScheme: nextColorScheme } }),
  );
}

function watchHostEnvironment() {
  notifyHostTheme();

  themeObserver = new MutationObserver(notifyHostTheme);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "data-theme", "data-color-scheme", "data-mode", "style"],
  });

  if (document.body) {
    themeObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "data-color-scheme", "data-mode", "style"],
    });
  }

  themeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  themeMediaListener = notifyHostTheme;
  themeMediaQuery.addEventListener("change", themeMediaListener);
}

function loadEmbedBundle(serverUrl: string) {
  if (!embedScriptPromise) {
    embedScriptPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `${serverUrl}/widget-embed.js`;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error(`Failed to load Bizme widget bundle from ${script.src}`));
      document.head.appendChild(script);
    });
  }

  return embedScriptPromise;
}

async function mountWidget(initOptions: BizmeInitOptions, shadowRoot: ShadowRoot) {
  const serverUrl = normalizeUrl(initOptions.serverUrl, inferDefaultServerUrl());
  const apiUrl = normalizeUrl(initOptions.apiUrl, serverUrl);
  const hostColorScheme = getHostColorScheme(initOptions);
  lastHostColorScheme = hostColorScheme;

  const styleLink = document.createElement("link");
  styleLink.rel = "stylesheet";
  styleLink.href = `${serverUrl}/widget-embed.css`;
  shadowRoot.appendChild(styleLink);

  if (!mountContainer) {
    return;
  }

  try {
    await loadEmbedBundle(serverUrl);
  } catch {
    mountContainer.textContent = "Unable to load comments.";
    return;
  }

  if (!mountContainer) {
    return;
  }

  window.BizmeWidget?.mount(mountContainer, {
    installKey: initOptions.installKey,
    apiUrl,
    pageUrl: initOptions.pageUrl,
    pageTitle: initOptions.pageTitle,
    hostColorScheme,
  });
}

function init(initOptions: BizmeInitOptions) {
  if (!initOptions.installKey) {
    throw new Error("Bizme init requires installKey");
  }

  destroy();

  activeInitOptions = initOptions;
  lastHostColorScheme = getHostColorScheme(initOptions);

  const nextRoot = document.createElement("div");
  nextRoot.id = ROOT_ID;
  nextRoot.style.width = "100%";
  nextRoot.style.minWidth = "0";

  const nextShadowRoot = nextRoot.attachShadow({ mode: "open" });
  const nextMountContainer = document.createElement("div");
  nextMountContainer.style.width = "100%";
  nextMountContainer.style.minWidth = "0";
  nextShadowRoot.appendChild(nextMountContainer);

  mountContainer = nextMountContainer;
  root = nextRoot;
  getTarget(initOptions).appendChild(nextRoot);

  void mountWidget(initOptions, nextShadowRoot);
  watchHostEnvironment();
}

function destroy() {
  if (mountContainer) {
    try {
      window.BizmeWidget?.unmount(mountContainer);
    } catch {
      // Ignore cleanup errors; the DOM is removed below regardless.
    }
    mountContainer = null;
  }

  themeObserver?.disconnect();
  themeObserver = null;

  if (themeMediaQuery && themeMediaListener) {
    themeMediaQuery.removeEventListener("change", themeMediaListener);
  }

  themeMediaQuery = null;
  themeMediaListener = null;

  activeInitOptions = null;
  root?.remove();
  root = null;
}

function open() {
  root?.removeAttribute("hidden");
}

function close() {
  root?.setAttribute("hidden", "");
}

function dispatch(command: BizmeCommand, initOptions?: BizmeInitOptions) {
  if (command === "init") {
    if (!initOptions) {
      throw new Error("Bizme init requires options");
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

  throw new Error(`Unknown Bizme command: ${command}`);
}

const queuedCalls = window.Bizme?.q ?? [];

const Bizme: BizmeGlobal = (command: BizmeCommand, initOptions?: BizmeInitOptions) => {
  dispatch(command, initOptions);
};

window.Bizme = Bizme;

for (const [command, initOptions] of queuedCalls) {
  dispatch(command, initOptions);
}

export {};