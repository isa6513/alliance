import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

const monorepoRoot = path.resolve(__dirname, "..", "..");

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: { exclude: ["@alliance/shared"] },
  resolve: {
    preserveSymlinks: true,
    alias: [
      {
        find: "@alliance/shared",
        replacement: path.resolve(monorepoRoot, "shared"),
      },
    ],
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3005",
        changeOrigin: true,
        secure: false,
      },
    },
    fs: {
      allow: [".."],
    },
  },
});
