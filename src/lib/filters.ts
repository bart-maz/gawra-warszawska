import { SERVICES, TYPES, type ServiceSlug, type TypeSlug } from "./taxonomy";

export type Filters = { typ: TypeSlug | null; klient: string | null; usluga: ServiceSlug | null };
export type Filterable = { types: string[]; services: string[]; clientSlug: string };

const PL: Record<string, string> = {
  ą: "a", ć: "c", ę: "e", ł: "l", ń: "n", ó: "o", ś: "s", ź: "z", ż: "z",
};

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ąćęłńóśźż]/g, (ch) => PL[ch])
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseFilters(search: string, knownClients: string[]): Filters {
  const q = new URLSearchParams(search);
  const typ = q.get("typ");
  const klient = q.get("klient");
  const usluga = q.get("usluga");
  return {
    typ: typ !== null && Object.hasOwn(TYPES, typ) ? (typ as TypeSlug) : null,
    klient: klient !== null && knownClients.includes(klient) ? klient : null,
    usluga: usluga !== null && Object.hasOwn(SERVICES, usluga) ? (usluga as ServiceSlug) : null,
  };
}

export function toQuery(f: Filters): string {
  const q = new URLSearchParams();
  if (f.typ) q.set("typ", f.typ);
  if (f.klient) q.set("klient", f.klient);
  if (f.usluga) q.set("usluga", f.usluga);
  const s = q.toString();
  return s ? `?${s}` : "";
}

export function matches(p: Filterable, f: Filters): boolean {
  return (
    (f.typ === null || p.types.includes(f.typ)) &&
    (f.klient === null || p.clientSlug === f.klient) &&
    (f.usluga === null || p.services.includes(f.usluga))
  );
}
