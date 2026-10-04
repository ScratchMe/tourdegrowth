import type { Page } from "@playwright/test";
import { ENGINE_COPY } from "@/content/engine-copy";
import { fillTemplate } from "@/lib/engine/format";
import { hybridState, salesAssistedState, withEntry } from "../src/lib/engine/__tests__/fixtures";
import type { EngineState } from "../src/lib/engine/types";
import { ADMIN_PASSWORD, expect, grantOwnerPreview, SKIP_ADMIN_REASON, test } from "./helpers";
import { storedEngineEntry, writeEngineSeed, openNumber } from "./engine-helpers";

// The page ships closed (engine-flag.spec.ts): every test opens it with the
// owner's signed preview, minted by /admin/preview (e2e/helpers.ts).
test.skip(!ADMIN_PASSWORD, SKIP_ADMIN_REASON);
test.beforeEach(async ({ context }) => {
  await grantOwnerPreview(context.request, "engine");
});

/**
 * The engine with two motions (A7.3.c, engine spec §18.7): the setup's two
 * boxes, the hybrid board — « deux moteurs, un total », then one engine at a
 * time under « Moteur affiché » (A18 T5) — sales-assisted alone, a sales-assisted sheet, the settings that
 * untick a motion without losing it, and the step-by-step per motion.
 *
 * The numbers are §18.9's (`hybridState`): self-serve exactly §6.0, a
 * 180 000 € sales-assisted MRR, 31 of 130 opportunities from self-serve.
 * Behaviour, read from the screen and from the device's storage.
 */
const EXAMPLE_CLOCK = new Date(2026, 8, 24, 12);
const NB = " ";

async function openEngine(page: Page, locale: "en" | "fr" = "en"): Promise<void> {
  await page.goto(`/${locale}/aarrr-funnel-template`);
  await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
}

async function seed(page: Page, state: EngineState, locale: "en" | "fr" = "en"): Promise<void> {
  await page.clock.setFixedTime(EXAMPLE_CLOCK);
  await openEngine(page, locale);
  await writeEngineSeed(page, state);
  await page.reload();
  await expect(page.getByTestId("engine-board")).toBeVisible();
}

async function storedMotions(page: Page): Promise<{ plg: boolean; slg: boolean } | null> {
  return (await storedEngineEntry(page))?.state.setup.motions ?? null;
}

async function noHorizontalScroll(page: Page): Promise<void> {
  const [scroll, client] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  expect(scroll).toBe(client);
}

