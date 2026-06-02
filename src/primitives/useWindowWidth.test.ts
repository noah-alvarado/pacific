import { renderHook } from "@solidjs/testing-library";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { useWindowWidth } from "./useWindowWidth.js";

describe("useWindowWidth", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  test("initial value matches window.innerWidth", () => {
    const { result, cleanup } = renderHook(() => useWindowWidth());
    try {
      expect(result()).toBe(window.innerWidth);
    } finally {
      cleanup();
    }
  });

  test("updates on resize event", () => {
    const { result, cleanup } = renderHook(() => useWindowWidth());

    try {
      (window as unknown as { innerWidth: number }).innerWidth = 800;
      window.dispatchEvent(new Event("resize"));
      expect(result()).toBe(800);

      (window as unknown as { innerWidth: number }).innerWidth = 1234;
      window.dispatchEvent(new Event("resize"));
      expect(result()).toBe(1234);
    } finally {
      cleanup();
    }
  });

  test("removes resize listener on cleanup", () => {
    const { result, cleanup } = renderHook(() => useWindowWidth());

    (window as unknown as { innerWidth: number }).innerWidth = 500;
    window.dispatchEvent(new Event("resize"));
    expect(result()).toBe(500);

    cleanup();

    (window as unknown as { innerWidth: number }).innerWidth = 999;
    window.dispatchEvent(new Event("resize"));
    // Signal should remain at the value from before cleanup
    expect(result()).toBe(500);
  });
});
