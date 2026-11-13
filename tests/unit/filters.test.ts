import { expect, test } from "vitest";
import { matches, parseFilters, slugify, toQuery } from "../../src/lib/filters";

test("slugify obsługuje polskie znaki", () => {
  expect(slugify("Bądź życzliwy (M1)")).toBe("badz-zyczliwy-m1");
  expect(slugify("Galaxy Live „Back to School”")).toBe("galaxy-live-back-to-school");
  expect(slugify("Łódź & Święto")).toBe("lodz-swieto");
});

test("parseFilters czyta znane wartości", () => {
  expect(parseFilters("?typ=konferencje&klient=samsung", ["samsung"])).toEqual({
    typ: "konferencje",
    klient: "samsung",
    usluga: null,
  });
});

test("parseFilters ignoruje nieznane wartości", () => {
  expect(parseFilters("?typ=konferencja&klient=nike&usluga=x", ["samsung"])).toEqual({
    typ: null,
    klient: null,
    usluga: null,
  });
});

test("parseFilters nie traktuje odziedziczonych kluczy obiektu jako typów", () => {
  expect(parseFilters("?typ=constructor&usluga=toString", [])).toEqual({ typ: null, klient: null, usluga: null });
});

test("toQuery jest odwrotnością parseFilters", () => {
  expect(toQuery({ typ: "festiwale", klient: null, usluga: "scenografia" })).toBe("?typ=festiwale&usluga=scenografia");
  expect(toQuery({ typ: null, klient: null, usluga: null })).toBe("");
});

test("matches łączy filtry przez AND", () => {
  const p = { types: ["konferencje"], services: ["eventy", "scenografia"], clientSlug: "tchibo" };
  expect(matches(p, { typ: "konferencje", klient: null, usluga: "scenografia" })).toBe(true);
  expect(matches(p, { typ: "festiwale", klient: null, usluga: null })).toBe(false);
  expect(matches(p, { typ: null, klient: "samsung", usluga: null })).toBe(false);
  expect(matches(p, { typ: null, klient: null, usluga: null })).toBe(true);
});
