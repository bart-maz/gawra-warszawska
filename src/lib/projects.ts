// Pure helpers for ordering case studies. Loading from the content collection lives in collection.ts.
export type ProjectLike = {
  slug: string;
  clientSlug: string;
  data: { title: string; featured: boolean; year?: number; types: string[] };
};

export function sortProjects<T extends ProjectLike>(list: T[]): T[] {
  return [...list].sort(
    (a, b) =>
      Number(b.data.featured) - Number(a.data.featured) ||
      (b.data.year ?? -Infinity) - (a.data.year ?? -Infinity) ||
      a.data.title.localeCompare(b.data.title, "pl"),
  );
}

export function related<T extends ProjectLike>(all: T[], current: T, n = 3): T[] {
  const others = sortProjects(all.filter((p) => p.slug !== current.slug));
  const shares = (p: T) => p.data.types.some((t) => current.data.types.includes(t));
  return [...others.filter(shares), ...others.filter((p) => !shares(p))].slice(0, n);
}
