import { readFile } from "node:fs/promises";
import type { Locator, Page } from "@playwright/test";
import { ENGINE_COPY } from "@/content/engine-copy";
import { hybridState } from "../src/lib/engine/__tests__/fixtures";
import type { EngineState, MetricId } from "../src/lib/engine/types";
import { ADMIN_PASSWORD, expect, grantOwnerPreview, SKIP_ADMIN_REASON, test } from "./helpers";
import { engineSeed } from "./engine-helpers";

// The page ships closed (engine-flag.spec.ts): every test opens it with the
// owner's signed preview, minted by /admin/preview (e2e/helpers.ts).
test.skip(!ADMIN_PASSWORD, SKIP_ADMIN_REASON);
test.beforeEach(async ({ context }) => {
  await grantOwnerPreview(context.request, "engine");
});

/**
 * The hybrid's whole journey (engine spec §18.10.3), FR and EN, at 1280 and
 * 390: an engine set up with both motions — self-serve already holding the
 * §6.0 example, sales-assisted's §18.9 numbers typed through its own sheets —
 * then the total's exact title, the two diagnoses, the coverage of each
 * motion, a reload that keeps everything, sales-assisted unticked (the board
 * is self-serve's alone, the warning said before saving) and ticked again
 * (its numbers come back), and a file that, exported, the device cleared and
 * imported, gives the same counts.
 *
 * Read from the screen and the device, never from the component's state.
 */
const NB = " ";

/** The §18.9 hybrid with sales-assisted empty: its targets kept (18 %, 32 %, 92 %), its numbers to type. */
function selfServeOnly(): EngineState {
  const state = hybridState();
  const snapshot = state.snapshots[0]!;
  for (const id of Object.keys(snapshot.metrics) as MetricId[]) if (id.startsWith("slg.") || id.startsWith("link.")) delete snapshot.metrics[id];
  delete snapshot.base;
  return state;
}

async function seed(page: Page, locale: "fr" | "en") {
  await page.clock.setFixedTime(new Date(2026, 8, 24, 12));
  await page.addInitScript(
    (items) => {
      if (sessionStorage.getItem("e2e-engine-seeded")) return;
      for (const [key, value] of items) localStorage.setItem(key, value);
      sessionStorage.setItem("e2e-engine-seeded", "1");
    },
    engineSeed(selfServeOnly()),
  );
  await page.goto(`/${locale}/aarrr-funnel-template`);
  await expect(page.getByTestId("engine-board")).toHaveAttribute("data-motions", "hybrid");
}

/** Sales-assisted's tab of a stage, then its sheet unfolded. */
async function openSheet(page: Page, stage: string, dom: string): Promise<Locator> {
  const tab = page.getByTestId(`engine-tab-${stage}`);
  if ((await tab.getAttribute("aria-selected")) !== "true") await tab.click();
  const toggle = page.getByTestId(`engine-metric-${dom}`);
  if ((await toggle.getAttribute("aria-expanded")) !== "true") await toggle.click();
  const sheet = page.getByTestId(`engine-sheet-${dom}`);
  await expect(sheet).toBeVisible();
  return sheet;
}

/** « I have it », two counts, a source, the first variant when the number has one — then saved. */
async function typeCounts(page: Page, locale: "fr" | "en", stage: string, dom: string, num: string, den: string) {
  const sheet = await openSheet(page, stage, dom);
  await sheet.locator(`#engine-${dom}-num`).fill(num);
  await sheet.locator(`#engine-${dom}-den`).fill(den);
  await sheet.locator(`#engine-${dom}-source`).selectOption({ index: 1 });
  const variant = sheet.getByRole("group", { name: ENGINE_COPY.sheet.variant[locale] });
  if ((await variant.count()) > 0) await variant.getByRole("radio").first().check();
  await sheet.getByTestId(`engine-save-${dom}`).click();
  await expect(sheet.getByTestId(`engine-saved-${dom}`)).not.toBeEmpty();
}

const found = (locale: "fr" | "en", n: number, N: number) => (locale === "fr" ? `${n} chiffres sur ${N} trouvés` : `${n} of ${N} numbers found`);

