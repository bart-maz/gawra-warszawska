import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://gawra-warszawska.pl",
  trailingSlash: "always",
  integrations: [sitemap()],
});
