import { expect, test } from "@playwright/test";

const visible = (page: import("@playwright/test").Page) => page.locator("#grid .card:visible");

test("lista pokazuje wszystkie 13 realizacji", async ({ page }) => {
  await page.goto("/realizacje/");
  await expect(visible(page)).toHaveCount(13);
  await expect(page.locator("#count")).toHaveText("13 z 13 realizacji");
});

test("filtr typu zapisuje się w adresie", async ({ page }) => {
  await page.goto("/realizacje/");
  await page.getByRole("button", { name: "Konferencje" }).click();
  await expect(page).toHaveURL(/\/realizacje\/\?typ=konferencje$/);
  await expect(visible(page)).toHaveCount(4);
  await expect(page.getByRole("button", { name: "Konferencje" })).toHaveAttribute("aria-pressed", "true");
  const titles = await visible(page).locator("h3").allTextContents();
  expect(titles.sort()).toEqual(["30-lecie Uczelni Techniczno-Handlowej", "Bezpieczny lot", "Dzień Dobry Tchibo", "ProviTV"]);
  await expect(page.locator("#count")).toHaveText("4 z 13 realizacji");
});

test("link z filtrem otwiera przefiltrowaną listę", async ({ page }) => {
  await page.goto("/realizacje/?typ=strefy-promocyjne");
  await expect(visible(page)).toHaveCount(5);
  await expect(page.getByRole("button", { name: "Strefy promocyjne" })).toHaveAttribute("aria-pressed", "true");
});

test("błędna wartość filtra w linku pokazuje wszystko", async ({ page }) => {
  await page.goto("/realizacje/?typ=konferencja");
  await expect(visible(page)).toHaveCount(13);
  await expect(page.getByRole("button", { name: "Wszystkie" })).toHaveAttribute("aria-pressed", "true");
});

test("brak wyników pokazuje komunikat i pozwala wyczyścić filtry", async ({ page }) => {
  await page.goto("/realizacje/?typ=konferencje&klient=samsung");
  await expect(visible(page)).toHaveCount(0);
  await expect(page.locator("#empty")).toBeVisible();
  await expect(page.locator("#empty")).toContainText("Brak realizacji dla tych filtrów");
  await page.getByRole("button", { name: "Pokaż wszystkie" }).click();
  await expect(visible(page)).toHaveCount(13);
  await expect(page).toHaveURL(/\/realizacje\/$/);
});

test("filtry klienta i usługi działają razem z typem", async ({ page }) => {
  await page.goto("/realizacje/");
  await page.locator("#f-klient").selectOption("samsung");
  await expect(visible(page)).toHaveCount(4);
  await expect(page).toHaveURL(/klient=samsung/);
  await page.locator("#f-usluga").selectOption("kontent");
  await expect(visible(page)).toHaveCount(1);
});

test("przycisk wstecz przywraca poprzedni filtr", async ({ page }) => {
  await page.goto("/realizacje/");
  await page.getByRole("button", { name: "Konferencje" }).click();
  await page.getByRole("button", { name: "Festiwale i plenery" }).click();
  await expect(visible(page)).toHaveCount(3);
  await page.goBack();
  await expect(visible(page)).toHaveCount(4);
  await expect(page.getByRole("button", { name: "Konferencje" })).toHaveAttribute("aria-pressed", "true");
});

test("karta prowadzi do podstrony i pokazuje wyróżnik", async ({ page }) => {
  await page.goto("/realizacje/");
  const card = page.locator('#grid .card:has(h3:text-is("Galaxy Campus"))');
  await expect(card.locator("a")).toHaveAttribute("href", "/realizacje/galaxy-campus/");
  await expect(card).toContainText("10 000 uczestników");
  await expect(card).toContainText("Samsung");
});

test("lista mieści się na telefonie", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/realizacje/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
});

test.describe("bez JavaScriptu", () => {
  test.use({ javaScriptEnabled: false });
  test("widać wszystkie realizacje", async ({ page }) => {
    await page.goto("/realizacje/");
    await expect(visible(page)).toHaveCount(13);
  });
});