test.describe("how the company sells: the start's question, then the full card's two boxes (§18.1.1, A18 T3.a)", () => {
  test("self-serve by default; « Both » carries into the full card, where sales-assisted unfolds its windows and months; none ticked is refused", async ({ page }) => {
    await page.clock.setFixedTime(EXAMPLE_CLOCK);
    await openEngine(page);
    await expect(page.locator("#engine-start-motion-ss")).toBeChecked();
    // Sales-assisted alone follows no self-serve cohort: the sentence names the month of the numbers only.
    await page.locator("#engine-start-motion-sa").check();
    await expect(page.getByTestId("engine-start-defaults")).not.toContainText("sign-ups");
    await page.locator("#engine-start-motion-both").check();
    await expect(page.getByTestId("engine-start-defaults")).toContainText("sign-ups");

    // « Change »: every setting, the start's answer ticked.
    await page.getByTestId("engine-start-change").click();
    await expect(page.locator("#engine-setup-title")).toBeFocused();
    const plg = page.getByTestId("engine-motion-plg");
    const slg = page.getByTestId("engine-motion-slg");
    await expect(plg).toBeChecked();
    await expect(slg).toBeChecked();
    await expect(page.getByText(ENGINE_COPY.setup.qualificationWindow.en)).toBeVisible();
    await expect(page.getByText(ENGINE_COPY.setup.goLiveWindow.en)).toBeVisible();
    await expect(page.getByTestId("engine-setup-slg-periods")).toBeVisible();

    // Self-serve unticked: its cohort month goes with it (sales-assisted reads three months, D7).
    await plg.uncheck();
    await expect(page.getByLabel(ENGINE_COPY.setup.cohortMonth.en)).toHaveCount(0);

    // Neither: the start is refused, said under the boxes, the focus on the first one.
    await slg.uncheck();
    await page.getByTestId("engine-setup-start").click();
    await expect(page.getByText(ENGINE_COPY.setup.motionsRequired.en)).toBeVisible();
    await expect(plg).toBeFocused();
    await expect(page.getByTestId("engine-targets-start")).toHaveCount(0);
    expect(await storedMotions(page)).toBeNull();

    await plg.check();
    await slg.check();
    await page.getByTestId("engine-setup-start").click();
    await page.getByTestId("engine-targets-next").click();
    await page.getByTestId("engine-number-back").click();
    await expect(page.getByTestId("engine-board")).toHaveAttribute("data-motions", "hybrid");
    expect(await storedMotions(page)).toEqual({ plg: true, slg: true });
  });

  test("« Cancel » from the full card goes back to the start, its answer kept and nothing created", async ({ page }) => {
    await openEngine(page);
    await page.locator("#engine-start-motion-sa").check();
    await page.getByTestId("engine-start-change").click();
    await page.getByTestId("engine-setup-cancel").click();
    await expect(page.locator("#engine-start-title")).toBeFocused();
    await expect(page.locator("#engine-start-motion-sa")).toBeChecked();
    expect(await storedMotions(page)).toBeNull();
  });
});

