import { expect, test } from "@playwright/test";

const viewports = [
  { width: 320, height: 568 },
  { width: 360, height: 640 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
];

for (const viewport of viewports) {
  test(`game shell fits ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");

    const shell = page.locator("[data-game-shell]");
    await expect(shell).toBeVisible();

    const metrics = await page.evaluate(() => ({
      viewportWidth: window.innerWidth,
      pageWidth: document.documentElement.scrollWidth,
    }));

    expect(metrics.pageWidth).toBeLessThanOrEqual(metrics.viewportWidth + 1);

    const box = await shell.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 1);

    if (viewport.width >= 1024) {
      expect(box!.width).toBeLessThanOrEqual(560);
    }
  });
}

test("progress restores after reload", async ({ page }) => {
  await page.goto("/");
  // Replace these test IDs with the game's real controls.
  await page.getByTestId("answer-input").fill("example");
  await page.getByTestId("submit-answer").click();
  await page.reload();
  await expect(page.getByTestId("attempt-history")).not.toBeEmpty();
});
