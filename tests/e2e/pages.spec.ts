import { expect, test } from "@playwright/test";

test("strona główna: hasło, 6 wyróżnionych realizacji, klienci, kontakt", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveText("Kreujemy niebanalne wrażenia");
  await expect(page.locator("h1 em")).toHaveText("niebanalne");
  await expect(page.locator("#wyroznione .card")).toHaveCount(6);
  await expect(page.locator('a[href="/realizacje/"]', { hasText: "Wszystkie realizacje" })).toBeVisible();
  await expect(page.locator(".hero").getByRole("link", { name: "Zobacz realizacje", exact: true })).toHaveAttribute("href", "/realizacje/");
  await expect(page.locator("#klienci li")).toHaveCount(11);
  await expect(page.locator("#co-robimy a[href^='/realizacje/?usluga=']")).toHaveCount(4);
  await expect(page.locator('form[name="spotkanie"]')).toBeVisible();
});

test("co robimy: cztery obszary z linkami do realizacji", async ({ page }) => {
  await page.goto("/co-robimy/");
  await expect(page.locator("main h2.area")).toHaveText(["Eventy", "Scenografia", "Technologia", "Produkcja kontentu"]);
  const hrefs = await page.locator("main a.more").evaluateAll((els) => els.map((e) => e.getAttribute("href")));
  expect(hrefs).toEqual(["/realizacje/?usluga=eventy", "/realizacje/?usluga=scenografia", "/realizacje/?usluga=technologia", "/realizacje/?usluga=kontent"]);
});

test("o nas: pięć osób z zespołu", async ({ page }) => {
  await page.goto("/o-nas/");
  for (const name of ["Dawid Sobieraj", "Aldona Michalak", "Kuba Woźniak", "Piotr Samulski", "Zuza Woś"]) {
    await expect(page.locator("#zespol")).toContainText(name);
  }
});

for (const path of ["/", "/co-robimy/", "/o-nas/"]) {
  test(`${path} nie ma pozostałości po szablonie i mieści się na telefonie`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto(path);
    const text = await page.locator("body").innerText();
    expect(text).not.toMatch(/Brand Strategy|Lorem|undefined/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    await expect(page.locator("h1")).toHaveCount(1);
  });
}
