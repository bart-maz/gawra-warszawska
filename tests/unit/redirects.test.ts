import { expect, test } from "vitest";
import { buildRedirects } from "../../scripts/build-redirects.mjs";

test("stare adresy realizacji przekierowują na nowe, reszta na listę", () => {
  const out = buildRedirects([{ slug: "provitv", oldSlug: "provi-tv" }, { slug: "badz-zyczliwy" }]);
  const lines = out.trim().split("\n");
  expect(lines).toContain("/projekt/provi-tv/ /realizacje/provitv/ 301");
  expect(lines).toContain("/projekt/provi-tv /realizacje/provitv/ 301");
  expect(lines.at(-1)).toBe("/projekt/* /realizacje/ 301");
  expect(out).not.toContain("badz-zyczliwy");
});

test("realizacja, której adres się nie zmienił, nadal dostaje przekierowanie z /projekt/", () => {
  const out = buildRedirects([{ slug: "galaxy-campus", oldSlug: "galaxy-campus" }]);
  expect(out).toContain("/projekt/galaxy-campus/ /realizacje/galaxy-campus/ 301");
});
