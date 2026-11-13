import { expect, test } from "@playwright/test";

test("formularz spotkania jest gotowy dla Netlify", async ({ page }) => {
  await page.goto("/kontakt/");
  const form = page.locator('form[name="spotkanie"]');
  await expect(form).toHaveAttribute("data-netlify", "true");
  await expect(form).toHaveAttribute("method", /post/i);
  await expect(form).toHaveAttribute("action", "/dziekujemy/");
  await expect(form.locator('input[name="form-name"]')).toHaveValue("spotkanie");
  for (const n of ["imie", "firma", "email", "telefon", "wiadomosc", "realizacja"]) await expect(form.locator(`[name="${n}"]`)).toHaveCount(1);
  await expect(form.locator('[name="imie"]')).toHaveAttribute("required", "");
  await expect(form.locator('[name="email"]')).toHaveAttribute("type", "email");
  await expect(form.getByRole("button", { name: "Wyślij zgłoszenie" })).toBeVisible();
  await expect(page.locator("main")).toContainText("dawid@gawra-warszawska.pl");
  await expect(page.locator("main")).toContainText("604 774 276");
});

test("wejście z podstrony realizacji podpowiada, czego dotyczy zapytanie", async ({ page }) => {
  await page.goto("/kontakt/?realizacja=provitv");
  await expect(page.locator('[name="realizacja"]')).toHaveValue("provitv");
  await expect(page.locator("#dotyczy")).toBeVisible();
  await expect(page.locator("#dotyczy")).toHaveText("Zapytanie dotyczy realizacji: ProviTV");
});

test("nieznana realizacja w adresie jest ignorowana", async ({ page }) => {
  await page.goto("/kontakt/?realizacja=%3Cscript%3Ealert(1)%3C/script%3E");
  await expect(page.locator('[name="realizacja"]')).toHaveValue("");
  await expect(page.locator("#dotyczy")).toBeHidden();
});

test("pusty formularz nie zostaje wysłany", async ({ page }) => {
  await page.goto("/kontakt/");
  await page.getByRole("button", { name: "Wyślij zgłoszenie" }).click();
  await expect(page).toHaveURL(/\/kontakt\/$/);
});

test("strona podziękowania", async ({ page }) => {
  await page.goto("/dziekujemy/");
  await expect(page.locator("h1")).toHaveText("Dziękujemy");
  await expect(page.locator('main a[href="/realizacje/"]')).toBeVisible();
});
