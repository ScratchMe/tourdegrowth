import AxeBuilder from "@axe-core/playwright";
import type { Locator, Page } from "@playwright/test";
import { ENGINE_COPY } from "@/content/engine-copy";
import { exampleState, hybridState } from "../src/lib/engine/__tests__/fixtures";
import { ADMIN_PASSWORD, expect, grantOwnerPreview, SKIP_ADMIN_REASON, test } from "./helpers";
import { engineSeed, nextStep, openEngineMenu, storedEngineEntry, openNumber, backToBoard, expectLeft, skipToAsks } from "./engine-helpers";

// The page ships closed (engine-flag.spec.ts): every test opens it with the
// owner's signed preview, minted by /admin/preview (e2e/helpers.ts).
test.skip(!ADMIN_PASSWORD, SKIP_ADMIN_REASON);
test.beforeEach(async ({ context }) => {
  await grantOwnerPreview(context.request, "engine");
});

/**
 * The engine on a phone, and its two motions read by every reader (engine
 * spec §13.3, §18.10.3). The width checks of v1 are spread across
 * engine-board-tabs, engine-collect, engine-deck and engine-whatif; this
 * spec holds the screens the two motions add — the setup with both boxes
 * unfolded, the hybrid board, the relays, a sales-assisted sheet, the
 * collect list and the slide screen — at 360, 390 and 430, in both
 * languages, with 320 measured and reported but not held (§18.10.3: « à 320,
 * mesure seulement »). Then: the two columns as tall as each other at 1280,
 * axe on the hybrid board with sales-assisted's red diagnosis showing, and
 * the keyboard alone ticking sales-assisted and filling its win rate.
 *
 * Non-vacuity, measured on 2026-10-01: the total band forced to 600px makes
 * the board run 190 to 260px past the viewport, and the six width tests
 * fail on it. (A `min-width` written above the rule's own `min-width: 0`
 * first passed — the sabotage, not the guard, was empty.) At 320, every
 * screen measured 0 in both languages.
 */

async function overflow(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

async function seedHybrid(page: Page, locale: "fr" | "en") {
  await page.clock.setFixedTime(new Date(2026, 8, 24, 12));
  await page.addInitScript(
    (items) => {
      if (sessionStorage.getItem("e2e-engine-seeded")) return;
      for (const [key, value] of items) localStorage.setItem(key, value);
      sessionStorage.setItem("e2e-engine-seeded", "1");
    },
    engineSeed(hybridState()),
  );
  await page.goto(`/${locale}/aarrr-funnel-template`);
  await expect(page.getByTestId("engine-board")).toHaveAttribute("data-motions", "hybrid");
}

/** Every screen the two motions add, each measured: how many pixels the page runs past the viewport. */
async function measureScreens(page: Page, locale: "fr" | "en"): Promise<Record<string, number>> {
  const out: Record<string, number> = {};
  // E1 — the start screen, « Both », then its full card with both motions unfolded, then the « Targets » screen (A18 T3.a).
  await page.goto(`/${locale}/aarrr-funnel-template`);
  await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
  await page.locator("#engine-start-motion-both").check();
  out.start = await overflow(page);
  await page.getByTestId("engine-start-change").click();
  out.setup = await overflow(page);
  await page.getByTestId("engine-setup-start").click();
  await expect(page.getByTestId("engine-targets-start")).toBeVisible();
  out.targets = await overflow(page);
  // E4 — the requests, one screen, both motions' (A18 T3.c): the five-minute numbers passed to reach it.
  await page.getByTestId("engine-targets-next").click();
  await skipToAsks(page);
  out.asks = await overflow(page);

  // E2 — the hybrid board, then sales-assisted's stages and a sheet.
  await seedHybrid(page, locale);
  out.board = await overflow(page);
  await page.getByTestId("engine-motion-selector").getByRole("button", { name: ENGINE_COPY.hybrid.motionName.slg[locale] }).click();
  await openNumber(page, "slg-rev-win-rate");
  await expect(page.getByTestId("engine-sheet-slg-rev-win-rate")).toBeVisible();
  out.sheet = await overflow(page);

  await backToBoard(page);

  // E5 — the slide screen of the hybrid.
  await page.getByTestId("engine-open-deck").click();
  await expect(page.getByTestId("engine-deck")).toBeVisible();
  out.deck = await overflow(page);
  return out;
}

for (const locale of ["fr", "en"] as const) {
  for (const width of [360, 390, 430] as const) {
    test(`${locale} at ${width}: nothing the two motions add pushes the page sideways`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      expect(await measureScreens(page, locale)).toEqual({ start: 0, setup: 0, targets: 0, asks: 0, board: 0, sheet: 0, deck: 0 });
    });
  }

  test(`${locale} at 320: measured and reported, not held (§18.10.3)`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    const measured = await measureScreens(page, locale);
    test.info().annotations.push({ type: "overflow at 320", description: JSON.stringify(measured) });
    // The start, its full card and the « Targets » screen joined the screens measured (A18 T3.a).
    expect(Object.keys(measured)).toHaveLength(7);
  });

  test(`${locale}: each relay's words stay inside its card, at 390 and 1280`, async ({ page }) => {
    for (const width of [390, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await seedHybrid(page, locale);
      const card = await page.getByTestId("engine-column-slg").getByTestId("engine-board-relays").boundingBox();
      const words = page.getByTestId("engine-column-slg").getByTestId("engine-relays").locator("p, h3, h4, span, dt, dd");
      const boxes = await words.evaluateAll((els) => els.map((e) => e.getBoundingClientRect()).filter((r) => r.width > 0).map((r) => [r.left, r.right]));
      expect(boxes.length).toBeGreaterThan(5);
      for (const [left, right] of boxes) {
        expect(left!).toBeGreaterThanOrEqual(card!.x - 1);
        expect(right!).toBeLessThanOrEqual(card!.x + card!.width + 1);
      }
    }
  });
}

