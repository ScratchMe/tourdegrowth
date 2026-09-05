import { defineConfig, devices } from "@playwright/test";

/**
 * REVIEW.md R-07 — every step of this project was verified with Playwright
 * (see CLAUDE.md), but always through throwaway scripts that were never
 * committed. The `data-testid` hooks were already in the app; only the specs
 * were missing, so nothing protected the critical path from a regression.
 *
 * Chromium only: this is a solo side project, and one engine catching real
 * flow regressions beats three engines nobody maintains.
 *
 * The specs run against a PRODUCTION build (`next start`), not `next dev` —
 * the bugs worth catching here (hydration, RSC payloads, redirects) behave
 * differently between the two. Run `npm run build` first; CI does that as its
 * own step so a build failure reports as a build failure.
 */
const PORT = 3210;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"], ["list"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}/how-it-works`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
