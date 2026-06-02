import { describe, expect, test } from "vitest";

import {
  iconForPiece,
  playerColorToHex,
  positionStyle,
} from "./GamePiece.util.js";

describe("positionStyle", () => {
  test("computes top-right corner offsets for an even row", () => {
    const style = positionStyle({ x: 0, y: 0 }, { size: 50 });
    expect(style.position).toBe("absolute");
    // top-right: intersectionX = (0*2 + 1) * 79, intersectionY = 0 * 79
    // left = 79 - 25 + 40 + 1.5 = 95.5
    // top = 0 - 25 + 40 + 1.5 = 16.5
    expect(style.left).toBe("95.5px");
    expect(style.top).toBe("16.5px");
  });

  test("computes top-left corner offsets for an odd row", () => {
    const style = positionStyle({ x: 1, y: 1 }, { size: 50 });
    // top-left: intersectionX = 1 * 2 * 79 = 158, intersectionY = 1 * 79 = 79
    // left = 158 - 25 + 40 + 1.5 = 174.5
    // top  = 79  - 25 + 40 + 1.5 = 95.5
    expect(style.left).toBe("174.5px");
    expect(style.top).toBe("95.5px");
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
