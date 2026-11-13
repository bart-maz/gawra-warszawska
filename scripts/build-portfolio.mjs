// Builds the mailable PDF portfolio from the same case-study files the website uses.
// Usage: npm run portfolio            (links point at SITE_URL, default https://gawra-warszawska.pl)
import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import matter from "gray-matter";
import sharp from "sharp";
import { chromium } from "playwright";

// Which case studies go in, and in what order. Edit this list to change the selection.
const SELECTION = [
  "strefa-galaxy-fun-na-festiwalach",
  "dzien-dobry-tchibo",
  "galaxy-campus",
  "betclic-x-fame-mma",
  "provitv",
  "galaxy-live-back-to-school",
  "betclic-studio",
  "bezpieczny-lot",
  "30-lecie-uth",
];
const SITE = (process.env.SITE_URL ?? "https://gawra-warszawska.pl").replace(/\/$/, "");
const YEAR = new Date().getFullYear();
const TYPES = { konferencje: "Konferencje", festiwale: "Festiwale i plenery", "strefy-promocyjne": "Strefy promocyjne", specjalne: "Wydarzenia specjalne" };
const SERVICES = { eventy: "Eventy", scenografia: "Scenografia", technologia: "Technologia", kontent: "Produkcja kontentu" };
const CLIENTS = ["Samsung", "Tchibo", "Betclic", "Provident", "Hyundai", "Apart", "M1", "Sodexo", "Panattoni", "Maxi Zoo", "Exclusive Networks"];
const AREAS = [
  ["Eventy", "Przygotujemy koncepcję, zaprojektujemy doświadczenie i zorganizujemy wszystko od A do Zet. Niezależnie od skali i tematyki, z pełnym uwzględnieniem ram budżetowych i timingowych."],
  ["Scenografia", "Znamy trendy, współpracujemy z uznanymi scenografami i artystami. Łączymy piękno i funkcjonalność i pamiętamy o drugim życiu projektu na zdjęciach i filmach w social mediach."],
  ["Technologia", "Wprowadzamy rozwiązania, które dają uczestnikom iluzję magii: AI, CGI, mapping 3D czy siatki LED-owe. Nasz wielokrotnie nagradzany team kreatywny dopasuje je do potrzeb marki."],
  ["Produkcja kontentu", "Relacje z eventów, sesje produktowe, filmy poradnikowe, shooty reklamowe i kontent na social media. Od kreacji po plik emisyjny."],
];

const CONTENT = "src/content/realizacje";
const BUILD = ".portfolio-build";
const OUT = "portfolio/Gawra-Warszawska-portfolio.pdf";
mkdirSync(BUILD, { recursive: true });
mkdirSync(dirname(OUT), { recursive: true });

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const fileUrl = (p) => pathToFileURL(resolve(p)).href;

let n = 0;
async function img(src, width, height) {
  n += 1;
  const out = join(BUILD, `i${n}.jpg`);
  await sharp(src).rotate().resize(width, height, { fit: "cover", position: "attention" }).jpeg({ quality: 72, mozjpeg: true }).toFile(out);
  return fileUrl(out);
}

const projects = [];
for (const slug of SELECTION) {
  const file = join(CONTENT, `${slug}.md`);
  const { data, content } = matter(readFileSync(file, "utf8"));
  const abs = (rel) => resolve(dirname(file), rel);
  if (!data.scope || !data.strength || data.gallery.length < 3) throw new Error(`${slug}: portfolio needs scope, strength and at least 3 gallery photos`);
  projects.push({
    slug,
    data,
    paragraphs: content.trim().split(/\n\s*\n/).map((p) => p.replace(/\s+/g, " ").trim()),
    cover: await img(abs(data.cover), 1800, 1273),
    thumb: await img(abs(data.cover), 700, 440),
    photos: [await img(abs(data.gallery[0]), 1000, 560), await img(abs(data.gallery[1]), 500, 380), await img(abs(data.gallery[2]), 500, 380)],
  });
}
const coverImg = await img(resolve("src/assets/realizacje/galaxy-campus/01.jpg"), 1800, 1273);
const teamImg = await img(resolve("src/assets/brand/zespol.jpg"), 1400, 600);
const logo = fileUrl("src/assets/brand/sygnet-white.png");
const font = (pkg, f) => `<link rel="stylesheet" href="${fileUrl(`node_modules/@fontsource/${pkg}/${f}.css`)}">`;

