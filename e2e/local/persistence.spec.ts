import { expect, test } from "@playwright/test";

import { expectTurn, gotoLocal } from "../helpers/game.js";

const SAVE_KEY = "savedGame-local";

test("local game state persists across reload", async ({ page }) => {
  await gotoLocal(page);
  await page.evaluate((key) => localStorage.removeItem(key), SAVE_KEY);
  await page.getByTestId("reset-game").click();
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
