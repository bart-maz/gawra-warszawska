import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  reporter: "line",
  // BASE_URL=https://... runs the same tests against a deployed site instead of the local preview.
  use: { baseURL: process.env.BASE_URL ?? "http://localhost:4321", trace: "off" },
  webServer: process.env.BASE_URL
    ? undefined
    : { command: "npm run preview -- --port 4321", url: "http://localhost:4321", reuseExistingServer: true },
});
