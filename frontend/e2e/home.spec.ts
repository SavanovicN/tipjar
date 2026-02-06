import { expect, test } from "@playwright/test";
import { mockRpc, mockTipLogs } from "@/e2e/mocks/rpc";

async function disableAnimations(page: import("@playwright/test").Page) {
  await page.evaluate(() => {
    document.querySelectorAll('[class*="animate"]').forEach((el) => {
      (el as HTMLElement).style.animation = "none";
    });
  });
}

test.describe("Home Page - Empty State", () => {
  test("light mode", async ({ page }) => {
    await mockRpc(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Support creators")).toBeVisible();
    await expect(
      page.getByLabel("Main navigation").getByRole("button", { name: "Connect Wallet" }),
    ).toBeVisible();

    await disableAnimations(page);

    await expect(page).toHaveScreenshot("home-empty-light.png", { fullPage: true });
  });

  test("dark mode", async ({ page }) => {
    await mockRpc(page);
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Support creators")).toBeVisible();
    await disableAnimations(page);

    await expect(page).toHaveScreenshot("home-empty-dark.png", { fullPage: true });
  });
});

test.describe("Home Page - With Leaderboard", () => {
  test("light mode", async ({ page }) => {
    await mockRpc(page, {
      eth_getLogs: () => mockTipLogs,
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Support creators")).toBeVisible();
    await expect(page.getByText("Total tipped").first()).toBeVisible({ timeout: 10_000 });
    await disableAnimations(page);

    await expect(page).toHaveScreenshot("home-leaderboard-light.png", { fullPage: true });
  });

  test("dark mode", async ({ page }) => {
    await mockRpc(page, {
      eth_getLogs: () => mockTipLogs,
    });
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Support creators")).toBeVisible();
    await expect(page.getByText("Total tipped").first()).toBeVisible({ timeout: 10 * 1000 });
    await disableAnimations(page);

    await expect(page).toHaveScreenshot("home-leaderboard-dark.png", { fullPage: true });
  });
});
