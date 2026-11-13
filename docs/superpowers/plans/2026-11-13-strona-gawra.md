# Nowa strona Gawry Warszawskiej: plan wdrożenia

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Zbudować statyczną stronę agencji z filtrowalnym portfolio 13 realizacji, które zespół rozszerza sam (panel) lub przez Claude'a (pliki).

**Architecture:** Astro generuje statyczne strony z kolekcji treści `realizacje` (Markdown z polami w nagłówku, walidowane schematem). Filtrowanie działa w przeglądarce na danych osadzonych w HTML, a stan filtra żyje w adresie (`?typ=`). Publikacja: GitHub → Netlify; panel treści: Pages CMS na tym samym repozytorium.

**Tech Stack:** Astro 5, TypeScript, zwykły CSS (tokeny w `:root`), `@fontsource` (Big Shoulders Display, Manrope), Vitest (logika), Playwright (testy strony), Netlify (hosting, formularz, przekierowania), Pages CMS.

**Spec:** `docs/2026-11-13-strona-gawra-design.md`

## Global Constraints

- Katalog projektu: `/home/user/gawra` (repozytorium `bart-maz/gawra-warszawska`).
- Język treści i interfejsu: wyłącznie polski, `<html lang="pl">`.
- Kolory: tło `#0b0b0c`, tekst `#ffffff`, czerwień `#e0092f` tylko jako sygnał (główne przyciski, nazwa klienta, aktywny filtr, wyróżnione słowo nagłówka).
- Kroje: nagłówki Big Shoulders Display 700/900 wersalikami, tekst Manrope 400/500/700; oba hostowane lokalnie, z podzbiorem latin-ext.
- Ostre narożniki, bez cieni; gradient tylko jako przyciemnienie zdjęcia pod tekstem.
- Typy wydarzeń (slug → etykieta): `konferencje` → Konferencje, `festiwale` → Festiwale i plenery, `strefy-promocyjne` → Strefy promocyjne, `specjalne` → Wydarzenia specjalne.
- Usługi (slug → etykieta): `eventy` → Eventy, `scenografia` → Scenografia, `technologia` → Technologia, `kontent` → Produkcja kontentu.
- Jedno wezwanie do działania w całym serwisie: „Umów spotkanie".
- Kontakt: `biuro@gawra-warszawska.pl`; osoba kontaktowa Dawid Sobieraj, `dawid@gawra-warszawska.pl`, 604 774 276; adres Duchnicka 3 bud. Defabryka, 01-796 Warszawa.
- ProviTV: 700 uczestników (nie 7000).
- Strona działa bez JavaScriptu (pokazuje wszystkie realizacje) i szanuje `prefers-reduced-motion`.
- Żadnych skryptów śledzących wymagających banera cookies.
- Domena produkcyjna nie jest przepinana w ramach tego planu; kończymy na adresie testowym Netlify.

## Review Focus

1. Link z maila z nieznaną lub błędnie wpisaną wartością filtra (`?typ=konferencja`) → strona pokazuje wszystkie realizacje, bez błędu i bez pustej listy. (Task 2, Task 5)
2. Kombinacja filtrów bez wyników → komunikat „Brak realizacji dla tych filtrów" z przyciskiem „Pokaż wszystkie". (Task 5)
3. Realizacja bez wyników, bez daty lub bez wideo (CNK, LPP, UTH) → podstrona i kafelek renderują się bez pustych sekcji i bez słowa „undefined". (Task 4, Task 6)
4. Stary link `/projekt/<stara-nazwa>/` z wcześniejszych maili → przekierowanie 301 na właściwą nową podstronę, także dla długiego adresu Exclusive Networks. (Task 9)
5. Zespół wgrywa przez panel zdjęcie 8 MB prosto z aparatu → strona serwuje wersje zmniejszone (żaden plik obrazu w `dist/` powyżej 400 KB). (Task 4)

---

## Struktura plików