test.describe("the hybrid board (§18.7 E2)", () => {
  test("« deux moteurs, un total »: the sum in the title, self-serve first, the total set off by a rule, the link said as a share", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await seed(page, hybridState(), "fr");
    const band = page.getByTestId("engine-total-band");
    await expect(band).toContainText(`228${NB}000${NB}€`);
    await expect(page.getByTestId("engine-total-mrr-plg")).toHaveText(`48${NB}000${NB}€`);
    await expect(page.getByTestId("engine-total-mrr-slg")).toHaveText(`180${NB}000${NB}€`);
    // Self-serve first, always: the blocks never follow their values. Then the total, set off by a rule (A18 T5).
    const plgBox = await page.getByTestId("engine-total-plg").boundingBox();
    const slgBox = await page.getByTestId("engine-total-slg").boundingBox();
    const sumBox = await page.getByTestId("engine-total-sum").boundingBox();
    expect(plgBox!.x).toBeLessThan(slgBox!.x);
    expect(slgBox!.x).toBeLessThan(sumBox!.x);
    await expect(page.getByTestId("engine-total-sum")).toContainText(ENGINE_COPY.total.sumMrr.fr);
    await expect(page.getByTestId("engine-total-sum")).toContainText(`228${NB}000${NB}€`);
    // A sum, never a comparison: no « + » nor « = » between the figures (those are a disclosure's glyphs) —
    // nor in the line of what else adds up (extension 09, A20.d T3.b): the ARR, the MRR in 12 months, the cash.
    await expect(band.locator("dl")).toHaveCount(2);
    for (const dl of await band.locator("dl").all()) await expect(dl).not.toContainText(/[+=]/);
    await expect(page.getByTestId("engine-total-band-totals-arr")).toContainText(`2${NB}736${NB}000${NB}€`);
    const link = page.getByTestId("engine-total-link");
    await expect(link).toContainText(fillTemplate(ENGINE_COPY.total.link.fr, { n: "31", m: "130", period: "juin à août 2026" }));
    await expect(link).toContainText(ENGINE_COPY.total.linkNote.fr);
    // The new MRR and its sum are on the `total` slide, not the board's band.
    await expect(page.getByTestId("engine-total-sums")).toHaveCount(0);
    // The band's title is the board's heading: one verdict at the top, not two.
    await expect(band.locator("#engine-verdict")).toHaveCount(1);
    await expect(page.locator('[data-testid="engine-board"] > header [data-testid="engine-verdict"]')).toHaveCount(0);
  });

  test("a part with no MRR: « pas de chiffre » set in the text face, never in the figures' (A21.3)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await seed(page, withEntry(hybridState(), "slg.rev.arpa", undefined), "fr");
    const value = (id: string) => page.getByTestId(id).locator("dd");
    const fontOf = (id: string) => value(id).evaluate((el) => getComputedStyle(el).fontFamily);
    await expect(value("engine-total-slg")).toHaveText(ENGINE_COPY.slide.noNumber.fr);
    await expect(value("engine-total-sum")).toHaveText(ENGINE_COPY.slide.noNumber.fr);
    // Self-serve's MRR keeps the figures' face; the words do not take it.
    const figureFace = await fontOf("engine-total-plg");
    expect(await fontOf("engine-total-slg")).not.toBe(figureFace);
    expect(await fontOf("engine-total-sum")).not.toBe(figureFace);
  });

  test("one engine at a time under « Engine shown »: its own verdict, diagnosis and drawing — never two columns", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await seed(page, hybridState());
    const selector = page.getByTestId("engine-motion-selector");
    await expect(selector).toContainText(ENGINE_COPY.hybrid.selectorLabel.en);
    await expect(page.getByTestId("engine-motion-columns")).toHaveCount(0);
    // Self-serve shown: its verdict (its slide's title), its diagnosis, its peloton — and nothing of sales-assisted's.
    await expect(page.getByTestId("engine-motion-verdict")).toBeVisible();
    await expect(page.getByTestId("engine-diagnosis")).toBeVisible();
    await expect(page.getByTestId("engine-board-peloton")).toBeVisible();
    await expect(page.getByTestId("engine-relays")).toHaveCount(0);
    await expect(page.getByTestId("engine-small-sample")).toHaveCount(0);
    const plgVerdict = await page.getByTestId("engine-motion-verdict").innerText();
    await expect(page.getByTestId("engine-two-segments")).toHaveText(ENGINE_COPY.hybrid.twoEngines.en);

    await selector.getByRole("button", { name: ENGINE_COPY.hybrid.motionName.slg.en }).click();
    await expect(page.getByTestId("engine-board-peloton")).toHaveCount(0);
    await expect(page.getByTestId("engine-diagnosis-slg")).toBeVisible();
    // The §18.9 diagnosis names the win rate: the stamp is on its relay, and on no other.
    await expect(page.getByTestId("relays-stamp")).toHaveCount(1);
    await expect(page.getByTestId("relays-numeral-slg.rev.win-rate")).toContainText("24");
    await expect(page.getByTestId("engine-pipeline")).toBeVisible();
    // Its own verdict, the relays slide's title, not self-serve's.
    await expect(page.getByTestId("engine-motion-verdict")).not.toHaveText(plgVerdict);
    // Its small sample said right under « Engine shown », before its verdict.
    const caveat = (await page.getByTestId("engine-small-sample").boundingBox())!;
    const selectorBox = (await selector.boundingBox())!;
    const verdict = (await page.getByTestId("engine-motion-verdict").boundingBox())!;
    expect(caveat.y).toBeGreaterThan(selectorBox.y);
    expect(caveat.y).toBeLessThan(verdict.y);
  });

  test("the selector shows one motion's list and what-ifs at a time; the link is its own group at the end of sales-assisted's", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await seed(page, hybridState());
    const selector = page.getByTestId("engine-motion-selector");
    await expect(selector.getByRole("button", { name: ENGINE_COPY.hybrid.motionName.plg.en })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("engine-metric-act-rate")).toHaveCount(1);
    await expect(page.getByTestId("engine-link-block")).toHaveCount(0);

    await selector.getByRole("button", { name: ENGINE_COPY.hybrid.motionName.slg.en }).click();
    // Sales-assisted's diagnosis names the win rate: its revenue holds back, in its own list.
    await expect(page.getByTestId("engine-numbers-revenue")).toHaveAttribute("data-holds", "true");
    await expect(page.getByTestId("engine-metric-slg-rev-win-rate")).toBeVisible();
    await expect(page.getByTestId("engine-metric-act-rate")).toHaveCount(0);
    // The link: its own closed group at the end of sales-assisted's list (A18 T2.b).
    const block = page.getByTestId("engine-link-block");
    await expect(block.locator("summary")).toContainText(ENGINE_COPY.hybrid.linkBlock.en);
    await block.locator("summary").click();
    await expect(block.getByTestId("engine-metric-link-pql-handoff")).toBeVisible();

    // Its what-if panel, its own levers, the link counted in opportunities. What adds up is the band's line
    // (extension 09, A20.d T3.b): the ARR, the MRR in 12 months at today's pace, the cash tied up.
    await page.getByTestId("engine-board-whatif").locator("summary").first().click();
    await expect(page.getByTestId("engine-whatif-slg-panel")).toBeVisible();
    await expect(page.getByTestId("whatif-value-link.pql-handoff")).toHaveText("31");
    await expect(page.getByTestId("whatif-slg-quarter")).toContainText("130");
    await expect(page.getByTestId("engine-total-in12")).toHaveCount(0);
    await expect(page.getByTestId("engine-total-band-totals-mrr12")).toContainText(ENGINE_COPY.total.sumMrr12.en);
    await expect(page.getByTestId("engine-total-band-totals-arr")).toContainText(ENGINE_COPY.total.sumArr.en);
  });

  test("moving a sales-assisted lever keeps self-serve's what-ifs, and its reset leaves them alone", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    const state = hybridState();
    state.whatIf = { "act.rate": 24 };
    await seed(page, state);
    await page.getByTestId("engine-motion-selector").getByRole("button", { name: ENGINE_COPY.hybrid.motionName.slg.en }).click();
    await page.getByTestId("engine-board-whatif").locator("summary").first().click();
    const slider = page.getByTestId("whatif-slider-slg.rev.win-rate");
    await slider.focus();
    for (let i = 0; i < 6; i++) await page.keyboard.press("ArrowRight");
    await expect(page.getByTestId("whatif-value-slg.rev.win-rate")).toHaveText("30%");
    // Both engines' MRR in 12 months with the what-ifs: the card's total line (A20.d T3.a).
    await expect(page.getByTestId("engine-lever-total")).toContainText(/today|aujourd/);
    await page.getByTestId("whatif-slg-reset-all").click();
    const whatIf = (await storedEngineEntry(page))?.state.whatIf;
    expect(whatIf).toEqual({ "act.rate": 24 });
  });

  test("the referred share of opportunities is a lever: it moves the opportunities created (§19.3.2)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await seed(page, hybridState());
    await page.getByTestId("engine-motion-selector").getByRole("button", { name: ENGINE_COPY.hybrid.motionName.slg.en }).click();
    await page.getByTestId("engine-board-whatif").locator("summary").first().click();
    await expect(page.getByTestId("whatif-value-slg.ref.referred-share")).toHaveText("20%");
    await page.getByTestId("whatif-slider-slg.ref.referred-share").focus();
    for (let i = 0; i < 10; i++) await page.keyboard.press("ArrowRight");
    await expect(page.getByTestId("whatif-value-slg.ref.referred-share")).toHaveText("30%");
    // 130 × 80/70 = 149 opportunities created: the referred come on top of the others.
    await expect(page.getByTestId("whatif-slg-quarter")).toContainText("149");
    await expect(page.getByTestId("whatif-slg-assumptions")).toContainText(ENGINE_COPY.scenario.slgAssumption["slg-referral-on-top"].en);
    expect((await storedEngineEntry(page))?.state.whatIf).toEqual({ "slg.ref.referred-share": 30 });
  });

  test("390: the two engines side by side over their total and its rule, the totals two by two, nothing pushes the page sideways — French too", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const locale of ["en", "fr"] as const) {
      await seed(page, hybridState(), locale);
      const plg = await page.getByTestId("engine-total-plg").boundingBox();
      const slg = await page.getByTestId("engine-total-slg").boundingBox();
      const sum = await page.getByTestId("engine-total-sum").boundingBox();
      // Extension 09 (A20.d T3.b): self-serve then sales-assisted on one row, the total under both.
      expect(Math.abs(slg!.y - plg!.y)).toBeLessThan(2);
      expect(plg!.x).toBeLessThan(slg!.x);
      expect(sum!.y).toBeGreaterThan(Math.max(plg!.y + plg!.height, slg!.y + slg!.height) - 1);
      const arr = await page.getByTestId("engine-total-band-totals-arr").boundingBox();
      const in12 = await page.getByTestId("engine-total-band-totals-mrr12").boundingBox();
      expect(Math.abs(in12!.y - arr!.y)).toBeLessThan(2);
      await noHorizontalScroll(page);
      await page.getByTestId("engine-motion-selector").getByRole("button", { name: ENGINE_COPY.hybrid.motionName.slg[locale] }).click();
      await expect(page.getByTestId("engine-relays")).toBeVisible();
      await noHorizontalScroll(page);
    }
  });
});

