import { XIcon } from "lucide-react";
import { WidgetIcon } from "@/assets/icons/widget-icon";
import { ReactIcon } from "@/assets/icons/react-icon";
import { VueIcon } from "@/assets/icons/vue-icon";
import { SvelteIcon } from "@/assets/icons/svelte";
import { WordPressIcon } from "@/assets/icons/wordpress";
import { RobotIcon } from "@/assets/icons/robot";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  BundledLanguage,
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockFilename,
  CodeBlockFiles,
  CodeBlockHeader,
  CodeBlockItem,
} from "../code-block";
import { env } from "@better-comments/env/web";

interface WidgetInstructionsProps {
  installKey: string | null;
  type?: "widget" | "frameworks" | "wordpress" | "agent";
  onClose?: () => void;
}

export const WidgetInstructions = ({
  installKey,
  type = "widget",
  onClose,
}: WidgetInstructionsProps) => {
  const sdkUrl = `${env.VITE_FRONTEND_ORIGIN}/sdk.js`;
  const apiUrl = env.VITE_SERVER_URL;
  const [copiedBlock, setCopiedBlock] = useState<string | null>(null);

  const embedCode = installKey
    ? `<script>
(function(w,d){if(w.self!==w.top) return;
if(w.location.pathname==="/widget") return;
if(typeof w.Bizme!=="function"){
  var q=[];
  var stub = function(){
    q.push(arguments)
  };
  stub.q=q;
  w.Bizme=stub
}
var s=d.createElement("script");
s.src="${sdkUrl}";
s.async=true;
d.head.appendChild(s)
})(window,document);
</script>
<script>
  if(window.self===window.top&&window.location.pathname!=="/widget"){
  window.Bizme("init",{
    installKey:"${installKey}",
    apiUrl:"${apiUrl}"
  });
}
  </script>`
    : "";
  const reactCode = installKey
    ? `import { useEffect } from "react";

export function BizmeComments() {
  useEffect(() => {
    if (window.self !== window.top || window.location.pathname === "/widget") return;

    if (typeof window.Bizme !== "function") {
      const queue = [];
      const stub = (...args) => queue.push(args);
      stub.q = queue;
      window.Bizme = stub;
    }

    const script = document.createElement("script");
    script.src = "${sdkUrl}";
    script.async = true;
    document.head.appendChild(script);

    window.Bizme("init", {
      installKey: "${installKey}",
      apiUrl: "${apiUrl}",
    });

    return () => {
      window.Bizme?.("destroy");
    };
  }, []);

  return null;
}`
    : "";
  const vueCode = installKey
    ? `<script setup>
import { onMounted, onUnmounted } from "vue";

onMounted(() => {
  if (window.self !== window.top || window.location.pathname === "/widget") return;

  if (typeof window.Bizme !== "function") {
    const queue = [];
    const stub = (...args) => queue.push(args);
    stub.q = queue;
    window.Bizme = stub;
  }

  const script = document.createElement("script");
  script.src = "${sdkUrl}";
  script.async = true;
  document.head.appendChild(script);

  window.Bizme("init", {
    installKey: "${installKey}",
    apiUrl: "${apiUrl}",
  });
});

onUnmounted(() => {
  window.Bizme?.("destroy");
});
</script>

<template></template>`
    : "";
  const svelteCode = installKey
    ? `<script>
  import { onMount } from "svelte";

  onMount(() => {
    if (window.self !== window.top || window.location.pathname === "/widget") return;

    if (typeof window.Bizme !== "function") {
      const queue = [];
      const stub = (...args) => queue.push(args);
      stub.q = queue;
      window.Bizme = stub;
    }

    const script = document.createElement("script");
    script.src = "${sdkUrl}";
    script.async = true;
    document.head.appendChild(script);

    window.Bizme("init", {
      installKey: "${installKey}",
      apiUrl: "${apiUrl}",
    });

    return () => {
      window.Bizme?.("destroy");
    };
  });
</script>`
    : "";
  const wordpressCode = installKey
    ? `<?php
add_action('wp_footer', function () { ?>
  <script>
  (function(w,d){if(w.self!==w.top) return;
  if(w.location.pathname==="/widget") return;
  if(typeof w.Bizme!=="function"){
    var q=[];
    var stub = function(){
      q.push(arguments)
    };
    stub.q=q;
    w.Bizme=stub
  }
  var s=d.createElement("script");
  s.src="${sdkUrl}";
  s.async=true;
  d.head.appendChild(s)
  })(window,document);
  </script>
  <script>
  if(window.self===window.top&&window.location.pathname!=="/widget"){
    window.Bizme("init",{
      installKey:"${installKey}",
      apiUrl:"${apiUrl}"
    });
  }
  </script>
<?php });`
    : "";
  const wordpressPluginCode = installKey
    ? `<?php
/**
 * Plugin Name: Bizme Comments
 * Description: Adds the Bizme comments widget to your WordPress site.
 */

add_action('wp_footer', function () { ?>
  <script>
  (function(w,d){if(w.self!==w.top) return;
  if(w.location.pathname==="/widget") return;
  if(typeof w.Bizme!=="function"){
    var q=[];
    var stub = function(){
      q.push(arguments)
    };
    stub.q=q;
    w.Bizme=stub
  }
  var s=d.createElement("script");
  s.src="${sdkUrl}";
  s.async=true;
  d.head.appendChild(s)
  })(window,document);
  </script>
  <script>
  if(window.self===window.top&&window.location.pathname!=="/widget"){
    window.Bizme("init",{
      installKey:"${installKey}",
      apiUrl:"${apiUrl}"
    });
  }
  </script>
<?php });`
    : "";
  const agentPrompt = installKey
    ? `You are implementing the Bizme comments widget in this codebase.

Goal:
Add the Bizme comments widget to the public website so visitors can leave comments on pages. Use the provided SDK snippet exactly, but adapt placement to the app framework and routing structure.

Implementation requirements:
1. Add the widget once near the public app shell, root layout, document footer, or equivalent location that runs on normal public pages.
2. Do not render or initialize the widget inside iframes.
3. Do not initialize the widget on the widget route itself if the app has a /widget path.
4. Load the SDK asynchronously from ${sdkUrl}.
5. Initialize Bizme with installKey "${installKey}" and apiUrl "${apiUrl}".
6. Preserve existing app behavior, routing, styles, analytics, and hydration behavior.
7. If this is a React, Vue, Svelte, Next.js, Nuxt, Astro, Remix, or similar app, place the integration in the smallest appropriate client-side component or script hook.
8. If this is a static HTML site, paste the snippet before the closing </body> tag.
9. If this is a server-rendered framework, make sure any direct window/document access only runs in the browser.
10. Avoid loading the SDK more than once. If the app already has a Bizme integration, update it instead of adding a duplicate.
11. Add cleanup on unmount when the framework supports it by calling window.Bizme?.("destroy").
12. After implementing, verify that the SDK script is present in the browser, window.Bizme is initialized, and the comments widget appears on public pages.

SDK snippet to implement:

\`\`\`html
${embedCode}
\`\`\`

Suggested framework guidance:
- React/Next.js/Remix: create a small client component such as BizmeComments and mount it in the root layout or app shell.
- Vue/Nuxt: initialize from onMounted and clean up from onUnmounted.
- Svelte/SvelteKit: initialize from onMount and return a cleanup function.
- Astro/static HTML: inject the script near the end of the body.
- WordPress/PHP: enqueue or print the snippet in the footer.

Do not change the install key or API URL.`
    : "Sign in to a workspace first, then copy this prompt with your workspace install key.";
  const selectedCode =
    type === "frameworks"
      ? reactCode
      : type === "wordpress"
        ? wordpressCode
        : type === "agent"
          ? agentPrompt
          : embedCode;
  const selectedLanguage =
    type === "frameworks"
      ? "tsx"
      : type === "wordpress"
        ? "php"
        : type === "agent"
          ? "markdown"
          : "html";
  const selectedFilename =
    type === "frameworks"
      ? "BizmeComments.tsx"
      : type === "wordpress"
        ? "functions.php"
        : type === "agent"
          ? "prompt.md"
          : "widget.html";
  const selectedIcon =
    type === "frameworks" ? (
      <ReactIcon className="size-5" />
    ) : type === "wordpress" ? (
      <WordPressIcon className="size-5 text-sky-600" />
    ) : type === "agent" ? (
      <RobotIcon className="size-5 text-red-600" />
    ) : (
      <WidgetIcon color="purple" />
    );
  const title =
    type === "frameworks"
      ? "Install with frameworks"
      : type === "wordpress"
        ? "Install on WordPress"
        : type === "agent"
          ? "Instructions for AI agent"
          : "Install the widget";
  const description =
    type === "frameworks"
      ? "Mount the Bizme comments widget from React, Vue, or Svelte."
      : type === "wordpress"
        ? "Add Bizme comments to your WordPress theme without a plugin."
        : type === "agent"
          ? "Copy this prompt and give it to your coding agent to install Bizme"
          : "Get the Bizme comments widget running on your website in under a minute";
  const platformLabel =
    type === "frameworks"
      ? "React app"
      : type === "wordpress"
        ? "WordPress theme"
        : type === "agent"
          ? "AI coding agent prompt"
          : "Standard HTML website";

  const handleCopy = (code: string, block: string) => {
    if (code) {
      navigator.clipboard.writeText(code);
      toast.success("Copied to clipboard");
      setCopiedBlock(block);
      setTimeout(() => setCopiedBlock(null), 2000);
    }
  };

  return (
    <>
      <div className="min-h-0 min-w-0 flex-1 p-2 overflow-hidden">
        <div className="relative h-full min-w-0 rounded-xl bg-white dark:bg-gray-950 overflow-hidden  shadow-xs border dark:border-gray-800">
          <div className="flex h-full min-h-0 min-w-0 flex-col overflow-y-auto p-8 scrollbar-hide">
            <div className=" min-w-0 shrink-0">
              <div className=" flex items-start justify-between">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {title}
                </h3>
                <Button
                  size="icon"
                  variant="outline"
                  className="text-gray-400 hidden sm:flex hover:text-gray-500 rounded-full"
                  onClick={onClose}
                >
                  <XIcon />
                </Button>
              </div>
              <p className="max-w-md text-pretty text-sm text-gray-600 dark:text-gray-400">
                {description}
              </p>
            </div>
            <div className="pt-5 pb-2">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedIcon}
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {platformLabel}
                  </p>
                </div>
                <Button
                  className="text-sm font-medium text-gray-600 dark:text-gray-100"
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(selectedCode, "primary")}
                >
                  {copiedBlock === "primary" ? "Copied" : "Copy"}
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                {type === "frameworks" ? (
                  "Add this component near your app shell or root layout."
                ) : type === "wordpress" ? (
                  "Paste this snippet into your active theme's functions.php file, or a small site-specific plugin."
                ) : type === "agent" ? (
                  "Copy the full prompt below and paste it into your coding agent"
                ) : (
                  <>
                    Add this code to your HTML, just before the closing{" "}
                    <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-[10px] dark:bg-gray-800">
                      &lt;/body&gt;
                    </code>{" "}
                    tag
                  </>
                )}
              </p>
            </div>
            <div className="grid w-full min-w-0 overflow-hidden">
              <CodeBlock
                value={selectedLanguage}
                data={[
                  {
                    code: selectedCode,
                    language: selectedLanguage,
                    filename: selectedFilename,
                  },
                ]}
                defaultValue={selectedLanguage}
              >
                <CodeBlockHeader>
                  <CodeBlockFiles>
                    {(item) => (
                      <CodeBlockFilename
                        key={item.language}
                        value={item.language}
                      >
                        {item.filename}
                      </CodeBlockFilename>
                    )}
                  </CodeBlockFiles>
                </CodeBlockHeader>
                <CodeBlockBody
                  className={cn(
                    type === "agent" ? "h-80" : "h-32",
                    "overflow-y-auto hide-scrollbar",
                  )}
                >
                  {(item) => (
                    <CodeBlockItem key={item.language} value={item.language}>
                      <CodeBlockContent
                        language={item.language as BundledLanguage}
                      >
                        {item.code}
                      </CodeBlockContent>
                    </CodeBlockItem>
                  )}
                </CodeBlockBody>
              </CodeBlock>
            </div>
            {type === "frameworks" ? (
              <>
                <div className="mt-5 grid w-full min-w-0 overflow-hidden">
                  <div className="mb-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <VueIcon className="size-5" />
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Vue.js app
                        </p>
                      </div>
                      <Button
                        className="text-sm font-medium text-gray-600 dark:text-gray-100"
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(vueCode, "vue")}
                      >
                        {copiedBlock === "vue" ? "Copied" : "Copy"}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Add this component near your app shell or root layout.
                    </p>
                  </div>
                  <CodeBlock
                    value="vue"
                    data={[
                      {
                        code: vueCode,
                        language: "vue",
                        filename: "BizmeComments.vue",
                      },
                    ]}
                    defaultValue="vue"
                  >
                    <CodeBlockHeader>
                      <CodeBlockFiles>
                        {(item) => (
                          <CodeBlockFilename
                            key={item.language}
                            value={item.language}
                          >
                            {item.filename}
                          </CodeBlockFilename>
                        )}
                      </CodeBlockFiles>
                    </CodeBlockHeader>
                    <CodeBlockBody className="h-32 overflow-y-auto hide-scrollbar">
                      {(item) => (
                        <CodeBlockItem
                          key={item.language}
                          value={item.language}
                        >
                          <CodeBlockContent
                            language={item.language as BundledLanguage}
                          >
                            {item.code}
                          </CodeBlockContent>
                        </CodeBlockItem>
                      )}
                    </CodeBlockBody>
                  </CodeBlock>
                </div>
                <div className="mt-5 grid w-full min-w-0 overflow-hidden">
                  <div className="mb-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <SvelteIcon className="size-5" />
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Svelte app
                        </p>
                      </div>
                      <Button
                        className="text-sm font-medium text-gray-600 dark:text-gray-100"
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(svelteCode, "svelte")}
                      >
                        {copiedBlock === "svelte" ? "Copied" : "Copy"}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Add this component to your root layout or top-level page.
                    </p>
                  </div>
                  <CodeBlock
                    value="svelte"
                    data={[
                      {
                        code: svelteCode,
                        language: "svelte",
                        filename: "BizmeComments.svelte",
                      },
                    ]}
                    defaultValue="svelte"
                  >
                    <CodeBlockHeader>
                      <CodeBlockFiles>
                        {(item) => (
                          <CodeBlockFilename
                            key={item.language}
                            value={item.language}
                          >
                            {item.filename}
                          </CodeBlockFilename>
                        )}
                      </CodeBlockFiles>
                    </CodeBlockHeader>
                    <CodeBlockBody className="h-32 overflow-y-auto hide-scrollbar">
                      {(item) => (
                        <CodeBlockItem
                          key={item.language}
                          value={item.language}
                        >
                          <CodeBlockContent
                            language={item.language as BundledLanguage}
                          >
                            {item.code}
                          </CodeBlockContent>
                        </CodeBlockItem>
                      )}
                    </CodeBlockBody>
                  </CodeBlock>
                </div>
              </>
            ) : null}
            {type === "wordpress" ? (
              <div className="mt-5 grid w-full min-w-0 overflow-hidden">
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Alternative: site-specific plugin
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Create a file like{" "}
                    <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-[10px] dark:bg-gray-800">
                      bizme-comments.php
                    </code>
                    , upload it to{" "}
                    <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-[10px] dark:bg-gray-800">
                      wp-content/plugins
                    </code>
                    , then activate it in WordPress.
                  </p>
                </div>
                <CodeBlock
                  value="php"
                  data={[
                    {
                      code: wordpressPluginCode,
                      language: "php",
                      filename: "bizme-comments.php",
                    },
                  ]}
                  defaultValue="php"
                >
                  <CodeBlockHeader>
                    <CodeBlockFiles>
                      {(item) => (
                        <CodeBlockFilename
                          key={item.language}
                          value={item.language}
                        >
                          {item.filename}
                        </CodeBlockFilename>
                      )}
                    </CodeBlockFiles>
                  </CodeBlockHeader>
                  <CodeBlockBody className="h-32 overflow-y-auto hide-scrollbar">
                    {(item) => (
                      <CodeBlockItem key={item.language} value={item.language}>
                        <CodeBlockContent
                          language={item.language as BundledLanguage}
                        >
                          {item.code}
                        </CodeBlockContent>
                      </CodeBlockItem>
                    )}
                  </CodeBlockBody>
                </CodeBlock>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
};
