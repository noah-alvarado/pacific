import { expect, test } from "@playwright/test";

import { game } from "../helpers/game.js";
import {
  hostRoom,
  joinRoom,
  uniqueRoomId,
  waitForPeer,
} from "../helpers/room.js";

test.describe.configure({ mode: "serial" });

// Firefox under Playwright does not gather any WebRTC ICE candidates (its ICE
// agent never leaves the "new" gathering state), so a real peer-to-peer
// connection cannot be established in automation regardless of signaling. The
// P2P path is exercised on Chromium, which connects via the local relay.
test.skip(
  ({ browserName }) => browserName === "firefox",
  "Firefox does not gather WebRTC ICE candidates under Playwright automation.",
);

test("two clients connect, negotiate, and a move propagates peer-to-peer", async ({
  browser,
}) => {
  test.slow();

  const hostCtx = await browser.newContext({ ignoreHTTPSErrors: true });
  const guestCtx = await browser.newContext({ ignoreHTTPSErrors: true });
  const hostPage = await hostCtx.newPage();
  const guestPage = await guestCtx.newPage();

  try {
    const roomId = uniqueRoomId();
    const creds = await hostRoom(hostPage, roomId);
    expect(creds.password.length).toBeGreaterThan(0);

    await joinRoom(guestPage, creds);

    // Both clients connect via WebRTC
    await waitForPeer(hostPage);
    await waitForPeer(guestPage);

    // Negotiation completes and both render the Game component
    await expect(game(hostPage)).toBeVisible({ timeout: 60_000 });
    await expect(game(guestPage)).toBeVisible({ timeout: 60_000 });

    // Roles assigned deterministically; one is blue, one is red
    const hostPlayer = await game(hostPage).getAttribute("data-player");
    const guestPlayer = await game(guestPage).getAttribute("data-player");
    expect(new Set([hostPlayer, guestPlayer])).toEqual(
      new Set(["red", "blue"]),
    );

    const bluePage = hostPlayer === "blue" ? hostPage : guestPage;
    const redPage = bluePage === hostPage ? guestPage : hostPage;

    // Both clients start on blue's turn
    await expect(game(bluePage)).toHaveAttribute("data-turn", "blue");
    await expect(game(redPage)).toHaveAttribute("data-turn", "blue");

    // Blue picks any selectable plane and makes a non-attack move
    const bluePiece = bluePage
      .locator('button[data-testid^="piece-blue-plane-"]:not([disabled])')
      .first();
    await expect(bluePiece).toBeVisible({ timeout: 10_000 });
    const movedPieceId = (await bluePiece.getAttribute("data-testid"))!.replace(
      "piece-",
      "",
    );
    const startPos = await bluePiece.getAttribute("data-position");
    await bluePiece.click();

    const firstDest = bluePage
      .locator('[data-testid^="dest-"][data-testid$="-move"]')
      .first();
    await expect(firstDest).toBeVisible({ timeout: 10_000 });
    const destTestId = (await firstDest.getAttribute("data-testid"))!;
    // dest-{x}-{y}-move
    const [, xStr, yStr] = destTestId.split("-");
    const expectedPos = `${xStr},${yStr}`;
    await firstDest.click();

    // The piece we moved should now be at the destination on the local (blue) side
    await expect(bluePage.getByTestId(`piece-${movedPieceId}`)).toHaveAttribute(
      "data-position",
      expectedPos,
      { timeout: 10_000 },
    );
    expect(expectedPos).not.toBe(startPos);

    // ...and should propagate to the red peer over WebRTC within a few seconds
    await expect(redPage.getByTestId(`piece-${movedPieceId}`)).toHaveAttribute(
      "data-position",
      expectedPos,
      { timeout: 30_000 },
    );
  } finally {
    await hostCtx.close();
    await guestCtx.close();
  }
});
