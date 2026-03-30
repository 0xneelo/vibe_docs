import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const pagesBasePath =
  process.env.VITE_BASE_PATH ??
  (process.env.GITHUB_ACTIONS === "true" ? "/vibe_docs/" : "/");

export default defineConfig({
  base: pagesBasePath,
  plugins: [react()],
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
