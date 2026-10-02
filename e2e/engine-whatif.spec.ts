import type { Page } from "@playwright/test";
import { ENGINE_COPY } from "@/content/engine-copy";
import type { EngineState } from "../src/lib/engine/types";
import { exampleState, measured, ratio, withEntry } from "../src/lib/engine/__tests__/fixtures";
import { ADMIN_PASSWORD, expect, grantOwnerPreview, openFold, SKIP_ADMIN_REASON, test } from "./helpers";
import { storedEngineEntry, writeEngineSeed } from "./engine-helpers";

// The page ships closed (engine-flag.spec.ts): every test opens it with the
// owner's signed preview, minted by /admin/preview (e2e/helpers.ts).
test.skip(!ADMIN_PASSWORD, SKIP_ADMIN_REASON);
test.beforeEach(async ({ context }) => {
  await grantOwnerPreview(context.request, "engine");
});

/**
 * « Et si ? », cumulated (Antoine, 2026-09-26): every lever at once, a funnel
 * that starts at the visitors, grids that grow past 100 for what the
 * what-ifs add, the growth numbers moving with the sliders, and the targets
 * kept in the state so the deck can print them.
 *
 * Behaviour, not markup: the numbers themselves are the pure model's, tested
 * in scenario.test.ts and scenario-view.test.ts. What only a browser can say
 * is here — that a slider moves the screen, that the screen keeps what was
 * moved, and that it holds on a phone.
 */
const EXAMPLE_CLOCK = new Date(2026, 8, 24, 12);
const W = ENGINE_COPY.scenario;

async function openWith(page: Page, state: EngineState, locale: "en" | "fr" = "en"): Promise<void> {
  await page.clock.setFixedTime(EXAMPLE_CLOCK);
  await page.goto(`/${locale}/aarrr-funnel-template`);
  await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
  await writeEngineSeed(page, state);
  await page.reload();
  await expect(page.getByTestId("engine-board")).toBeVisible();
  await openFold(page.getByTestId("engine-board-whatif"));
  await expect(page.getByTestId("engine-whatif-panel").or(page.getByTestId("engine-whatif-none"))).toBeVisible();
}

async function nudge(page: Page, lever: string, key: "ArrowRight" | "ArrowLeft", times = 1): Promise<void> {
  await page.getByTestId(`whatif-slider-${lever}`).focus();
  for (let i = 0; i < times; i += 1) await page.keyboard.press(key);
}

async function storedWhatIf(page: Page): Promise<Record<string, number> | undefined> {
  return (await storedEngineEntry(page))?.state.whatIf;
}

test("a better sign-up rate finally shows: same visitors, and the sign-up grid grows past 100", async ({ page }) => {
  await openWith(page, exampleState());
  const panel = page.getByTestId("engine-whatif-panel");
  const signups = panel.getByTestId("whatif-step-signups");
  await expect(signups.locator("[data-dot]")).toHaveCount(100);
  await expect(signups.locator('[data-dot="gained"]')).toHaveCount(0);

  await nudge(page, "acq.signup-rate", "ArrowRight", 5);
  // The visitors are the same people: no change claimed on them.
  await expect(panel.getByTestId("whatif-step-visitors")).not.toContainText("+");
  // What the what-ifs add beyond today's 100 is marked gained, and the grid grew by whole rows.
  await expect(signups.locator('[data-dot="gained"]').first()).toBeVisible();
  const dots = await signups.locator("[data-dot]").count();
  expect(dots).toBeGreaterThan(100);
  expect(dots % 10).toBe(0);
  await expect(signups).toContainText("+");
  await expect(panel.getByTestId("whatif-legend")).toContainText(W.legendGained.en);
});

test("two levers: what each brings alone, the compounding sentence, and the resets", async ({ page }) => {
  await openWith(page, exampleState(), "fr");
  const panel = page.getByTestId("engine-whatif-panel");
  // One lever: no table — alone and together would be the same line.
  await nudge(page, "act.rate", "ArrowRight", 3);
  await expect(panel.getByTestId("whatif-alone")).toHaveCount(0);

  await nudge(page, "ret.logo-churn", "ArrowLeft", 5);
  const alone = panel.getByTestId("whatif-alone");
  await expect(alone.locator("tbody tr")).toHaveCount(2);
  // Activation and churn compound: more customers kept longer is worth more than the sum.
  await expect(panel.getByTestId("whatif-together")).toContainText(W.together.fr.split("{total}")[0]!.trim());
  await expect(panel.getByTestId("whatif-assumptions")).toBeVisible();

  // Back to today, one lever: its value is today's again, and the table goes.
  await panel.getByTestId("whatif-reset-act.rate").click();
  await expect(panel.getByTestId("whatif-value-act.rate")).toHaveText(/^18\s?%$/);
  await expect(panel.getByTestId("whatif-alone")).toHaveCount(0);
  expect(await storedWhatIf(page)).toEqual({ "ret.logo-churn": expect.any(Number) });

  // All back to today: the funnel is today's, and the file carries no empty scenario.
  await panel.getByTestId("whatif-reset-all").click();
  await expect(panel.getByTestId("engine-whatif-funnel-title")).toHaveText(W.funnelToday.fr);
  expect(await storedWhatIf(page)).toBeUndefined();
});

