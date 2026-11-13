// One-off import: downloads full-size photos of each case study from the old WordPress site.
// Usage: node scripts/import-images.mjs <newSlug>=<oldSlug> ...
import { mkdir, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";

const BASE = "https://gawra-warszawska.pl";
const get = (url, out) => execFileSync("curl", ["-sSL", "-m", "90", "-A", "Mozilla/5.0", ...(out ? ["-o", out] : []), url], { maxBuffer: 1 << 28 });

for (const pair of process.argv.slice(2)) {
  const [slug, old] = pair.split("=");
  const html = get(`${BASE}/projekt/${old}/`).toString("utf8");
  const main = html.split(/<footer/i)[0];
  const urls = [...main.matchAll(/https:\/\/gawra-warszawska\.pl\/wp-content\/uploads\/[^"' )]+?\.(?:jpe?g|png|webp)/gi)]
    .map((m) => m[0].replace(/-\d+x\d+(\.\w+)$/, "$1"))
    .filter((u) => !/sygnet|logo|fav|oh__img|team/i.test(u));
  const unique = [...new Set(urls)];
  const dir = `src/assets/realizacje/${slug}`;
  await mkdir(dir, { recursive: true });
  let i = 0;
  for (const u of unique) {
    i += 1;
    const ext = u.split(".").pop().toLowerCase().replace("jpeg", "jpg");
    get(u, `${dir}/${String(i).padStart(2, "0")}.${ext}`);
  }
  const text = main.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, "\n").replace(/&nbsp;/g, " ").replace(/\n\s*\n+/g, "\n").trim();
  await writeFile(`${dir}/_old.txt`, text);
  console.log(slug, unique.length, "images");
}
