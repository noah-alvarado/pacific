import { defineConfig, devices } from "@playwright/test";

const PORT = 3000;
const RELAY_PORT = 4444;
const STUN_PORT = 3478;
const BASE_URL = `https://localhost:${PORT}`;
const RELAY_URL = `wss://localhost:${RELAY_PORT}`;
const STUN_URL = `stun:localhost:${STUN_PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "html" : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: BASE_URL,
    ignoreHTTPSErrors: true,
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
  ],
  webServer: [
    // Local Nostr relay for WebRTC signaling so the online test never depends
    // on the public relay network. See e2e/relay/nostr-relay.js.
    {
      command: "node e2e/relay/nostr-relay.js",
      url: `https://localhost:${RELAY_PORT}`,
      env: { RELAY_PORT: String(RELAY_PORT), STUN_PORT: String(STUN_PORT) },
      reuseExistingServer: !process.env.CI,
      ignoreHTTPSErrors: true,
      timeout: 30_000,
    },
    {
      command: "yarn dev",
      url: BASE_URL,
      // Point trystero at the local relay + STUN server for the test run.
      env: {
        VITE_TRYSTERO_RELAY_URLS: RELAY_URL,
        VITE_TRYSTERO_STUN_URL: STUN_URL,
      },
      reuseExistingServer: !process.env.CI,
      ignoreHTTPSErrors: true,
      timeout: 120_000,
    },
  ],
});
