import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { defineConfig } from "vite";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const isStorybook =
  process.env.STORYBOOK === "true" ||
  process.argv.some((a) => a.includes("storybook"));

const monorepoRoot = path.resolve(__dirname, "..", "..");
const sharedPkg = path.resolve(monorepoRoot, "shared");

// https://vite.dev/config/
export default defineConfig({
  plugins: [!isStorybook && reactRouter(), tailwindcss()],
  optimizeDeps: {
    exclude: ["@alliance/shared"],
  },
  build: {
    sourcemap: true,
  },
  server: {
    watch: {
      usePolling: true,
      interval: 100,
    },
    proxy: {
      "/api": {
        target: "http://localhost:3005",
        changeOrigin: true,
        secure: false,
      },
    },
    fs: {
      allow: [monorepoRoot, sharedPkg],
    },
  },
  ssr: {
    noExternal: ["posthog-js", "posthog-js/react", "@alliance/shared"],
  },
  resolve: {
    preserveSymlinks: true,
    dedupe: ["react", "react-dom"],
    alias: [
      {
        find: "three/webgpu",
        replacement: path.resolve(
          __dirname,
          "../../node_modules/globe.gl/node_modules/three/build/three.webgpu.js"
        ),
      },
      {
        find: "three/tsl",
        replacement: path.resolve(
          __dirname,
          "../../node_modules/globe.gl/node_modules/three/build/three.tsl.js"
        ),
      },
      {
        find: "three",
        replacement: path.resolve(
          __dirname,
          "../../node_modules/globe.gl/node_modules/three"
        ),
      },
      {
        find: "@alliance/shared",
        replacement: path.resolve(monorepoRoot, "shared"),
      },
    ],
  },
});
