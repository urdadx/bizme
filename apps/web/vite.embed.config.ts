import { fileURLToPath, URL } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    lib: {
      entry: "src/widget-embed.tsx",
      formats: ["iife"],
      name: "BizmeWidget",
      fileName: () => "widget-embed.js",
    },
    outDir: "dist/embed",
    emptyOutDir: true,
    cssCodeSplit: false,
    sourcemap: true,
    minify: "esbuild",
    rollupOptions: {
      output: {
        exports: "named",
        assetFileNames: "widget-embed.css",
        inlineDynamicImports: true,
      },
    },
  },
});
