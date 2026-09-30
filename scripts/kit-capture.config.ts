import { defineConfig, devices } from "@playwright/test";

/**
 * The provisional captures of the engine and the game — CHANTIERS.md A7.12.b,
 * decided 2026-09-29 (C21): take them now, marked `provisoire-`, and redo
 * them against the opened products (A7.12.c). Not a test suite: its own
 * config, outside `e2e/`, so CI never runs it. The Tour's captures stay in
 * `kit-screenshots.mjs`, which needs no browser state.
 *
 * Against a LOCAL production build with both products open. Both flags at
 * build too: the space band of the prerendered game pages reads the engine's
 * flag then, and a build without it prints the engine as "soon" there.
 *
 *   GAME_ENABLED=true ENGINE_ENABLED=true npm run build
 *   GAME_ENABLED=true ENGINE_ENABLED=true npx next start -p 3000 &
 *   npx playwright test --config scripts/kit-capture.config.ts
 */
export default defineConfig({
  testDir: ".",
  testMatch: /kit-provisional\.capture\.ts$/,
  workers: 1,
  reporter: [["list"]],
  use: { ...devices["Desktop Chrome"], baseURL: process.env.SITE ?? "http://localhost:3000", deviceScaleFactor: 2 },
});
