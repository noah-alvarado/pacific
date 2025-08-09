/// <reference types="vitest" />
/// <reference types="vite-plugin-solid-svg/types-component-solid" />
/// <reference types="vite/client" />
/// <reference types="@types/node" />

import { defineConfig, loadEnv } from "vite";

import solidPlugin from "vite-plugin-solid";
import solidSvg from "vite-plugin-solid-svg";
import mkcert from "vite-plugin-mkcert";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    base: env.VITE_GITHUB_PAGES ? "/pacific/" : "/",
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
      setupFiles: ["node_modules/@testing-library/jest-dom/vitest"],
      isolate: false,
      coverage: {
        enabled: true,
        include: ["src/**/*.{ts,tsx}"],
      },
    },
  };
});
