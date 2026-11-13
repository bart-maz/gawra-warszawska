# Nowa strona Gawry Warszawskiej: projekt

Data: 2026-11-13. Status: zaakceptowany przez właściciela 2026-11-13.

## Po co to robimy

Gawra wysyła do firm maile z zaproszeniem na spotkanie i linkiem do realizacji. Odbiorca (osoba z marketingu, HR lub komunikacji w firmie planującej konferencję, strefę festiwalową albo event marki) klika link, najczęściej na telefonie, i w minutę lub dwie ma zobaczyć: „robili dokładnie to, czego potrzebuję, dla marek tej skali". Potem ma umówić spotkanie.

Obecna strona (WordPress, motyw Ohio, Elementor) pokazuje realizacje jako kafelki na stronie głównej, bez filtrów, bez wyników liczbowych i z pozostałościami po szablonie.

## Cele

1. Portfolio z filtrowaniem, w którym każdą realizację da się wysłać linkiem, także jako przefiltrowaną listę (np. same konferencje).
2. Każda realizacja jako krótkie case study: wynik liczbowy na górze, zakres działań, zdjęcia, jedno wezwanie do działania.
3. Zespół dodaje kolejne realizacje sam: przez formularz w przeglądarce albo zlecając to Claude'owi.
4. Nowoczesny wygląd w kolorach czerwony / biały / czarny, kierunek „A. Scena".
5. Bardzo szybkie ładowanie i pełna wygoda na telefonie.

## Poza zakresem (na teraz)

