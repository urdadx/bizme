import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

interface DeviceInfo {
  type: "mobile" | "tablet" | "desktop" | "unknown";
  os: string;
  browser: string;
  isIOS: boolean;
  isAndroid: boolean;
  isMac: boolean;
  isWindows: boolean;
  isLinux: boolean;
  isSafari: boolean;
  isChrome: boolean;
  isFirefox: boolean;
  isEdge: boolean;
  model?: string;
}
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ApplicationError extends Error {
  info: string;
  status: number;
}

export const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.") as ApplicationError;

    error.info = await res.json();
    error.status = res.status;

    throw error;
  }

  return res.json();
};

export function getLocalStorage(key: string) {
  if (typeof window !== "undefined") {
    return JSON.parse(localStorage.getItem(key) || "[]");
  }
  return [];
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function capitalizeFirst(str: string): string {
  // Handle empty strings
  if (!str || str.length === 0) {
    return str;
  }

  // Capitalize the first letter and keep the rest of the string unchanged
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function detectDevice(): DeviceInfo {
  const userAgent = navigator.userAgent.toLowerCase();

  // Initialize result with defaults
  const result: DeviceInfo = {
    type: "unknown",
    os: "unknown",
    browser: "unknown",
    isIOS: false,
    isAndroid: false,
    isMac: false,
    isWindows: false,
    isLinux: false,
    isSafari: false,
    isChrome: false,
    isFirefox: false,
    isEdge: false,
  };

  // Device type detection
  if (
    /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|tablet|(puffin(?!.*(IP|AP|WP))))/.test(
      userAgent,
    )
  ) {
    result.type = "tablet";
  } else if (
    /(mobi|ipod|phone|blackberry|opera mini|fennec|minimo|symbian|psp|nintendo ds|archos|skyfire|puffin|blazer|bolt|gobrowser|iris|maemo|semc|teashark|uzard)/.test(
      userAgent,
    )
  ) {
    result.type = "mobile";
  } else {
    result.type = "desktop";
  }

  // OS detection
  if (/iphone|ipad|ipod/.test(userAgent)) {
    result.os = "iOS";
    result.isIOS = true;
  } else if (/android/.test(userAgent)) {
    result.os = "Android";
    result.isAndroid = true;
  } else if (/macintosh|mac os x/.test(userAgent)) {
    result.os = "macOS";
    result.isMac = true;
  } else if (/windows|win32|win64|wow64/.test(userAgent)) {
    result.os = "Windows";
    result.isWindows = true;
  } else if (/linux/.test(userAgent) && !result.isAndroid) {
    result.os = "Linux";
    result.isLinux = true;
  }

  // Browser detection
  if (/edg/.test(userAgent)) {
    result.browser = "Edge";
    result.isEdge = true;
  } else if (/chrome/.test(userAgent) && !/chromium|edg/.test(userAgent)) {
    result.browser = "Chrome";
    result.isChrome = true;
  } else if (/firefox/.test(userAgent)) {
    result.browser = "Firefox";
    result.isFirefox = true;
  } else if (/safari/.test(userAgent) && !/chrome|chromium|edg/.test(userAgent)) {
    result.browser = "Safari";
    result.isSafari = true;
  } else if (/msie|trident/.test(userAgent)) {
    result.browser = "Internet Explorer";
  } else if (/opera/.test(userAgent)) {
    result.browser = "Opera";
  }

  // Try to detect models for common devices
  if (result.isIOS) {
    const matches =
      userAgent.match(/iphone\s+os\s+(\d+)_(\d+)/i) ||
      userAgent.match(/ipad;\s+cpu\s+os\s+(\d+)_(\d+)/i);
    if (matches) {
      const model = userAgent.includes("ipad") ? "iPad" : "iPhone";
      result.model = `${model} (iOS ${matches[1]}.${matches[2]})`;
    }
  } else if (result.isAndroid) {
    const matches = userAgent.match(/android\s+(\d+)(\.(\d+))?/i);
    if (matches) {
      result.model = `Android ${matches[1]}${matches[3] ? `.${matches[3]}` : ""}`;
    }
  }

  return result;
}

/**
 * Server-side device detection that accepts a userAgent string
 * Use this in server-side code where navigator is not available
 */
export function detectDeviceFromUserAgent(userAgent: string): DeviceInfo {
  const ua = userAgent.toLowerCase();

  // Initialize result with defaults
  const result: DeviceInfo = {
    type: "unknown",
    os: "unknown",
    browser: "unknown",
    isIOS: false,
    isAndroid: false,
    isMac: false,
    isWindows: false,
    isLinux: false,
    isSafari: false,
    isChrome: false,
    isFirefox: false,
    isEdge: false,
  };

  // Device type detection
  if (
    /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|tablet|(puffin(?!.*(IP|AP|WP))))/.test(
      ua,
    )
  ) {
    result.type = "tablet";
  } else if (
    /(mobi|ipod|phone|blackberry|opera mini|fennec|minimo|symbian|psp|nintendo ds|archos|skyfire|puffin|blazer|bolt|gobrowser|iris|maemo|semc|teashark|uzard)/.test(
      ua,
    )
  ) {
    result.type = "mobile";
  } else {
    result.type = "desktop";
  }

  // OS detection
  if (/iphone|ipad|ipod/.test(ua)) {
    result.os = "iOS";
    result.isIOS = true;
  } else if (/android/.test(ua)) {
    result.os = "Android";
    result.isAndroid = true;
  } else if (/macintosh|mac os x/.test(ua)) {
    result.os = "macOS";
    result.isMac = true;
  } else if (/windows|win32|win64|wow64/.test(ua)) {
    result.os = "Windows";
    result.isWindows = true;
  } else if (/linux/.test(ua) && !result.isAndroid) {
    result.os = "Linux";
    result.isLinux = true;
  }

  // Browser detection
  if (/edg/.test(ua)) {
    result.browser = "Edge";
    result.isEdge = true;
  } else if (/chrome/.test(ua) && !/chromium|edg/.test(ua)) {
    result.browser = "Chrome";
    result.isChrome = true;
  } else if (/firefox/.test(ua)) {
    result.browser = "Firefox";
    result.isFirefox = true;
  } else if (/safari/.test(ua) && !/chrome|chromium|edg/.test(ua)) {
    result.browser = "Safari";
    result.isSafari = true;
  } else if (/msie|trident/.test(ua)) {
    result.browser = "Internet Explorer";
  } else if (/opera/.test(ua)) {
    result.browser = "Opera";
  }

  // Try to detect models for common devices
  if (result.isIOS) {
    const matches =
      ua.match(/iphone\s+os\s+(\d+)_(\d+)/i) || ua.match(/ipad;\s+cpu\s+os\s+(\d+)_(\d+)/i);
    if (matches) {
      const model = ua.includes("ipad") ? "iPad" : "iPhone";
      result.model = `${model} (iOS ${matches[1]}.${matches[2]})`;
    }
  } else if (result.isAndroid) {
    const matches = ua.match(/android\s+(\d+)(\.(\d+))?/i);
    if (matches) {
      result.model = `Android ${matches[1]}${matches[3] ? `.${matches[3]}` : ""}`;
    }
  }

  return result;
}

