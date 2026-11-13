import { expect, test } from "vitest";
import { TYPES, SERVICES } from "../../src/lib/taxonomy";

test("typy wydarzeń", () => {
  expect(TYPES).toEqual({
    konferencje: "Konferencje",
    festiwale: "Festiwale i plenery",
    "strefy-promocyjne": "Strefy promocyjne",
    specjalne: "Wydarzenia specjalne",
  });
});

test("usługi", () => {
  expect(Object.keys(SERVICES)).toEqual(["eventy", "scenografia", "technologia", "kontent"]);
});
