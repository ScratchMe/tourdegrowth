import { readFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import type { Locator, Page } from "@playwright/test";
import { ENGINE_COPY } from "@/content/engine-copy";
import { fillTemplate } from "@/lib/engine/format";
import { EXAMPLE_EXPECTED, exampleState } from "../src/lib/engine/__tests__/fixtures";
import { ADMIN_PASSWORD, expect, grantOwnerPreview, openFold, SKIP_ADMIN_REASON, test, trackedEvents } from "./helpers";
import { activeEngineKey, openWords, storedEngineEntry, writeEngineSeed, openEngineMenu, openNumber, backToBoard, expectFound, expectLeft, skipToAsks } from "./engine-helpers";

// The page ships closed (engine-flag.spec.ts): every test opens it with the
// owner's signed preview, minted by /admin/preview (e2e/helpers.ts).
test.skip(!ADMIN_PASSWORD, SKIP_ADMIN_REASON);
test.beforeEach(async ({ context }) => {
  await grantOwnerPreview(context.request, "engine");
});

/**
 * The growth engine's collection UI (engine spec §7 E1-E4, E6, E7): setup,
 * the five-stage board, a metric sheet, the "I can't find it" triage, the
 * collect hub with its copyable request, the resume band, and the three ways
 * out of the device — save, import, erase.
 *
 * Behaviour, not attributes: what a person sees after typing, what the
 * device really keeps after a reload WITHOUT clearing storage, what the
 * clipboard really holds, and what a keyboard alone can reach.
 *
 * The page ships closed (engine-flag.spec.ts): every test opens it with the
 * owner's signed preview (the beforeEach above). The helpers below are local on purpose — e2e/helpers.ts
 * belongs to the integration step — and only the GoatCounter stub fixture is
 * imported from it.
 *
 * The board's visuals (peloton, diagnosis, what-if, mirror) are checked on
 * the spec's §6.0 example, seeded into the device's storage exactly as a
 * returning person would have it — the SAME data set the unit tests use
 * (`lib/engine/__tests__/fixtures.ts`), so a number checked here is the
 * number checked everywhere. The clock is pinned to the example's "today".
 */

/** The example's "today" (24 September 2026), at noon so no time zone moves the day. */
const EXAMPLE_CLOCK = new Date(2026, 8, 24, 12);

/**
 * Opens the engine on the §6.0 example: the page first (so storage is this
 * origin's), the engine written the way the island writes it, then a reload —
 * the island reads the device once, at its first client render.
 */
async function openExample(page: Page, locale: "en" | "fr" = "en", at: Date = EXAMPLE_CLOCK): Promise<void> {
  await page.clock.setFixedTime(at);
  await openEngine(page, locale);
  await writeEngineSeed(page, exampleState());
  await page.reload();
  await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
  await expect(page.getByTestId("engine-board")).toBeVisible();
}

/** A grid's dots by state — what the eye counts, to hold against the numeral above it. */
async function dotCounts(grid: Locator): Promise<Record<string, number>> {
  return grid.evaluate((el) => {
    const counts: Record<string, number> = {};
    for (const dot of el.querySelectorAll("[data-dot]")) {
      const kind = (dot as HTMLElement).dataset.dot!;
      counts[kind] = (counts[kind] ?? 0) + 1;
    }
    return counts;
  });
}

async function openEngine(page: Page, locale: "en" | "fr" = "en"): Promise<Locator> {
  await page.goto(`/${locale}/aarrr-funnel-template`);
  const island = page.getByTestId("engine-workbench");
  await expect(island).toHaveAttribute("data-state", "ready");
  return island;
}

/** The start screen with its defaults (self-serve, last closed month, EUR), the targets passed, the first number left: the board. */
async function startEngine(page: Page, locale: "en" | "fr" = "en"): Promise<void> {
  await openEngine(page, locale);
  await page.getByTestId("engine-start-go").click();
  await page.getByTestId("engine-targets-next").click();
  await page.getByTestId("engine-number-back").click();
  await expect(page.getByTestId("engine-board")).toBeVisible();
}

/** The number's own screen, from its row in « Tes chiffres » (A18 T2.b). */
async function openSheet(page: Page, _stage: string, metricDomId: string): Promise<Locator> {
  // The list shows every stage (A18 T2.b): the row is enough, the stage stays for the callers' reading.
  return openNumber(page, metricDomId);
}

async function storedEngine(page: Page): Promise<{ state: Record<string, unknown> & { snapshots: { metrics: Record<string, { status: string }> }[] } } | null> {
  return storedEngineEntry(page);
}

async function noHorizontalScroll(page: Page): Promise<void> {
  const [scroll, client] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  expect(scroll).toBe(client);
}

/** Presses Tab until `target` has focus — the only way a keyboard user gets anywhere. */
async function tabTo(page: Page, target: Locator, max = 80): Promise<void> {
  for (let i = 0; i < max; i += 1) {
    if (await target.evaluate((el) => el === document.activeElement)) return;
    await page.keyboard.press("Tab");
  }
  throw new Error(`Never reached ${target} with ${max} Tab presses`);
}

/** Serious and critical only, like accessibility.spec.ts. */
async function expectNoSeriousA11y(page: Page, label: string): Promise<void> {
  const results = await new AxeBuilder({ page }).include('[data-testid="engine-workbench"]').analyze();
  const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(serious.map((v) => `${label}: ${v.id} — ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
}

// The closed vocabulary of engine spec §11.6: never a number, never a label typed by someone.
const ENGINE_EVENT = /^engine_(opened|request_copied|deck_opened|tour_linked|setup\/(plg|slg|hybrid)|stage_saved\/(slg-)?(acquisition|activation|retention|referral|revenue)|exported\/json)$/;

test.describe("setup and first save", () => {
  test("first visit: one question, self-serve by default; « Start » → the targets, passed → the first number, each heading focused", async ({ page }) => {
    await openEngine(page);
    await expect(page.getByTestId("engine-start")).toBeVisible();
    // Self-serve unless someone answers otherwise (A7.3.c); every other default said in one sentence (A18 T3.a).
    await expect(page.locator("#engine-start-motion-ss")).toBeChecked();
    await expect(page.getByTestId("engine-start-plan")).toHaveText(fillTemplate(ENGINE_COPY.start.plan.en, { n: 17, quick: 5, hour: 7, ask: 5 }));
    await expect(page.getByTestId("engine-start-defaults")).toContainText("B2B SaaS, in euros");
    // The plan follows the answer, before anything is created.
    await page.locator("#engine-start-motion-both").check();
    await expect(page.getByTestId("engine-start-plan")).toHaveText(fillTemplate(ENGINE_COPY.start.plan.en, { n: 33, quick: 9, hour: 13, ask: 11 }));
    await page.locator("#engine-start-motion-ss").check();
    expect(await storedEngine(page)).toBeNull();

    // « Start »: the « Targets » screen (C40), every box optional, one way on.
    await page.getByTestId("engine-start-go").click();
    await expect(page.locator("#engine-targets-title")).toBeFocused();
    await expect(page.getByTestId("engine-targets-next")).toHaveText(ENGINE_COPY.targetsStart.go.en);
    // A box it cannot read stops the move, its message shown and the focus on it: leaving would drop it unseen.
    const target = page.locator("#engine-step-target-act-rate");
    await target.fill("25 kg");
    // Left first, as in the base step's spec: the message appears as the box loses focus and moves the
    // button down — a click begun before that lands on nothing.
    await target.blur();
    await expect(page.getByText(ENGINE_COPY.workbench.notANumber.en)).toBeVisible();
    await page.getByTestId("engine-targets-next").click();
    await expect(target).toBeFocused();
    await expect(page.getByTestId("engine-targets-start")).toBeVisible();
    await target.fill("");
    await page.getByTestId("engine-targets-next").click();
    // The first number a person can find alone, the quickest in the funnel's order: the sign-up rate.
    await expect(page.getByTestId("engine-number")).toHaveAttribute("data-metric", "acq.signup-rate");
    await expect(page.locator("#engine-number-title")).toBeFocused();
    await page.getByTestId("engine-number-back").click();
    await expectFound(page, 0);
    // Focus follows the way back to the number's row, never left on <body>.
    await expect(page.getByTestId("engine-metric-acq-signup-rate")).toBeFocused();
    await expect.poll(() => trackedEvents(page)).toContain("engine_opened");
  });

  test("counts give the live rate; Save keeps them on the device through a reload that clears nothing", async ({ page }) => {
    await startEngine(page);
    const sheet = await openSheet(page, "activation", "act-rate");
    await sheet.locator("#engine-act-rate-num").fill("144");
    await sheet.locator("#engine-act-rate-den").fill("800");
    await expect(sheet.getByTestId("engine-live")).toContainText("18%");
    await sheet.locator("#engine-act-rate-source").selectOption({ label: "Amplitude" });
    await sheet.getByTestId("engine-save-act-rate").click();
    await expectLeft(page, "act-rate");
    await expectFound(page, 1);

    const stored = await storedEngine(page);
    expect(stored?.state.snapshots[0]?.metrics["act.rate"]?.status).toBe("measured");
    // Read in the document that emitted it: a reload starts a new window, and its event log with it.
    await expect.poll(() => trackedEvents(page)).toContain("engine_stage_saved/activation");

    await page.reload();
    await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
    await expectFound(page, 1);
    const again = await openSheet(page, "activation", "act-rate");
    await expect(again.locator("#engine-act-rate-num")).toHaveValue("144");
    await expect(again.locator("#engine-act-rate-den")).toHaveValue("800");
  });

  test("a share with more of the part than of the whole is refused, and nothing is stored", async ({ page }) => {
    await startEngine(page);
    const sheet = await openSheet(page, "activation", "act-rate");
    await sheet.locator("#engine-act-rate-num").fill("900");
    await sheet.locator("#engine-act-rate-den").fill("800");
    await sheet.locator("#engine-act-rate-source").selectOption({ label: "Amplitude" });
    await sheet.getByTestId("engine-save-act-rate").click();
    // The "saved" line is a live region that always exists; refused, it stays silent.
    await expect(sheet.getByTestId("engine-saved-act-rate")).toBeEmpty();
    // The refusal takes the live rate's place, under the two counts it is about.
    await expect(sheet.getByTestId("engine-live")).toContainText(ENGINE_COPY.sanity.numGtDen.en.split("{num}")[0]!);
    await expectFound(page, 0);
    expect((await storedEngine(page))?.state.snapshots[0]?.metrics["act.rate"]).toBeUndefined();
  });

  test("a missing piece is named rather than silently blocking", async ({ page }) => {
    await startEngine(page);
    const sheet = await openSheet(page, "activation", "act-rate");
    await sheet.locator("#engine-act-rate-num").fill("144");
    await sheet.getByTestId("engine-save-act-rate").click();
    await expect(sheet.getByTestId("engine-save-needs")).toBeVisible();
  });

  test("a wide estimate is said to be wide, and still saved", async ({ page }) => {
    await startEngine(page);
    const sheet = await openSheet(page, "activation", "act-rate");
    await sheet.getByRole("button", { name: "I can estimate it" }).click();
    await sheet.locator("#engine-act-rate-low").fill("5");
    await sheet.locator("#engine-act-rate-high").fill("40");
    await expect(sheet.getByTestId("engine-wide-range")).toBeVisible();
    await sheet.getByRole("radio", { name: "Team hunch" }).check();
    await sheet.getByTestId("engine-save-act-rate").click();
    await expectLeft(page, "act-rate");
    expect((await storedEngine(page))?.state.snapshots[0]?.metrics["act.rate"]?.status).toBe("estimated");
  });

  test("\"I can't find it\" asks why and what fixing it would cost, and the answer is a status", async ({ page }) => {
    await startEngine(page);
    const sheet = await openSheet(page, "retention", "ret-d30");
    await sheet.getByRole("button", { name: "I can't find it" }).click();
    const triage = sheet.getByTestId("engine-triage");
    await triage.getByRole("radio", { name: "We don't measure it" }).check();
    await triage.getByRole("radio", { name: "a sprint" }).check();
    await sheet.getByTestId("engine-save-ret-d30").click();
    await expectLeft(page, "ret-d30");
    const entry = (await storedEngine(page))?.state.snapshots[0]?.metrics["ret.d30"] as { status: string; missing?: { cause: string; repair: string } };
    expect(entry.status).toBe("missing");
    expect(entry.missing).toMatchObject({ cause: "not-tracked", repair: "sprint" });
    // The number's own row says it, in words, and why it can't be found (its note, A18 T2.b).
    await backToBoard(page);
    const row = page.getByTestId("engine-metric-ret-d30");
    await expect(row).toContainText(ENGINE_COPY.list.status.cant.en);
    await expect(page.getByTestId("engine-metric-ret-d30-note")).toContainText(ENGINE_COPY.cause.notTracked.en);
  });
});

test.describe("asking and collecting", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  test("\"I'll ask for it\" copies the request, records who was asked, and the event carries no text", async ({ page }) => {
    await openEngine(page);
    // A company name and a number typed first: neither may travel in the copied message.
    // The name, in the full card the start screen's « Change » opens (A18 T3.a).
    await page.getByTestId("engine-start-change").click();
    await page.getByLabel(ENGINE_COPY.setup.companyLabel.en).fill("Canary Corp 4242");
    await page.getByTestId("engine-setup-start").click();
    await page.getByTestId("engine-targets-next").click();
    await page.getByTestId("engine-number-back").click();
    const found = await openSheet(page, "activation", "act-rate");
    await found.locator("#engine-act-rate-num").fill("144");
    await found.locator("#engine-act-rate-den").fill("800");
    await found.locator("#engine-act-rate-source").selectOption({ label: "Amplitude" });
    await found.getByTestId("engine-save-act-rate").click();

    const sheet = await openSheet(page, "revenue", "rev-gross-margin");
    await sheet.getByRole("button", { name: "I'll ask for it" }).click();
    await sheet.getByTestId("engine-request-copy").click();
    await expect(sheet.getByText(ENGINE_COPY.request.copied.en)).toBeVisible();
    const clip = await page.evaluate(() => navigator.clipboard.readText());

    // Structure, not wording (the copy is being reworded): the message's own
    // greeting, then ONE line per requested number, then its closing — read
    // from the template itself, so a reworded template still passes and a
    // broken assembly does not.
    const [greeting, closing] = ENGINE_COPY.request.message.en.split("{list}") as [string, string];
    const [bullet] = ENGINE_COPY.request.itemNoDefinition.en.split("{what}") as [string];
    expect(clip.startsWith(greeting)).toBe(true);
    expect(clip.endsWith(closing)).toBe(true);
    const list = clip.slice(greeting.length, clip.length - closing.length).split("\n");
    expect(list).toHaveLength(1);
    expect(list[0]!.startsWith(bullet)).toBe(true);
    expect(list[0]!.length).toBeGreaterThan(bullet.length);
    // Nothing the person typed elsewhere: not the company, not another number's counts.
    expect(clip).not.toMatch(/Canary|4242|144|800/);

    const entry = (await storedEngine(page))?.state.snapshots[0]?.metrics["rev.gross-margin"] as { status: string; request?: { role: string } };
    expect(entry.status).toBe("requested");
    expect(entry.request?.role).toBeTruthy();
    await expect.poll(() => trackedEvents(page)).toContain("engine_request_copied");
  });

  test("the requests, one screen: a card per person; copied, it says when; « Sent » goes on to the hour-long numbers", async ({ page }) => {
    await openEngine(page);
    await page.getByTestId("engine-start-go").click();
    await page.getByTestId("engine-targets-next").click();
    // The five-minute numbers passed: the next step is the requests, every one on one screen (A18 T3.c).
    await skipToAsks(page);
    await expect(page.locator("#engine-asks-title")).toBeFocused();
    await expect(page.locator("#engine-asks-title")).toHaveText(fillTemplate(ENGINE_COPY.asks.title.en, { n: 5 }));
    await expectNoSeriousA11y(page, "requests");
    // One card per person, not one per number: Finance (CAC, gross margin), Support, Data (K, paid conversion).
    await expect(page.getByTestId("engine-asks").locator(":scope > ul > li")).toHaveCount(3);
    const finance = page.getByTestId("engine-asks-finance");
    await expect(finance).toContainText("CAC");
    await expect(finance).toContainText("Gross margin");

    await finance.getByTestId("engine-request-copy").click();
    // Copied: both numbers asked of Finance, the card says when, on its pending edge.
    await expect(finance).toContainText(/Copied on /);
    // Said once on screen: the card's line; « Request copied » is only announced (`quietStatus`).
    await expect(finance.getByRole("status")).toHaveText(ENGINE_COPY.request.copied.en);
    await expect(finance.getByRole("status")).toHaveClass(/tdg-visually-hidden/);
    const stored = (await storedEngine(page))?.state.snapshots[0]?.metrics;
    expect(stored?.["acq.cac"]?.status).toBe("requested");
    expect(stored?.["rev.gross-margin"]?.status).toBe("requested");
    await expect.poll(() => trackedEvents(page)).toContain("engine_request_copied");

    // « Sent, next number »: the hour-long numbers; the requests not copied stay « to do ».
    await expect(page.getByTestId("engine-asks-done")).toHaveText(ENGINE_COPY.asks.done.en);
    await page.getByTestId("engine-asks-done").click();
    await expect(page.getByTestId("engine-number")).toHaveAttribute("data-metric", "acq.top-channel-share");
    expect((await storedEngine(page))?.state.snapshots[0]?.metrics["ret.churn-cause"]).toBeUndefined();
  });

  test("a returning visit says the last visit, the one next step, and what is waiting on someone", async ({ page }) => {
    await startEngine(page);
    const day = 86_400_000;
    await page.evaluate(
      ({ key, day }) => {
        const store = JSON.parse(window.localStorage.getItem(key)!);
        const now = Date.now();
        const iso = (ago: number) => new Date(now - ago * day).toISOString();
        store.state.updatedAt = iso(3);
        store.state.snapshots[0].metrics["ref.k-factor"] = {
          status: "requested",
          request: { role: "support", requestedAt: iso(10) },
          updatedAt: iso(10),
        };
        window.localStorage.setItem(key, JSON.stringify(store));
      },
      { key: await activeEngineKey(page), day },
    );
    await page.reload();
    // One card (A18 T2.a): the last visit, the primary, then the request to follow up with its own action.
    await expect(page.locator("#engine-next")).toHaveText("Last visit · 3 days ago");
    const asked = page.getByTestId("engine-next-asked-support");
    await expect(asked).toHaveText(/^Asked Support 10 days ago: viral coefficient \(K\), no answer typed yet\./);
    await expect(asked.getByTestId("engine-request-copy")).toHaveText("Follow up");
    await page.getByTestId("engine-next-number").click();
    // « Next number » opens the first five-minute number still to fill.
    await expect(page.locator('[data-testid^="engine-sheet-"]:visible')).toHaveCount(1);
  });
});

test.describe("the §6.0 example on the board", () => {
  for (const locale of ["en", "fr"] as const) {
    test(`${locale}: the peloton's numerals are its grids, and an unmeasured stage is a "?", never a 0`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await openExample(page, locale);
      await expectFound(page, 11);
      // The next step is always there (A18 T2.a): one card under the verdict, one primary.
      await expect(page.getByTestId("engine-next")).toBeVisible();

      // The board's own funnel — the folded « what if » below draws a second one.
      const peloton = page.getByTestId("engine-board-peloton");
      // Activated: the numeral says 18, the grid holds exactly 18 measured dots.
      await expect(peloton.getByTestId("peloton-numeral-act.rate")).toHaveText(EXAMPLE_EXPECTED.activatedPerHundred);
      expect(await dotCounts(peloton.getByTestId("peloton-grid-act.rate"))).toEqual({ filled: 18, empty: 82 });
      // Paid, estimated 6 to 9: 6 sure dots, 3 hatched, and the numeral says the range.
      await expect(peloton.getByTestId("peloton-numeral-rev.paid-conversion")).toHaveText(EXAMPLE_EXPECTED.paidPerHundred[locale]);
      expect(await dotCounts(peloton.getByTestId("peloton-grid-rev.paid-conversion"))).toEqual({ filled: 6, range: 3, empty: 91 });
      // Day-30 retention is not measured: a "?", no dots at all — an unknown is not an empty grid.
      await expect(peloton.getByTestId("peloton-numeral-ret.d30")).toHaveText("?");
      expect(await dotCounts(peloton.getByTestId("peloton-grid-ret.d30"))).toEqual({});
      await expect(peloton.getByTestId("peloton-grid-ret.d30")).toContainText("?");
      // Upstream: the visitors per 100 sign-ups, approximated.
      await expect(peloton.getByTestId("peloton-upstream")).toContainText(EXAMPLE_EXPECTED.visitorsPerHundred[locale]);

      // The diagnosis names activation — one stage, stamped once, on its column — and says retention is blind.
      const diagnosis = page.getByTestId("engine-diagnosis");
      await expect(diagnosis).toHaveAttribute("data-state", EXAMPLE_EXPECTED.diagnosis.state);
      await expect(diagnosis.getByTestId("diagnosis-named-act.rate")).toBeVisible();
      // The unmeasured stage mid-sentence, as a subject with its article — not a capitalised name.
      await expect(diagnosis.getByTestId("diagnosis-blind")).toContainText(
        ENGINE_COPY.diagnosis.blindOne[locale].replace("{stages}", ENGINE_COPY.subject["ret.d30"][locale]),
      );
      await expect(peloton.getByTestId("peloton-stamp")).toHaveCount(1);
      await expect(peloton.locator('[data-metric="act.rate"]').getByTestId("peloton-stamp")).toBeVisible();

      // The stamp makes its column's label row taller, and the four 10×10 grids still start on
      // one line (Antoine, 2026-09-26: the named grid used to sit lower than its neighbours).
      // Measured on the rendered boxes: the four columns share their row tracks (subgrid).
      const tops = await peloton
        .locator('[data-testid^="peloton-grid-"]')
        .evaluateAll((grids) => grids.map((g) => g.getBoundingClientRect().top));
      expect(tops).toHaveLength(4);
      expect(Math.max(...tops) - Math.min(...tops), `grid tops: ${tops.join(", ")}`).toBeLessThan(1);

      // No Tour on this device: the mirror invites to take one.
      await expect(page.getByTestId("engine-mirror")).toHaveAttribute("data-state", "none");
      await noHorizontalScroll(page);
    });

    test(`${locale}: "what if" moves a lever, and the growth numbers and the what-if funnel move with it`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await openExample(page, locale);
      // « Tes chiffres » opens nothing in place (A18 T2.b), and « what if » is not in a number's sheet.
      await expect(page.locator('[data-testid^="engine-sheet-"]')).toHaveCount(0);
      await expect(page.getByTestId("engine-numbers").getByTestId("engine-whatif-panel")).toHaveCount(0);
      const fold = page.getByTestId("engine-board-whatif");
      await fold.locator(":scope > summary").click();
      const panel = fold.getByTestId("engine-whatif-panel");
      await expect(panel).toBeVisible();
      const w = ENGINE_COPY.scenario;

      // Nothing moved: today's funnel, and no figure claims a change.
      await expect(panel.getByTestId("engine-whatif-funnel-title")).toHaveText(w.funnelToday[locale]);
      await expect(panel.getByTestId("whatif-kpis")).not.toContainText(w.better[locale]);

      // Activation 18 → 19 %, one step of the slider.
      await panel.getByTestId("whatif-slider-act.rate").focus();
      await page.keyboard.press("ArrowRight");
      await expect(panel.getByTestId("whatif-value-act.rate")).toHaveText(/^19\s?%$/);
      await expect(panel.getByTestId("engine-whatif-funnel-title")).toHaveText(w.funnelIf[locale]);
      // The activated grow, and the payers with them (they are among the activated).
      await expect(panel.getByTestId("whatif-step-activated")).toContainText("+");
      await expect(panel.getByTestId("whatif-step-paying")).toContainText("+");
      // Day 30 is not measured in the example: the unknown shape, never 0 dots.
      await expect(panel.getByTestId("whatif-step-d30").locator("[data-dot]")).toHaveCount(0);
      // More new MRR is better, and at the same spend a lower CAC is better too — said in words.
      await expect(panel.getByTestId("whatif-kpi-newMrr")).toContainText(w.better[locale]);
      await expect(panel.getByTestId("whatif-kpi-cac")).toContainText(w.better[locale]);
      // Churn did not move: retention says nothing.
      await expect(panel.getByTestId("whatif-kpi-grr")).not.toContainText(w.better[locale]);
      // The board's own funnel is still today's.
      await expect(page.getByTestId("engine-board-peloton").getByTestId("peloton-numeral-act.rate")).toHaveText(EXAMPLE_EXPECTED.activatedPerHundred);
    });
  }

  /**
   * P7a/P7c: the example's churn (10/400 = 2.5% against the fictional team's
   * 2% target) is BEHIND, and for a lower-is-better metric behind is above.
   * The sheet used to print a direction-blind « Sous le repère » here. Read
   * from the copy, not retyped, and in both languages.
   */
  for (const locale of ["en", "fr"] as const) {
    test(`${locale}: churn behind its target is labelled above it on its sheet`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await openExample(page, locale);
      const sheet = await openSheet(page, "retention", "ret-logo-churn");
      const above = ENGINE_COPY.side.overTarget[locale];
      const label = above.charAt(0).toUpperCase() + above.slice(1);
      // Since A18 T1 it is the verdict of « How it compares »: the red of a diagnosis, against the team's target only (C1).
      const verdict = sheet.getByTestId("engine-reference").locator("[data-verdict]");
      await expect(verdict).toHaveText(label);
      await expect(verdict).toHaveAttribute("data-verdict", "below");
      await expect(verdict).not.toContainText(locale === "fr" ? "Sous" : "Below");
    });
  }

  test("fr at 390px: the example board, the activation panel and its what-if scroll only downward", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openExample(page, "fr");
    await noHorizontalScroll(page);
    // The peloton keeps its phone layout under the shared row tracks of the desktop one
    // (2026-09-26): one row per column, the mini-grid on the left of its numeral, the rows stacked.
    const peloton = page.getByTestId("engine-board-peloton");
    const rows = await peloton.locator("[data-metric]").evaluateAll((columns) =>
      columns.map((c) => {
        const grid = c.querySelector('[data-testid^="peloton-grid-"]')!.getBoundingClientRect();
        const numeral = c.querySelector('[data-testid^="peloton-numeral-"]')!.getBoundingClientRect();
        return { top: c.getBoundingClientRect().top, gridRight: grid.right, numeralLeft: numeral.left };
      }),
    );
    expect(rows).toHaveLength(4);
    for (const row of rows) expect(row.gridRight, "mini-grid left of its numeral").toBeLessThanOrEqual(row.numeralLeft);
    for (let i = 1; i < rows.length; i += 1) expect(rows[i]!.top, "one column under another").toBeGreaterThan(rows[i - 1]!.top);
    // Every stage name on one line: a stencil name that wraps (« ACQUISITI / ON », seen at
    // 390 on the old rows). One line of --engine-stage-title (21px/1.1) is 23px.
    for (const stage of ["acquisition", "activation", "retention", "referral", "revenue"]) {
      const box = await page.getByTestId(`engine-numbers-${stage}`).locator("h3").boundingBox();
      expect(box!.height, stage).toBeLessThan(28);
    }
    await openSheet(page, "activation", "act-rate");
    await noHorizontalScroll(page);
    await backToBoard(page);
    const fold = page.getByTestId("engine-board-whatif");
    await fold.locator(":scope > summary").click();
    await expect(fold.getByTestId("engine-whatif-panel")).toBeVisible();
    await noHorizontalScroll(page);
  });

  test("a returning visit says when, and the request waiting on someone, a week old", async ({ page }) => {
    // Three days after the example's last save; the k-factor request (20 Sept.) is then a week old.
    await openExample(page, "en", new Date(2026, 8, 27, 12));
    await expect(page.locator("#engine-next")).toHaveText("Last visit · 3 days ago");
    await expect(page.locator('[data-testid^="engine-next-asked-"]')).toHaveText(/7 days ago: viral coefficient \(K\), no answer typed yet\./);
  });
});

