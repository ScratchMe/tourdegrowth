import { defineConfig, devices } from "@playwright/test";

/** The engine's density captures (brief 07) — see `engine-density.capture.ts` for how to run them. */
export default defineConfig({
  testDir: ".",
  testMatch: /engine-density\.capture\.ts$/,
  workers: 1,
  reporter: [["list"]],
  timeout: 90_000,
  use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:3000", deviceScaleFactor: 2 },
});
