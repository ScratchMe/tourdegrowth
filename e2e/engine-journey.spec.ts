import type { Page } from "@playwright/test";
import { ENGINE_COPY } from "@/content/engine-copy";
import type { MetricId } from "@/lib/engine/types";
import { exampleState, withMonthBefore } from "../src/lib/engine/__tests__/fixtures";
import { ADMIN_PASSWORD, expect, grantOwnerPreview, SKIP_ADMIN_REASON, test } from "./helpers";
import { storedEngineEntry, openEngineMenu, openNumber, expectFound, writeEngineSeed } from "./engine-helpers";

// The page ships closed (engine-flag.spec.ts): every test opens it with the
// owner's signed preview, minted by /admin/preview (e2e/helpers.ts).
test.skip(!ADMIN_PASSWORD, SKIP_ADMIN_REASON);
test.beforeEach(async ({ context }) => {
  await grantOwnerPreview(context.request, "engine");
});

/**
 * The journey (A18 T3.b, design system extension 07): the step-by-step,
 * folded into the board. From the start, each number's screen leads to the
 * next step — « Enregistre et continue » — in the board's own order: the
 * five-minute numbers, then the requests, then the hour-long ones, then the
 * board. « Passe pour l'instant » leaves a number « à faire ». A count
 * several numbers share is typed once, in the first number that carries it.
 * And the filled-in example, the settings changed after the fact, the
 * answers that are not numbers. Behaviour, read from the device's storage and
 * from what the next screen shows — never from the component's state.
 */

type Stored = {
  state: {
    setup: { activationWindowDays: number };
    snapshots: { base?: Record<string, unknown>; targets: Record<string, number>; metrics: Record<string, { status: string; value?: unknown }> }[];
  };
};

async function stored(page: Page): Promise<Stored | null> {
  return storedEngineEntry<Stored>(page);
}

async function open(page: Page, locale: "en" | "fr" = "en"): Promise<void> {
  await page.goto(`/${locale}/aarrr-funnel-template`);
  await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
}

/** The example engine, every number answered but the ones named: back to « à faire ». */
async function seedWithout(page: Page, ids: MetricId[]): Promise<void> {
  const state = exampleState();
  const snapshot = state.snapshots[state.snapshots.length - 1]!;
  for (const id of ids) delete snapshot.metrics[id];
  await page.clock.setFixedTime(new Date(2026, 8, 24, 12));
  await open(page);
  await writeEngineSeed(page, state);
  await page.reload();
  await expect(page.getByTestId("engine-board")).toBeVisible();
}

test("from the start, « Save and continue » walks the quick numbers; « Skip for now » leaves one to do; a shared count is typed once", async ({ page }) => {
  await open(page);
  await page.getByTestId("engine-start-go").click();
  // A target on the « Targets » screen, written on its way out of the box.
  await page.locator("#engine-step-target-act-rate").fill("25");
  await page.locator("#engine-step-target-act-rate").blur();
  await page.getByTestId("engine-targets-next").click();
  expect((await stored(page))?.state.snapshots[0]?.targets["act.rate"]).toBe(25);

  // The first number: the quickest, in the funnel's order. Its sign-ups are the month's, shared.
  const number = page.getByTestId("engine-number");
  await expect(number).toHaveAttribute("data-metric", "acq.signup-rate");
  const sheet = page.getByTestId("engine-sheet-acq-signup-rate");
  await sheet.locator("#engine-acq-signup-rate-num").fill("1000");
  await sheet.locator("#engine-acq-signup-rate-den").fill("20000");
  await sheet.locator("#engine-acq-signup-rate-source").selectOption({ index: 1 });
  const save = page.getByTestId("engine-save-acq-signup-rate");
  await expect(save).toHaveText(ENGINE_COPY.sheet.saveNext.en);
  await save.click();

  // The next quick number, its heading focused: a person moved (R-19).
  await expect(number).toHaveAttribute("data-metric", "act.event");
  await expect(page.locator("#engine-number-title")).toBeFocused();
  expect((await stored(page))?.state.snapshots[0]?.metrics["acq.signup-rate"]?.status).toBe("measured");

  // Passed for now: still « à faire », and the next quick one comes.
  await page.getByTestId("engine-number-skip").click();
  await expect(number).toHaveAttribute("data-metric", "ret.logo-churn");
  expect((await stored(page))?.state.snapshots[0]?.metrics["act.event"]).toBeUndefined();

  // The month's sign-ups, typed once: the top channel's share already carries them.
  await openNumber(page, "acq-top-channel-share");
  await expect(page.locator("#engine-acq-top-channel-share-den")).toHaveValue("1,000");
});