```
gawra/
  astro.config.mjs, package.json, tsconfig.json, netlify.toml, .pages.yml, README.md
  src/
    content.config.ts            schemat kolekcji `realizacje`
    content/realizacje/<slug>.md 13 plików realizacji
    assets/realizacje/<slug>/    zdjęcia źródłowe
    assets/brand/                sygnet, logotypy klientów, zdjęcia zespołu
    lib/taxonomy.ts              słowniki typów i usług
    lib/filters.ts               logika filtrów (czysta)
    lib/projects.ts              pobieranie, sortowanie, podobne realizacje
    styles/tokens.css, base.css
    layouts/Base.astro
    components/Header.astro, Footer.astro, Cta.astro, ProjectCard.astro,
               FilterBar.astro, Stats.astro, Facts.astro, Gallery.astro, ContactBlock.astro
    scripts/filter.ts            podpięcie filtrów w przeglądarce
    pages/index.astro, realizacje/index.astro, realizacje/[slug].astro,
          co-robimy.astro, o-nas.astro, kontakt.astro, dziekujemy.astro, 404.astro
  tests/unit/*.test.ts           Vitest
  tests/e2e/*.spec.ts            Playwright na zbudowanej stronie
  scripts/import-images.mjs      jednorazowy import zdjęć z obecnej strony
```

---

