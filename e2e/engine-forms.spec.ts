import type { Locator, Page } from "@playwright/test";
import { ENGINE_COPY } from "@/content/engine-copy";
import { exampleState } from "../src/lib/engine/__tests__/fixtures";
import { ADMIN_PASSWORD, expect, grantOwnerPreview, SKIP_ADMIN_REASON, test } from "./helpers";

// The page ships closed (engine-flag.spec.ts): every test opens it with the
// owner's signed preview, minted by /admin/preview (e2e/helpers.ts).
test.skip(!ADMIN_PASSWORD, SKIP_ADMIN_REASON);
test.beforeEach(async ({ context }) => {
  await grantOwnerPreview(context.request, "engine");
});

/**
 * The growth engine on the design system's form primitives (design system
 * extension 04, CHANTIERS.md A10.b). What the port must keep, and the one
 * thing it fixes, measured in the built page:
 *
 * 1. « 26 000 » is 26 000, in the sheet (NumberField and the engine's
 *    parser) and in the slide builder — whose own parser read "26,000" as
 *    26 before the port.
 * 2. One focus ring, the system's, on every kind of control the engine
 *    draws, and never two at once (the box AND the input inside it).
 *
 * Non-vacuity (2026-09-30), one build with two faults put back: NumberField
 * reading with `Number(text)` — the naive reading the deck's own parser was a
 * variant of — fails the first two tests (no live rate; nothing stored for
 * « 26,000 »), and Select's ring back on `--focus-ring-invert` fails the
 * third on the first list it reaches, the month.
 */

const STORAGE_KEY = "tdg.engine.v2";

async function openEngine(page: Page, locale: "en" | "fr"): Promise<void> {
  await page.goto(`/${locale}/aarrr-funnel-template`);
  await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
}

async function storedState(page: Page): Promise<ReturnType<typeof exampleState> | null> {
  return page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw).state : null;
  }, STORAGE_KEY);
}

/** Presses Tab until `target` has focus: the ring under test is the keyboard's. */
async function tabTo(page: Page, target: Locator, max = 120): Promise<void> {
  for (let i = 0; i < max; i += 1) {
    if (await target.evaluate((el) => el === document.activeElement)) return;
    await page.keyboard.press("Tab");
  }
  throw new Error(`Never reached ${target} with ${max} Tab presses`);
}

/**
 * The rings drawn around the focused control: the control itself and each
 * ancestor up to the workbench, with the colour of each outline. A control
 * sits in at most one ring — its own, its box's or its row's.
 */
async function ringsAround(target: Locator): Promise<{ colours: string[]; expected: string }> {
  return target.evaluate((el) => {
    const probe = document.createElement("div");
    probe.style.outline = "2px solid var(--focus-ring)";
    el.parentElement!.appendChild(probe);
    const expected = getComputedStyle(probe).outlineColor;
    probe.remove();
    const colours: string[] = [];
    for (let node: Element | null = el; node && !node.matches('[data-testid="engine-workbench"]'); node = node.parentElement) {
      const style = getComputedStyle(node);
      if (style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0) colours.push(style.outlineColor);
    }
    return { colours, expected };
  });
}

async function expectOneSystemRing(page: Page, target: Locator, name: string): Promise<void> {
  await tabTo(page, target);
  const { colours, expected } = await ringsAround(target);
  expect(colours, `${name}: one ring, the system's`).toEqual([expected]);
}

test("« 26 000 » typed in French is 26 000: the sheet reads it, and the live rate follows", async ({ page }) => {
  await openEngine(page, "fr");
  await page.getByTestId("engine-setup-board").click();
  await page.getByTestId("engine-tab-activation").click();
  await page.getByTestId("engine-metric-act-rate").click();
  const sheet = page.getByTestId("engine-sheet-act-rate");
  await sheet.getByRole("radio", { name: "Je l'ai" }).check();
  // Typed as a French reader writes them, with an ordinary space.
  await sheet.locator("#engine-act-rate-num").pressSequentially("4 680");
  await sheet.locator("#engine-act-rate-den").pressSequentially("26 000");
  // 4 680 out of 26 000 is 18 %; read as 26 (or empty), it would be 180 or nothing.
  await expect(sheet.getByTestId("engine-live")).toContainText("18");
  await expect(sheet.getByTestId("engine-live")).not.toContainText("180");
  // Regrouped as it was typed, with the no-break space the language writes.
  await expect(sheet.locator("#engine-act-rate-den")).toHaveValue("26 000");
});

test("« 26,000 » typed in English in the slide builder is stored as 26 000, not 26", async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 8, 24, 12));
  await openEngine(page, "en");
  await page.evaluate(
    ({ key, state }) => window.localStorage.setItem(key, JSON.stringify({ schemaVersion: 2, state })),
    { key: STORAGE_KEY, state: exampleState() },
  );
  await page.reload();
  await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
  await page.getByTestId("engine-open-deck").click();
  const form = page.getByTestId("deck-ask-form");
  await expect(form).toBeVisible();
  await form.getByRole("radio", { name: "An amount" }).check();
  const amount = form.getByTestId("deck-ask-amount");
  await amount.fill("26,000");
  await amount.blur();
  await expect.poll(async () => (await storedState(page))?.deck.ask.cost).toEqual({ kind: "money", amount: 26000 });
});

