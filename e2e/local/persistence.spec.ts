import { expect, test } from "@playwright/test";

import { expectTurn, gotoLocal, resetGame } from "../helpers/game.js";

const SAVE_KEY = "savedGame-local";

test("local game state persists across reload", async ({ page }) => {
  await gotoLocal(page);
  await page.evaluate((key) => localStorage.removeItem(key), SAVE_KEY);
  await resetGame(page);
  await expectTurn(page, "blue");

  await page
    .locator('button[data-testid^="piece-blue-plane-"]:not([disabled])')
    .first()
    .click();
  await page
    .locator('[data-testid^="dest-"][data-testid$="-move"]')
    .first()
    .click();
  await expectTurn(page, "red");

  // The save effect is async (it dynamically imports deep-object-diff in dev),
  // so poll until the persisted JSON reflects the post-move turn.
  await expect
    .poll(
      () =>
        page.evaluate((key) => {
          const raw = localStorage.getItem(key);
          if (!raw) return null;
          try {
            return (JSON.parse(raw) as { turn?: string }).turn ?? null;
          } catch {
            return null;
          }
        }, SAVE_KEY),
      { timeout: 5000 },
    )
    .toBe("red");

  await page.reload();
  await expect(page.getByTestId("game")).toBeVisible();
  await expectTurn(page, "red");
});

test("board rotation and upright numbers persist across reload", async ({
  page,
}) => {
  await gotoLocal(page);
  const game = page.getByTestId("game");
  const board = page.locator("#gameBoard");
  await expect(board).not.toHaveAttribute("data-upright-numbers");

  await page.getByTestId("rotate-board-left").click();
  await expect(game).toHaveAttribute("data-rotation", "270");
  await page.getByTestId("game-menu").click();
  await page.getByTestId("upright-numbers").click();
  await expect(page.getByTestId("upright-numbers")).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await expect(board).toHaveAttribute("data-upright-numbers");

  await page.reload();
  await expect(game).toHaveAttribute("data-rotation", "270");
  await expect(board).toHaveAttribute("data-upright-numbers");
});

test("upright pieces forces upright numbers, counter-rotates pieces and persists", async ({
  page,
}) => {
  await gotoLocal(page);
  const board = page.locator("#gameBoard");
  const redShip = page.getByTestId("piece-red-ship-1");
  const numbers = page.getByTestId("upright-numbers");
  const rotate = () => redShip.evaluate((el) => getComputedStyle(el).rotate);

  await page.getByTestId("rotate-board-right").click();
  // red pieces face blue, so they're drawn upside down by default
  expect(await rotate()).toBe("180deg");

  await page.getByTestId("game-menu").click();
  await page.getByTestId("upright-pieces").click();
  await expect(board).toHaveAttribute("data-upright-pieces");
  await expect(board).toHaveAttribute("data-upright-numbers");
  await expect(numbers).toBeDisabled();
  await expect(numbers).toHaveAttribute("aria-checked", "true");
  // cancels the board's quarter turn so the piece reads upright on screen
  expect(await rotate()).toBe("-90deg");

  await page.reload();
  await expect(board).toHaveAttribute("data-upright-pieces");
  await expect(board).toHaveAttribute("data-upright-numbers");

  // turning it off restores the separate upright numbers choice (off)
  await page.getByTestId("game-menu").click();
  await page.getByTestId("upright-pieces").click();
  await expect(board).not.toHaveAttribute("data-upright-pieces");
  await expect(board).not.toHaveAttribute("data-upright-numbers");
  await expect(numbers).toBeEnabled();
});

test("theme choice persists across reload", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await gotoLocal(page);
  const html = page.locator("html");
  await expect(html).toHaveAttribute("data-theme", "light");

  await page.getByLabel("Switch to dark mode").click();
  await expect(html).toHaveAttribute("data-theme", "dark");

  await page.reload();
  await expect(html).toHaveAttribute("data-theme", "dark");
});

test("settings saved by older versions are migrated", async ({ page }) => {
  await gotoLocal(page);
  await page.evaluate(() => {
    localStorage.removeItem("preferences");
    localStorage.setItem("boardRotation", "2");
    localStorage.setItem("uprightNumbers", "true");
  });

  await page.reload();
  await expect(page.getByTestId("game")).toHaveAttribute(
    "data-rotation",
    "180",
  );
  await expect(page.locator("#gameBoard")).toHaveAttribute(
    "data-upright-numbers",
  );
  expect(
    await page.evaluate(() => localStorage.getItem("boardRotation")),
  ).toBeNull();
});

test("corrupt local save is cleared on load", async ({ page }) => {
  await page.addInitScript(
    ({ key }) => {
      try {
        localStorage.clear();
        localStorage.setItem(key, "{not valid json");
      } catch {
        /* ignore */
      }
    },
    { key: SAVE_KEY },
  );
  await gotoLocal(page);
  await expect(page.getByTestId("game")).toBeVisible();

  const after = await page.evaluate(
    (key) => localStorage.getItem(key),
    SAVE_KEY,
  );
  expect(after === null || after !== "{not valid json").toBe(true);
});