for (const locale of ["fr", "en"] as const) {
  for (const width of [1280, 390] as const) {
    test(`${locale} at ${width}: both motions, typed, kept, unticked, ticked again, exported and imported`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await seed(page, locale);

      // 2 — sales-assisted's numbers, through its sheets (§18.9.1).
      await page.getByTestId("engine-motion-selector").getByRole("button", { name: ENGINE_COPY.hybrid.motionName.slg[locale] }).click();
      await typeCounts(page, locale, "revenue", "slg-rev-win-rate", "18", "75");
      await typeCounts(page, locale, "acquisition", "slg-acq-lead-to-opp", "72", "480");
      await typeCounts(page, locale, "retention", "slg-ret-renewal", "22", "25");
      await typeCounts(page, locale, "revenue", "slg-rev-acv", "432000", "18");
      await typeCounts(page, locale, "revenue", "slg-rev-arpa", "180000", "100");

      // 3 — the total's title, exact.
      const total = locale === "fr" ? `228${NB}000${NB}€` : "€228,000";
      await expect(page.getByTestId("engine-total-band")).toContainText(total);
      // 4 — two diagnoses: activation in self-serve, the win rate in sales-assisted.
      await expect(page.getByTestId("engine-column-plg").getByTestId("engine-diagnosis")).toContainText("Activation");
      await expect(page.getByTestId("engine-column-slg").getByTestId("engine-diagnosis-slg")).toContainText(locale === "fr" ? "Taux de closing" : "Win rate");
      // 5 — each motion's own coverage.
      await expect(page.getByTestId("engine-column-plg").getByTestId("engine-coverage")).toContainText(found(locale, 11, 17));
      await expect(page.getByTestId("engine-column-slg").getByTestId("engine-coverage")).toContainText(found(locale, 5, 15));

      // 6 — a reload keeps it all.
      await page.reload();
      await expect(page.getByTestId("engine-total-band")).toContainText(total);
      await expect(page.getByTestId("engine-column-slg").getByTestId("engine-coverage")).toContainText(found(locale, 5, 15));

      // 7 — unticked: said before saving, the board is self-serve's; ticked again, its five numbers are back.
      await page.getByTestId("engine-open-settings").click();
      await page.getByTestId("engine-settings").getByTestId("engine-motion-slg").uncheck();
      await expect(page.getByTestId("engine-settings-resets")).not.toBeEmpty();
      await page.getByTestId("engine-settings-save").click();
      await expect(page.getByTestId("engine-board")).toHaveAttribute("data-motions", "plg");
      await expect(page.getByTestId("engine-coverage")).toContainText(found(locale, 11, 17));
      await page.getByTestId("engine-open-settings").click();
      await page.getByTestId("engine-settings").getByTestId("engine-motion-slg").check();
      await page.getByTestId("engine-settings-save").click();
      await expect(page.getByTestId("engine-column-slg").getByTestId("engine-coverage")).toContainText(found(locale, 5, 15));

      // 8 — exported, the device cleared, imported: the same counts.
      const download = page.waitForEvent("download");
      await page.getByTestId("engine-save-json").click();
      const path = (await (await download).path())!;
      expect(JSON.parse(await readFile(path, "utf8")).setup.motions).toEqual({ plg: true, slg: true });
      await page.evaluate(() => {
        window.localStorage.clear();
        window.sessionStorage.setItem("e2e-engine-seeded", "1");
      });
      await page.reload();
      await expect(page.getByTestId("engine-setup")).toBeVisible();
      await page.getByTestId("engine-setup-import").click();
      await page.getByTestId("engine-import-file").setInputFiles(path);
      await page.getByTestId("engine-import-open").click();
      await expect(page.getByTestId("engine-board")).toHaveAttribute("data-motions", "hybrid");
      await expect(page.getByTestId("engine-column-plg").getByTestId("engine-coverage")).toContainText(found(locale, 11, 17));
      await expect(page.getByTestId("engine-column-slg").getByTestId("engine-coverage")).toContainText(found(locale, 5, 15));
      await expect(page.getByTestId("engine-total-band")).toContainText(total);
    });
  }
}
