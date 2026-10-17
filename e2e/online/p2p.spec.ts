import { type Browser, expect, type Page, test } from "@playwright/test";

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

async function connectPlayers(browser: Browser) {
  const hostCtx = await browser.newContext({ ignoreHTTPSErrors: true });
  const guestCtx = await browser.newContext({ ignoreHTTPSErrors: true });
  const hostPage = await hostCtx.newPage();
  const guestPage = await guestCtx.newPage();
  const close = async () => {
    await hostCtx.close();
    await guestCtx.close();
  };

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
    return { bluePage, redPage, close };
  } catch (e) {
    await close();
    throw e;
  }
}

async function makeBlueMove(bluePage: Page) {
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
  expect(expectedPos).not.toBe(startPos);
  return { movedPieceId, expectedPos };
}

async function expectOwnPiecesAtBottom(page: Page, player: "red" | "blue") {
  const opponent = player === "red" ? "blue" : "red";
  const own = await page.getByTestId(`piece-${player}-ship-1`).boundingBox();
  const theirs = await page
    .getByTestId(`piece-${opponent}-ship-1`)
    .boundingBox();
  expect(own!.y).toBeGreaterThan(theirs!.y);
}

test("two clients connect, negotiate, and a move propagates peer-to-peer", async ({
  browser,
}) => {
  test.slow();

  const { bluePage, redPage, close } = await connectPlayers(browser);

  try {
    // Both clients start on blue's turn
    await expect(game(bluePage)).toHaveAttribute("data-turn", "blue");
    await expect(game(redPage)).toHaveAttribute("data-turn", "blue");

    // Blue picks any selectable plane and makes a non-attack move
    const { movedPieceId, expectedPos } = await makeBlueMove(bluePage);

    // The piece we moved should now be at the destination on the local (blue) side
    await expect(bluePage.getByTestId(`piece-${movedPieceId}`)).toHaveAttribute(
      "data-position",
      expectedPos,
      { timeout: 10_000 },
    );

    // ...and should propagate to the red peer over WebRTC within a few seconds
    await expect(redPage.getByTestId(`piece-${movedPieceId}`)).toHaveAttribute(
      "data-position",
      expectedPos,
      { timeout: 30_000 },
    );
  } finally {
    await close();
  }
});

test("each player starts with their own pieces at the bottom and board settings stay local", async ({
  browser,
}) => {
  test.slow();

  const { bluePage, redPage, close } = await connectPlayers(browser);

  try {
    await expect(game(bluePage)).toHaveAttribute("data-rotation", "0");
    await expect(game(redPage)).toHaveAttribute("data-rotation", "180");
    await expectOwnPiecesAtBottom(bluePage, "blue");
    await expectOwnPiecesAtBottom(redPage, "red");

    await redPage.getByTestId("rotate-board-right").click();
    await redPage.getByTestId("game-menu").click();
    await redPage.getByTestId("upright-pieces").click();
    await expect(game(redPage)).toHaveAttribute("data-rotation", "270");
    await expect(redPage.locator("#gameBoard")).toHaveAttribute(
      "data-upright-pieces",
    );

    // a move still syncs, but neither player's view changes the other's
    const { movedPieceId, expectedPos } = await makeBlueMove(bluePage);
    await expect(redPage.getByTestId(`piece-${movedPieceId}`)).toHaveAttribute(
      "data-position",
      expectedPos,
      { timeout: 30_000 },
    );
    await expect(game(redPage)).toHaveAttribute("data-rotation", "270");
    await expect(game(bluePage)).toHaveAttribute("data-rotation", "0");
    await expect(bluePage.locator("#gameBoard")).not.toHaveAttribute(
      "data-upright-pieces",
    );

    // the online rotation is saved apart from the local one
    await redPage.goto("/#/local");
    await expect(game(redPage)).toHaveAttribute("data-rotation", "0");
    expect(
      await redPage.evaluate(
        () =>
          (
            JSON.parse(localStorage.getItem("preferences")!) as {
              boardRotation: unknown;
            }
          ).boardRotation,
      ),
    ).toEqual({ local: 0, online: 1 });
  } finally {
    await close();
  }
});
