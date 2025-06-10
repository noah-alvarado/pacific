/// <reference types="vitest" />
/// <reference types="vite-plugin-solid-svg/types-component-solid" />
/// <reference types="vite/client" />

import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import solidSvg from 'vite-plugin-solid-svg'

export default defineConfig({
  base: import.meta.env.GITHUB_PAGES ? '/pacific/' : '/',
  plugins: [
    solidPlugin(),
    solidSvg(),
  ],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
  resolve: {
    conditions: ['development', 'browser'],
  },
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['node_modules/@testing-library/jest-dom/vitest'],
    isolate: false,
    coverage: {
      enabled: true,
      include: ['src/**/*.{ts,tsx}'],
    }
  },
});
