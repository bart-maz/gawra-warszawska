# Gawra Warszawska: strona agencji

Statyczna strona zbudowana w Astro. Każda realizacja to jeden plik w `src/content/realizacje/` i folder zdjęć w `src/assets/realizacje/`. Po każdej zmianie w repozytorium Netlify sam publikuje nową wersję (zwykle w 2–3 minuty).

## Jak dodać realizację przez panel

1. Wejdź na https://app.pagescms.org i zaloguj się kontem GitHub.
2. Wybierz repozytorium `gawra-warszawska`, a potem „Realizacje” → „Dodaj”.
3. Wypełnij pola. Najważniejsze: tytuł, klient, typ wydarzenia, wyróżnik na kafelek (krótko, najlepiej liczba) i wyniki.
4. Wgraj zdjęcie główne i 3–12 zdjęć do galerii. Możesz wgrywać oryginały, strona sama je zmniejszy.
5. Kliknij „Zapisz”. Realizacja pojawi się na stronie po kilku minutach.

## Jak dodać realizację przez Claude'a

Napisz „dodaj realizację” i podaj: tytuł, klienta, typ wydarzenia, datę, miejsce, wyniki (liczby), opis, zakres działań, najmocniejszą stronę projektu oraz zdjęcia. Claude utworzy plik, przygotuje zdjęcia i opublikuje zmianę.

## Linki z filtrem do maili

Filtr zapisuje się w adresie, więc odbiorca od razu widzi właściwe realizacje:

- Konferencje: `https://gawra-warszawska.pl/realizacje/?typ=konferencje`
- Festiwale i plenery: `https://gawra-warszawska.pl/realizacje/?typ=festiwale`
- Strefy promocyjne: `https://gawra-warszawska.pl/realizacje/?typ=strefy-promocyjne`
- Wydarzenia specjalne: `https://gawra-warszawska.pl/realizacje/?typ=specjalne`
- Realizacje jednego klienta: `https://gawra-warszawska.pl/realizacje/?klient=samsung`
- Łączenie filtrów: `https://gawra-warszawska.pl/realizacje/?typ=konferencje&usluga=scenografia`

Najprościej: ustaw filtry na stronie i skopiuj adres z paska przeglądarki.

## Portfolio PDF do wysyłki mailowej

Plik `portfolio/Gawra-Warszawska-portfolio.pdf` powstaje z tych samych realizacji co strona. Po zmianie treści wygeneruj go ponownie:

```bash
npm run portfolio
```

Wybór i kolejność realizacji ustawia lista `SELECTION` na górze `scripts/build-portfolio.mjs`. Realizacja w portfolio musi mieć zakres działań, najmocniejszą stronę i co najmniej 3 zdjęcia w galerii. Skrypt sam dopasowuje wielkość tekstu i przerywa, jeśli coś się nie mieści na stronie albo plik przekracza 10 MB.

## Formularz „Umów spotkanie”

Zgłoszenia obsługuje Netlify Forms (formularz `spotkanie`). Powiadomienia e-mail ustawia się w panelu Netlify: Forms → Form notifications.

## Dla programistów

```bash
npm install
npm run dev        # podgląd lokalny
npm run check      # testy jednostkowe, budowanie, testy w przeglądarce
```

- Słowniki typów i usług: `src/lib/taxonomy.ts` (po zmianie zaktualizuj też `.pages.yml`; pilnuje tego test).
- Pola realizacji: `src/content.config.ts`.
- Stare adresy `/projekt/...` przekierowuje plik `_redirects` generowany przy budowaniu z pola `oldSlug`.
- Projekt i plan: `docs/`.