test("at 1280 the two columns are as tall as each other", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await seedHybrid(page, "fr");
  const plg = await page.getByTestId("engine-column-plg").boundingBox();
  const slg = await page.getByTestId("engine-column-slg").boundingBox();
  expect(Math.abs(plg!.height - slg!.height)).toBeLessThanOrEqual(2);
});

test("the hybrid board has no serious or critical accessibility violation, sales-assisted's red diagnosis showing", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await seedHybrid(page, "fr");
  // The §18.9 diagnosis names the win rate: the red surface is on screen.
  await expect(page.getByTestId("engine-column-slg").getByTestId("relays-stamp")).toBeVisible();
  const results = await new AxeBuilder({ page }).include('[data-testid="engine-board"]').analyze();
  const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(serious.flatMap((v) => v.nodes.map((n) => `${v.id} on ${n.target.join(" ")}`))).toEqual([]);
});

/** Presses Tab until `target` has focus — the keyboard's own way there. */
async function tabTo(page: Page, target: Locator, max = 200): Promise<void> {
  for (let i = 0; i < max; i += 1) {
    if (await target.evaluate((el) => el === document.activeElement)) return;
    await page.keyboard.press("Tab");
  }
  throw new Error(`Never reached ${target} with ${max} Tab presses`);
}

