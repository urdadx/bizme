(function() {
	//#region src/sdk.ts
	const ROOT_ID = "bizme-comments-root";
	const IFRAME_ID = "bizme-comments-iframe";
	const DEFAULT_HEIGHT = 520;
	let root = null;
	let iframe = null;
	let onMessage = null;
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
	function buildWidgetUrl(initOptions) {
		const serverUrl = normalizeUrl(initOptions.serverUrl, inferDefaultServerUrl());
		const apiUrl = normalizeUrl(initOptions.apiUrl, serverUrl);
		const url = new URL("/widget", serverUrl);
		url.searchParams.set("installKey", initOptions.installKey);
		url.searchParams.set("apiUrl", apiUrl);
		url.searchParams.set("pageUrl", initOptions.pageUrl ?? window.location.href);
		url.searchParams.set("pageTitle", initOptions.pageTitle ?? document.title);
		url.searchParams.set("hostOrigin", window.location.origin);
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
		nextIframe.style.height = `${DEFAULT_HEIGHT}px`;
		nextIframe.style.border = "0";
		nextIframe.style.overflow = "hidden";
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
			if (data?.type === "bizme:resize" && typeof data.height === "number") iframe.style.height = `${Math.max(DEFAULT_HEIGHT, Math.ceil(data.height))}px`;
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