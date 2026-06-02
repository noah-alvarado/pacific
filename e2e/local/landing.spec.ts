import { expect, test } from "@playwright/test";

test("landing renders and links to local game", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "PACIFIC" })).toBeVisible();
  await page.getByRole("link", { name: "Start Local Game" }).click();
  await expect(page).toHaveURL(/#\/local$/);
  await expect(page.getByTestId("game")).toBeVisible();
});
