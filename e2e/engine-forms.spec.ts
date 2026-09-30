import type { Locator, Page } from "@playwright/test";
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

const STORAGE_KEY = "tdg.engine.v1";

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
    ({ key, state }) => window.localStorage.setItem(key, JSON.stringify({ schemaVersion: 1, state })),
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

  // The setup: a radio row, a month list, a short select, a text box.
  const setup = page.getByTestId("engine-setup");
  await expectOneSystemRing(page, setup.getByRole("radio", { name: /self-serve/i }), "a choice row");
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
    ({ key, state }) => window.localStorage.setItem(key, JSON.stringify({ schemaVersion: 1, state })),
    { key: STORAGE_KEY, state: exampleState() },
  );
  await page.reload();
  await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
  await page.getByTestId("engine-open-deck").click();
  await expectOneSystemRing(page, page.getByTestId("deck-show-credit"), "a checkbox");
  await expectOneSystemRing(page, page.getByTestId("deck-ask-what"), "the ask");
});