- Wersja angielska (struktura ma jej nie blokować).
- Blog, aktualności, strefa klienta, logowanie dla odwiedzających.
- Rezerwacja terminu w kalendarzu online (patrz „Decyzje do potwierdzenia").
- Nowy logotyp lub nowa identyfikacja; używamy obecnego sygnetu z niedźwiedziem.

## Czego unikamy

- Strony, na której realizacja to tylko galeria bez liczb i bez kontekstu.
- Linku z maila, który prowadzi do ogólnej strony głównej zamiast do konkretów.
- Panelu, którego zespół boi się dotknąć.
- Czerwieni wszędzie: gryzie się z kolorowymi zdjęciami z eventów.
- Treści wypełniających i pozostałości po szablonie.

## Rozważane podejścia

- **A. Lekka strona statyczna z realizacjami jako plikami (wybrane).** Każda realizacja to plik tekstowy z polami plus folder zdjęć. Claude dodaje realizację, tworząc plik; zespół ma formularz w przeglądarce. Najszybsza, tania w utrzymaniu, pełna swoboda projektu. Koszt: konto GitHub i przepięcie domeny.
- **B. Autorski motyw WordPress.** Zostaje znany panel i hosting, ale strona jest wolniejsza, wymaga aktualizacji i wtyczek, a Claude nie ma dostępu do serwera.
- **C. Strona statyczna z zewnętrznym systemem treści (np. Sanity).** Najwygodniejszy panel, ale dodatkowa usługa i konto; przerost formy przy kilkunastu realizacjach.

Wybór właściciela: A, bo najlepiej obsługuje oba sposoby dodawania realizacji i daje najszybszą stronę.

## Wygląd: kierunek „A. Scena"

Wybrany przez właściciela na podstawie makiet: https://claude.ai/artifact/NAg5AXyE4LBgfAvcNx5RPt

- Czarne tło (`#0b0b0c`), biały tekst, czerwień marki (`#e0092f`) wyłącznie jako sygnał: główne przyciski, nazwa klienta, aktywny filtr, wyróżnione słowo w nagłówku.
- Zdjęcia z realizacji niosą stronę: pełna szerokość w otwarciu, duże kafelki w portfolio.
- Nagłówki: wąski, ciężki krój wersalikami (Big Shoulders Display). Tekst: Manrope. Oba z polskimi znakami.
- Na każdym kafelku biała etykieta z jedną liczbą lub faktem (np. „10 000 uczestników"). To element przeniesiony z kierunku B.
- Ostre narożniki, bez cieni i gradientów poza przyciemnieniem zdjęć pod tekstem.
- Ruch oszczędny: płynne przefiltrowanie siatki, delikatne powiększenie zdjęcia po najechaniu. Szanujemy ustawienie „ogranicz ruch".

## Struktura strony

| Adres | Zawartość |
|---|---|
| `/` | Otwarcie z hasłem „Kreujemy niebanalne wrażenia", 4–6 wyróżnionych realizacji, skrót „co robimy", logotypy klientów, blok kontaktowy |
| `/realizacje/` | Wszystkie realizacje, filtry, licznik wyników |
| `/realizacje/<nazwa>/` | Podstrona realizacji |
| `/co-robimy/` | Cztery obszary: eventy, scenografia, technologia, produkcja kontentu |
| `/o-nas/` | Kim jesteśmy, zespół (5 osób) |
| `/kontakt/` | Formularz, telefon, e-mail, adres |

Stare adresy `/projekt/<nazwa>/` przekierowują na nowe `/realizacje/<nazwa>/`, żeby wysłane wcześniej linki działały.

## Portfolio i filtry

- Główny filtr: **typ wydarzenia**. Wartości startowe: Konferencje, Festiwale i plenery, Strefy promocyjne, Wydarzenia specjalne. „Strefy promocyjne” łączą eventy w centrach handlowych i promocję marki (decyzja właściciela). Realizacja może mieć więcej niż jeden typ.
- Filtry dodatkowe: **klient** i **usługa** (eventy, scenografia, technologia, produkcja kontentu).
- Wybrany filtr zapisuje się w adresie, np. `/realizacje/?typ=konferencje`. Taki link można wkleić do maila i odbiorca zobaczy od razu przefiltrowaną listę.
- Kolejność: wyróżnione najpierw, potem od najnowszych.
- Lista wartości filtrów powstaje z danych realizacji; nowy typ lub klient pojawia się w filtrach sam.

## Realizacja: pola

Schemat wzięty z portfolio PDF i obecnej strony.

| Pole | Wymagane | Przykład |
|---|---|---|
| Tytuł | tak | Strefa Galaxy Fun na festiwalach |
| Klient | tak | Samsung |
| Typ wydarzenia (lista) | tak | Festiwale i plenery |
| Usługi (lista) | tak | eventy, scenografia |
| Data (tekst) i rok (liczba do sortowania) | tak | „Lato 2023", 2023 |
| Miejsce | tak | Open'er, Clout, Juwenalia |
| Wyróżnik na kafelek | tak | 30 tys.+ odwiedzających |
| Wyniki (0–4 pary liczba + opis) | nie | 30 tys.+ / odwiedzających strefę |
| Opis | tak | 1–3 akapity |
| Odpowiedzialność i działania | tak | akapit |
| Najmocniejsza strona projektu | tak | akapit |
| Zdjęcie główne + galeria (3–12 zdjęć) | tak | |
| Wideo (link) | nie | |
| Wyróżniona na stronie głównej | nie | tak/nie |

### Podstrona realizacji, od góry

1. Tytuł, klient, zdjęcie główne.
2. Wyniki dużą typografią (jeśli są).
3. Pasek faktów: klient, typ, data, miejsce, usługi.
4. Opis, „Odpowiedzialność i działania", „Najmocniejsza strona projektu".
5. Galeria, opcjonalnie wideo.
6. Przycisk „Umów spotkanie w sprawie podobnego projektu" z osobą kontaktową.
7. Dwie lub trzy podobne realizacje (ten sam typ).

## Realizacje na start

Trzynaście: dziesięć z PDF-u i trzy, które są tylko na obecnej stronie.

Z PDF-u: Dzień Dobry Tchibo, Galaxy Campus, Bądź życzliwy (M1), Betclic Studio, Strefy promocyjne Betclic x FAME MMA, Bezpieczny lot (Exclusive Networks), ProviTV, Galaxy Live „Back to School", Galaxy S24 Launch Event, Strefa Galaxy Fun na festiwalach.

Tylko z obecnej strony: CNK x wieczory dla dorosłych, Otwarcie hali LPP Logistics, 30-lecie UTH.

Teksty i liczby bierzemy z PDF-u (jest pełniejszy), zdjęcia z obecnej strony w pełnej rozdzielczości. Dla M1 i Galaxy S24 nie ma zdjęć na stronie; potrzebne oryginały od zespołu, do tego czasu używamy wycinków z PDF-u.

## „Umów spotkanie"

Jedno wezwanie do działania w całym serwisie. Prowadzi do bloku kontaktowego z:

- krótkim formularzem (imię, firma, e-mail, telefon, wiadomość), który wysyła zgłoszenie na `biuro@gawra-warszawska.pl`,
- osobą kontaktową ze zdjęciem: Dawid Sobieraj, `dawid@gawra-warszawska.pl`, 604 774 276.

Gdy formularz otwarto z podstrony realizacji, zgłoszenie zawiera jej nazwę.

## Dodawanie realizacji

- **Przez Claude'a:** właściciel podaje opis i zdjęcia; Claude tworzy plik realizacji, przygotowuje zdjęcia i publikuje zmianę.
- **Samodzielnie:** panel w przeglądarce z formularzem odpowiadającym polom powyżej, logowanie kontem GitHub. Zapis publikuje stronę automatycznie w ciągu kilku minut.
- Zdjęcia są automatycznie zmniejszane i kompresowane przy publikacji; zespół wgrywa oryginały.

## Jak to będzie zbudowane (decyzje Claude'a)

Właściciel zostawił wybór technologii; to są moje decyzje, do zmiany na życzenie.

- Generator stron: Astro. Realizacje jako pliki Markdown z polami w nagłówku, w jednym folderze, ze sprawdzaniem poprawności pól przy budowaniu.
- Kod i treści w repozytorium GitHub na koncie właściciela `bart-maz`.
- Hosting: Netlify (darmowy plan), z automatyczną publikacją po każdej zmianie i wbudowaną obsługą formularza.
- Panel dla zespołu: Pages CMS (działa na repozytorium GitHub, bez własnego serwera).
- Filtrowanie po stronie przeglądarki, bez przeładowania; strona działa też bez JavaScriptu (pokazuje wszystkie realizacje).
- Statystyki odwiedzin bez banera cookies (np. Plausible lub statystyki hostingu); obecny baner cookies znika, jeśli nie będzie żadnych skryptów śledzących.

## Ograniczenia

- Tylko polska wersja językowa.
- Domena `gawra-warszawska.pl` zostaje; przepięcie następuje dopiero po akceptacji gotowej strony na adresie testowym.
- Skrzynki e-mail w domenie nie mogą ucierpieć przy przepinaniu (zmieniamy wyłącznie rekordy strony WWW).
- Logotypy klientów pokazujemy tak jak dziś na stronie i w PDF-ie.

## Zostawione budującemu

- Dokładna skala typografii i odstępy, w duchu makiety.
- Układ sekcji „co robimy" i „o nas" (treści są w PDF-ie i na obecnej stronie).
- Liczba kolumn i rytm siatki portfolio na różnych szerokościach.
- Sposób prezentacji galerii (siatka albo przewijany pas).

## Decyzje właściciela (2026-11-13)

1. **ProviTV:** 700 uczestników. Liczba „7000" w PDF-ie to błąd.
2. **Umawianie spotkań:** krótki formularz wysyłany na `biuro@gawra-warszawska.pl` plus dane Dawida. Bez kalendarza online.
3. **GitHub:** konto `bart-maz`.
4. **Braki w materiałach:** ruszamy bez zdjęć M1 i Galaxy S24 w pełnej rozdzielczości oraz bez dat CNK, LPP i UTH; uzupełnienie później. Do tego czasu M1 i S24 używają wycinków z PDF-u, a CNK, LPP i UTH nie pokazują daty.
