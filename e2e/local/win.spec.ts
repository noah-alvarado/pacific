import { expect, test } from "@playwright/test";

import {
  expectWinner,
  gotoLocal,
  PieceId,
  selectPiece,
} from "../helpers/game.js";

// Uses the dev-only ONE_MOVE_TO_WIN seed button. Both players have a single
// kamikaze with exactly one valid move that ends the game.
test("blue wins in one move from ONE_MOVE_TO_WIN seed", async ({ page }) => {
  await page.addInitScript(() => {
    try {
      localStorage.clear();
    } catch {
      /* ignore */
    }
  });
  await gotoLocal(page);
  await page.getByTestId("seed-one-move-to-win").click();

  // Default fresh-state turn is blue, and ONE_MOVE_TO_WIN preserves that.
  await selectPiece(page, PieceId.BluePlane1A);

  const dests = page.locator('[data-testid^="dest-"]');
  // Comment in constants/game.ts: "the only available move" — exactly one.
  await expect(dests).toHaveCount(1);
  await dests.first().click();

  await expectWinner(page, "blue");
});
