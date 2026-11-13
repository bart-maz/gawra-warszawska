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

test.describe("bez JavaScriptu", () => {
  test.use({ javaScriptEnabled: false });
  test("nawigacja jest widoczna", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("header nav a.navlink").first()).toBeVisible();
  });

  test("menu na telefonie jest zwinięte od pierwszej klatki i rozwija się po kliknięciu", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto("/");
    await expect(page.locator("header a.moblink").first()).toBeHidden();
    await page.locator("header summary").click();
    await expect(page.locator("header a.moblink")).toHaveCount(4);
    await expect(page.locator("header a.moblink").first()).toBeVisible();
  });
});

test("małe czerwone etykiety mają wystarczający kontrast na czarnym tle", async ({ page }) => {
  await page.goto("/");
  const ratio = await page.locator("#klienci .eyebrow").evaluate((el) => {
    const lum = (c: string) => {
      const [r, g, b] = c.match(/\d+/g)!.slice(0, 3).map((v) => { const x = Number(v) / 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const fg = lum(getComputedStyle(el).color), bg = lum(getComputedStyle(document.body).backgroundColor);
    return (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
  });
  expect(ratio).toBeGreaterThanOrEqual(4.5);
});