test("the keyboard alone: answer « Both », pass the targets, open the board, fill its win rate", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.clock.setFixedTime(new Date(2026, 8, 24, 12));
  await page.goto("/en/aarrr-funnel-template");
  await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
  // The start's question is one radio group: Tab reaches it, the arrows choose « Both » (A18 T3.a).
  await tabTo(page, page.locator("#engine-start-motion-ss"));
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await expect(page.locator("#engine-start-motion-both")).toBeChecked();
  await tabTo(page, page.getByTestId("engine-start-go"));
  await page.keyboard.press("Enter");
  await tabTo(page, page.getByTestId("engine-targets-next"));
  await page.keyboard.press("Enter");
  await tabTo(page, page.getByTestId("engine-number-back"));
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("engine-board")).toHaveAttribute("data-motions", "hybrid");

  const selector = page.getByTestId("engine-motion-selector").getByRole("button", { name: ENGINE_COPY.hybrid.motionName.slg.en });
  await tabTo(page, selector);
  await page.keyboard.press("Enter");
  // Sales-assisted's list (A18 T2.b): its win rate's row, one button; Enter opens its screen.
  await tabTo(page, page.getByTestId("engine-metric-slg-rev-win-rate"));
  await page.keyboard.press("Enter");
  const sheet = page.getByTestId("engine-sheet-slg-rev-win-rate");
  await expect(sheet).toBeVisible();
  await tabTo(page, sheet.locator("#engine-slg-rev-win-rate-num"));
  await page.keyboard.type("18");
  await tabTo(page, sheet.locator("#engine-slg-rev-win-rate-den"));
  await page.keyboard.type("75");
  await tabTo(page, sheet.locator("#engine-slg-rev-win-rate-source"));
  await page.keyboard.press("ArrowDown");
  await tabTo(page, sheet.getByTestId("engine-save-slg-rev-win-rate"));
  await page.keyboard.press("Enter");
  await expectLeft(page, "slg-rev-win-rate");
  const stored = (await storedEngineEntry(page))?.state.snapshots[0]!.metrics["slg.rev.win-rate"];
  expect(stored?.value).toEqual({ kind: "ratio", numerator: 18, denominator: 75 });
});

/*
 * The screens of the complete engine (engine spec §19.13, A14 T7): each PR
 * from T2 to T6 held its own screens at the width it was built for; here
 * they are all measured the same way as the two motions' above — at 360,
 * 390 and 430, in both languages, with 320 measured and reported but not
 * held — then read by axe. The month bar and the next month's band, a
 * month started and a past month read only, the engines' switcher, a new
 * engine's setup, the deletion, a pasted table's preview, a file's three
 * choices with the merge's preview, a request's reminder, and the deck in
 * white.
 */

const A14_SCREENS = ["month", "started", "past", "switcher", "newEngine", "delete", "table", "merge", "reminder", "white"] as const;

async function seedExample(page: Page, locale: "fr" | "en") {
  // 2 October: September's flows are over, so the next month can start.
  await page.clock.setFixedTime(new Date(2026, 9, 2, 12));
  await page.addInitScript(
    (items) => {
      if (sessionStorage.getItem("e2e-engine-seeded")) return;
      for (const [key, value] of items) localStorage.setItem(key, value);
      sessionStorage.setItem("e2e-engine-seeded", "1");
    },
    engineSeed(exampleState()),
  );
  await page.goto(`/${locale}/aarrr-funnel-template`);
  await expect(page.getByTestId("engine-board")).toBeVisible();
}

async function reopen(page: Page, locale: "fr" | "en") {
  await page.goto(`/${locale}/aarrr-funnel-template`);
  await expect(page.getByTestId("engine-board")).toBeVisible();
}

/** « Changer ou ajouter un moteur », in the engine bar's menu (A18 T2.a). */
async function openSwitcher(page: Page) {
  await openEngineMenu(page);
  const details = page.getByTestId("engine-switcher");
  if ((await details.getAttribute("open")) === null) await details.locator("summary").click();
}

