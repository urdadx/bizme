import { defineConfig } from "rolldown";

export default defineConfig({
  input: "src/sdk.ts",
  output: {
    file: "dist/sdk.js",
    format: "iife",
    name: "BizmeCommentWidget",
    sourcemap: true,
  },
});
