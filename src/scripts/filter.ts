import { matches, parseFilters, toQuery, type Filters } from "../lib/filters";

const bar = document.getElementById("filters");
const grid = document.getElementById("grid");
if (bar && grid) {
  const clients = (bar.dataset.clients ?? "").split(" ").filter(Boolean);
  const cards = [...grid.querySelectorAll<HTMLElement>(".card")];
  const typeButtons = [...bar.querySelectorAll<HTMLButtonElement>('button[data-filter="typ"]')];
  const client = document.getElementById("f-klient") as HTMLSelectElement;
  const service = document.getElementById("f-usluga") as HTMLSelectElement;
  const count = document.getElementById("count");
  const empty = document.getElementById("empty");

  const apply = (f: Filters) => {
    let shown = 0;
    for (const card of cards) {
      const ok = matches(
        { types: (card.dataset.types ?? "").split(" "), services: (card.dataset.services ?? "").split(" "), clientSlug: card.dataset.client ?? "" },
        f,
      );
      card.hidden = !ok;
      if (ok) shown += 1;
    }
    for (const b of typeButtons) b.setAttribute("aria-pressed", String((b.dataset.value || null) === f.typ));
    client.value = f.klient ?? "";
    service.value = f.usluga ?? "";
    if (count) count.textContent = `${shown} z ${cards.length} realizacji`;
    if (empty) empty.hidden = shown > 0;
    grid.classList.toggle("is-filtered", shown !== cards.length);
  };

  const current = () => parseFilters(location.search, clients);
  const go = (f: Filters) => {
    history.pushState(null, "", location.pathname + toQuery(f));
    apply(f);
  };

  for (const b of typeButtons) b.addEventListener("click", () => go({ ...current(), typ: (b.dataset.value || null) as Filters["typ"] }));
  client.addEventListener("change", () => go({ ...current(), klient: client.value || null }));
  service.addEventListener("change", () => go({ ...current(), usluga: (service.value || null) as Filters["usluga"] }));
  document.getElementById("clear")?.addEventListener("click", () => go({ typ: null, klient: null, usluga: null }));
  window.addEventListener("popstate", () => apply(current()));
  apply(current());
}
