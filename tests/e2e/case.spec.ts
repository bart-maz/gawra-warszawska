import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";

test("podstrona realizacji z wynikami", async ({ page }) => {
  await page.goto("/realizacje/strefa-galaxy-fun-na-festiwalach/");
  await expect(page.locator("h1")).toHaveText("Strefa Galaxy Fun na festiwalach");
  await expect(page.locator(".stats")).toContainText("30 tys.+");
  await expect(page.locator(".stats")).toContainText("odwiedzających strefę");
  await expect(page.getByRole("heading", { name: "Odpowiedzialność i działania" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Najmocniejsza strona projektu" })).toBeVisible();
  await expect(page.locator("#podobne .card")).toHaveCount(3);
  const cta = page.getByRole("link", { name: "Umów spotkanie w sprawie podobnego projektu" });
  await expect(cta).toHaveAttribute("href", "/kontakt/?realizacja=strefa-galaxy-fun-na-festiwalach");
  await expect(page.locator('.facts a[href="/realizacje/?typ=festiwale"]')).toHaveText("Festiwale i plenery");
  await expect(page.locator('.facts a[href="/realizacje/?usluga=scenografia"]')).toHaveText("Scenografia");
});

test("ProviTV pokazuje 700 uczestników", async ({ page }) => {
  await page.goto("/realizacje/provitv/");
  const body = await page.locator("main").innerText();
  expect(body).toContain("700");
  expect(body).not.toContain("7000");
});

test("realizacja bez wyników, daty i zakresu nie ma pustych sekcji", async ({ page }) => {
  await page.goto("/realizacje/cnk-wieczory-dla-doroslych/");
  await expect(page.locator("h1")).toHaveText("CNK x wieczory dla dorosłych");
  await expect(page.locator(".stats")).toHaveCount(0);
  await expect(page.locator(".facts")).not.toContainText("Data");
  await expect(page.getByRole("heading", { name: "Odpowiedzialność i działania" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Najmocniejsza strona projektu" })).toHaveCount(0);
  const text = await page.locator("body").innerText();
  expect(text).not.toMatch(/undefined|null|NaN/);
});

test("realizacja z jednym zdjęciem nie pokazuje galerii", async ({ page }) => {
  await page.goto("/realizacje/otwarcie-hali-lpp-logistics/");
  await expect(page.locator(".gallery")).toHaveCount(0);
});

test("obraz do podglądu linku to zdjęcie główne realizacji, zdjęcia mają opisy", async ({ page }) => {
  await page.goto("/realizacje/galaxy-campus/");
  const og = await page.locator('meta[property="og:image"]').getAttribute("content");
  expect(og).toMatch(/^https:\/\/gawra-warszawska\.pl\/_astro\/.+\.jpg$/);
  await page.goto("/");
  const home = await page.locator('meta[property="og:image"]').getAttribute("content");
  expect(og).not.toBe(home);
  await page.goto("/realizacje/galaxy-campus/");
  const alts = await page.locator("article .top img, article .gallery img").evaluateAll((els) => els.map((e) => e.getAttribute("alt")));
  expect(alts.length).toBeGreaterThan(3);
  for (const a of alts) expect(a).toBeTruthy();
  await expect(page).toHaveTitle("Galaxy Campus, Samsung | Gawra Warszawska");
});

test("podstrona mieści się na telefonie", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/realizacje/badz-zyczliwy/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
});

test("żaden obraz serwowany na stronach nie przekracza 400 KB", () => {
  // Checks every image a visitor can actually load: all src/srcset/og:image references in built HTML.
  const html: string[] = [];
  const walk = (d: string) => {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (f.endsWith(".html")) html.push(readFileSync(p, "utf8"));
    }
  };
  walk("dist");
  const refs = new Set<string>();
  for (const h of html) for (const m of h.matchAll(/\/_astro\/[^"' ,)]+\.(?:jpe?g|png|webp|avif)/gi)) refs.add(m[0]);
  expect(refs.size).toBeGreaterThan(50);
  const big = [...refs].filter((r) => statSync(join("dist", r)).size > 400_000);
  expect(big).toEqual([]);
});
