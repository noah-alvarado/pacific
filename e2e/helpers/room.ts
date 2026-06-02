import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

import { gotoOnline } from "./game.js";

export interface RoomCreds {
  roomId: string;
  password: string;
}

export function uniqueRoomId(prefix = "e2e"): string {
  const rand = globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID().replace(/-/g, "").slice(0, 10)
    : Math.random().toString(36).slice(2, 12);
  return `${prefix}-${rand}`.toUpperCase();
}

export async function hostRoom(
  page: Page,
  roomId: string = uniqueRoomId(),
): Promise<RoomCreds> {
  await gotoOnline(page);
  await page.getByTestId("room-id-input").fill(roomId);
  await page.getByTestId("host-room").click();

  const idEl = page.getByTestId("room-id");
  await expect(idEl).toBeVisible();
  const passEl = page.getByTestId("room-password");
  await expect(passEl).toBeVisible();

  const id = (await idEl.textContent())?.trim() ?? roomId;
  const password = (await passEl.textContent())?.trim() ?? "";
  return { roomId: id, password };
}

export async function joinRoom(
  page: Page,
  { roomId, password }: RoomCreds,
): Promise<void> {
  await gotoOnline(page);
  await page.getByTestId("room-id-input").fill(roomId);
  await page.getByTestId("room-password-input").fill(password);
  await page.getByTestId("join-room").click();
  await expect(page.getByTestId("room-status")).toBeVisible();
}

export async function waitForPeer(page: Page, timeout = 60_000): Promise<void> {
  await expect(page.getByTestId("peers")).toHaveAttribute(
    "data-peer-count",
    /[1-9]\d*/,
    { timeout },
  );
}
