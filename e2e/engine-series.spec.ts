import type { Page } from "@playwright/test";
import { exampleState, hybridState, measured, ratio, withMonthBefore } from "../src/lib/engine/__tests__/fixtures";
import type { EngineState } from "../src/lib/engine/types";
import { engineSeed } from "./engine-helpers";
import { ADMIN_PASSWORD, expect, grantOwnerPreview, SKIP_ADMIN_REASON, test } from "./helpers";

// The page ships closed (engine-flag.spec.ts): every test opens it with the owner's signed preview.
test.skip(!ADMIN_PASSWORD, SKIP_ADMIN_REASON);
test.beforeEach(async ({ context }) => {
  await grantOwnerPreview(context.request, "engine");
});

/**
 * The monthly series in a real browser (engine spec §19.2.6, A14 T1): an
 * engine of two months — July closed before the example's August — offers
 * « Ce qui a bougé » in the slide screen, unticked; ticked, the slide prints
 * its numbers in AARRR order, in both languages, inside its 1 280 × 720 frame.
 * The screens that start a month and compare it on the board are T2's.
 */

const amplitude = { kind: "tool", tool: "amplitude" } as const;
const stripe = { kind: "tool", tool: "stripe" } as const;

function twoMonths(): EngineState {
  return withMonthBefore(exampleState(), (july) => {
    july.metrics["act.rate"] = measured(ratio(120, 800), amplitude);
    july.metrics["ret.logo-churn"] = measured(ratio(12, 400), stripe);
    july.metrics["rev.arpa"] = measured(ratio(46_000, 400), stripe);
  });
}

async function openDeck(page: Page, locale: "fr" | "en", state: EngineState) {
  await page.clock.setFixedTime(new Date(2026, 8, 24, 12));
  await page.addInitScript((items) => {
    if (sessionStorage.getItem("e2e-engine-seeded")) return;
    for (const [key, value] of items) localStorage.setItem(key, value);
    sessionStorage.setItem("e2e-engine-seeded", "1");
  }, engineSeed(state));
  await page.goto(`/${locale}/aarrr-funnel-template`);
  await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
  await page.getByTestId("engine-open-deck").click();
  await expect(page.getByTestId("engine-deck")).toBeVisible();
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
}

const TEXT = {
  fr: {
    title: "3 chiffres ont bougé depuis juillet 2026 ; l'activation reste la fuite",
    rows: ["15 %, puis 18 % (+3 points, vers la cible)", "3 %, puis 2,5 % (–0,5 point, vers la cible)", "115 €, puis 120 € (+5 € · +4,3 %)"],
  },
  en: {
    title: "3 numbers moved since July 2026; activation is still the leak",
    rows: ["15%, then 18% (+3 points, toward the target)", "3%, then 2.5% (–0.5 points, toward the target)", "€115, then €120 (+€5 · +4.3%)"],
  },
} as const;

for (const locale of ["fr", "en"] as const) {
  test(`${locale}: two months offer « Ce qui a bougé », unticked; ticked, it prints its numbers in AARRR order`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await openDeck(page, locale, twoMonths());
    const thumb = page.getByTestId("deck-thumb-evolution");
    await expect(thumb).toBeVisible();
    const include = page.getByTestId("deck-include-evolution");
    await expect(include).not.toBeChecked();
    await include.check();
    await expect(include).toBeChecked();

    const slide = thumb.locator("[data-slide]");
    await expect(slide.getByRole("heading").first()).toHaveText(TEXT[locale].title);
    const rows = slide.getByTestId("slide-evolution-plg").locator("li");
    await expect(rows).toHaveCount(3);
    for (const [i, text] of TEXT[locale].rows.entries()) await expect(rows.nth(i)).toContainText(text);
    // Inside its frame: nothing runs past the slide.
    const overflow = await slide.evaluate((el) => el.scrollHeight - el.clientHeight);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test("a one-month engine offers no such slide", async ({ page }) => {
  await openDeck(page, "fr", exampleState());
  await expect(page.getByTestId("deck-thumb-peloton")).toBeVisible();
  await expect(page.getByTestId("deck-thumb-evolution")).toHaveCount(0);
});

test("the hybrid offers one per motion, both unticked", async ({ page }) => {
  const hybrid = withMonthBefore(hybridState(), (july) => void (july.metrics["slg.rev.win-rate"] = measured(ratio(15, 75), { kind: "tool", tool: "hubspot" })));
  await openDeck(page, "fr", hybrid);
  for (const id of ["evolution", "slg:evolution"]) {
    await expect(page.getByTestId(`deck-thumb-${id}`)).toBeVisible();
    await expect(page.getByTestId(`deck-include-${id}`)).not.toBeChecked();
  }
});
