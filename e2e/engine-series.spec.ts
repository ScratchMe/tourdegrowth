import type { Page } from "@playwright/test";
import { exampleState, hybridState, measured, ratio, withMonthBefore } from "../src/lib/engine/__tests__/fixtures";
import type { EngineState } from "../src/lib/engine/types";
import { engineSeed, storedEngineEntry } from "./engine-helpers";
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

// --- The series' screens (A14 T2, §19.2.1-§19.2.5) ---------------------------------------

async function openBoard(page: Page, locale: "fr" | "en", state: EngineState, at: Date) {
  await page.clock.setFixedTime(at);
  await page.addInitScript((items) => {
    if (sessionStorage.getItem("e2e-engine-seeded")) return;
    for (const [key, value] of items) localStorage.setItem(key, value);
    sessionStorage.setItem("e2e-engine-seeded", "1");
  }, engineSeed(state));
  await page.goto(`/${locale}/aarrr-funnel-template`);
  await expect(page.getByTestId("engine-board")).toBeVisible();
}

const SCREENS = {
  fr: { september: "septembre 2026", august: "août 2026", july: "juillet 2026", start: "Démarrer septembre 2026", delta: "+3 points depuis juillet 2026, vers ta cible" },
  en: { september: "September 2026", august: "August 2026", july: "July 2026", start: "Start September 2026", delta: "+3 points since July 2026, toward your target" },
} as const;

for (const locale of ["fr", "en"] as const) {
  const t = SCREENS[locale];

  test(`${locale}: a month over offers the next; started, it opens empty with its targets, and the month before is read only`, async ({ page }) => {
    await openBoard(page, locale, exampleState(), new Date(2026, 9, 2, 12));
    const next = page.getByTestId("engine-month-next");
    await expect(next).toContainText(t.september);
    await page.getByTestId("engine-month-start").click();
    await expect(next).toHaveCount(0);

    // September: no number yet, the targets kept, August closed with today's date and its windows.
    const stored = await storedEngineEntry(page);
    expect(stored?.state.snapshots.map((s) => s.referenceMonth)).toEqual(["2026-08", "2026-09"]);
    expect(stored?.state.snapshots[0]!.closedAt).toBeTruthy();
    expect(stored?.state.snapshots[0]!.windows).toEqual({ activationWindowDays: 7, paidWindowDays: 30, qualificationWindowDays: 30, goLiveWindowDays: 90 });
    expect(stored?.state.snapshots[1]!.metrics).toEqual({});
    expect(stored?.state.snapshots[1]!.targets).toEqual(stored?.state.snapshots[0]!.targets);

    // August, read only: its numbers, no « Et si », no entry, no file actions; then back.
    await page.getByTestId("engine-month-select").selectOption({ label: t.august });
    const past = page.getByTestId("engine-month-past");
    await expect(past).toContainText(t.august);
    await expect(page.getByTestId("engine-board-whatif")).toHaveCount(0);
    await expect(page.getByTestId("engine-actions")).toHaveCount(0);
    await page.getByTestId("engine-tab-activation").click();
    await expect(page.getByTestId("engine-row-value-act-rate")).toContainText("18");
    expect(await page.getByTestId("engine-metric-act-rate").evaluate((el) => el.tagName)).toBe("SPAN");
    await page.getByTestId("engine-month-back").click();
    await expect(past).toHaveCount(0);
    await expect(page.getByTestId("engine-actions")).toBeVisible();
  });

  test(`${locale}: each number says how far it moved; a past month corrected recomputes the next month's change`, async ({ page }) => {
    await openBoard(page, locale, twoMonths(), new Date(2026, 8, 24, 12));
    await page.getByTestId("engine-tab-activation").click();
    const delta = page.getByTestId("engine-row-delta-act-rate");
    await expect(delta).toHaveText(t.delta);

    // Correct July's activation: 130 activated instead of 120.
    await page.getByTestId("engine-month-select").selectOption({ label: t.july });
    await page.getByTestId("engine-month-correct").click();
    await expect(page.getByTestId("engine-month-past")).toHaveAttribute("data-correcting", "true");
    await page.getByTestId("engine-tab-activation").click();
    await page.getByTestId("engine-metric-act-rate").click();
    const sheet = page.getByTestId("engine-sheet-act-rate");
    await sheet.locator("#engine-act-rate-num").fill("130");
    await page.getByTestId("engine-save-act-rate").click();
    await expect(sheet.getByTestId("engine-saved-act-rate")).not.toBeEmpty();
    const stored = await storedEngineEntry(page);
    expect(stored?.state.snapshots[0]!.metrics["act.rate"]?.value).toEqual({ kind: "ratio", numerator: 130, denominator: 800 });
    expect(stored?.state.snapshots[1]!.metrics["act.rate"]?.value).toEqual({ kind: "ratio", numerator: 144, denominator: 800 });

    await page.getByTestId("engine-month-done").click();
    await page.getByTestId("engine-month-back").click();
    await page.getByTestId("engine-tab-activation").click();
    await expect(delta).not.toHaveText(t.delta);
    await expect(delta).toContainText(t.july);
  });
}

test("the diagnosis says the month before's leak when it changed stage", async ({ page }) => {
  const state = withMonthBefore(exampleState(), (july) => {
    july.metrics["act.rate"] = measured(ratio(200, 800), amplitude);
    july.metrics["ret.logo-churn"] = measured(ratio(16, 400), stripe);
  });
  await openBoard(page, "fr", state, new Date(2026, 8, 24, 12));
  await expect(page.getByTestId("diagnosis-previous-plg")).toHaveText("En juillet 2026, la fuite était le churn logo.");
});

test("a new month's sheet offers the month before's variant and source, never its value", async ({ page }) => {
  await openBoard(page, "en", exampleState(), new Date(2026, 9, 2, 12));
  await page.getByTestId("engine-month-start").click();
  await page.getByTestId("engine-tab-acquisition").click();
  await page.getByTestId("engine-metric-acq-cac").click();
  const sheet = page.getByTestId("engine-sheet-acq-cac");
  await sheet.getByRole("radio", { name: "I have it" }).check();
  await expect(sheet.locator('input[type="radio"][value="media-only"]')).toBeChecked();
  await expect(sheet.locator("#engine-acq-cac-num")).toHaveValue("");
});

for (const width of [390, 1280]) {
  test(`the month bar and a past month's band fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await openBoard(page, "fr", twoMonths(), new Date(2026, 8, 24, 12));
    await page.getByTestId("engine-month-select").selectOption({ label: "juillet 2026" });
    await expect(page.getByTestId("engine-month-past")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test("in a series, the settings never offer a flows month before the month before's", async ({ page }) => {
  await openBoard(page, "fr", twoMonths(), new Date(2026, 8, 24, 12));
  await page.getByTestId("engine-open-settings").click();
  const months = await page.getByLabel("Mois des flux").locator("option").allTextContents();
  expect(months).toContain("août 2026");
  expect(months).not.toContain("juillet 2026");
  expect(months).not.toContain("juin 2026");
});