test.describe("sales-assisted alone", () => {
  test("the relays and their diagnosis, no total and no selector", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await seed(page, salesAssistedState());
    await expect(page.getByTestId("engine-board")).toHaveAttribute("data-motions", "slg");
    await expect(page.getByTestId("engine-board-relays")).toBeVisible();
    await expect(page.getByTestId("engine-diagnosis-slg")).toBeVisible();
    await expect(page.getByTestId("engine-total-band")).toHaveCount(0);
    await expect(page.getByTestId("engine-motion-selector")).toHaveCount(0);
    await expect(page.getByTestId("engine-board-peloton")).toHaveCount(0);
    await expect(page.getByTestId("engine-numbers-revenue")).toHaveAttribute("data-holds", "true");
  });
});

test.describe("a sales-assisted sheet", () => {
  test("its three months; the company-wide margin, approximate, offered on both margin sheets in the hybrid", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await seed(page, hybridState(), "fr");
    await page.getByTestId("engine-motion-selector").getByRole("button", { name: ENGINE_COPY.hybrid.motionName.slg.fr }).click();
    await openNumber(page, "slg-rev-win-rate");
    const sheet = page.getByTestId("engine-sheet-slg-rev-win-rate");
    await expect(sheet.getByTestId("engine-sheet-period")).toContainText("Prends les trois mois");

    await openNumber(page, "slg-rev-gross-margin");
    const margin = page.getByTestId("engine-sheet-slg-rev-gross-margin");
    await margin.getByTestId("engine-company-wide-slg-rev-gross-margin").click();
    await expect(margin.getByTestId("engine-company-wide")).toContainText(ENGINE_COPY.sheet.companyWideHint.fr);
    await expect(margin.getByTestId("engine-estimate")).toBeVisible();
  });

  test("a number's screen counts what remains in both engines: the self-serve margin, one sales-assisted number left (A21.8)", async ({ page }) => {
    // Every self-serve number is in, sales-assisted's time to go live is not: « Enregistre et continue » leads there, so
    // the header cannot say « Plus rien à faire » (it did, counting the margin's engine alone).
    await page.setViewportSize({ width: 1280, height: 900 });
    await seed(page, hybridState(), "fr");
    await openNumber(page, "rev-gross-margin");
    await expect(page.getByTestId("engine-number-progress")).toHaveText(ENGINE_COPY.list.lastOne.fr);
  });
});

