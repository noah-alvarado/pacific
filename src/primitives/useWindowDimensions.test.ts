import { renderHook } from "@solidjs/testing-library";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { useWindowDimensions } from "./useWindowDimensions.js";

function setWindowSize(width: number, height: number) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: width,
  });
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    writable: true,
    value: height,
  });
}

describe("useWindowDimensions", () => {
  const originalWidth = window.innerWidth;
  const originalHeight = window.innerHeight;

  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    setWindowSize(originalWidth, originalHeight);
  });

  test("initial value matches window.innerWidth and window.innerHeight", () => {
    const { result, cleanup } = renderHook(() => useWindowDimensions());
    try {
      expect(result()).toEqual({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    } finally {
      cleanup();
    }
  });

  test("updates on resize event", () => {
    const { result, cleanup } = renderHook(() => useWindowDimensions());

    try {
      setWindowSize(800, 600);
      window.dispatchEvent(new Event("resize"));
      expect(result()).toEqual({ width: 800, height: 600 });

      setWindowSize(1234, 4567);
      window.dispatchEvent(new Event("resize"));
      expect(result()).toEqual({ width: 1234, height: 4567 });
    } finally {
      cleanup();
    }
  });

  test("removes resize listener on cleanup", () => {
    const { result, cleanup } = renderHook(() => useWindowDimensions());

    setWindowSize(500, 300);
    window.dispatchEvent(new Event("resize"));
    expect(result()).toEqual({ width: 500, height: 300 });

    cleanup();

    setWindowSize(555, 333);
    window.dispatchEvent(new Event("resize"));
    // Signal should remain at the value from before cleanup
    expect(result()).toEqual({ width: 500, height: 300 });
  });
});