test.describe("leaving the device and coming back", () => {
  test("save → clear the site's data → import gives back the same engine", async ({ page }) => {
    await startEngine(page);
    const sheet = await openSheet(page, "activation", "act-rate");
    await sheet.locator("#engine-act-rate-num").fill("144");
    await sheet.locator("#engine-act-rate-den").fill("800");
    await sheet.locator("#engine-act-rate-source").selectOption({ label: "Amplitude" });
    await sheet.getByTestId("engine-save-act-rate").click();
    await expectFound(page, 1);

    const downloadP = page.waitForEvent("download");
    await openEngineMenu(page);
    await page.getByTestId("engine-save-json").click();
    const download = await downloadP;
    const path = await download.path();
    const text = await readFile(path, "utf8");
    // The file is the engine state itself (lib/engine/io.ts), not the device's storage envelope.
    expect(JSON.parse(text).snapshots[0].metrics["act.rate"].value).toEqual({ kind: "ratio", numerator: 144, denominator: 800 });
    await expect.poll(() => trackedEvents(page)).toContain("engine_exported/json");
    await expect(page.getByTestId("engine-backup")).toHaveCount(0);

    // Really clear it: without this the test proves React state survived a click, not that the file carries the work.
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();
    await expect(page.getByTestId("engine-start")).toBeVisible();
    await page.getByTestId("engine-start-import").click();
    await page.getByTestId("engine-import-file").setInputFiles(path);
    await expect(page.getByTestId("engine-import-preview")).toContainText("1 of 17");
    await page.getByTestId("engine-import-open").click();
    await expectFound(page, 1);
    expect((await storedEngine(page))?.state.snapshots[0]?.metrics["act.rate"]?.status).toBe("measured");
  });

  test("a file that isn't an engine is refused, and nothing changes", async ({ page }) => {
    await openEngine(page);
    await page.getByTestId("engine-start-import").click();
    await page.getByTestId("engine-import-file").setInputFiles({ name: "x.json", mimeType: "application/json", buffer: Buffer.from('{"hello":1}') });
    await expect(page.getByTestId("engine-import-refused")).toBeVisible();
    await expect(page.getByTestId("engine-import-open")).toHaveCount(0);
    expect(await storedEngine(page)).toBeNull();
  });

  test("erasing asks for the word first, then leaves nothing on the device", async ({ page }) => {
    await startEngine(page);
    await openEngineMenu(page);
    await page.getByTestId("engine-erase-open").click();
    const confirm = page.getByTestId("engine-erase-confirm");
    await expect(confirm).toBeDisabled();
    await expect(page.getByTestId("engine-erase-prompt")).toContainText('type "ERASE" below');
    // Case is not compared (Antoine, 2026-09-25): the word used to sit in an uppercase label.
    await page.getByLabel("Confirmation").fill("erase");
    await expect(confirm).toBeEnabled();
    await confirm.click();
    await expect(page.getByTestId("engine-start")).toBeVisible();
    expect(await storedEngine(page)).toBeNull();
  });
});