test.describe("the settings: a motion unticked is hidden, never erased (§18.1.3)", () => {
  test("untick sales-assisted: said before saving, gone from the board, back with its numbers when ticked again; the last box can't be unticked", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await seed(page, hybridState());
    await page.getByTestId("engine-bar-settings").click();
    const settings = page.getByTestId("engine-settings");
    await settings.getByTestId("engine-motion-slg").uncheck();
    await expect(page.getByTestId("engine-settings-resets")).toContainText("Unticking sales-assisted removes it from the board and the slides. Its 15 numbers");
    await page.getByTestId("engine-settings-save").click();
    await expect(page.getByTestId("engine-board")).toHaveAttribute("data-motions", "plg");
    await expect(page.getByTestId("engine-total-band")).toHaveCount(0);
    expect(await storedMotions(page)).toEqual({ plg: true, slg: false });
    // Still on the device.
    const kept = (await storedEngineEntry(page))?.state.snapshots[0]!.metrics["slg.rev.win-rate"]?.status;
    expect(kept).toBe("measured");

    await page.getByTestId("engine-bar-settings").click();
    // Self-serve is the only box left: it can't be unticked.
    const last = page.getByTestId("engine-settings").getByTestId("engine-motion-plg");
    await expect(last).toBeDisabled();
    await expect(last).toBeChecked();
    // …and it still LOOKS ticked: filled with its own ink, as a ticked box is. Found on the design
    // sync of 2026-10-01: the disabled rule repainted the fill and the box read as unticked.
    // Non-vacuity (2026-10-01): with that rule emptied in Checkbox.module.css and the app rebuilt, this
    // line alone fails, 1 test of the file's 11 (the fill is rgb(222, 214, 194), the disabled beige);
    // `toBeChecked` above passes in both states — the box IS ticked, it only stopped looking it.
    expect(await last.evaluate((el) => getComputedStyle(el).backgroundColor === getComputedStyle(el).color)).toBe(true);
    await expect(page.getByText(ENGINE_COPY.settings.motionLast.en)).toBeVisible();
    await page.getByTestId("engine-settings").getByTestId("engine-motion-slg").check();
    await expect(page.getByTestId("engine-settings-resets")).toContainText(/numbers are back/);
    await page.getByTestId("engine-settings-save").click();
    await expect(page.getByTestId("engine-board")).toHaveAttribute("data-motions", "hybrid");
    await expect(page.getByTestId("engine-total-mrr-slg")).toContainText(`180,000`);
  });
});

