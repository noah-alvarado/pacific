/// <reference types="vitest" />
/// <reference types="vite-plugin-solid-svg/types-component-solid" />
/// <reference types="vite/client" />
/// <reference types="@types/node" />

import { defineConfig } from "vite";
import mkcert from "vite-plugin-mkcert";
import solidPlugin from "vite-plugin-solid";
import solidSvg from "vite-plugin-solid-svg";

export default defineConfig(({ mode }) => {
  return {
    cacheDir: process.env.E2E_VITE_CACHE_DIR ?? "node_modules/.vite",
    plugins: [
      solidPlugin(),
      solidSvg(),
      // @ts-ignore
      mkcert(),
    ],
    server: {
      port: 3000,
    },
    build: {
      target: "es2020",
    },
    resolve: {
      conditions: [
        "browser",
        mode === "development" ? "development" : "production",
      ],
    },
    test: {
      environment: "jsdom",
      globals: false,
      setupFiles: [
        "node_modules/@testing-library/jest-dom/vitest",
        "src/test/setup.ts",
      ],
      include: ["src/**/*.test.{ts,tsx}"],
      coverage: {
        enabled: true,
        include: ["src/**/*.{ts,tsx}"],
        exclude: [
          "src/**/*.test.{ts,tsx}",
          "src/test/**",
          "src/types/GameEvents.ts",
          "src/types/GameConfig.ts",
          "src/index.tsx",
          "src/AppRouter.tsx",
        ],
        reporter: ["text", "html", "json-summary"],
        thresholds: {
          perFile: true,
          lines: 90,
          functions: 90,
          branches: 85,
          statements: 90,
        },
      },
    },
  };
});