test("the last number to find alone says « Save and see your engine », and leads to the board; an answered one offers no skip", async ({ page }) => {
  await seedWithout(page, ["act.ttv"]);
  // A number already answered, opened from the list: nothing to pass, so no « Skip for now ».
  await openNumber(page, "act-rate");
  await expect(page.getByTestId("engine-number-skip")).toHaveCount(0);
  await openNumber(page, "act-ttv");
  await expect(page.getByTestId("engine-save-act-ttv")).toHaveText(ENGINE_COPY.sheet.saveLast.en);
  await page.getByTestId("engine-number-skip").click();
  await expect(page.getByTestId("engine-board")).toBeVisible();
  await expect(page.locator("#engine-verdict")).toBeFocused();
});

test.describe("one request left", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  test("leads to its number, « I'll ask for it » open; copied, « Continue » goes on", async ({ page }) => {
    await seedWithout(page, ["act.ttv", "rev.gross-margin"]);
    await openNumber(page, "act-ttv");
    // Something is still to ask for: not the last screen.
    await expect(page.getByTestId("engine-save-act-ttv")).toHaveText(ENGINE_COPY.sheet.saveNext.en);
    await page.getByTestId("engine-number-skip").click();
    await expect(page.getByTestId("engine-number")).toHaveAttribute("data-metric", "rev.gross-margin");
    const sheet = page.getByTestId("engine-sheet-rev-gross-margin");
    // Before the copy, which is the save, the ways on are the copy and « Skip for now » — no « Continue ».
    await expect(page.getByTestId("engine-continue-rev-gross-margin")).toHaveCount(0);
    await expect(page.getByTestId("engine-number-skip")).toBeVisible();
    await sheet.getByRole("button", { name: ENGINE_COPY.request.copy.en }).click();
    await expect.poll(async () => (await stored(page))?.state.snapshots[0]?.metrics["rev.gross-margin"]?.status).toBe("requested");
    await page.getByTestId("engine-continue-rev-gross-margin").click();
    await expect(page.getByTestId("engine-board")).toBeVisible();
  });
});

test("a past month corrected only saves: no « continue », no « skip »", async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 8, 24, 12));
  await open(page);
  await writeEngineSeed(page, withMonthBefore(exampleState(), () => undefined));
  await page.reload();
  await openEngineMenu(page);
  await page.getByTestId("engine-month-select").selectOption({ index: 1 });
  await page.getByTestId("engine-month-correct").click();
  await openNumber(page, "act-rate");
  await expect(page.getByTestId("engine-save-act-rate")).toHaveText(ENGINE_COPY.sheet.save.en);
  await expect(page.getByTestId("engine-number-skip")).toHaveCount(0);
});

test("the example shows a filled-in funnel and its slides, and writes nothing on the device", async ({ page }) => {
  await open(page, "fr");
  await page.getByTestId("engine-start-example").click();
  const example = page.getByTestId("engine-example");
  await expect(example).toBeVisible();
  await expect(example).toContainText(ENGINE_COPY.example.bannerTitle.fr);
  await expect(example.getByTestId("peloton-numeral-act.rate")).toHaveText("18");
  await page.getByTestId("engine-example-deck-open").click();
  await expect(page.getByTestId("engine-example-deck")).toBeVisible();
  await expect(page.getByTestId("engine-deck")).toBeVisible();
  expect(await stored(page)).toBeNull();
});

test("settings can be changed later; a new activation window sends that number back to « to fill in »", async ({ page }) => {
  await open(page);
  await page.getByTestId("engine-start-go").click();
  await page.getByTestId("engine-targets-next").click();
  await page.getByTestId("engine-number-back").click();
  await openNumber(page, "act-rate");
  const sheet = page.getByTestId("engine-sheet-act-rate");
  await sheet.locator("#engine-act-rate-num").fill("144");
  await sheet.locator("#engine-act-rate-den").fill("800");
  await sheet.locator("#engine-act-rate-source").selectOption({ label: "Amplitude" });
  await sheet.getByTestId("engine-save-act-rate").click();
  await expectFound(page, 1);

  await page.getByTestId("engine-bar-settings").click();
  const settings = page.getByTestId("engine-settings");
  await expect(settings).toBeVisible();
  await settings.getByRole("group", { name: ENGINE_COPY.setup.activationWindow.en }).getByRole("button", { name: "14 days" }).click();
  await expect(page.getByTestId("engine-settings-resets")).toContainText("14 days");
  await page.getByTestId("engine-settings-save").click();

  await expect(page.getByTestId("engine-board")).toBeVisible();
  await expectFound(page, 0);
  const after = await stored(page);
  expect(after?.state.setup.activationWindowDays).toBe(14);
  expect(after?.state.snapshots[0]?.metrics["act.rate"]).toBeUndefined();
});

