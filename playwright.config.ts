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
// `E2E_PORT` lets several checkouts run the suite side by side on one
// machine without sharing a port — and so without `reuseExistingServer`
// silently serving another checkout's build (CLAUDE.md, R-09).
const PORT = Number(process.env.E2E_PORT ?? 3210);

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
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    // The accessibility pass again, at the phone width DESIGN-BRIEF fixes
    // (ds-critique M-7, 2026-09-24). Every `@media (max-width: 760px)` rule
    // — smaller type, restacked cards, different colour pairs — used to
    // escape the "no known contrast gap" guarantee, because the only project
    // ran at 1280. Scoped to that one spec: the rest of the suite already
    // sets its own mobile viewports where layout is what it tests, and
    // running everything twice would double CI for no new signal.
    {
      name: "mobile",
      testMatch: /accessibility\.spec\.ts$/,
      use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: {
    command: `npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}/how-it-works`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