test.describe("the journey, both motions (§18.7 E3, A18 T3.b)", () => {
  test("the start's targets grouped by motion; then one order for both engines, stage by stage", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.clock.setFixedTime(EXAMPLE_CLOCK);
    await openEngine(page);
    await page.locator("#engine-start-motion-both").check();
    await page.getByTestId("engine-start-go").click();
    // The « Targets » screen at the start (C40, A18 T3.a): one group per motion, self-serve first.
    await expect(page.getByTestId("engine-targets-start-plg")).toBeVisible();
    await expect(page.getByTestId("engine-targets-start-slg")).toBeVisible();
    await page.getByTestId("engine-targets-next").click();

    // The five-minute numbers of both engines, in the funnel's order: self-serve's acquisition, then the
    // activation of each — not all of self-serve's before sales-assisted's, as the step-by-step went.
    const number = page.getByTestId("engine-number");
    await expect(number).toHaveAttribute("data-metric", "acq.signup-rate");
    await page.getByTestId("engine-number-skip").click();
    await expect(number).toHaveAttribute("data-metric", "act.event");
    await page.getByTestId("engine-number-skip").click();
    await expect(number).toHaveAttribute("data-metric", "slg.act.live-event");
  });
});

test.describe("the example, in the start's answer", () => {
  test("« Both »: the example is the hybrid's, with its total", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.clock.setFixedTime(EXAMPLE_CLOCK);
    await openEngine(page);
    await page.locator("#engine-start-motion-both").check();
    await page.getByTestId("engine-start-example").click();
    const example = page.getByTestId("engine-example");
    await expect(example.getByTestId("engine-total-band")).toBeVisible();
    await expect(example.getByTestId("engine-column-slg")).toBeVisible();
    // Nothing written: the example lives in memory only.
    expect(await storedMotions(page)).toBeNull();
  });
});