test("the company field says it is the product's or the company's name", async ({ page }) => {
  await open(page, "fr");
  // In the full card the start screen's « Modifier » opens (A18 T3.a).
  await page.getByTestId("engine-start-change").click();
  await expect(page.getByLabel(ENGINE_COPY.setup.companyLabel.fr)).toBeVisible();
  expect(ENGINE_COPY.setup.companyLabel.fr).toMatch(/entreprise|SaaS/);
});

/**
 * Antoine, 2026-09-26: « Où en es-tu avec ce chiffre ? » was asked of the
 * activation event, which is a name. The three answers — activation event,
 * churn cause, referral mechanism — get their own wording, their own eyebrow
 * in the step-by-step, and no « J'ai deux chiffres qui ne collent pas » in the
 * triage (its two readings were percent boxes). Since A18 T1 the question is
 * the boxes, and the other answers sit under « Pas de chiffre sous la main ? »
 * — « Pas de réponse » over a name, with no estimate: a name is not somewhere
 * between. The numbers keep theirs: the companion assertions below would pass
 * on a sheet that offered no other answer at all.
 */
test("an answer is offered « Pas de réponse sous la main ? », never « Pas de chiffre »", async ({ page }) => {
  await open(page, "fr");
  const q = ENGINE_COPY.sheet;
  await page.getByTestId("engine-start-go").click();
  await page.getByTestId("engine-targets-next").click();
  await page.getByTestId("engine-number-back").click();

  for (const [stage, metric] of [
    ["activation", "act-event"],
    ["retention", "ret-churn-cause"],
    ["referral", "ref-mechanism"],
  ] as const) {
    const sheet = await boardSheet(page, stage, metric);
    await expect(sheet.getByRole("group", { name: q.answerLegendAnswer.fr, exact: true })).toBeVisible();
    await expect(sheet.getByRole("group", { name: q.answerLegend.fr, exact: true })).toHaveCount(0);
    await expect(sheet.getByRole("button", { name: q.canEstimate.fr })).toHaveCount(0);
    // « Je ne le trouve pas »: four causes, never two numbers that don't match.
    await sheet.getByRole("button", { name: q.cantFind.fr }).click();
    const triage = sheet.getByTestId("engine-triage");
    await expect(triage.getByRole("radio")).toHaveCount(4);
    await expect(triage.getByRole("radio", { name: ENGINE_COPY.cause.conflicting.fr })).toHaveCount(0);
  }

  // A number keeps « chiffre », its estimate, and its « deux chiffres » triage answer.
  const rate = await boardSheet(page, "activation", "act-rate");
  await expect(rate.getByRole("group", { name: q.answerLegend.fr, exact: true })).toBeVisible();
  await expect(rate.getByRole("button", { name: q.canEstimate.fr })).toHaveCount(1);
  await rate.getByRole("button", { name: q.cantFind.fr }).click();
  await expect(rate.getByTestId("engine-triage").getByRole("radio", { name: ENGINE_COPY.cause.conflicting.fr })).toHaveCount(1);
});

test("an answer's screen says where it sits, never « Chiffre »", async ({ page }) => {
  await open(page, "fr");
  await page.getByTestId("engine-start-go").click();
  await page.getByTestId("engine-targets-next").click();
  // The step-by-step's « Point 4 sur 17 » went with it (A18 T3.b): every screen says its stage and its place there.
  await page.getByTestId("engine-number-skip").click();
  const number = page.getByTestId("engine-number");
  await expect(number).toHaveAttribute("data-metric", "act.event");
  await expect(number).toContainText(ENGINE_COPY.list.position.fr.replace("{stage}", ENGINE_COPY.stages.activation.fr).replace("{i}", "2").replace("{n}", "3"));
  await expect(number).not.toContainText("Chiffre");
  await expect(number.getByRole("group", { name: ENGINE_COPY.sheet.answerLegendAnswer.fr, exact: true })).toBeVisible();
});

/**
 * Antoine, 2026-09-26: an MRR of 2 000 000 typed as "2000000" stayed a row of
 * zeros. The field groups as it goes — U+00A0 in French, a comma in English —
 * keeps the caret where the person is typing, lets a decimal separator be
 * typed, and still stores the number. The value is compared with `toBe` on
 * `inputValue()`, never `toHaveValue`: a NBSP must be proved, not normalised.
 */
