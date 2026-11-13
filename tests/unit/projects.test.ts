import { expect, test } from "vitest";
import { related, sortProjects } from "../../src/lib/projects";

const p = (slug: string, o: { featured?: boolean; year?: number; types?: string[]; title?: string } = {}) =>
  ({ slug, clientSlug: "x", data: { title: o.title ?? slug, featured: o.featured ?? false, year: o.year, types: o.types ?? ["konferencje"] } }) as any;

test("sortProjects: wyróżnione najpierw, potem rok malejąco, brak roku na końcu, potem tytuł", () => {
  const list = [p("bez-roku"), p("b-2022", { year: 2022 }), p("a-2023", { year: 2023 }), p("wyr-2021", { featured: true, year: 2021 }), p("a-2022", { year: 2022 })];
  expect(sortProjects(list).map((x) => x.slug)).toEqual(["wyr-2021", "a-2023", "a-2022", "b-2022", "bez-roku"]);
});

test("sortProjects nie zmienia tablicy wejściowej", () => {
  const list = [p("b"), p("a", { featured: true })];
  sortProjects(list);
  expect(list.map((x) => x.slug)).toEqual(["b", "a"]);
});

test("related: pomija bieżącą, preferuje wspólny typ, zwraca dokładnie n", () => {
  const cur = p("cur", { types: ["festiwale"] });
  const all = [cur, p("k1", { year: 2024 }), p("f1", { types: ["festiwale"], year: 2020 }), p("k2", { year: 2023 }), p("f2", { types: ["festiwale", "specjalne"], year: 2021 })];
  expect(related(all, cur, 3).map((x) => x.slug)).toEqual(["f2", "f1", "k1"]);
});

test("related: zwraca mniej, gdy realizacji jest za mało", () => {
  const cur = p("cur");
  expect(related([cur, p("a")], cur, 3).map((x) => x.slug)).toEqual(["a"]);
});