### Task 1: Szkielet projektu, schemat realizacji, słowniki

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/content.config.ts`, `src/lib/taxonomy.ts`, `src/content/realizacje/strefa-galaxy-fun-na-festiwalach.md`, `src/pages/index.astro` (tymczasowa), `playwright.config.ts`
- Test: `tests/unit/taxonomy.test.ts`

**Interfaces:**
- Produces:
  - `TYPES: Record<TypeSlug, string>`, `SERVICES: Record<ServiceSlug, string>` oraz typy `TypeSlug`, `ServiceSlug` z `src/lib/taxonomy.ts` (wartości z Global Constraints).
  - Kolekcja `realizacje` o polach: `title: string`, `client: string`, `types: TypeSlug[]` (min. 1), `services: ServiceSlug[]` (min. 1), `dateLabel?: string`, `year?: number`, `place: string`, `highlight: string` (maks. 40 znaków), `stats: {value: string, label: string}[]` (0–4, domyślnie `[]`), `scope: string`, `strength: string`, `cover: image()`, `gallery: image()[]` (domyślnie `[]`), `video?: url`, `featured: boolean` (domyślnie `false`), `oldSlug?: string`. Treść pliku Markdown to opis.
  - Skrypty npm: `dev`, `build`, `preview`, `test` (Vitest), `test:e2e` (Playwright na `astro preview`, port 4321, `--trace off`).

- [ ] **Step 1:** `npm create astro@latest . -- --template minimal --typescript strict --no-git --install`; dodaj `vitest`, `@playwright/test` (wersja zgodna z preinstalowaną przeglądarką; nie uruchamiaj `playwright install`), `@fontsource/big-shoulders-display`, `@fontsource/manrope`. `git init`, gałąź `main`.
- [ ] **Step 2: Test słowników** w `tests/unit/taxonomy.test.ts`:

```ts
import { TYPES, SERVICES } from "../../src/lib/taxonomy";
test("typy wydarzeń", () => {
  expect(TYPES).toEqual({
    konferencje: "Konferencje", festiwale: "Festiwale i plenery",
    "strefy-promocyjne": "Strefy promocyjne", specjalne: "Wydarzenia specjalne",
  });
});
test("usługi", () => {
  expect(Object.keys(SERVICES)).toEqual(["eventy", "scenografia", "technologia", "kontent"]);
});
```

- [ ] **Step 3:** `npm test` → FAIL (brak modułu). Zaimplementuj `taxonomy.ts`. `npm test` → PASS.
- [ ] **Step 4:** Napisz `src/content.config.ts` ze schematem jak w Interfaces (enumy z kluczy `TYPES`/`SERVICES`, loader `glob` na `src/content/realizacje/*.md`).
- [ ] **Step 5:** Dodaj jedną realizację (Galaxy Fun, dane z PDF s. 28–29: klient Samsung, `types: [festiwale]`, `services: [eventy, scenografia]`, `dateLabel: "Lato 2023"`, `year: 2023`, `place: "Open'er, Clout, Juwenalia"`, `highlight: "30 tys.+ odwiedzających"`, `stats: [{value: "30 tys.+", label: "odwiedzających strefę"}]`, `featured: true`, `oldSlug: galaxy-festiwale`) i jej zdjęcie główne.
- [ ] **Step 6:** `npm run build` → PASS. Zmień tymczasowo `types` na `[centra]` → build FAIL z błędem schematu; cofnij.
- [ ] **Step 7:** Commit `chore: szkielet Astro, schemat realizacji, słowniki`.

### Task 2: Logika filtrów

**Files:**
- Create: `src/lib/filters.ts`
- Test: `tests/unit/filters.test.ts`

**Interfaces:**
- Consumes: `TYPES`, `SERVICES`, `TypeSlug`, `ServiceSlug`.
- Produces:
  - `type Filters = { typ: TypeSlug | null; klient: string | null; usluga: ServiceSlug | null }`
  - `type Filterable = { types: string[]; services: string[]; clientSlug: string }`
  - `slugify(text: string): string` (polskie znaki → ASCII, małe litery, myślniki)
  - `parseFilters(search: string, knownClients: string[]): Filters` (nieznane wartości → `null`)
  - `toQuery(f: Filters): string` (np. `"?typ=konferencje"`, pusty łańcuch gdy brak filtrów; kolejność `typ`, `klient`, `usluga`)
  - `matches(p: Filterable, f: Filters): boolean`

- [ ] **Step 1: Testy:**

```ts
test("slugify obsługuje polskie znaki", () => {
  expect(slugify("Bądź życzliwy (M1)")).toBe("badz-zyczliwy-m1");
  expect(slugify("Galaxy Live „Back to School”")).toBe("galaxy-live-back-to-school");
});
test("parseFilters czyta znane wartości", () => {
  expect(parseFilters("?typ=konferencje&klient=samsung", ["samsung"]))
    .toEqual({ typ: "konferencje", klient: "samsung", usluga: null });
});
test("parseFilters ignoruje nieznane wartości", () => {
  expect(parseFilters("?typ=konferencja&klient=nike&usluga=x", ["samsung"]))
    .toEqual({ typ: null, klient: null, usluga: null });
});
test("toQuery jest odwrotnością parseFilters", () => {
  expect(toQuery({ typ: "festiwale", klient: null, usluga: "scenografia" })).toBe("?typ=festiwale&usluga=scenografia");
  expect(toQuery({ typ: null, klient: null, usluga: null })).toBe("");
});
test("matches łączy filtry przez AND", () => {
  const p = { types: ["konferencje"], services: ["eventy", "scenografia"], clientSlug: "tchibo" };
  expect(matches(p, { typ: "konferencje", klient: null, usluga: "scenografia" })).toBe(true);
  expect(matches(p, { typ: "festiwale", klient: null, usluga: null })).toBe(false);
  expect(matches(p, { typ: null, klient: null, usluga: null })).toBe(true);
});
```

- [ ] **Step 2:** `npm test` → FAIL. Zaimplementuj cztery funkcje. `npm test` → PASS.
- [ ] **Step 3:** Commit `feat: logika filtrów portfolio`.

### Task 3: System wizualny i rama strony

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/base.css`, `src/layouts/Base.astro`, `src/components/Header.astro`, `Footer.astro`, `Cta.astro`, `src/assets/brand/sygnet-white.png`
- Test: `tests/e2e/shell.spec.ts`

**Interfaces:**
- Produces:
  - `Base.astro` z propsami `{ title: string; description: string; image?: ImageMetadata }`; ustawia `<title>` jako `"<title> | Gawra Warszawska"`, meta description, Open Graph (`og:title`, `og:description`, `og:image`, domyślnie zdjęcie Galaxy Fun), `lang="pl"`, link „Przejdź do treści".
  - `Cta.astro` z propsami `{ href?: string; label?: string; variant?: "primary" | "ghost" }`; domyślnie `href="/kontakt/"`, `label="Umów spotkanie"`.
  - Nawigacja: Realizacje `/realizacje/`, Co robimy `/co-robimy/`, O nas `/o-nas/`, Kontakt `/kontakt/`, plus przycisk „Umów spotkanie". Poniżej 760 px linki chowają się do rozwijanego menu (`<details>`), przycisk zostaje widoczny.
  - Tokeny CSS: `--black`, `--ink` (`#141416`), `--white`, `--red`, `--grey` (`#8d8a86`), `--f-display`, `--f-body`, `--gutter`.

- [ ] **Step 1: Test** `shell.spec.ts`: na `/` istnieje `html[lang=pl]`; nagłówek ma 4 linki o powyższych adresach; link „Umów spotkanie" prowadzi do `/kontakt/`; w szerokości 390 px `document.documentElement.scrollWidth <= innerWidth`; obliczone tło `body` to `rgb(11, 11, 12)`.
- [ ] **Step 2:** `npm run build && npm run test:e2e` → FAIL.
- [ ] **Step 3:** Zaimplementuj tokeny, bazę (reset, typografia, `:focus-visible` z czerwonym obrysem, reguła `prefers-reduced-motion`), układ i komponenty. Wygląd wzoruj na makiecie „A. Scena" (`https://claude.ai/artifact/NAg5AXyE4LBgfAvcNx5RPt`, plik źródłowy opisany w specyfikacji). Stopka: adres, e-mail, telefon, linki do LinkedIn, Facebook, Instagram (adresy z obecnej strony), `© <bieżący rok> Gawra Warszawska`.
- [ ] **Step 4:** Testy → PASS. Commit `feat: system wizualny, nagłówek, stopka`.

### Task 4: Treść 13 realizacji i zdjęcia

**Files:**
- Create: `scripts/import-images.mjs`, 12 kolejnych plików w `src/content/realizacje/`, foldery w `src/assets/realizacje/<slug>/`, `src/lib/projects.ts`
- Test: `tests/unit/projects.test.ts`, `tests/unit/content.test.ts`

**Interfaces:**
- Consumes: kolekcja `realizacje`, `slugify`.
- Produces z `src/lib/projects.ts`:
  - `type Project` = wpis kolekcji + `slug: string` + `clientSlug: string`
  - `getProjects(): Promise<Project[]>` posortowane: `featured` najpierw, potem `year` malejąco (brak roku na końcu), potem tytuł alfabetycznie
  - `sortProjects(list: Project[]): Project[]` (czysta, ta sama kolejność)
  - `related(all: Project[], current: Project, n = 3): Project[]` (wspólny typ, bez bieżącej; gdy za mało, dopełnij pozostałymi w kolejności `sortProjects`)

Mapa realizacji (slug nowy ← `oldSlug`; typ; klient):

| slug | oldSlug | types | client |
|---|---|---|---|
| strefa-galaxy-fun-na-festiwalach | galaxy-festiwale | festiwale | Samsung |
| galaxy-campus | galaxy-campus | festiwale | Samsung |
| dzien-dobry-tchibo | tchibo | konferencje | Tchibo |
| provitv | provi-tv | konferencje | Provident |
| bezpieczny-lot | bezpieczny-lot-z-exclusive-networks-i-fortinet-konferencja-z-okazji-20-lecia-wspolpracy | konferencje | Exclusive Networks |
| betclic-studio | (sprawdź adres na obecnej stronie) | strefy-promocyjne | Betclic |
| betclic-x-fame-mma | betclic-x-fame-mma | strefy-promocyjne | Betclic |
| galaxy-live-back-to-school | galaxy-live-back-to-school | strefy-promocyjne, festiwale | Samsung |
| galaxy-s24-launch-event | brak | strefy-promocyjne | Samsung |
| badz-zyczliwy | brak | strefy-promocyjne, specjalne | M1 |
| cnk-wieczory-dla-doroslych | cnk-x-wieczory-dla-doroslych | specjalne | Centrum Nauki Kopernik |
| otwarcie-hali-lpp-logistics | otwarcie-hali-magazynowej-lpp-logistics | specjalne | Panattoni |
| 30-lecie-uth | celebracja-30-lecia-uczelni-techniczno-handlowej-im-heleny-chodkowskiej | konferencje, specjalne | UTH |

Źródła treści: PDF `Gawra_Warszawska.pdf` s. 8–29 (opis, „odpowiedzialność i działania" → `scope`, „najmocniejsza strona projektu" → `strength`, wyniki → `stats`); dla CNK, LPP i UTH teksty z ich podstron na obecnej stronie, bez `dateLabel` i `year`. `featured: true` dla: Galaxy Fun, Dzień Dobry Tchibo, Galaxy Campus, Betclic x FAME MMA, ProviTV, Galaxy Live.

- [ ] **Step 1: Testy logiki** (`projects.test.ts`): `sortProjects` stawia wyróżnione przed resztą, w grupie rok malejąco, wpis bez roku na końcu; `related` nie zwraca bieżącej realizacji, preferuje wspólny typ, zwraca dokładnie `n` gdy dostępnych jest dość.
- [ ] **Step 2: Testy treści** (`content.test.ts`, czyta pliki przez `gray-matter`): jest dokładnie 13 plików; każdy `highlight` ma ≤ 40 znaków; w `provitv.md` występuje „700", a nie występuje „7000"; żaden plik nie zawiera `centra` ani `promocja` w `types`; `oldSlug` są unikalne.
- [ ] **Step 3:** `npm test` → FAIL. Zaimplementuj `projects.ts`.
- [ ] **Step 4:** Napisz `scripts/import-images.mjs`: dla każdej realizacji z `oldSlug` pobiera podstronę `https://gawra-warszawska.pl/projekt/<oldSlug>/`, zapisuje obrazy z `wp-content/uploads` w pełnej rozdzielczości (bez sufiksów `-WxH`) do `src/assets/realizacje/<slug>/`. Uruchom. Dla S24 i M1 wytnij zdjęcia ze stron PDF (`pdfimages`) i oznacz w nagłówku pliku komentarzem `# TODO-zdjęcia: wycinki z PDF, podmienić na oryginały`.
- [ ] **Step 5:** Napisz 12 plików realizacji. Popraw oczywiste literówki z PDF („owiedzających", „take").
- [ ] **Step 6:** `npm test` → PASS; `npm run build` → PASS; `find dist -name '*.jpg' -o -name '*.webp' -o -name '*.avif' | xargs ls -l | awk '$5>400000'` → brak wyników (obrazy renderuj przez `astro:assets` z szerokościami 480/960/1600 i formatem WebP).
- [ ] **Step 7:** Commit `feat: 13 realizacji z treścią i zdjęciami`.

### Task 5: Lista realizacji z filtrami

**Files:**
- Create: `src/components/ProjectCard.astro`, `src/components/FilterBar.astro`, `src/scripts/filter.ts`, `src/pages/realizacje/index.astro`
- Test: `tests/e2e/portfolio.spec.ts`

**Interfaces:**
- Consumes: `getProjects`, `Project`, `parseFilters`, `toQuery`, `matches`, `TYPES`, `SERVICES`.
- Produces:
  - `ProjectCard.astro` z propsem `{ project: Project }`; element główny `<li class="card" data-types="a b" data-services="a b" data-client="<clientSlug>">` z linkiem do `/realizacje/<slug>/`, nazwą klienta, tytułem, linią `"<etykieta pierwszego typu> · <dateLabel>"` (bez kropki środkowej, gdy brak daty) i białą etykietą `highlight`.
  - `FilterBar.astro` z propsem `{ projects: Project[] }`; trzy grupy: przyciski typu (`button[data-filter="typ"][data-value]`, pierwszy „Wszystkie"), `select#f-klient`, `select#f-usluga`; klienci wyliczani z danych, alfabetycznie.
  - Licznik `#count` o treści `"<n> z <N> realizacji"`; pusty stan `#empty` z tekstem „Brak realizacji dla tych filtrów" i przyciskiem „Pokaż wszystkie".

- [ ] **Step 1: Testy e2e:**
  - `/realizacje/` pokazuje 13 kart i licznik „13 z 13 realizacji".
  - Klik „Konferencje" → adres kończy się `?typ=konferencje`, widać 4 karty (Tchibo, ProviTV, Bezpieczny lot, 30-lecie UTH), przycisk ma `aria-pressed="true"`.
  - Wejście wprost na `/realizacje/?typ=strefy-promocyjne` → 5 kart.
  - `/realizacje/?typ=konferencja` (literówka) → 13 kart, „Wszystkie" aktywne.
  - `/realizacje/?typ=konferencje&klient=samsung` → 0 kart, widoczny `#empty`; klik „Pokaż wszystkie" → 13 kart i adres bez parametrów.
  - Przycisk wstecz po dwóch zmianach filtra przywraca poprzedni stan.
  - Z wyłączonym JavaScriptem widać 13 kart.
  - Szerokość 390 px: brak poziomego przewijania.
- [ ] **Step 2:** `npm run build && npm run test:e2e` → FAIL.
- [ ] **Step 3:** Zaimplementuj. `filter.ts`: przy starcie i na `popstate` czyta `location.search` przez `parseFilters`, ustawia `hidden` na kartach przez `matches`, aktualizuje kontrolki, licznik i pusty stan; zmiana kontrolki robi `history.pushState` z `toQuery`. Siatka jak w makiecie: 12 kolumn, karty na przemian 7 i 5 kolumn, stała wysokość wiersza `clamp(250px, 30vw, 420px)`, jedna kolumna poniżej 760 px.
- [ ] **Step 4:** Testy → PASS. Commit `feat: portfolio z filtrami w adresie`.

### Task 6: Podstrona realizacji

**Files:**
- Create: `src/pages/realizacje/[slug].astro`, `src/components/Stats.astro`, `Facts.astro`, `Gallery.astro`
- Test: `tests/e2e/case.spec.ts`

**Interfaces:**
- Consumes: `getProjects`, `related`, `ProjectCard`, `Cta`, `Base`.
- Produces: strony `/realizacje/<slug>/`; przycisk końcowy z `href="/kontakt/?realizacja=<slug>"` i etykietą „Umów spotkanie w sprawie podobnego projektu"; fakty „Typ projektu" i „Usługi" są linkami do `/realizacje/?typ=<slug>` i `/realizacje/?usluga=<slug>`.

Kolejność sekcji: tytuł + klient + zdjęcie główne; wyniki (`Stats`, tylko gdy `stats.length > 0`); fakty (klient, typ, data gdy jest, miejsce, usługi); opis; „Odpowiedzialność i działania"; „Najmocniejsza strona projektu"; galeria (gdy niepusta); wideo jako link „Zobacz wideo" (gdy jest); przycisk; „Podobne realizacje" (3 karty).

- [ ] **Step 1: Testy e2e:**
  - `/realizacje/strefa-galaxy-fun-na-festiwalach/`: `h1` = „Strefa Galaxy Fun na festiwalach", widać „30 tys.+" i „odwiedzających strefę", nagłówki „Odpowiedzialność i działania" i „Najmocniejsza strona projektu", 3 karty podobnych, przycisk prowadzi do `/kontakt/?realizacja=strefa-galaxy-fun-na-festiwalach`.
  - `/realizacje/provitv/`: widać „700", brak „7000".
  - `/realizacje/cnk-wieczory-dla-doroslych/`: brak sekcji wyników, brak etykiety „Data", treść strony nie zawiera „undefined" ani „null".
  - `og:image` każdej podstrony wskazuje na jej zdjęcie główne (bezwzględny adres).
  - Każdy obraz ma niepusty `alt`.
- [ ] **Step 2:** Build + e2e → FAIL. Zaimplementuj. Build + e2e → PASS.
- [ ] **Step 3:** Commit `feat: podstrona realizacji`.

### Task 7: Strona główna, Co robimy, O nas

**Files:**
- Create/Modify: `src/pages/index.astro`, `src/pages/co-robimy.astro`, `src/pages/o-nas.astro`, `src/assets/brand/` (logotypy klientów i zdjęcia zespołu z obecnej strony)
- Test: `tests/e2e/pages.spec.ts`

**Interfaces:**
- Consumes: `getProjects`, `ProjectCard`, `Cta`, `Base`, `ContactBlock` (Task 8; do czasu jego powstania wstaw `Cta`).

Treść:
- Strona główna: `h1` „Kreujemy niebanalne wrażenia" (słowo „niebanalne" czerwone) na zdjęciu Galaxy Campus; akapit „Agencja eventowa z Warszawy. Konferencje, strefy festiwalowe i wydarzenia marek, od idei po ostatni kabel."; przyciski „Umów spotkanie" i „Zobacz realizacje"; 6 wyróżnionych realizacji + link „Wszystkie realizacje"; cztery obszary „co robimy" (po jednym zdaniu, link do `/co-robimy/`); sekcja „Zaufali nam" z logotypami w bieli (Samsung, Apart, Hyundai, M1, Tchibo, Sodexo, Panattoni, Maxi Zoo, Betclic; tylko te, których pliki są na obecnej stronie, resztę jako tekst); blok kontaktowy.
- Co robimy: cztery sekcje z tekstami z `https://gawra-warszawska.pl/co-robimy/`, każda z linkiem „Zobacz realizacje" do `/realizacje/?usluga=<slug>`. Bez numeracji 01–04.
- O nas: teksty z PDF s. 2 („Chcemy zostać zapamiętani" i dwa akapity), zespół: Dawid Sobieraj, Aldona Michalak, Kuba Woźniak, Piotr Samulski, Zuza Woś (zdjęcie zespołu `team-2.jpg` z obecnej strony).

- [ ] **Step 1: Testy e2e:** strona główna ma `h1` z tekstem „Kreujemy niebanalne wrażenia", dokładnie 6 kart, link do `/realizacje/`; `/co-robimy/` ma 4 nagłówki `h2` i 4 linki zaczynające się od `/realizacje/?usluga=`; `/o-nas/` zawiera 5 nazwisk; żadna z trzech stron nie zawiera tekstu „Brand Strategy" ani „Lorem"; brak poziomego przewijania w 390 px.
- [ ] **Step 2:** FAIL → implementacja → PASS. Commit `feat: strona główna, co robimy, o nas`.

### Task 8: Kontakt i formularz

**Files:**
- Create: `src/components/ContactBlock.astro`, `src/pages/kontakt.astro`, `src/pages/dziekujemy.astro`
- Test: `tests/e2e/contact.spec.ts`

**Interfaces:**
- Produces: `ContactBlock.astro` (bez propsów): formularz `<form name="spotkanie" method="POST" action="/dziekujemy/" data-netlify="true" netlify-honeypot="bot-field">` z polami `imie` (wymagane), `firma`, `email` (wymagane, `type=email`), `telefon`, `wiadomosc`, ukrytym `realizacja`, ukrytym `form-name=spotkanie`; obok dane Dawida ze zdjęciem. Przycisk: „Wyślij zgłoszenie". Pod formularzem zdanie o przetwarzaniu danych w celu odpowiedzi na zgłoszenie.

- [ ] **Step 1: Testy e2e:** `/kontakt/` ma formularz o `name="spotkanie"` z atrybutem `data-netlify`; wejście na `/kontakt/?realizacja=provitv` ustawia ukryte pole `realizacja` na `provitv` i pokazuje nad formularzem „Zapytanie dotyczy realizacji: ProviTV"; `/kontakt/?realizacja=<script>` nie pokazuje tej linii i zostawia pole puste; wysłanie pustego formularza nie przechodzi (walidacja przeglądarki, adres bez zmiany); strona zawiera `dawid@gawra-warszawska.pl` i „604 774 276" jako zaznaczalny tekst; `/dziekujemy/` ma `h1` „Dziękujemy" i link do `/realizacje/`.
- [ ] **Step 2:** FAIL → implementacja (nazwę realizacji bierz z mapy slug → tytuł osadzonej w stronie, nigdy wprost z adresu) → PASS.
- [ ] **Step 3:** Podmień tymczasowe `Cta` na `ContactBlock` na stronie głównej. Commit `feat: kontakt i formularz spotkania`.

### Task 9: Przekierowania, 404, mapa strony

**Files:**
- Create: `netlify.toml`, `src/pages/404.astro`, `scripts/build-redirects.mjs`; Modify: `astro.config.mjs` (`site: "https://gawra-warszawska.pl"`, integracja `@astrojs/sitemap`), `package.json` (`build` = `astro build && node scripts/build-redirects.mjs`)
- Test: `tests/unit/redirects.test.ts`

**Interfaces:**
- Produces: `buildRedirects(projects: {slug: string; oldSlug?: string}[]): string` eksportowane ze `scripts/build-redirects.mjs`; wynik zapisywany do `dist/_redirects`.

- [ ] **Step 1: Test:** dla `[{slug:"provitv", oldSlug:"provi-tv"}, {slug:"badz-zyczliwy"}]` wynik zawiera linię `/projekt/provi-tv/ /realizacje/provitv/ 301`, linię `/projekt/provi-tv /realizacje/provitv/ 301`, linię zbiorczą `/projekt/* /realizacje/ 301` jako ostatnią i nie zawiera `badz-zyczliwy`.
- [ ] **Step 2:** FAIL → implementacja → PASS. Po `npm run build` plik `dist/_redirects` ma 11 par linii + zbiorczą; `dist/sitemap-index.xml` istnieje.
- [ ] **Step 3:** `404.astro`: „Nie ma takiej strony" + linki do realizacji i kontaktu. `netlify.toml`: `command = "npm run build"`, `publish = "dist"`, Node 22.
- [ ] **Step 4:** Commit `feat: przekierowania starych adresów, 404, mapa strony`.

### Task 10: Panel dla zespołu i instrukcja

**Files:**
- Create: `.pages.yml`, `README.md`
- Test: `tests/unit/cms.test.ts`

**Interfaces:**
- Consumes: schemat z `src/content.config.ts`, `TYPES`, `SERVICES`.

- [ ] **Step 1: Test** (`cms.test.ts`, parsuje `.pages.yml` przez `yaml`): kolekcja `realizacje` ma `path: src/content/realizacje`; nazwy pól w panelu są dokładnie zbiorem pól schematu (`title, client, types, services, dateLabel, year, place, highlight, stats, scope, strength, cover, gallery, video, featured, oldSlug` + `body`); opcje pola `types` równe kluczom `TYPES`, pola `services` kluczom `SERVICES`; `media.input` wskazuje `src/assets/realizacje`.
- [ ] **Step 2:** FAIL → napisz `.pages.yml` z polskimi etykietami pól („Tytuł", „Klient", „Typ wydarzenia", „Wyróżnik na kafelek (maks. 40 znaków)" itd.) → PASS.
- [ ] **Step 3:** `README.md` po polsku: jak dodać realizację przez panel (5 kroków), jak przez Claude'a (co podać: tytuł, klient, typ, data, miejsce, wyniki, opis, zdjęcia), jak wysłać link z filtrem (przykłady adresów dla 4 typów), jak uruchomić lokalnie.
- [ ] **Step 4:** Commit `feat: panel Pages CMS i instrukcja dla zespołu`.

### Task 11: Publikacja na adresie testowym

Wymaga działań właściciela; kroki oznaczone **[właściciel]** nie mogą być wykonane przez agenta.

- [ ] **Step 1 [właściciel]:** Utworzyć puste, prywatne repozytorium `bart-maz/gawra-warszawska` i dać sesji Claude do niego dostęp (integracja GitHub w ustawieniach claude.ai).
- [ ] **Step 2:** `git remote add origin`, `git push -u origin main`.
- [ ] **Step 3 [właściciel]:** Założyć konto Netlify (logowanie przez GitHub), „Add new site → Import from GitHub → gawra-warszawska"; w ustawieniach formularzy włączyć wykrywanie formularzy i powiadomienia e-mail na `biuro@gawra-warszawska.pl`.
- [ ] **Step 4 [właściciel]:** Wejść na `app.pagescms.org`, zalogować się kontem GitHub, wybrać repozytorium.
- [ ] **Step 5:** Na adresie testowym sprawdzić: `/realizacje/?typ=konferencje` pokazuje 4 karty; `/projekt/provi-tv/` przekierowuje; testowe zgłoszenie formularza dociera na skrzynkę; Lighthouse (mobile) wydajność ≥ 90 dla `/` i `/realizacje/`.
- [ ] **Step 6:** Przekazać właścicielowi adres testowy do akceptacji. Przepięcie domeny to osobny krok po akceptacji, poza tym planem.