const footer = (label) => `<footer><span class="brand"><img src="${logo}" alt="">Gawra Warszawska</span><span>${esc(label)}</span><span>Portfolio ${YEAR}</span></footer>`;

const casePages = projects.map((p, i) => {
  const d = p.data;
  const url = `${SITE}/realizacje/${p.slug}/`;
  const num = `${String(i + 1).padStart(2, "0")} / ${String(projects.length).padStart(2, "0")}`;
  const facts = [["Klient", d.client], ["Typ projektu", d.types.map((t) => TYPES[t]).join(", ")], ["Data", d.dateLabel], ["Miejsce", d.place], ["Usługi", d.services.map((s) => SERVICES[s]).join(", ")]].filter((f) => f[1]);
  return `
<section class="page opener">
  <img class="bleed" src="${p.cover}" alt="">
  <div class="shade"></div>
  <div class="inner">
    <p class="num">${num}</p>
    <div class="bottom">
      <p class="client">${esc(d.client)}</p>
      <h2>${esc(d.title)}</h2>
      ${d.stats.length ? `<ul class="stats">${d.stats.slice(0, 2).map((s) => `<li><b>${esc(s.value)}</b><span>${esc(s.label)}</span></li>`).join("")}</ul>` : `<p class="tagline">${esc(d.highlight)}</p>`}
    </div>
  </div>
</section>
<section class="page detail">
  <div class="cols">
    <div class="text">
      <dl class="facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
      <div class="desc">${p.paragraphs.map((x) => `<p>${esc(x)}</p>`).join("")}</div>
      <div class="pair">
        <div><h3>Odpowiedzialność i działania</h3><p>${esc(d.scope)}</p></div>
        <div><h3>Najmocniejsza strona projektu</h3><p>${esc(d.strength)}</p></div>
      </div>
    </div>
    <div class="photos">
      <img class="big" src="${p.photos[0]}" alt="">
      <img src="${p.photos[1]}" alt=""><img src="${p.photos[2]}" alt="">
      <a class="more" href="${url}">Więcej zdjęć i szczegóły na stronie →</a>
    </div>
  </div>
  ${footer(d.title)}
</section>`;
}).join("");

