import { expect, test } from "@playwright/test";

import { gotoLocal, PieceId, resetGame } from "../helpers/game.js";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      localStorage.clear();
    } catch {
      /* ignore */
    }
  });
});

test("board fits a phone viewport and every piece is clickable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await gotoLocal(page);

  const board = await page.locator("#gameBoard").boundingBox();
  expect(board).not.toBeNull();
  expect(Math.abs(board!.width - board!.height)).toBeLessThanOrEqual(1);
  expect(board!.x).toBeGreaterThanOrEqual(0);
  expect(board!.x + board!.width).toBeLessThanOrEqual(375);

  for (const piece of await page.locator('[data-testid^="piece-"]').all()) {
    await expect(piece).toBeInViewport();
  }
  await page
    .locator('[data-testid^="piece-blue-"]:not([disabled])')
    .first()
    .click();
  await expect(page.locator('[data-testid^="dest-"]').first()).toBeVisible();
});

test("rotate turns the board in quarter turns without changing game coordinates", async ({
  page,
}) => {
  await gotoLocal(page);
  const game = page.getByTestId("game");
  const board = page.locator("#gameBoard");
  const ship = page.getByTestId(`piece-${PieceId.RedShip1}`);
  const position = await ship.getAttribute("data-position");
  const center = async () => {
    const b = (await board.boundingBox())!;
    const s = (await ship.boundingBox())!;
    return {
      dx: s.x + s.width / 2 - (b.x + b.width / 2),
      dy: s.y + s.height / 2 - (b.y + b.height / 2),
    };
  };

  // red starts top-left and faces down the board
  const start = await center();
  expect(start.dx).toBeLessThan(0);
  expect(start.dy).toBeLessThan(0);
  await expect(ship).toHaveCSS("rotate", "180deg");

  await page.getByTestId("rotate-board-right").click();
  await expect(game).toHaveAttribute("data-rotation", "90");
  const right = await center();
  expect(right.dx).toBeGreaterThan(0);
  expect(right.dy).toBeLessThan(0);
  expect(await ship.getAttribute("data-position")).toBe(position);

  // the board's dots rotate with it, so a piece still selects and moves
  await page
    .locator('[data-testid^="piece-blue-"]:not([disabled])')
    .first()
    .click();
  await expect(page.locator('[data-testid^="dest-"]').first()).toBeVisible();

  await page.getByTestId("rotate-board-left").click();
  await page.getByTestId("rotate-board-left").click();
  await expect(game).toHaveAttribute("data-rotation", "270");
  const left = await center();
  expect(left.dx).toBeLessThan(0);
  expect(left.dy).toBeGreaterThan(0);
  await expect(page.getByTestId("player-card-red")).toBeInViewport();
});

test("undo reverts the last move and its turn change", async ({ page }) => {
  await gotoLocal(page);
  const undo = page.getByTestId("undo-move");
  await expect(undo).toBeDisabled();

  const plane = page.getByTestId(`piece-${PieceId.BluePlane1B}`);
  await plane.click();
  await page
    .locator('[data-testid^="dest-"][data-testid$="-move"]')
    .first()
    .click();
  await expect(page.getByTestId("game")).toHaveAttribute("data-turn", "red");
  await expect(plane).not.toHaveAttribute("data-position", "0,5");

  await undo.click();
  await expect(plane).toHaveAttribute("data-position", "0,5");
  await expect(page.getByTestId("game")).toHaveAttribute("data-turn", "blue");
  await expect(undo).toBeDisabled();
});

test("reset asks for confirmation and cancel keeps the game", async ({
  page,
}) => {
  await gotoLocal(page);
  await page
    .locator('[data-testid^="piece-blue-plane-"]:not([disabled])')
    .first()
    .click();
  await page
    .locator('[data-testid^="dest-"][data-testid$="-move"]')
    .first()
    .click();
  await expect(page.getByTestId("game")).toHaveAttribute("data-turn", "red");

  await page.getByTestId("reset-game").click();
  await page.getByTestId("confirm-cancel").click();
  await expect(page.getByTestId("game")).toHaveAttribute("data-turn", "red");

  await resetGame(page);
  await expect(page.getByTestId("game")).toHaveAttribute("data-turn", "red");
  for (const plane of await page
    .locator('[data-testid^="piece-blue-plane-"][data-testid$="b"]')
    .all()) {
    await expect(plane).toHaveAttribute("data-position", /^\d,5$/);
  }
});