export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function sanitizeText(text: string) {
  return text.replace("<has_function_call>", "");
}

export const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
};
export const getPrettyUrl = (url?: string | null) => {
  if (!url) return "";
  // remove protocol (http/https) and www.
  // also remove trailing slash
  return url
    .replace(/(^\w+:|^)\/\//, "")
    .replace("www.", "")
    .replace(/\/$/, "");
};

export function getBaseUrl(url: string) {
  try {
    // Create a URL object
    const parsedUrl = new URL(url);

    // Get the pathname and split it
    const pathSegments = parsedUrl.pathname.split("/").filter((segment) => segment !== "");

    // If no path segments, return just the origin
    if (pathSegments.length === 0) {
      return parsedUrl.origin;
    }

    // Construct the base URL
    return `${parsedUrl.origin}`;
  } catch (error: any) {
    console.error("Error parsing URL:", error.message);
    return null;
  }
}

export function getDaysUntilReset(createdAt?: Date) {
  if (!createdAt) return "-";
  const created = new Date(createdAt);
  const reset = new Date(created);
  reset.setMonth(reset.getMonth() + 1);
  const now = new Date();
  const diffTime = reset.getTime() - now.getTime();
  const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
}

import ccTLDs from "@/constants/cctlds";
import { SECOND_LEVEL_DOMAINS, SPECIAL_APEX_DOMAINS } from "@/constants/domains";

export const getApexDomain = (url: string) => {
  let domain: any;
  try {
    domain = new URL(url).hostname;
  } catch (e: any) {
    console.error("Error parsing URL:", e.message);
    return "";
  }
  // special apex domains (e.g. youtu.be)
  if (SPECIAL_APEX_DOMAINS[domain as keyof typeof SPECIAL_APEX_DOMAINS])
    return SPECIAL_APEX_DOMAINS[domain as keyof typeof SPECIAL_APEX_DOMAINS];

  const parts = domain.split(".");
  if (parts.length > 2) {
    // if this is a second-level TLD (e.g. co.uk, .com.ua, .org.tt), we need to return the last 3 parts
    if (SECOND_LEVEL_DOMAINS.has(parts[parts.length - 2]) && ccTLDs.has(parts[parts.length - 1])) {
      return parts.slice(-3).join(".");
    }
    // otherwise, it's a subdomain (e.g. dub.vercel.app), so we return the last 2 parts
    return parts.slice(-2).join(".");
  }
  // if it's a normal domain (e.g. dub.sh), we return the domain
  return domain;
};

// Verify the URL entered by user
export const validDomainRegex = new RegExp(
  /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
);

export const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch (e: any) {
    console.error("Invalid URL:", e.message);
    return false;
  }
};

