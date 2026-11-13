export const TYPES = {
  konferencje: "Konferencje",
  festiwale: "Festiwale i plenery",
  "strefy-promocyjne": "Strefy promocyjne",
  specjalne: "Wydarzenia specjalne",
} as const;

export const SERVICES = {
  eventy: "Eventy",
  scenografia: "Scenografia",
  technologia: "Technologia",
  kontent: "Produkcja kontentu",
} as const;

export type TypeSlug = keyof typeof TYPES;
export type ServiceSlug = keyof typeof SERVICES;

export const TYPE_SLUGS = Object.keys(TYPES) as [TypeSlug, ...TypeSlug[]];
export const SERVICE_SLUGS = Object.keys(SERVICES) as [ServiceSlug, ...ServiceSlug[]];
