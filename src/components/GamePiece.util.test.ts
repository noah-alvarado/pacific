import { describe, expect, test } from "vitest";

import { gridPoint, playerColorVar, positionStyle } from "./GamePiece.util.js";

describe("gridPoint", () => {
  test("even rows sit on odd grid columns", () => {
    expect(gridPoint({ x: 0, y: 0 })).toEqual({ gx: 1, gy: 0 });
    expect(gridPoint({ x: 3, y: 6 })).toEqual({ gx: 7, gy: 6 });
  });

  test("odd rows sit on even grid columns", () => {
    expect(gridPoint({ x: 0, y: 1 })).toEqual({ gx: 0, gy: 1 });
    expect(gridPoint({ x: 3, y: 7 })).toEqual({ gx: 6, gy: 7 });
  });

  test("flipped rotates the point 180 degrees", () => {
    expect(gridPoint({ x: 0, y: 0 }, true)).toEqual({ gx: 6, gy: 7 });
    expect(gridPoint({ x: 3, y: 7 }, true)).toEqual({ gx: 1, gy: 0 });
  });
});

describe("positionStyle", () => {
  test("exposes the grid point as CSS variables", () => {
    expect(positionStyle({ x: 1, y: 1 })).toEqual({ "--gx": 2, "--gy": 1 });
    expect(positionStyle({ x: 1, y: 1 }, true)).toEqual({
      "--gx": 5,
      "--gy": 6,
    });
  });
});

describe("playerColorVar", () => {
  test("returns red var for red", () => {
    expect(playerColorVar("red")).toBe("var(--player-red)");
  });

  test("returns blue var for blue", () => {
    expect(playerColorVar("blue")).toBe("var(--player-blue)");
  });
});