for (const [locale, big, middle, decimal] of [
  ["fr", "2\u00a0000\u00a0000", "129\u00a0834", ["12,", "12,5"]],
  ["en", "2,000,000", "129,834", ["12.", "12.5"]],
] as const) {
  test(`${locale}: big numbers group as they are typed, the caret stays put, and 2000000 is saved`, async ({ page }) => {
    await open(page, locale);
    await page.getByTestId("engine-start-go").click();

    // A rate field: a trailing decimal separator is half a number, not something to clean up.
    const target = page.locator("#engine-step-target-act-rate");
    await target.pressSequentially(decimal[0]);
    expect(await target.inputValue()).toBe(decimal[0]);
    await target.pressSequentially("5");
    expect(await target.inputValue()).toBe(decimal[1]);
    await target.blur();
    await page.getByTestId("engine-targets-next").click();

    // A count, typed digit by digit, in a number's own boxes.
    await openNumber(page, "act-rate");
    const den = page.locator("#engine-act-rate-den");
    await den.pressSequentially("2000000");
    expect(await den.inputValue()).toBe(big);

    // Typing in the middle: the caret follows the digit just typed, not the end of the box.
    const num = page.locator("#engine-act-rate-num");
    await num.pressSequentially("1234");
    await num.press("ArrowLeft");
    await num.press("ArrowLeft");
    await num.pressSequentially("9");
    expect(await num.evaluate((el: HTMLInputElement) => el.selectionStart)).toBe(4);
    await num.pressSequentially("8");
    expect(await num.inputValue()).toBe(middle);

    await page.locator("#engine-act-rate-source").selectOption({ index: 1 });
    await page.getByTestId("engine-save-act-rate").click();
    const saved = (await stored(page))?.state.snapshots[0];
    expect(saved?.metrics["act.rate"]?.value).toEqual({ kind: "ratio", numerator: 129834, denominator: 2000000 });
    expect(saved?.targets["act.rate"]).toBe(12.5);
  });
}

/** Opens a stage's drawer if it isn't already the one showing, then one metric's sheet on the board. */
/** A number's own screen, from its row in « Tes chiffres » (A18 T2.b; the stage tabs of 2026-09-26 are gone). */
async function boardSheet(page: Page, _stage: string, metricDomId: string) {
  // The list shows every stage (A18 T2.b): the row is enough, the stage stays for the callers' reading.
  return openNumber(page, metricDomId);
}

/*
 * A15.2 (2026-10-01): a target is written when its box is left, and a box
 * holding text it cannot read used to write `null` — erasing the stored
 * target while the box still showed the typo and its message. Both target
 * fields: the step screen's and the board sheet's. Emptying the box is still
 * how a target is removed.
 *
 * Non-vacuity (2026-10-01), one guard at a time: without the step screen's,
 * the test falls on the step's `toBe(25)` (`undefined`); without the sheet's,
 * on the sheet's, the step part passing. Each field is held on its own.
 */
test("a typo in a target keeps the stored target, on the step screen and in a sheet; an empty box removes it", async ({ page }) => {
  const target = async () => (await stored(page))?.state.snapshots[0]?.targets["act.rate"];
  await open(page);
  // The start's « Targets » screen (A18 T3.a): the same boxes as the step-by-step's.
  await page.getByTestId("engine-start-go").click();

  const step = page.locator("#engine-step-target-act-rate");
  await step.fill("25");
  await step.blur();
  await expect.poll(target).toBe(25);
  // Not « 25 %% » any more: since A15.10 a unit sign is read, and that reads as 25.
  await step.fill("25 kg");
  await step.blur();
  await expect(page.getByText(ENGINE_COPY.workbench.notANumber.en)).toBeVisible();
  expect(await target()).toBe(25);

  // The same field in a sheet, after a reload: the target came back from the device.
  await page.reload();
  await expect(page.getByTestId("engine-board")).toBeVisible();
  await openNumber(page, "act-rate");
  const box = page.locator("#engine-act-rate-target");
  await expect(box).toHaveValue("25");
  await box.fill("abc");
  await box.blur();
  await expect(page.getByTestId("engine-sheet-act-rate").getByText(ENGINE_COPY.workbench.notANumber.en)).toBeVisible();
  expect(await target()).toBe(25);

  await box.fill("");
  await box.blur();
  await expect.poll(target).toBeUndefined();
});

test("a target typed with its percent sign is read, the sign dropped from the box", async ({ page }) => {
  await open(page);
  await page.getByTestId("engine-start-go").click();
  const target = page.locator("#engine-step-target-act-rate");
  await target.fill("25 %");
  await target.blur();
  await expect.poll(async () => (await stored(page))?.state.snapshots[0]?.targets["act.rate"]).toBe(25);
  await expect(target).toHaveValue("25");
});
