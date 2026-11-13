import { getCollection, type CollectionEntry } from "astro:content";
import { slugify } from "./filters";
import { sortProjects } from "./projects";

export type Project = CollectionEntry<"realizacje"> & { slug: string; clientSlug: string };

export async function getProjects(): Promise<Project[]> {
  const entries = await getCollection("realizacje");
  return sortProjects(entries.map((e) => ({ ...e, slug: e.id, clientSlug: slugify(e.data.client) })));
}
