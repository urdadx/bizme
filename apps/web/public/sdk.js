(function() {
	//#region src/sdk.ts
	const ROOT_ID = "bizme-comments-root";
	let root = null;
	let mountContainer = null;
	let themeObserver = null;
	let themeMediaQuery = null;
	let themeMediaListener = null;
	let activeInitOptions = null;
	let lastHostColorScheme = "light";
	let embedScriptPromise = null;
	function inferDefaultServerUrl() {
		const currentScript = document.currentScript;
		if (currentScript?.src) return new URL(currentScript.src, window.location.href).origin;
		const candidate = document.querySelector("script[src*=\"/sdk.js\"]");
		if (candidate?.src) return new URL(candidate.src, window.location.href).origin;
		return window.location.origin;
	}
	function normalizeUrl(url, fallback) {
		if (url?.trim()) return url.replace(/\/$/, "");
		return fallback.replace(/\/$/, "");
	}
	function getTarget(initOptions) {
		if (!initOptions.selector) return document.body;
		return document.querySelector(initOptions.selector) ?? document.body;
	}
	function getHostColorScheme(initOptions) {
		if (initOptions.colorScheme === "light" || initOptions.colorScheme === "dark") return initOptions.colorScheme;
		const root = document.documentElement;
		const body = document.body;
		const explicitTheme = root.dataset.theme || root.dataset.colorScheme || root.getAttribute("data-mode") || body?.dataset.theme || body?.dataset.colorScheme || body?.getAttribute("data-mode");
		if (explicitTheme === "light" || explicitTheme === "dark") return explicitTheme;
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
		window.dispatchEvent(new CustomEvent("bizme:host-theme", { detail: { colorScheme: nextColorScheme } }));
	}
	function watchHostEnvironment() {
		notifyHostTheme();
		themeObserver = new MutationObserver(notifyHostTheme);
		themeObserver.observe(document.documentElement, {
			attributes: true,
			attributeFilter: [
				"class",
				"data-theme",
				"data-color-scheme",
				"data-mode",
				"style"
			]
		});
		if (document.body) themeObserver.observe(document.body, {
			attributes: true,
			attributeFilter: [
				"class",
				"data-theme",
				"data-color-scheme",
				"data-mode",
				"style"
			]
		});
		themeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		themeMediaListener = notifyHostTheme;
		themeMediaQuery.addEventListener("change", themeMediaListener);
	}
	function loadEmbedBundle(serverUrl) {
		if (!embedScriptPromise) embedScriptPromise = new Promise((resolve, reject) => {
			const script = document.createElement("script");
			script.src = `${serverUrl}/widget-embed.js`;
			script.async = true;
			script.onload = () => resolve();
			script.onerror = () => reject(/* @__PURE__ */ new Error(`Failed to load Bizme widget bundle from ${script.src}`));
			document.head.appendChild(script);
		});
		return embedScriptPromise;
	}
	async function mountWidget(initOptions, shadowRoot) {
		const serverUrl = normalizeUrl(initOptions.serverUrl, inferDefaultServerUrl());
		const apiUrl = normalizeUrl(initOptions.apiUrl, serverUrl);
		const hostColorScheme = getHostColorScheme(initOptions);
		lastHostColorScheme = hostColorScheme;
		const styleLink = document.createElement("link");
		styleLink.rel = "stylesheet";
		styleLink.href = `${serverUrl}/widget-embed.css`;
		shadowRoot.appendChild(styleLink);
		if (!mountContainer) return;
		try {
			await loadEmbedBundle(serverUrl);
		} catch {
			mountContainer.textContent = "Unable to load comments.";
			return;
		}
		if (!mountContainer) return;
		window.BizmeWidget?.mount(mountContainer, {
			installKey: initOptions.installKey,
			apiUrl,
			pageUrl: initOptions.pageUrl,
			pageTitle: initOptions.pageTitle,
			hostColorScheme
		});
	}
	function init(initOptions) {
		if (!initOptions.installKey) throw new Error("Bizme init requires installKey");
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
		mountWidget(initOptions, nextShadowRoot);
		watchHostEnvironment();
	}
	function destroy() {
		if (mountContainer) {
			try {
				window.BizmeWidget?.unmount(mountContainer);
			} catch {}
			mountContainer = null;
		}
		themeObserver?.disconnect();
		themeObserver = null;
		if (themeMediaQuery && themeMediaListener) themeMediaQuery.removeEventListener("change", themeMediaListener);
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
	function dispatch(command, initOptions) {
		if (command === "init") {
			if (!initOptions) throw new Error("Bizme init requires options");
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
	const Bizme = (command, initOptions) => {
		dispatch(command, initOptions);
	};
	window.Bizme = Bizme;
	for (const [command, initOptions] of queuedCalls) dispatch(command, initOptions);
	//#endregion
})();

//# sourceMappingURL=sdk.js.map