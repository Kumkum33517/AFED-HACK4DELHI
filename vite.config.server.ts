import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "server/node-build.ts"),
      name: "server",
      fileName: "production",
      formats: ["es"],
    },
    outDir: "dist/server",
    target: "node22",
    ssr: true,
    rollupOptions: {
      external: [
        // Node built-ins
        /^node:/,
        "fs", "path", "url", "http", "https", "os", "crypto",
        "stream", "util", "events", "buffer", "querystring", "child_process",
        // All npm deps — don't bundle, resolve at runtime
        "express", "cors", "dotenv", "exceljs",
        "dotenv/config",
      ],
      output: {
        format: "es",
        entryFileNames: "[name].mjs",
      },
    },
    minify: false,
    sourcemap: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  define: {
    "process.env.NODE_ENV": '"production"',
  },
});
