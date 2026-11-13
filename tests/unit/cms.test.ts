import { readFileSync } from "node:fs";
import { parse } from "yaml";
import { expect, test } from "vitest";
import { SERVICES, TYPES } from "../../src/lib/taxonomy";

const cfg = parse(readFileSync(".pages.yml", "utf8"));
const col = cfg.content.find((c: any) => c.name === "realizacje");
const field = (n: string) => col.fields.find((f: any) => f.name === n);

test("panel zapisuje realizacje i zdjęcia we właściwych folderach", () => {
  expect(col.type).toBe("collection");
  expect(col.path).toBe("src/content/realizacje");
  expect(cfg.media.input).toBe("src/assets/realizacje");
});

test("pola panelu odpowiadają polom realizacji", () => {
  expect(col.fields.map((f: any) => f.name).sort()).toEqual(
    ["body", "client", "cover", "dateLabel", "featured", "gallery", "highlight", "oldSlug", "place", "scope", "services", "stats", "strength", "title", "types", "video", "year"].sort(),
  );
});

test("typy i usługi w panelu to dokładnie słowniki strony", () => {
  expect(field("types").options.values.map((v: any) => v.value)).toEqual(Object.keys(TYPES));
  expect(field("types").options.values.map((v: any) => v.label)).toEqual(Object.values(TYPES));
  expect(field("services").options.values.map((v: any) => v.value)).toEqual(Object.keys(SERVICES));
});

test("wyróżnik ma w panelu limit 40 znaków, a pola obowiązkowe są wymagane", () => {
  expect(field("highlight").options.maxlength).toBe(40);
  for (const n of ["title", "client", "types", "services", "place", "highlight", "cover"]) expect(field(n).required, n).toBe(true);
});