test.describe("keyboard, languages, widths", () => {
  test("keyboard only: the start, the targets, a number's row, its screen, saved", async ({ page }) => {
    await openEngine(page);
    // The question's radios move with the arrows, as a real radio group does.
    await page.locator("#engine-start-motion-ss").focus();
    await page.keyboard.press("ArrowDown");
    await expect(page.locator("#engine-start-motion-sa")).toBeChecked();
    await page.keyboard.press("ArrowUp");
    await expect(page.locator("#engine-start-motion-ss")).toBeChecked();
    await tabTo(page, page.getByTestId("engine-start-go"));
    await page.keyboard.press("Enter");
    await tabTo(page, page.getByTestId("engine-targets-next"));
    await page.keyboard.press("Enter");
    await tabTo(page, page.getByTestId("engine-number-back"));
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("engine-board")).toBeVisible();

    // « Tes chiffres » (A18 T2.b): a row is one button; Enter opens the number's screen, its heading focused.
    await tabTo(page, page.getByTestId("engine-metric-act-rate"));
    await page.keyboard.press("Enter");
    await expect(page.locator("#engine-number-title")).toBeFocused();
    const sheet = page.getByTestId("engine-sheet-act-rate");
    await tabTo(page, sheet.locator("#engine-act-rate-num"));
    await page.keyboard.type("144");
    await tabTo(page, sheet.locator("#engine-act-rate-den"));
    await page.keyboard.type("800");
    const source = sheet.locator("#engine-act-rate-source");
    await tabTo(page, source);
    await source.selectOption({ label: "Amplitude" }); // a native select's options are the browser's, not ours
    await tabTo(page, sheet.getByTestId("engine-save-act-rate"));
    await page.keyboard.press("Enter");
    // Saved, and on to the next step (A18 T3.b): its heading takes the focus.
    await expectLeft(page, "act-rate");
    await expect(page.locator("#engine-number-title")).toBeFocused();
  });

  for (const locale of ["en", "fr"] as const) {
    test(`${locale}: every sheet's labels are resolved — no raw {placeholder} anywhere`, async ({ page }) => {
      await startEngine(page, locale);
      // Every row of « Tes chiffres », each number's own screen in turn (A18 T2.b).
      const rows = await page.locator('button[data-testid^="engine-metric-"]').evaluateAll((els) => els.map((el) => el.getAttribute("data-testid")!));
      expect(rows).toHaveLength(17);
      for (const row of rows) {
        await page.getByTestId(row).click();
        await expect(page.getByTestId("engine-number")).toBeVisible();
        // The boxes are the question (A18 T1): every count label is on screen as soon as the sheet is.
        await expect(page.getByTestId("engine-workbench")).not.toContainText(/\{[a-zA-Z]+\}/);
        await backToBoard(page);
      }
    });

    for (const width of [390, 1280]) {
      test(`${locale} at ${width}px: no sideways scroll on a number's screen, its widest`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await startEngine(page, locale);
        const sheet = await openSheet(page, "activation", "act-rate");
        // The widest the sheet gets: the boxes, and « Where to find it » unfolded with its paths.
        await sheet.locator("summary", { hasText: ENGINE_COPY.sheet.whereTitle[locale] }).click();
        await noHorizontalScroll(page);
        // The screen is the number's: no board beside it or under it (A18 T2.b).
        await expect(page.getByTestId("engine-board")).toHaveCount(0);
      });
    }
  }

  test("every analytics event is from the closed vocabulary — never a number or a typed word", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await startEngine(page);
    const sheet = await openSheet(page, "activation", "act-rate");
    await sheet.locator("#engine-act-rate-num").fill("144");
    await sheet.locator("#engine-act-rate-den").fill("800");
    await sheet.locator("#engine-act-rate-source").selectOption({ label: "Amplitude" });
    await openWords(sheet);
    await sheet.locator("#engine-act-rate-note").fill("canary-note-4242");
    await sheet.getByTestId("engine-save-act-rate").click();
    const ask = await openSheet(page, "revenue", "rev-gross-margin");
    await ask.getByRole("button", { name: "I'll ask for it" }).click();
    await ask.getByTestId("engine-request-copy").click();
    await expect.poll(async () => (await trackedEvents(page)).length).toBeGreaterThanOrEqual(3);
    const events = await trackedEvents(page);
    for (const e of events) expect(e).toMatch(ENGINE_EVENT);
    expect(events.join(" ")).not.toMatch(/144|800|canary/);
  });
});

