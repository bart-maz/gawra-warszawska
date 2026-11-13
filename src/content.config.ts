import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { SERVICE_SLUGS, TYPE_SLUGS } from "./lib/taxonomy";

const realizacje = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/realizacje" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      client: z.string(),
      types: z.array(z.enum(TYPE_SLUGS)).min(1),
      services: z.array(z.enum(SERVICE_SLUGS)).min(1),
      dateLabel: z.string().optional(),
      year: z.number().int().optional(),
      place: z.string(),
      highlight: z.string().max(40),
      stats: z.array(z.object({ value: z.string(), label: z.string() })).max(4).default([]),
      scope: z.string(),
      strength: z.string(),
      cover: image(),
      gallery: z.array(image()).default([]),
      video: z.string().url().optional(),
      featured: z.boolean().default(false),
      oldSlug: z.string().optional(),
    }),
});

export const collections = { realizacje };