/** Every screen A14 adds, each measured: how many pixels the page runs past the viewport. */
async function measureA14(page: Page, locale: "fr" | "en"): Promise<Record<(typeof A14_SCREENS)[number], number>> {
  const out = {} as Record<(typeof A14_SCREENS)[number], number>;
  await seedExample(page, locale);
  await expect(nextStep(page, "start-month")).toBeVisible();
  out.month = await overflow(page);
  await page.getByTestId("engine-month-start").click();
  await expect(nextStep(page, "start-month")).toHaveCount(0);
  out.started = await overflow(page);
  // Newest first: the month before is the second.
  await openEngineMenu(page);
  await page.getByTestId("engine-month-select").selectOption({ index: 1 });
  await expect(nextStep(page, "back-to-current")).toBeVisible();
  out.past = await overflow(page);

  await reopen(page, locale);
  await openSwitcher(page);
  out.switcher = await overflow(page);
  await page.getByTestId("engine-new").click();
  await expect(page.getByTestId("engine-start")).toBeVisible();
  out.newEngine = await overflow(page);

  await reopen(page, locale);
  await openSwitcher(page);
  await openEngineMenu(page);
  await page.getByTestId("engine-delete-open").click();
  await expect(page.getByTestId("engine-delete")).toBeVisible();
  out.delete = await overflow(page);

  await reopen(page, locale);
  await page.getByTestId("engine-table").locator("summary").click();
  await page.getByTestId("engine-table-paste").fill("id;chiffre;étape;numérateur;dénominateur;valeur;unité;source\nref.k-factor;;;12;800;;;\nmade.up;Un chiffre au nom bien plus long que la colonne;;1;2;;;\n");
  await page.getByTestId("engine-table-read").click();
  await expect(page.getByTestId("engine-table-preview")).toBeVisible();
  out.table = await overflow(page);

  await reopen(page, locale);
  const file = exampleState();
  file.snapshots[0]!.targets["rev.paid-conversion"] = 12;
  await openEngineMenu(page);
  await page.getByTestId("engine-import-open-screen").click();
  await page.getByTestId("engine-import-file").setInputFiles({ name: "laptop.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(file)) });
  await page.getByTestId("engine-import-choices").getByRole("radio").nth(2).check();
  await expect(page.getByTestId("engine-import-merge")).toBeVisible();
  out.merge = await overflow(page);

  await reopen(page, locale);
  await openNumber(page, "rev-gross-margin");
  const sheet = page.getByTestId("engine-sheet-rev-gross-margin");
  await sheet.getByRole("button", { name: ENGINE_COPY.sheet.willAsk[locale] }).click();
  await sheet.getByTestId("engine-request-copy").click();
  await expect(sheet.getByTestId("engine-request-remind")).toBeVisible();
  out.reminder = await overflow(page);

  await backToBoard(page);
  await page.getByTestId("engine-open-deck").click();
  await page.getByTestId("deck-white-theme").check();
  await expect(page.getByTestId("slide-peloton")).toHaveAttribute("data-theme", "white");
  out.white = await overflow(page);
  return out;
}

const NONE = Object.fromEntries(A14_SCREENS.map((k) => [k, 0]));

test.describe("the complete engine's screens (§19.13, A14 T7)", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  for (const locale of ["fr", "en"] as const) {
    for (const width of [360, 390, 430] as const) {
      test(`${locale} at ${width}: nothing A14 adds pushes the page sideways`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
        expect(await measureA14(page, locale)).toEqual(NONE);
      });
    }

    test(`${locale} at 320: A14's screens measured and reported, not held`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 640 });
      const measured = await measureA14(page, locale);
      test.info().annotations.push({ type: "overflow at 320", description: JSON.stringify(measured) });
      expect(Object.keys(measured)).toHaveLength(A14_SCREENS.length);
    });
  }

  /** Axe on what A14 opens over the board: the switcher, a pasted table's preview, the merge's choices, the deletion. */
  test("no serious or critical accessibility violation on A14's panels", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    const serious = async (): Promise<string[]> => {
      const results = await new AxeBuilder({ page }).include('[data-testid="engine-workbench"]').analyze();
      return results.violations
        .filter((v) => v.impact === "serious" || v.impact === "critical")
        .flatMap((v) => v.nodes.map((n) => `${v.id} on ${n.target.join(" ")}`));
    };
    await seedExample(page, "fr");
    await openSwitcher(page);
    await page.getByTestId("engine-table").locator("summary").click();
    await page.getByTestId("engine-table-paste").fill("id;chiffre;étape;numérateur;dénominateur;valeur;unité;source\nref.k-factor;;;12;800;;;\n");
    await page.getByTestId("engine-table-read").click();
    await expect(page.getByTestId("engine-table-preview")).toBeVisible();
    expect(await serious()).toEqual([]);

    await openEngineMenu(page);
    await page.getByTestId("engine-import-open-screen").click();
    await page.getByTestId("engine-import-file").setInputFiles({ name: "laptop.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(exampleState())) });
    await expect(page.getByTestId("engine-import-choices")).toBeVisible();
    expect(await serious()).toEqual([]);

    await reopen(page, "fr");
    await openSwitcher(page);
    await openEngineMenu(page);
    await page.getByTestId("engine-delete-open").click();
    await expect(page.getByTestId("engine-delete")).toBeVisible();
    expect(await serious()).toEqual([]);
  });
});
