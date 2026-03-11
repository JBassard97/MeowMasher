import { defineConfig } from "vite";

export default defineConfig({
  server: { open: true },
  build: {
    outDir: "dist/web",
    emptyOutDir: true,
    assetsDir: "assets",
  },
});
