import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 3001,
  },
  preview: {
    allowedHosts: [
      "bizme.urdadx.com",
      "bizme-api.urdadx.com",
      "bizme-web-mbyjct-592f93-91-98-78-138.traefik.me",
    ],
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [tailwindcss(), tanstackStart(), viteReact()],
});
