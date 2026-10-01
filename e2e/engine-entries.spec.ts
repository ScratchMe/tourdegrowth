import { UI_STRINGS, tc } from "@/lib/i18n/dictionary";
import type { Page } from "@playwright/test";
import { exampleState } from "../src/lib/engine/__tests__/fixtures";
import { ENGINE_INDEX_KEY } from "../src/lib/engine/types";
import { expect, test } from "./helpers";
import { engineSeed } from "./engine-helpers";

/**
 * The landing's way back into the engine (engine spec §19.10, C32 Q16, A14
 * T6): « Ton moteur : août 2026, 11 sur 17 chiffres — le reprendre → », when the
 * device holds an engine — and only on a build that opened the engine. The
 * CI builds it closed, where the line must not exist, nor the engine's code
 * load; a build with `ENGINE_ENABLED=true` checks the open side. The result's
 * own door is in `result-real.spec.ts`, which needs a stored result.
 */
const ENGINE_OPEN = process.env.ENGINE_ENABLED === "true";

/**
 * Every script the page loads, read as it arrives. The engine's code is told
 * by its storage key: only the engine's modules hold it. A static search of
 * the landing's own script tags was tried first (A14 T6) and saw nothing on
 * the open build either — the chunk is reached through a loader in another
 * file — so this reads what the browser actually fetched.
 */
function loadedScripts(page: Page): () => Promise<string[]> {
  const bodies: Promise<string>[] = [];
  page.on("response", (response) => {
    if (new URL(response.url()).pathname.endsWith(".js")) bodies.push(response.text().catch(() => ""));
  });
  return () => Promise.all(bodies);
}

for (const locale of ["en", "fr"] as const) {
  test(`the landing names the engine on this device and its month — only when the build opened it (${locale})`, async ({ page }) => {
    await page.addInitScript((items) => {
      for (const [key, value] of items) localStorage.setItem(key, value);
    }, engineSeed(exampleState()));
    const scripts = loadedScripts(page);
    await page.goto(`/${locale}`);
    await expect(page.getByTestId("hero-cta")).toBeVisible();
    const line = page.getByTestId("landing-engine-resume");
    if (!ENGINE_OPEN) {
      // Give the island its chance to mount, then hold that nothing came — neither the line nor the code that reads the device.
      await page.waitForLoadState("networkidle");
      await expect(line).toHaveCount(0);
      // A count, not the bodies: a failure would otherwise print a 200 kB chunk.
      expect((await scripts()).filter((body) => body.includes(ENGINE_INDEX_KEY)).length, "a closed build loaded the engine's code on the landing").toBe(0);
      return;
    }
    const month = locale === "fr" ? "août 2026" : "August 2026";
    const expected = tc(UI_STRINGS.lastResult.engine, locale).replace("{month}", month).replace("{n}", "11").replace("{N}", "17");
    await expect(line).toContainText(expected);
    await expect(page.getByTestId("landing-engine-resume-link")).toHaveAttribute("href", `/${locale}/aarrr-funnel-template`);
    // The other side of the closed build's check: open, the line came from the engine's own code — the search can see it.
    expect((await scripts()).some((body) => body.includes(ENGINE_INDEX_KEY))).toBe(true);
  });
}

test("no engine on the device, no line — whatever the build", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByTestId("hero-cta")).toBeVisible();
  await page.waitForLoadState("networkidle");
  await expect(page.getByTestId("landing-engine-resume")).toHaveCount(0);
});
