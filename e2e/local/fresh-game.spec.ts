import { expect, test } from "@playwright/test";

import { destinationCount, expectTurn, gotoLocal } from "../helpers/game.js";

test.beforeEach(async ({ context }) => {
  await context.clearCookies();
});

test("fresh local game starts with blue's turn and shows destinations on selection", async ({
  page,
}) => {
  await page.addInitScript(() => {
    try {
      localStorage.clear();
    } catch {
      /* ignore */
    }
  });
  await gotoLocal(page);
  await page.getByTestId("reset-game").click();

  await expectTurn(page, "blue");

  // Click the first selectable (enabled) piece button
  await page
    .locator('button[data-testid^="piece-blue-plane-"]:not([disabled])')
    .first()
    .click();
  await expect.poll(() => destinationCount(page)).toBeGreaterThan(0);
});

test("making a move flips the turn from blue to red", async ({ page }) => {
  await page.addInitScript(() => {
    try {
      localStorage.clear();
    } catch {
      /* ignore */
    }
  });
  await gotoLocal(page);
  await page.getByTestId("reset-game").click();
  await expectTurn(page, "blue");

  await page
    .locator('button[data-testid^="piece-blue-plane-"]:not([disabled])')
    .first()
    .click();
  // Use a non-attack ("move") destination so the turn ends.
  const moveDest = page
    .locator('[data-testid^="dest-"][data-testid$="-move"]')
    .first();
  await expect(moveDest).toBeVisible();
  await moveDest.click();

  await expectTurn(page, "red");
});
