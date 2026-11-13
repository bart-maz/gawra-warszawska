import { readdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import matter from "gray-matter";
import { expect, test } from "vitest";
import { TYPES, SERVICES } from "../../src/lib/taxonomy";

const DIR = "src/content/realizacje";
const files = readdirSync(DIR).filter((f) => f.endsWith(".md"));
const entries = files.map((f) => ({ f, raw: readFileSync(join(DIR, f), "utf8"), ...matter(readFileSync(join(DIR, f), "utf8")) }));

test("jest dokładnie 13 realizacji", () => {
  expect(files).toHaveLength(13);
});

test("każdy wyróżnik ma najwyżej 40 znaków", () => {
  for (const e of entries) expect(e.data.highlight.length, e.f).toBeLessThanOrEqual(40);
});

test("ProviTV podaje 700 uczestników, nie 7000", () => {
  const provi = entries.find((e) => e.f === "provitv.md")!;
  expect(provi.raw).toContain("700");
  expect(provi.raw).not.toContain("7000");
});

test("typy i usługi pochodzą wyłącznie ze słowników", () => {
  for (const e of entries) {
    for (const t of e.data.types) expect(Object.keys(TYPES), e.f).toContain(t);
    for (const s of e.data.services) expect(Object.keys(SERVICES), e.f).toContain(s);
  }
});

test("stare adresy są unikalne", () => {
  const old = entries.map((e) => e.data.oldSlug).filter(Boolean);
  expect(new Set(old).size).toBe(old.length);
  expect(old).toHaveLength(11);
});

test("każde zdjęcie wskazane w realizacji istnieje, galeria ma najwyżej 12 zdjęć", () => {
  for (const e of entries) {
    const imgs = [e.data.cover, ...(e.data.gallery ?? [])];
    expect((e.data.gallery ?? []).length, e.f).toBeLessThanOrEqual(12);
    for (const i of imgs) expect(existsSync(resolve(dirname(join(DIR, e.f)), i)), `${e.f}: ${i}`).toBe(true);
  }
});

test("każda realizacja ma opis", () => {
  for (const e of entries) expect(e.content.trim().length, e.f).toBeGreaterThan(40);
});