test("the targets are kept in the state: a reload finds them where they were left", async ({ page }) => {
  await openWith(page, exampleState());
  await nudge(page, "rev.arpa", "ArrowRight", 2);
  const moved = await page.getByTestId("whatif-value-rev.arpa").textContent();
  expect(await storedWhatIf(page)).toEqual({ "rev.arpa": 130 });

  await page.reload();
  await expect(page.getByTestId("engine-board")).toBeVisible();
  await openFold(page.getByTestId("engine-board-whatif"));
  await expect(page.getByTestId("whatif-value-rev.arpa")).toHaveText(moved!);
  await expect(page.getByTestId("engine-whatif-funnel-title")).toHaveText(W.funnelIf.en);
});

test("day 30, once entered, is a lever: the paying follow it, and the assumption says so (§19.3.1)", async ({ page }) => {
  await openWith(page, withEntry(exampleState(), "ret.d30", measured(ratio(120, 800))));
  const panel = page.getByTestId("engine-whatif-panel");
  await expect(panel.getByTestId("whatif-value-ret.d30")).toHaveText(/^15\s?%$/);
  await nudge(page, "ret.d30", "ArrowRight", 3);
  await expect(panel.getByTestId("whatif-value-ret.d30")).toHaveText(/^18\s?%$/);
  await expect(panel.getByTestId("whatif-step-paying")).toContainText("+");
  await expect(panel.getByTestId("whatif-assumptions")).toContainText(W.assumption["d30-drives-paying"].en);
  expect(await storedWhatIf(page)).toEqual({ "ret.d30": 18 });
});

test("a lever not entered gets no slider, and says which ones; with nothing entered there is nothing to move", async ({ page }) => {
  const onlyActivation = exampleState();
  const snapshot = onlyActivation.snapshots[0]!;
  for (const id of Object.keys(snapshot.metrics)) if (id !== "act.rate") delete snapshot.metrics[id as keyof typeof snapshot.metrics];
  await openWith(page, onlyActivation);
  const panel = page.getByTestId("engine-whatif-panel");
  await expect(panel.locator('[data-testid^="whatif-slider-"]')).toHaveCount(1);
  await expect(panel.getByTestId("whatif-slider-act.rate")).toBeVisible();
  await expect(panel.getByTestId("whatif-unknown-levers")).toContainText("ARPA");

  const empty = exampleState();
  empty.snapshots[0]!.metrics = {};
  await openWith(page, empty);
  await expect(page.getByTestId("engine-whatif-none")).toBeVisible();
});

for (const locale of ["en", "fr"] as const) {
  test(`${locale} at 390px: the panel, levers moved, scrolls only downward`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openWith(page, exampleState(), locale);
    await nudge(page, "acq.signup-rate", "ArrowRight", 5);
    await nudge(page, "act.rate", "ArrowRight", 3);
    await expect(page.getByTestId("whatif-alone")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBe(0);
  });
}

test("at 1280px, the growth numbers stay in view while the last slider moves", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openWith(page, exampleState());
  // The last lever sits far below the tiles: without the sticky column, moving it scrolls them away.
  await nudge(page, "rev.arpa", "ArrowRight", 2);
  await expect(page.getByTestId("whatif-slider-rev.arpa")).toBeInViewport();
  await expect(page.getByTestId("whatif-kpi-mrr12")).toBeInViewport();
});

/**
 * Design audit 2026-09-27, S-4. The seven tiles were themselves a polite live
 * region, re-read at every step of every slider, while a comment claimed the
 * opposite. Now one sentence, written once the slider has rested 500 ms.
 * Timing is not asserted step by step (a slow runner would make it flaky);
 * what is asserted is the structure — one live region in the block, the
 * summary — and that it says the resting figures, then "today" once reset.
 * Non-vacuity, checked by sabotage on 2026-09-28: a build with `aria-live`
 * put back on the tiles fails this test on the live-region count.
 */
