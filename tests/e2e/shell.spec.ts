import { expect, test } from "@playwright/test";

test("rama strony: język, nawigacja, tło", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "pl");
  const hrefs = await page.locator("header nav a.navlink").evaluateAll((els) => els.map((e) => e.getAttribute("href")));
  expect(hrefs).toEqual(["/realizacje/", "/co-robimy/", "/o-nas/", "/kontakt/"]);
  await expect(page.locator("header a.cta")).toHaveAttribute("href", "/kontakt/");
  await expect(page.locator("header a.cta")).toHaveText("Umów spotkanie");
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe("rgb(11, 11, 12)");
  await expect(page.locator("footer")).toContainText("biuro@gawra-warszawska.pl");
  await expect(page.locator("footer")).toContainText(String(new Date().getFullYear()));
});

test("rama strony mieści się na telefonie", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  await expect(page.locator("header a.cta")).toBeVisible();
});
