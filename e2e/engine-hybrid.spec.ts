import type { Page } from "@playwright/test";
import { ENGINE_COPY } from "@/content/engine-copy";
import { hybridState, salesAssistedState } from "../src/lib/engine/__tests__/fixtures";
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
 * boxes, the hybrid board — « deux moteurs, un total », the two columns, the
 * selector — sales-assisted alone, a sales-assisted sheet, the settings that
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

test.describe("the setup's two boxes (§18.1.1)", () => {
  test("self-serve ticked by default; sales-assisted unfolds its windows and the months it reads; none ticked is refused", async ({ page }) => {
    await page.clock.setFixedTime(EXAMPLE_CLOCK);
    await openEngine(page);
    const plg = page.getByTestId("engine-motion-plg");
    const slg = page.getByTestId("engine-motion-slg");
    await expect(plg).toBeChecked();
    await expect(slg).not.toBeChecked();
    await expect(page.getByTestId("engine-setup-slg-periods")).toHaveCount(0);

    await slg.check();
    await expect(page.getByText(ENGINE_COPY.setup.qualificationWindow.en)).toBeVisible();
    await expect(page.getByText(ENGINE_COPY.setup.goLiveWindow.en)).toBeVisible();
    await expect(page.getByTestId("engine-setup-slg-periods")).toBeVisible();

    // Self-serve unticked: its cohort month goes with it (sales-assisted reads three months, D7).
    await plg.uncheck();
    await expect(page.getByLabel(ENGINE_COPY.setup.cohortMonth.en)).toHaveCount(0);

    // Neither: the start is refused, said under the boxes, the focus on the first one.
    await slg.uncheck();
    await page.getByTestId("engine-setup-board").click();
    await expect(page.getByText(ENGINE_COPY.setup.motionsRequired.en)).toBeVisible();
    await expect(plg).toBeFocused();
    await expect(page.getByTestId("engine-board")).toHaveCount(0);

    await plg.check();
    await slg.check();
    await page.getByTestId("engine-setup-board").click();
    await expect(page.getByTestId("engine-board")).toHaveAttribute("data-motions", "hybrid");
    expect(await storedMotions(page)).toEqual({ plg: true, slg: true });
  });
});

