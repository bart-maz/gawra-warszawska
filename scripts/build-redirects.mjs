// Writes dist/_redirects so links to the old WordPress site (/projekt/<stara-nazwa>/) keep working.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export function buildRedirects(projects) {
  const lines = [];
  for (const p of projects) {
    if (!p.oldSlug) continue;
    lines.push(`/projekt/${p.oldSlug}/ /realizacje/${p.slug}/ 301`, `/projekt/${p.oldSlug} /realizacje/${p.slug}/ 301`);
  }
  lines.push("/index.php/* / 301", "/projekt/* /realizacje/ 301");
  return lines.join("\n") + "\n";
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { default: matter } = await import("gray-matter");
  const dir = "src/content/realizacje";
  const projects = readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => ({ slug: f.replace(/\.md$/, ""), oldSlug: matter(readFileSync(join(dir, f), "utf8")).data.oldSlug }));
  writeFileSync("dist/_redirects", buildRedirects(projects));
  console.log(`_redirects: ${projects.filter((p) => p.oldSlug).length} starych adresów`);
}
