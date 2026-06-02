import type { Page, Locator } from "@playwright/test";
import { expect } from "@playwright/test";

// Mirror of src/types/GameState.ts PieceId enum values. Kept as plain strings
// so the e2e harness has no compile-time dependency on src.
export const PieceId = {
  RedShip1: "red-ship-1",
  RedPlane1A: "red-plane-1a",
  RedPlane1B: "red-plane-1b",
  RedShip2: "red-ship-2",
  RedPlane2A: "red-plane-2a",
  RedPlane2B: "red-plane-2b",
  RedShip3: "red-ship-3",
  RedPlane3A: "red-plane-3a",
  RedPlane3B: "red-plane-3b",
  RedShip4: "red-ship-4",
  RedPlane4A: "red-plane-4a",
  RedPlane4B: "red-plane-4b",
  BlueShip1: "blue-ship-1",
  BluePlane1A: "blue-plane-1a",
  BluePlane1B: "blue-plane-1b",
  BlueShip2: "blue-ship-2",
  BluePlane2A: "blue-plane-2a",
  BluePlane2B: "blue-plane-2b",
  BlueShip3: "blue-ship-3",
  BluePlane3A: "blue-plane-3a",
  BluePlane3B: "blue-plane-3b",
  BlueShip4: "blue-ship-4",
  BluePlane4A: "blue-plane-4a",
  BluePlane4B: "blue-plane-4b",
} as const;
export type PieceIdValue = (typeof PieceId)[keyof typeof PieceId];

export type PlayerColor = "red" | "blue";
export type MoveType = "move" | "attack";

export const game = (page: Page): Locator => page.getByTestId("game");

export async function gotoLocal(page: Page): Promise<void> {
  await page.goto("/#/local");
  await expect(game(page)).toBeVisible();
}

export async function gotoOnline(page: Page): Promise<void> {
  await page.goto("/#/online");
}

export async function selectPiece(page: Page, id: PieceIdValue): Promise<void> {
  await page.getByTestId(`piece-${id}`).click();
}

export async function moveTo(
  page: Page,
  x: number,
  y: number,
  moveType: MoveType,
): Promise<void> {
  await page.getByTestId(`dest-${x}-${y}-${moveType}`).click();
}

export async function expectTurn(
  page: Page,
  color: PlayerColor,
): Promise<void> {
  await expect(game(page)).toHaveAttribute("data-turn", color);
}

export async function expectWinner(
  page: Page,
  color: PlayerColor,
): Promise<void> {
  await expect(page.getByTestId("game-over")).toBeVisible();
  await expect(page.getByTestId("game-over")).toHaveAttribute(
    "data-winner",
    color,
  );
}

export async function destinationCount(page: Page): Promise<number> {
  return page.locator('[data-testid^="dest-"]').count();
}
