import { cleanup } from "@solidjs/testing-library";
import { afterEach } from "vitest";

// jsdom does not implement matchMedia; provide a benign default that returns
// `matches: false` so providers (Theme, Header) can render in tests without
// each suite reaching for vi.stubGlobal. Tests that need a different value
// should still stub it explicitly.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

// Globals are off, so testing-library's auto-cleanup hook isn't installed.
// With `isolate: false`, DOM bleeds across tests and queries find stale nodes.
afterEach(() => cleanup());