export const getWebsiteDomain = (websiteUrl: string) => {
  const trimmedWebsiteUrl = websiteUrl.trim();
  if (!trimmedWebsiteUrl) return "";

  const normalizedWebsiteUrl = /^https?:\/\//i.test(trimmedWebsiteUrl)
    ? trimmedWebsiteUrl
    : `https://${trimmedWebsiteUrl}`;

  return getApexDomain(normalizedWebsiteUrl);
};

export const signalIframe = () => {
  const iframe = document.getElementById("preview") as HTMLIFrameElement;
  console.log("iframe", iframe);
  if (iframe) {
    iframe.contentWindow?.postMessage("", "*");
  }
};

export const timeAgo = (timestamp: string | number | Date | null | undefined) => {
  if (timestamp === null) return "----";
  if (!timestamp) return "Just now";

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "Just now";

  const diff = Date.now() - date.getTime();

  // Handle future timestamps
  if (diff < 0) return "Just now";

  // Less than 1 minute
  if (diff < 60000) {
    return "Just now";
  }

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) {
    return `${years} year${years > 1 ? "s" : ""} ago`;
  }

  if (months > 0) {
    return `${months} month${months > 1 ? "s" : ""} ago`;
  }

  if (weeks > 0) {
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  }

  if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
};

export const removeHashFromHexColor = (hexColor: string) => {
  // Use a regular expression to match the # symbol at the beginning
  return hexColor.replace(/^#/, "");
};

export const getCurrentBaseURL = () => {
  if (typeof window !== "undefined") {
    const baseURL = window.location.origin;
    return baseURL;
  }
};

export const getInitials = (name: string | undefined): string => {
  if (!name) return "";

  const words = name.split(" ");
  if (words.length > 1) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function parseCamel<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(parseCamel) as T;
  }
  if (obj !== null && typeof obj === "object") {
    return Object.keys(obj).reduce((acc: any, key: string) => {
      const newKey = snakeToCamel(key);
      acc[newKey] = parseCamel((obj as any)[key]);
      return acc;
    }, {}) as T;
  }
  return obj;
}

export function parseSnake(input: any): any {
  if (Array.isArray(input)) {
    return input.map((item) => parseSnake(item));
  }

  if (input !== null && typeof input === "object") {
    return Object.fromEntries(
      Object.entries(input).map(([key, value]) => [
        key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`),
        parseSnake(value),
      ]),
    );
  }

  return input;
}

export async function extractOpenGraphInfo(link: string): Promise<{
  previewImage: string | null;
  previewTitle: string | null;
  previewDescription: string | null;
}> {
  try {
    const response = await fetch(`/api/v1/og-preview?url=${encodeURIComponent(link)}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch preview: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      previewImage: data.previewImage,
      previewTitle: data.previewTitle,
      previewDescription: data.previewDescription,
    };
  } catch (error) {
    console.error("Error extracting OpenGraph info:", error);
    return {
      previewImage: null,
      previewTitle: null,
      previewDescription: null,
    };
  }
}

export function decodeLatin1ToUtf8(str: string): string {
  return decodeURIComponent(escape(str));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