const html = `<!doctype html><html lang="pl"><head><meta charset="utf-8"><title>Gawra Warszawska: portfolio ${YEAR}</title>
${font("big-shoulders-display", "latin-700")}${font("big-shoulders-display", "latin-ext-700")}${font("big-shoulders-display", "latin-900")}${font("big-shoulders-display", "latin-ext-900")}
${font("manrope", "latin-400")}${font("manrope", "latin-ext-400")}${font("manrope", "latin-500")}${font("manrope", "latin-ext-500")}${font("manrope", "latin-700")}${font("manrope", "latin-ext-700")}
<style>
  @page { size: 297mm 210mm; margin: 0; }
  :root { --black: #0b0b0c; --ink: #141416; --line: #2e2e33; --white: #fff; --soft: #cfccc7; --grey: #8d8a86; --red: #e0092f; --red-text: #ff4d61;
    --display: "Big Shoulders Display", "Arial Narrow", sans-serif; --body: "Manrope", system-ui, sans-serif; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { background: var(--black); color: var(--white); font-family: var(--body); font-size: 10.5pt; line-height: 1.5; }
  .page { position: relative; width: 297mm; height: 210mm; overflow: hidden; page-break-after: always; background: var(--black); padding: 16mm 18mm 18mm; }
  h1, h2, h3, .disp { font-family: var(--display); text-transform: uppercase; font-weight: 900; line-height: 0.88; }
  a { color: inherit; }
  ul { list-style: none; }
  .bleed { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(11,11,12,.72), rgba(11,11,12,.12) 38%, rgba(11,11,12,.96)); }
  .inner { position: relative; height: 100%; display: flex; flex-direction: column; justify-content: space-between; }
  .label { font-size: 8pt; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--red-text); }
  footer { position: absolute; left: 18mm; right: 18mm; bottom: 8mm; display: flex; justify-content: space-between; align-items: center; font-size: 7.5pt; letter-spacing: .1em; text-transform: uppercase; color: var(--grey); }
  footer .brand { display: flex; align-items: center; gap: 2mm; color: var(--white); font-weight: 700; }
  footer .brand img { width: 4.5mm; height: auto; }

  /* cover */
  .cover .top { display: flex; justify-content: space-between; align-items: center; font-size: 9pt; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
  .cover .top span:first-child { display: flex; align-items: center; gap: 3mm; }
  .cover .top img { width: 9mm; }
  .cover h1 { font-size: 150pt; letter-spacing: -.01em; }
  .cover h1 em { font-style: normal; color: var(--red); }
  .cover .sub { font-size: 14pt; max-width: 120mm; color: #e6e3de; margin-top: 5mm; }

  /* about */
  .about .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12mm; height: 100%; }
  .about h2 { font-size: 62pt; margin: 3mm 0 7mm; }
  .about .txt p { color: var(--soft); font-size: 11.5pt; margin-bottom: 4mm; }
  .about .side { display: flex; flex-direction: column; gap: 5mm; justify-content: center; }
  .about .side img { width: 100%; height: auto; }
  .about .team { display: flex; flex-wrap: wrap; gap: 1mm 6mm; font-family: var(--display); font-weight: 700; text-transform: uppercase; font-size: 15pt; }

  /* services + clients */
  .what h2, .index h2 { font-size: 62pt; margin: 3mm 0 8mm; }
  .areas { display: grid; grid-template-columns: repeat(4, 1fr); gap: 7mm; }
  .areas li { border-top: .6mm solid var(--white); padding-top: 4mm; }
  .areas h3 { font-size: 22pt; font-weight: 700; margin-bottom: 3mm; line-height: 1; }
  .areas p { color: var(--soft); font-size: 9.6pt; }
  .clients { margin-top: 11mm; }
  .clients ul { display: flex; flex-wrap: wrap; gap: 1mm 7mm; font-family: var(--display); font-weight: 900; text-transform: uppercase; font-size: 31pt; line-height: 1.05; margin-top: 2mm; }
  .clients li:nth-child(even) { color: var(--grey); }

  /* index */
  .tiles { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm; }
  .tiles a { position: relative; display: block; height: 38.5mm; overflow: hidden; text-decoration: none; }
  .tiles img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .tiles a::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 25%, rgba(11,11,12,.93)); }
  .tiles .t { position: absolute; z-index: 1; left: 4mm; right: 4mm; bottom: 3mm; }
  .tiles .c { font-size: 7pt; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--red-text); }
  .tiles .n { font-family: var(--display); font-weight: 700; text-transform: uppercase; font-size: 17pt; line-height: .95; }
  .tiles .f { position: absolute; z-index: 1; top: 3mm; left: 3mm; background: var(--white); color: var(--black); font-size: 7.5pt; font-weight: 700; padding: .8mm 2mm; }

  /* case opener */
  .opener .num { font-size: 9pt; font-weight: 700; letter-spacing: .14em; }
  .opener .client { font-size: 10pt; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--red-text); margin-bottom: 2mm; }
  .opener h2 { font-size: 86pt; max-width: 235mm; }
  .stats { display: flex; gap: 16mm; margin-top: 7mm; }
  .stats li { max-width: 95mm; }
  .stats b { display: block; font-family: var(--display); font-weight: 900; font-size: 58pt; line-height: .9; white-space: nowrap; }
  .stats span { display: block; font-size: 10pt; color: #e6e3de; margin-top: 1mm; }
  .tagline { margin-top: 6mm; display: inline-block; background: var(--white); color: var(--black); font-weight: 700; font-size: 12pt; padding: 1.5mm 4mm; }

  /* case detail */
  .detail .cols { display: grid; grid-template-columns: 1.32fr 1fr; gap: 12mm; height: 100%; }
  .detail .text { display: flex; flex-direction: column; gap: 6mm; min-height: 0; }
  .facts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3.5mm 6mm; border-bottom: .3mm solid var(--line); padding-bottom: 5mm; }
  .facts dt, .pair h3 { font-family: var(--body); font-size: 7.2pt; font-weight: 700; letter-spacing: .13em; text-transform: uppercase; color: var(--red-text); line-height: 1.4; }
  .facts dd { font-size: calc(9.6pt * var(--k, 1)); line-height: 1.35; margin-top: .6mm; }
  .desc p { font-size: calc(9.8pt * var(--k, 1)); color: var(--soft); margin-bottom: 2.6mm; }
  .pair { display: grid; grid-template-columns: 1fr 1.25fr; gap: 7mm; }
  .pair h3 { margin-bottom: 1.4mm; }
  .pair p { font-size: calc(8.9pt * var(--k, 1)); line-height: 1.45; }
  .photos { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 84mm 58mm auto; gap: 3mm; align-content: start; }
  .photos img { width: 100%; height: 100%; object-fit: cover; }
  .photos .big { grid-column: 1 / -1; }
  .more { grid-column: 1 / -1; justify-self: start; margin-top: 2mm; font-weight: 700; font-size: 10pt; text-decoration: none; border-bottom: .5mm solid var(--red); padding-bottom: .8mm; }

  /* contact */
  .contact h2 { font-size: 104pt; max-width: 230mm; }
  .contact .who { display: grid; grid-template-columns: auto 1fr; gap: 14mm; align-items: end; }
  .contact .who .name { font-family: var(--display); font-weight: 900; text-transform: uppercase; font-size: 36pt; line-height: 1; margin: 2mm 0 3mm; }
  .contact .who p { font-size: 13pt; }
  .contact .who a { text-decoration: none; border-bottom: .3mm solid #55555c; }
  .cta { display: inline-block; background: var(--red); color: var(--white); font-weight: 700; font-size: 13pt; padding: 4mm 8mm; text-decoration: none; }
  .contact .right { justify-self: end; text-align: right; display: grid; gap: 4mm; justify-items: end; }
  .contact .addr { font-size: 9.5pt; color: var(--soft); }
</style></head><body>

<section class="page cover">
  <img class="bleed" src="${coverImg}" alt=""><div class="shade"></div>
  <div class="inner">
    <div class="top"><span><img src="${logo}" alt="">Gawra Warszawska</span><span>Agencja eventowa · ${YEAR}</span></div>
    <div><h1>Port<em>folio</em></h1><p class="sub">Kreujemy niebanalne wrażenia. Konferencje, strefy festiwalowe i wydarzenia marek, od idei po ostatni kabel.</p></div>
  </div>
</section>

<section class="page about">
  <div class="grid">
    <div class="txt">
      <p class="label">Kim jesteśmy</p>
      <h2>Chcemy zostać zapamiętani</h2>
      <p>Brzmi to dość górnolotnie, ale faktycznie niewiele jest momentów w życiu, które zostają z nami na dłużej. Dlatego jeżeli mamy szansę wykreować niezapomniane doświadczenie, daje nam to ogromną satysfakcję z pracy.</p>
      <p>Jako agencja eventowa działamy już niemal dekadę, ale część naszego zespołu zna się nawet dłużej. Uzupełniamy się pod kątem kompetencji i mamy podobny gust muzyczny, więc rzadko kłócimy się o playlistę na open spejsie.</p>
      <p>Wyróżnia nas przekonanie, że za eventem powinna stać idea, która definiuje jego charakter, scenografię, atrakcje, rozwiązania technologiczne i wyznacza komunikację. Wokół niej budujemy wszystkie elementy, aby spięły się w spójną całość.</p>
    </div>
    <div class="side">
      <img src="${teamImg}" alt="">
      <ul class="team"><li>Dawid Sobieraj</li><li>Aldona Michalak</li><li>Kuba Woźniak</li><li>Piotr Samulski</li><li>Zuza Woś</li></ul>
    </div>
  </div>
  ${footer("Kim jesteśmy")}
</section>

<section class="page what">
  <p class="label">Co robimy</p>
  <h2>Od idei po ostatni kabel</h2>
  <ul class="areas">${AREAS.map(([t, x]) => `<li><h3>${t}</h3><p>${x}</p></li>`).join("")}</ul>
  <div class="clients">
    <p class="label">Zaufali nam</p>
    <ul>${CLIENTS.map((c) => `<li>${c}</li>`).join("")}</ul>
  </div>
  ${footer("Co robimy")}
</section>

<section class="page index">
  <p class="label">Wybrane realizacje</p>
  <h2>${projects.length} projektów, które zostały zapamiętane</h2>
  <div class="tiles">${projects.map((p) => `<a href="${SITE}/realizacje/${p.slug}/"><img src="${p.thumb}" alt=""><span class="f">${esc(p.data.highlight)}</span><span class="t"><span class="c">${esc(p.data.client)}</span><br><span class="n">${esc(p.data.title)}</span></span></a>`).join("")}</div>
  ${footer("Wybrane realizacje")}
</section>
${casePages}
<section class="page contact">
  <div class="inner">
    <p class="label">Kontakt</p>
    <h2>Co możemy dla Was zrobić?</h2>
    <div class="who">
      <div>
        <p class="label">Porozmawiajmy</p>
        <p class="name">Dawid Sobieraj</p>
        <p><a href="mailto:dawid@gawra-warszawska.pl">dawid@gawra-warszawska.pl</a></p>
        <p><a href="tel:+48604774276">604 774 276</a></p>
      </div>
      <div class="right">
        <a class="cta" href="${SITE}/kontakt/">Umów spotkanie →</a>
        <p class="addr">Wszystkie realizacje: <a href="${SITE}/realizacje/">${SITE.replace("https://", "")}/realizacje</a><br>Gawra Warszawska · Duchnicka 3 bud. Defabryka · 01-796 Warszawa</p>
      </div>
    </div>
  </div>
</section>
</body></html>`;