test("the growth numbers are read once, from one summary, not from the tiles (audit S-4)", async ({ page }) => {
  await openWith(page, exampleState());
  const kpis = page.getByTestId("whatif-kpis");
  const announce = kpis.getByTestId("whatif-announce");
  await expect(kpis.locator('[aria-live]:not([aria-live="off"])')).toHaveCount(1);
  await expect(announce).toHaveAttribute("aria-live", "polite");
  // Each lever's <output> is a status region by default; the slider's own
  // aria-valuetext already says the value, so it is switched off.
  await expect(page.getByTestId("whatif-value-act.rate")).toHaveAttribute("aria-live", "off");
  // Opening the panel is not news.
  await expect(announce).toHaveText("");

  await nudge(page, "act.rate", "ArrowRight", 6);
  await expect(announce).toContainText(`${W.kpisTitle.en}, ${W.kpiIf.en}: `);
  await expect(announce).toContainText(W.kpiMrr12.en);
  await expect(announce).toContainText(W.better.en);
  await expect(announce).not.toContainText(W.kpiNrr.en);

  await page.getByTestId("whatif-reset-all").click();
  await expect(announce).toContainText(`${W.kpisTitle.en}, ${W.kpiToday.en}: `);
});

/**
 * The growth tiles' changes are bold ink, gains and losses alike (Antoine,
 * 2026-09-28): a what-if the reader set up is nobody's verdict, and the
 * slides of the same scenario already print their « change » column so. S-5
 * had taken the red off the levers and the dots; the tiles still went green
 * and red through StatTile's `sentiment`, which whatif-no-red.test.ts, reading
 * the panel's own stylesheet, could not see. So this reads the colour the
 * browser paints, against the tile's own ink.
 * Non-vacuity: both a « better » and a « worse » are on screen when it reads;
 * and checked by sabotage on 2026-09-28, a build with the tiles back on
 * `good`/`bad` fails this test only, on the first delta's green.
 */
test("the tiles' changes are bold ink, a loss as much as a gain", async ({ page }) => {
  await openWith(page, exampleState());
  await nudge(page, "acq.signup-rate", "ArrowRight", 4);
  await nudge(page, "ret.logo-churn", "ArrowRight", 6);
  const deltas = page.getByTestId("whatif-kpis").locator("[data-direction]");
  await expect(deltas.filter({ hasText: W.worse.en })).not.toHaveCount(0);
  await expect(deltas.filter({ hasText: W.better.en })).not.toHaveCount(0);
  const painted = await deltas.evaluateAll((els) =>
    els.map((el) => {
      const tile = el.closest('[data-testid^="whatif-kpi-"]')!;
      return { text: el.textContent, color: getComputedStyle(el).color, ink: getComputedStyle(tile).color, weight: getComputedStyle(el).fontWeight };
    }),
  );
  for (const d of painted) {
    expect(d.color, d.text ?? "").toBe(d.ink);
    expect(d.weight, d.text ?? "").toBe("700");
  }
});

/**
 * Design audit S-10 (A2.2, 2026-09-29): the peloton and « Et si » drew the
 * same 100 sign-ups at 210px and 190px, each with its own dots. Both are
 * viz/DotGrid now: the same grid, the same dot, at both widths.
 * Non-vacuity: against the build of `main` before A2.2 this fails at 1280px
 * (210 against 190).
 */
for (const width of [1280, 390]) {
  test(`at ${width}px, the what-if grids are the peloton's: same size, same dot`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await openWith(page, exampleState());
    const measure = (selector: string) =>
      page.locator(selector).evaluateAll((grids) =>
        grids.map((grid) => {
          const dot = grid.querySelector("[data-dot]")!.getBoundingClientRect();
          return [Math.round(grid.getBoundingClientRect().width), Math.round(dot.width * 10) / 10];
        }),
      );
    const peloton = await measure('[data-testid="peloton-grid-act.rate"], [data-testid="peloton-grid-signups"]');
    const whatIf = await measure('[data-testid="whatif-step-activated"] [role="img"], [data-testid="whatif-step-signups"] [role="img"]');
    expect(peloton).toHaveLength(2);
    expect(whatIf).toHaveLength(2);
    for (const grid of [...peloton, ...whatIf]) expect(grid).toEqual(peloton[0]);
    expect(peloton[0]![0]).toBe(width === 1280 ? 200 : 118);
  });
}
