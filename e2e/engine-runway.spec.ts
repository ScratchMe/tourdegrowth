import type { Locator, Page } from "@playwright/test";
import { ENGINE_COPY } from "@/content/engine-copy";
import type { EngineState } from "../src/lib/engine/types";
import { filmState, measured as entry, ratio, withEntry } from "../src/lib/engine/__tests__/fixtures";
import { ADMIN_PASSWORD, expect, grantOwnerPreview, SKIP_ADMIN_REASON, test } from "./helpers";
import { storedEngineEntry, writeEngineSeed } from "./engine-helpers";

// The page ships closed (engine-flag.spec.ts): every test opens it with the
// owner's signed preview, minted by /admin/preview (e2e/helpers.ts).
test.skip(!ADMIN_PASSWORD, SKIP_ADMIN_REASON);
test.beforeEach(async ({ context }) => {
  await grantOwnerPreview(context.request, "engine");
});

/**
 * The runway (A20.d T5, C49): typed in Settings › Trésorerie, optional, the
 * word « runway » with its « ? » (« tes mois de trésorerie »). Typed, the
 * board's long-payback warning holds the payback against it; erased, against
 * the 30-month floor again. Out of its range (above 0, up to 240) the save
 * stops on the box and writes nothing. In both languages, at 1280 and 390.
 */

const M = ENGINE_COPY.money;
const S = ENGINE_COPY.settings;

/** The film's SaaS with churn at 2 %: counted 36 months, a CAC of 2 900 € paid back in 32 — no loss, past the floor. */
const late = (): EngineState => withEntry(withEntry(filmState(), "ret.logo-churn", entry(ratio(8, 400))), "acq.cac", entry({ kind: "amount", amount: 2_900 }));

type Stored = { state: { setup: { runwayMonths?: number } } };
const runwayStored = async (page: Page) => (await storedEngineEntry<Stored>(page))?.state.setup.runwayMonths;

/** A sentence as the page prints it: a no-break space reads as a space. */
const plain = (s: string) => s.replace(/ /g, " ");
async function expectText(locator: Locator, expected: string): Promise<void> {
  await expect.poll(async () => plain((await locator.textContent()) ?? "")).toBe(plain(expected));
}

async function openBoard(page: Page, locale: "fr" | "en"): Promise<void> {
  await page.clock.setFixedTime(new Date(2026, 8, 24, 12));
  await page.goto(`/${locale}/aarrr-funnel-template`);
  await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
  await writeEngineSeed(page, late());
  await page.reload();
  await expect(page.getByTestId("engine-board")).toBeVisible();
}

for (const [locale, width] of [
  ["fr", 1280],
  ["fr", 390],
  ["en", 1280],
  ["en", 390],
] as const) {
  test.describe(`the runway (${locale}, ${width})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width, height: width === 1280 ? 900 : 844 });
    });

    const months = (n: number) => (locale === "fr" ? `${n} mois` : `${n} months`);
    const floor = () => M.warnFloor[locale].replace("{payback}", months(32)).replace("{n}", months(30));
    const runway = (n: number) => M.warnRunway[locale].replace("{payback}", months(32)).replace("{n}", n === 1 ? (locale === "fr" ? "1\u00a0mois" : "1 month") : months(n));

    test("typed in Settings, the warning holds the payback against it; erased, against the 30-month floor", async ({ page }) => {
      await openBoard(page, locale);
      const warning = page.getByTestId("engine-money-warning");
      // Non-vacuity: no runway typed, the floor speaks.
      await expectText(warning, floor());

      await page.getByTestId("engine-bar-settings").click();
      const cash = page.getByTestId("engine-settings-cash");
      await expect(cash.getByRole("heading", { name: S.cash[locale] })).toBeVisible();
      const box = page.getByTestId("engine-settings-runway");
      await expect(box).toHaveValue("");
      // Its « ? »: « tes mois de trésorerie », in the hint, never inside the label.
      const term = cash.getByTestId("engine-term-runway");
      await expect(term).toHaveAttribute("aria-label", ENGINE_COPY.terms.label[locale].replace("{term}", ENGINE_COPY.terms.runway.term[locale]));
      await term.click();
      await expect(page.getByRole("dialog")).toContainText(ENGINE_COPY.terms.runway.definition[locale]);
      await expect(page.getByRole("dialog")).toContainText(locale === "fr" ? "Tes mois de trésorerie" : "Your months of cash");
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).toHaveCount(0);

      // The box's unit follows the number: « 1 month », "24 months" (A11.1: never « 1 months »).
      await box.fill("1");
      // The suffix follows the label and its « optional »: the box's value is not part of the text.
      if (locale === "en") await expect(cash).toContainText(/optional\s*month(?!s)/);
      await box.fill("24");
      if (locale === "en") await expect(cash).toContainText(/optional\s*months/);
      await page.getByTestId("engine-settings-save").click();
      await expect(page.getByTestId("engine-board")).toBeVisible();
      await expectText(warning, runway(24));
      expect(await runwayStored(page)).toBe(24);

      // Kept across another save, and shown in its box.
      await page.getByTestId("engine-bar-settings").click();
      await expect(page.getByTestId("engine-settings-runway")).toHaveValue("24");
      await page.getByTestId("engine-settings-runway").fill("");
      await page.getByTestId("engine-settings-save").click();
      await expect(page.getByTestId("engine-board")).toBeVisible();
      await expectText(warning, floor());
      expect(await runwayStored(page)).toBeUndefined();
    });

    test("out of its range, the save stops on the box with the rule, and writes nothing", async ({ page }) => {
      await openBoard(page, locale);
      await page.getByTestId("engine-bar-settings").click();
      const box = page.getByTestId("engine-settings-runway");
      for (const typed of ["300", "0"]) {
        await box.fill(typed);
        await page.getByTestId("engine-settings-save").click();
        await expect(box).toBeFocused();
        await expect(page.getByTestId("engine-settings-cash")).toContainText(S.runwayRange[locale].replace("{max}", "240"));
      }
      expect(await runwayStored(page)).toBeUndefined();
      // Nothing pushes a phone's page sideways.
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    });
  });
}