test.describe("accessibility of each screen", () => {
  test("setup, board with a sheet, triage, collect, import, erase — no serious or critical issue", async ({ page }) => {
    await openEngine(page);
    await expectNoSeriousA11y(page, "setup");
    await page.getByTestId("engine-start-go").click();
    await page.getByTestId("engine-targets-next").click();
    await page.getByTestId("engine-number-back").click();
    const sheet = await openSheet(page, "activation", "act-rate");
    await expectNoSeriousA11y(page, "sheet");
    await sheet.getByRole("button", { name: "I can't find it" }).click();
    await sheet.getByTestId("engine-triage").getByRole("radio").first().check();
    await expectNoSeriousA11y(page, "triage");
    await backToBoard(page);
    await openEngineMenu(page);
    await page.getByTestId("engine-import-open-screen").click();
    await expectNoSeriousA11y(page, "import");
    await page.getByTestId("engine-import-cancel").click();
    await openEngineMenu(page);
    await page.getByTestId("engine-erase-open").click();
    await expectNoSeriousA11y(page, "erase");
  });

  test("the example board — diagnosis, peloton, what-if, mirror — has no serious or critical issue", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await openExample(page);
    await openFold(page.getByTestId("engine-board-whatif"));
    await expect(page.getByTestId("engine-whatif-panel")).toBeVisible();
    // With a lever moved, so the red dots and the better/worse deltas are in the pass.
    await page.getByTestId("whatif-slider-acq.signup-rate").focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByTestId("engine-whatif-funnel-title")).toHaveText(ENGINE_COPY.scenario.funnelIf.en);
    await expectNoSeriousA11y(page, "example board");
  });
});