test("one focus ring, the system's, on every kind of control the engine draws", async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 8, 24, 12));
  await openEngine(page, "en");

  // The setup: a radio row, a motion's box, a month list, a short select, a text box.
  const setup = page.getByTestId("engine-setup");
  await expectOneSystemRing(page, setup.getByRole("radio", { name: /B2B SaaS/ }), "a choice row");
  await expectOneSystemRing(page, setup.getByTestId("engine-motion-slg"), "a motion's box");
  await expectOneSystemRing(page, setup.getByRole("combobox").first(), "a month");
  await expectOneSystemRing(page, setup.getByLabel("Currency"), "Currency");
  await expectOneSystemRing(page, setup.getByRole("textbox").first(), "the company name");

  // A sheet: a number in its box, the source list.
  await page.getByTestId("engine-setup-board").click();
  await page.getByTestId("engine-tab-activation").click();
  await page.getByTestId("engine-metric-act-rate").click();
  const sheet = page.getByTestId("engine-sheet-act-rate");
  await sheet.getByRole("radio", { name: "I have it" }).check();
  await expectOneSystemRing(page, sheet.locator("#engine-act-rate-num"), "a count");
  await expectOneSystemRing(page, sheet.locator("#engine-act-rate-source"), "the source");

  // The slide builder: a checkbox, and its own text box.
  await page.evaluate(
    ({ key, state }) => window.localStorage.setItem(key, JSON.stringify({ schemaVersion: 2, state })),
    { key: STORAGE_KEY, state: exampleState() },
  );
  await page.reload();
  await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
  await page.getByTestId("engine-open-deck").click();
  await expectOneSystemRing(page, page.getByTestId("deck-show-credit"), "a checkbox");
  await expectOneSystemRing(page, page.getByTestId("deck-ask-what"), "the ask");
});

/**
 * A11.3 (2026-09-30): the first column of a pair was as wide as the longer
 * of its label and its box, so with « Dépense d'acquisition en … » the
 * joiner stood far from the figure it joins (« 21 000 € ……… sur 42 »). It
 * now sits against the box, one column gap away, however long the label.
 * Non-vacuity: on a build with the first field back in column 1 alone, the
 * gap measured here is 114px, against 9 with the fix (column gap 12).
 */
test("the joiner of a pair sits against the first box, however long its label", async ({ page }) => {
  await openEngine(page, "fr");
  await page.getByTestId("engine-setup-board").click();
  await page.getByTestId("engine-tab-acquisition").click();
  await page.getByTestId("engine-metric-acq-cac").click();
  const sheet = page.getByTestId("engine-sheet-acq-cac");
  await sheet.getByRole("radio", { name: "Je l'ai" }).check();
  const measure = await sheet.locator("#engine-acq-cac-num").evaluate((input) => {
    const box = input.parentElement!;
    const row = box.closest('[class*="rowGrid"]')!;
    const joiner = row.querySelector(':scope > [class*="joiner"]')!;
    const label = row.querySelector(":scope > :first-child label")!;
    return {
      gap: joiner.getBoundingClientRect().left - box.getBoundingClientRect().right,
      columnGap: parseFloat(getComputedStyle(row).columnGap),
      labelWider: label.getBoundingClientRect().width > box.getBoundingClientRect().width,
      joiner: joiner.textContent,
    };
  });
  expect(measure.joiner).toBe("sur");
  // The case under test: a label wider than its box (it wraps now, over the box and the joiner).
  expect(measure.labelWider).toBe(true);
  expect(measure.gap).toBeLessThanOrEqual(measure.columnGap + 1);
});

/*
 * A15.3 (2026-10-01): a sheet's refused save said nothing to a screen reader
 * — its lines under the button sit in no live region, and the focus stayed on
 * the button. It now moves to the first field it names, whose label and
 * message are read out with it. And a rule one value breaks (a rate over
 * 100 %) is said as the box is left, where the person still looks.
 *
 * Non-vacuity (2026-10-01), one mechanism at a time, both languages: without
 * the focus move, the test falls on `toBeFocused` after the blur part
 * passes; without the check on leaving, on the message (« element(s) not
 * found »). A first version typed the rate AFTER a refused save and passed
 * without the blur check: once a save was tried, the sheet re-reads its rules
 * at every keystroke. Hence the order above.
 */
for (const locale of ["en", "fr"] as const) {
  test(`a refused save puts the focus on the field it names; a rate over 100 is said on leaving it (${locale})`, async ({ page }) => {
    await openEngine(page, locale);
    await page.getByTestId("engine-setup-board").click();
    const tab = page.getByTestId("engine-tab-activation");
    if ((await tab.getAttribute("aria-selected")) !== "true") await tab.click();
    const toggle = page.getByTestId("engine-metric-act-rate");
    if ((await toggle.getAttribute("aria-expanded")) !== "true") await toggle.click();
    const sheet = page.getByTestId("engine-sheet-act-rate");
    await sheet.getByRole("radio", { name: ENGINE_COPY.sheet.haveIt[locale] }).check();

    // The rate alone, over 100, BEFORE any save: once a save was tried the
    // sheet re-reads its rules at every keystroke, which would say it anyway.
    await sheet.getByRole("button", { name: ENGINE_COPY.sheet.rateOnly[locale] }).click();
    const rate = page.locator("#engine-act-rate-rate");
    await rate.fill("140");
    await expect(sheet.getByText(ENGINE_COPY.workbench.percentRange[locale])).toHaveCount(0);
    await rate.blur();
    await expect(sheet.getByText(ENGINE_COPY.workbench.percentRange[locale]).first()).toBeVisible();
    await expect(rate).toHaveAttribute("aria-invalid", "true");

    // The save is refused, and the focus goes to the first field it names — not left on the button.
    await page.getByTestId("engine-save-act-rate").click();
    const first = sheet.locator('[aria-invalid="true"]').first();
    await expect(first).toBeFocused();
    await expect(page.getByTestId("engine-save-act-rate")).not.toBeFocused();
  });
}
