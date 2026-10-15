import { describe, expect, test } from "vitest";

import {
  gridPoint,
  iconForPiece,
  playerColorToHex,
  positionStyle,
} from "./GamePiece.util.js";

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

describe("iconForPiece", () => {
  test("returns a component for ship", () => {
    expect(iconForPiece("ship")).toBeTypeOf("function");
  });

  test("returns a component for plane", () => {
    expect(iconForPiece("plane")).toBeTypeOf("function");
  });

  test("returns a component for kamikaze", () => {
    expect(iconForPiece("kamikaze")).toBeTypeOf("function");
  });

  test("returns undefined for an unknown type", () => {
    expect(iconForPiece("dragon")).toBeUndefined();
    expect(iconForPiece(undefined)).toBeUndefined();
  });
});

describe("playerColorToHex", () => {
  test("returns red hex for red", () => {
    expect(playerColorToHex("red")).toBe("#FF0000");
  });

  test("returns blue hex for blue", () => {
    expect(playerColorToHex("blue")).toBe("#0000FF");
  });
});
