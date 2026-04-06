import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const pagesBasePath =
  process.env.VITE_BASE_PATH ??
  (process.env.GITHUB_ACTIONS === "true" ? "/vibe_docs/" : "/");

export default defineConfig({
  base: pagesBasePath,
  plugins: [react()],
  server: {
    // Listen on LAN (0.0.0.0) so phones/tablets on the same Wi‑Fi can open the dev URL.
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "site",
    emptyOutDir: true,
  },
});