test.describe("the hybrid board (§18.7 E2)", () => {
  test("« deux moteurs, un total »: the sum in the title, self-serve first, the link said as a share, then the sums", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await seed(page, hybridState(), "fr");
    const band = page.getByTestId("engine-total-band");
    await expect(band).toContainText(`228${NB}000${NB}€`);
    await expect(page.getByTestId("engine-total-mrr-plg")).toHaveText(`48${NB}000${NB}€`);
    await expect(page.getByTestId("engine-total-mrr-slg")).toHaveText(`180${NB}000${NB}€`);
    // Self-serve first, always: the blocks never follow their values.
    const plgBox = await page.getByTestId("engine-total-plg").boundingBox();
    const slgBox = await page.getByTestId("engine-total-slg").boundingBox();
    expect(plgBox!.x).toBeLessThan(slgBox!.x);
    const link = page.getByTestId("engine-total-link");
    await expect(link).toContainText("31 des 130 opportunités assistées viennent de comptes du libre-service (juin à août 2026).");
    await expect(link).toContainText(ENGINE_COPY.total.linkNote.fr);
    await expect(page.getByTestId("engine-total-sums")).toContainText(`~5${NB}000${NB}€ + ~12${NB}000${NB}€ = ~17${NB}000${NB}€`);
    // No header verdict or coverage of its own: the band's title is the verdict.
    await expect(page.locator('[data-testid="engine-board"] > header [data-testid="engine-coverage"]')).toHaveCount(0);
  });

  test("two columns, each with its diagnosis and its own drawing — the peloton and the relays — then the two-segments line", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await seed(page, hybridState());
    const plg = page.getByTestId("engine-column-plg");
    const slg = page.getByTestId("engine-column-slg");
    await expect(plg.getByRole("heading", { level: 2 })).toHaveText(ENGINE_COPY.hybrid.motionName.plg.en);
    await expect(slg.getByRole("heading", { level: 2 })).toHaveText(ENGINE_COPY.hybrid.motionName.slg.en);
    await expect(plg.getByTestId("engine-diagnosis")).toBeVisible();
    await expect(slg.getByTestId("engine-diagnosis-slg")).toBeVisible();
    await expect(plg.getByTestId("engine-board-peloton")).toBeVisible();
    await expect(slg.getByTestId("engine-relays")).toBeVisible();
    // The §18.9 diagnosis names the win rate: the stamp is on its relay, and on no other.
    await expect(slg.getByTestId("relays-stamp")).toHaveCount(1);
    await expect(slg.getByTestId("relays-numeral-slg.rev.win-rate")).toContainText("24");
    // Side by side at 1280.
    const a = await plg.boundingBox();
    const b = await slg.boundingBox();
    expect(Math.abs(a!.y - b!.y)).toBeLessThan(2);
    await expect(page.getByTestId("engine-two-segments")).toHaveText(ENGINE_COPY.hybrid.twoSegments.en);
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

    // Its what-if panel, its own levers, the link counted in opportunities; the total line under it.
    await page.getByTestId("engine-board-whatif").locator("summary").first().click();
    await expect(page.getByTestId("engine-whatif-slg-panel")).toBeVisible();
    await expect(page.getByTestId("whatif-value-link.pql-handoff")).toHaveText("31");
    await expect(page.getByTestId("whatif-slg-quarter")).toContainText("130");
    await expect(page.getByTestId("engine-total-in12")).toContainText(ENGINE_COPY.scenario.totalIn12.en);
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
    await expect(page.getByTestId("engine-total-in12")).toContainText(/today|aujourd/);
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

  test("390: the columns stack and nothing pushes the page sideways — French too", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const locale of ["en", "fr"] as const) {
      await seed(page, hybridState(), locale);
      const a = await page.getByTestId("engine-column-plg").boundingBox();
      const b = await page.getByTestId("engine-column-slg").boundingBox();
      expect(b!.y).toBeGreaterThan(a!.y + a!.height - 1);
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

test.describe("the step-by-step, per motion (§18.7 E3)", () => {
  test("targets grouped by motion, both bases, then skip to sales-assisted and past the optional link", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.clock.setFixedTime(EXAMPLE_CLOCK);
    await openEngine(page);
    await page.getByTestId("engine-motion-slg").check();
    await page.getByTestId("engine-setup-start").click();
    const steps = page.getByTestId("engine-steps");
    await expect(steps).toHaveAttribute("data-phase", "targets");
    await expect(page.getByTestId("engine-steps-targets-plg")).toBeVisible();
    await expect(page.getByTestId("engine-steps-targets-slg")).toBeVisible();
    await page.getByTestId("engine-steps-next").click();
    await expect(page.getByTestId("engine-steps-base")).toBeVisible();
    await page.getByTestId("engine-steps-next").click();
    await expect(page.getByTestId("engine-steps-base-slg")).toBeVisible();
    await page.getByTestId("engine-steps-next").click();

    const number = page.getByTestId("engine-steps-number");
    await expect(number).toHaveAttribute("data-metric", /^(?!slg\.)/);
    await expect(page.getByTestId("engine-steps-skip-group")).toHaveText(ENGINE_COPY.steps.skipToSlg.en);
    await page.getByTestId("engine-steps-skip-group").click();
    await expect(number).toHaveAttribute("data-metric", /^slg\./);
    await expect(page.getByTestId("engine-steps-skip-group")).toHaveText(ENGINE_COPY.steps.skipToWhatIf.en);
    await page.getByTestId("engine-steps-skip-group").click();
    await expect(steps).toHaveAttribute("data-phase", "whatif");
  });
});

test.describe("the example, in the motions ticked", () => {
  test("both boxes ticked: the example is the hybrid's, with its total", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.clock.setFixedTime(EXAMPLE_CLOCK);
    await openEngine(page);
    await page.getByTestId("engine-motion-slg").check();
    await page.getByTestId("engine-setup-example").click();
    const example = page.getByTestId("engine-example");
    await expect(example.getByTestId("engine-total-band")).toBeVisible();
    await expect(example.getByTestId("engine-column-slg")).toBeVisible();
    // Nothing written: the example lives in memory only.
    expect(await storedMotions(page)).toBeNull();
  });
});
