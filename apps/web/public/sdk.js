(function() {
	//#region src/sdk.ts
	const ROOT_ID = "bizme-comments-root";
	const IFRAME_ID = "bizme-comments-iframe";
	let root = null;
	let iframe = null;
	let onMessage = null;
	let onViewportChange = null;
	let themeObserver = null;
	let themeMediaQuery = null;
	let themeMediaListener = null;
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
	function postTheme(initOptions) {
		iframe?.contentWindow?.postMessage({
			type: "bizme:theme",
			colorScheme: getHostColorScheme(initOptions)
		}, "*");
	}
	function postViewport() {
		if (!iframe) return;
		const rect = iframe.getBoundingClientRect();
		iframe.contentWindow?.postMessage({
			type: "bizme:viewport",
			iframeTop: rect.top,
			viewportHeight: window.innerHeight
		}, "*");
	}
	function watchHostEnvironment(initOptions) {
		const notify = () => {
			postTheme(initOptions);
			postViewport();
		};
		onViewportChange = () => window.requestAnimationFrame(notify);
		window.addEventListener("scroll", onViewportChange, { passive: true });
		window.addEventListener("resize", onViewportChange);
		themeObserver = new MutationObserver(notify);
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
		themeMediaListener = notify;
		themeMediaQuery.addEventListener("change", themeMediaListener);
		notify();
	}
	function buildWidgetUrl(initOptions) {
		const serverUrl = normalizeUrl(initOptions.serverUrl, inferDefaultServerUrl());
		const apiUrl = normalizeUrl(initOptions.apiUrl, serverUrl);
		const url = new URL("/widget", serverUrl);
		url.searchParams.set("installKey", initOptions.installKey);
		url.searchParams.set("apiUrl", apiUrl);
		url.searchParams.set("pageUrl", initOptions.pageUrl ?? window.location.href);
		url.searchParams.set("pageTitle", initOptions.pageTitle ?? document.title);
		url.searchParams.set("hostOrigin", window.location.origin);
		url.searchParams.set("hostColorScheme", getHostColorScheme(initOptions));
		return url.toString();
	}
	function createIframe(initOptions) {
		const nextRoot = document.createElement("div");
		const nextIframe = document.createElement("iframe");
		nextRoot.id = ROOT_ID;
		nextRoot.style.width = "100%";
		nextRoot.style.minWidth = "0";
		nextIframe.id = IFRAME_ID;
		nextIframe.title = "Bizme comments";
		nextIframe.src = buildWidgetUrl(initOptions);
		nextIframe.loading = "lazy";
		nextIframe.referrerPolicy = "strict-origin-when-cross-origin";
		nextIframe.style.display = "block";
		nextIframe.style.width = "100%";
		nextIframe.style.height = "1px";
		nextIframe.style.border = "0";
		nextIframe.style.overflow = "hidden";
		nextIframe.style.background = "transparent";
		nextRoot.appendChild(nextIframe);
		getTarget(initOptions).appendChild(nextRoot);
		return {
			nextRoot,
			nextIframe
		};
	}
	function init(initOptions) {
		if (!initOptions.installKey) throw new Error("Bizme init requires installKey");
		destroy();
		const dom = createIframe(initOptions);
		root = dom.nextRoot;
		iframe = dom.nextIframe;
		onMessage = (event) => {
			if (event.source !== iframe?.contentWindow) return;
			const data = event.data;
			if (data?.type === "bizme:resize" && typeof data.height === "number") {
				iframe.style.height = `${Math.max(1, Math.ceil(data.height))}px`;
				postViewport();
			}
		};
		window.addEventListener("message", onMessage);
		iframe.addEventListener("load", () => watchHostEnvironment(initOptions), { once: true });
	}
	function destroy() {
		if (onMessage) {
			window.removeEventListener("message", onMessage);
			onMessage = null;
		}
		if (onViewportChange) {
			window.removeEventListener("scroll", onViewportChange);
			window.removeEventListener("resize", onViewportChange);
			onViewportChange = null;
		}
		themeObserver?.disconnect();
		themeObserver = null;
		if (themeMediaQuery && themeMediaListener) themeMediaQuery.removeEventListener("change", themeMediaListener);
		themeMediaQuery = null;
		themeMediaListener = null;
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