const htmlPath = join(BUILD, "portfolio.html");
writeFileSync(htmlPath, html);

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(fileUrl(htmlPath), { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
// Each detail page gets the largest text size (up to +35%) at which its text column still fits.
await page.evaluate(() => {
  for (const d of document.querySelectorAll(".detail")) {
    const text = d.querySelector(".text");
    const limit = d.getBoundingClientRect().bottom - 60;
    for (let k = 1.35; k >= 0.9; k -= 0.05) {
      d.style.setProperty("--k", k.toFixed(2));
      if (text.lastElementChild.getBoundingClientRect().bottom <= limit) break;
    }
  }
});
// Fail the build if any page's content does not fit, instead of silently clipping text.
const overflow = await page.evaluate(() =>
  [...document.querySelectorAll(".page")].flatMap((p, i) => {
    const bottom = p.getBoundingClientRect().bottom - (p.querySelector("footer") ? 45 : 20);
    const bad = [...p.querySelectorAll("p, li, dd, h1, h2, h3, a.more, img:not(.bleed):not(footer img)")].filter((el) => {
      const r = el.getBoundingClientRect();
      return r.bottom > bottom + 1 || r.right > p.getBoundingClientRect().right + 1;
    });
    return bad.length ? [`strona ${i + 1}: ${bad.length} elementów poza polem (${bad[0].tagName} "${(bad[0].textContent || "").slice(0, 40)}")`] : [];
  }),
);
const fontsOk = await page.evaluate(() => document.fonts.check('900 20px "Big Shoulders Display"') && document.fonts.check('400 12px "Manrope"'));
const expected = 5 + projects.length * 2;
await page.pdf({ path: OUT, width: "297mm", height: "210mm", printBackground: true, preferCSSPageSize: true });
const pages = await page.locator(".page").count();
await browser.close();

const mb = statSync(OUT).size / 1e6;
console.log(`${OUT}: ${pages} stron, ${mb.toFixed(1)} MB, linki → ${SITE}`);
const problems = [...overflow];
if (!fontsOk) problems.push("kroje pisma nie załadowały się");
if (pages !== expected) problems.push(`oczekiwano ${expected} stron, jest ${pages}`);
if (mb > 10) problems.push(`plik ma ${mb.toFixed(1)} MB, limit to 10 MB`);
if (problems.length) {
  console.error("PROBLEMY:\n- " + problems.join("\n- "));
  process.exit(1);
}
