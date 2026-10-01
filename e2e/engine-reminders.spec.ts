import { readFile } from "node:fs/promises";
import type { Page } from "@playwright/test";
import { ENGINE_COPY } from "@/content/engine-copy";
import { exampleState } from "../src/lib/engine/__tests__/fixtures";
import { ADMIN_PASSWORD, expect, grantOwnerPreview, SKIP_ADMIN_REASON, test } from "./helpers";
import { engineSeed } from "./engine-helpers";

// The page ships closed (engine-flag.spec.ts): every test opens it with the
// owner's signed preview, minted by /admin/preview (e2e/helpers.ts).
test.skip(!ADMIN_PASSWORD, SKIP_ADMIN_REASON);
test.beforeEach(async ({ context }) => {
  await grantOwnerPreview(context.request, "engine");
});

/**
 * The two reminders, as calendar files (engine spec §19.9, C32 Q15, A14 T6).
 * The file's grammar is `ics.test.ts`'s; here, what a browser downloads —
 * and that it carries no value, no company name, nothing typed.
 */
const COMPANY = "Canary Corp";

async function open(page: Page, locale: "en" | "fr"): Promise<void> {
  await page.clock.setFixedTime(new Date(2026, 8, 24, 12));
  const state = { ...exampleState(), setup: { ...exampleState().setup, companyLabel: COMPANY } };
  await page.addInitScript((items) => {
    if (sessionStorage.getItem("e2e-engine-seeded")) return;
    for (const [key, value] of items) localStorage.setItem(key, value);
    sessionStorage.setItem("e2e-engine-seeded", "1");
  }, engineSeed(state));
  await page.goto(`/${locale}/aarrr-funnel-template`);
  await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
  await expect(page.getByTestId("engine-board")).toBeVisible();
}

async function downloaded(page: Page, click: () => Promise<void>): Promise<{ name: string; text: string }> {
  const download = page.waitForEvent("download");
  await click();
  const file = await download;
  return { name: file.suggestedFilename(), text: await readFile((await file.path())!, "utf8") };
}

test.describe("reminders", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  test("« Me le rappeler » after a request: the role and the numbers' names, five days on, and nothing typed", async ({ page }) => {
    await open(page, "fr");
    await page.getByTestId("engine-tab-revenue").click();
    const toggle = page.getByTestId("engine-metric-rev-gross-margin");
    if ((await toggle.getAttribute("aria-expanded")) !== "true") await toggle.click();
    const sheet = page.getByTestId("engine-sheet-rev-gross-margin");
    await sheet.getByRole("radio", { name: ENGINE_COPY.sheet.willAsk.fr }).check();
    await sheet.getByTestId("engine-request-copy").click();
    const ics = await downloaded(page, () => sheet.getByTestId("engine-request-remind").click());
    expect(ics.name).toBe("tdg-rappel-2026-09-29.ics");
    expect(ics.text).toMatch(/^BEGIN:VCALENDAR\r\n/);
    expect(ics.text).toContain("DTSTART:20260929T090000\r\n");
    expect(ics.text).toContain("SUMMARY:Relancer Finance : 1 chiffre du moteur\r\n");
    expect(ics.text).toContain("Marge brute");
    expect(ics.text).toContain("URL:http://");
    expect(ics.text).not.toContain(COMPANY);
    expect(ics.text).not.toContain("?");
  });

  for (const locale of ["en", "fr"] as const) {
    test(`« Remind me to start » the next month: the first working day after its flows (${locale})`, async ({ page }) => {
      await open(page, locale);
      const button = page.getByTestId("engine-month-remind");
      const month = locale === "fr" ? "septembre 2026" : "September 2026";
      await expect(button).toHaveText(ENGINE_COPY.reminders.month[locale].replace("{month}", month));
      const ics = await downloaded(page, () => button.click());
      expect(ics.name).toBe(locale === "fr" ? "tdg-rappel-2026-10-01.ics" : "tdg-reminder-2026-10-01.ics");
      expect(ics.text).toContain("DTSTART:20261001T090000\r\n");
      expect(ics.text).not.toContain(COMPANY);
      // No number of the engine goes in the file: the example's counts are nowhere in its words.
      const words = ics.text.split("\r\n").filter((l) => /^(SUMMARY|DESCRIPTION|URL):/.test(l)).join("\n");
      for (const n of ["820", "26000", "144", "800"]) expect(words).not.toContain(n);
    });
  }
});
