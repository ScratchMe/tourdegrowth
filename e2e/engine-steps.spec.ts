import type { Page } from "@playwright/test";
import { ENGINE_COPY } from "@/content/engine-copy";
import { ADMIN_PASSWORD, expect, grantOwnerPreview, SKIP_ADMIN_REASON, test } from "./helpers";

// The page ships closed (engine-flag.spec.ts): every test opens it with the
// owner's signed preview, minted by /admin/preview (e2e/helpers.ts).
test.skip(!ADMIN_PASSWORD, SKIP_ADMIN_REASON);
test.beforeEach(async ({ context }) => {
  await grantOwnerPreview(context.request, "engine");
});

/**
 * The engine's second way in (Antoine, 2026-09-25): the step-by-step, the
 * shared base typed once, the filled-in example, and the settings that can
 * now be changed after the fact. Behaviour, read from the device's storage
 * and from what the next screen shows — never from the component's state.
 */
const STORAGE_KEY = "tdg.engine.v1";

type Stored = {
  state: {
    setup: { activationWindowDays: number };
    snapshots: { base?: Record<string, unknown>; targets: Record<string, number>; metrics: Record<string, { status: string; value?: unknown }> }[];
  };
};

async function stored(page: Page): Promise<Stored | null> {
  return page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  }, STORAGE_KEY);
}

async function open(page: Page, locale: "en" | "fr" = "en"): Promise<void> {
  await page.goto(`/${locale}/aarrr-funnel-template`);
  await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
}

test("« Start step by step » walks targets → base → one number per screen, and the base is typed once", async ({ page }) => {
  await open(page);
  await page.getByTestId("engine-setup-start").click();
  const steps = page.getByTestId("engine-steps");
  await expect(steps).toHaveAttribute("data-phase", "targets");
  await expect(page.locator("#engine-steps-title")).toHaveText(ENGINE_COPY.steps.targetsTitle.en);

  // A target, written on its way out of the field.
  await page.locator("#engine-step-target-act-rate").fill("25");
  await page.getByTestId("engine-steps-next").click();
  await expect(steps).toHaveAttribute("data-phase", "base");
  expect((await stored(page))?.state.snapshots[0]?.targets["act.rate"]).toBe(25);
  // A person moved: the focus follows the heading, never left on <body>.
  await expect(page.locator("#engine-steps-title")).toBeFocused();

  await page.locator("#engine-base-cohort").fill("800");
  await page.locator("#engine-base-month").fill("1000");
  await page.getByTestId("engine-steps-next").click();
  await expect(steps).toHaveAttribute("data-phase", "number");
  // Both counts, in the base — the two used to be two writes, and the second dropped the first.
  expect((await stored(page))?.state.snapshots[0]?.base).toEqual({ cohortSignups: 800, monthSignups: 1000 });

  // Skip, then back: a skipped number stays "to fill in".
  const number = page.getByTestId("engine-steps-number");
  const first = await number.getAttribute("data-metric");
  await page.getByTestId("engine-steps-skip").click();
  await expect(number).not.toHaveAttribute("data-metric", first!);
  await page.getByTestId("engine-steps-back").click();
  await expect(number).toHaveAttribute("data-metric", first!);
  expect((await stored(page))?.state.snapshots[0]?.metrics[first!]).toBeUndefined();

  // The board's activation sheet already carries the 800: typed once, reused.
  await page.getByTestId("engine-steps-board").click();
  await expect(page.getByTestId("engine-board")).toBeVisible();
  const row = page.getByTestId("engine-row-activation");
  if ((await row.getAttribute("aria-expanded")) !== "true") await row.click();
  const toggle = page.getByTestId("engine-metric-act-rate");
  if ((await toggle.getAttribute("aria-expanded")) !== "true") await toggle.click();
  const sheet = page.getByTestId("engine-sheet-act-rate");
  await sheet.getByRole("radio", { name: "I have it" }).check();
  await expect(sheet.locator("#engine-act-rate-den")).toHaveValue("800");

  // And the peloton says what its 100 are.
  await expect(page.getByTestId("peloton-same-hundred").first()).toContainText("800");

  // Back to the steps: it resumes on the first number nobody has touched, not at the targets.
  await page.getByTestId("engine-open-steps").click();
  await expect(steps).toHaveAttribute("data-phase", "number");
});

test("the example shows a filled-in funnel and its slides, and writes nothing on the device", async ({ page }) => {
  await open(page, "fr");
  await page.getByTestId("engine-setup-example").click();
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
  await page.getByTestId("engine-setup-board").click();
  const row = page.getByTestId("engine-row-activation");
  if ((await row.getAttribute("aria-expanded")) !== "true") await row.click();
  const toggle = page.getByTestId("engine-metric-act-rate");
  if ((await toggle.getAttribute("aria-expanded")) !== "true") await toggle.click();
  const sheet = page.getByTestId("engine-sheet-act-rate");
  await sheet.getByRole("radio", { name: "I have it" }).check();
  await sheet.locator("#engine-act-rate-num").fill("144");
  await sheet.locator("#engine-act-rate-den").fill("800");
  await sheet.locator("#engine-act-rate-source").selectOption({ label: "Amplitude" });
  await sheet.getByTestId("engine-save-act-rate").click();
  await expect(page.getByTestId("engine-coverage")).toContainText("1 of 15 numbers found");

  await page.getByTestId("engine-open-settings").click();
  const settings = page.getByTestId("engine-settings");
  await expect(settings).toBeVisible();
  await settings.getByRole("group", { name: ENGINE_COPY.setup.activationWindow.en }).getByRole("button", { name: "14 days" }).click();
  await expect(page.getByTestId("engine-settings-resets")).toContainText("14 days");
  await page.getByTestId("engine-settings-save").click();

  await expect(page.getByTestId("engine-board")).toBeVisible();
  await expect(page.getByTestId("engine-coverage")).toContainText("0 of 15 numbers found");
  const after = await stored(page);
  expect(after?.state.setup.activationWindowDays).toBe(14);
  expect(after?.state.snapshots[0]?.metrics["act.rate"]).toBeUndefined();
});

test("the company field says it is the product's or the company's name", async ({ page }) => {
  await open(page, "fr");
  await expect(page.getByLabel(ENGINE_COPY.setup.companyLabel.fr)).toBeVisible();
  expect(ENGINE_COPY.setup.companyLabel.fr).toMatch(/entreprise|SaaS/);
});

/**
 * Antoine, 2026-09-26: « Où en es-tu avec ce chiffre ? » was asked of the
 * activation event, which is a name. The three answers — activation event,
 * churn cause, referral mechanism — get their own question, their own eyebrow
 * in the step-by-step, and no « J'ai deux chiffres qui ne collent pas » in the
 * triage (its two readings were percent boxes). The numbers keep theirs: the
 * companion assertions below would pass on a sheet that asked no question at all.
 */
test("an answer is asked where you are « sur ce point », never « avec ce chiffre »", async ({ page }) => {
  await open(page, "fr");
  const q = ENGINE_COPY.sheet;
  await page.getByTestId("engine-setup-board").click();

  for (const [stage, metric] of [
    ["activation", "act-event"],
    ["retention", "ret-churn-cause"],
    ["referral", "ref-mechanism"],
  ] as const) {
    const sheet = await boardSheet(page, stage, metric);
    await expect(sheet.getByRole("group", { name: q.statusQuestionAnswer.fr, exact: true })).toBeVisible();
    await expect(sheet.getByRole("group", { name: q.statusQuestion.fr, exact: true })).toHaveCount(0);
    await expect(sheet.locator("legend").first()).not.toContainText("chiffre");
    // « Je ne le trouve pas »: four causes, never two numbers that don't match.
    await sheet.getByRole("radio", { name: q.cantFind.fr }).check();
    const triage = sheet.getByTestId("engine-triage");
    await expect(triage.getByRole("radio")).toHaveCount(4);
    await expect(triage.getByRole("radio", { name: ENGINE_COPY.cause.conflicting.fr })).toHaveCount(0);
  }

  // A number keeps « ce chiffre », and its « deux chiffres » triage answer.
  const rate = await boardSheet(page, "activation", "act-rate");
  await expect(rate.getByRole("group", { name: q.statusQuestion.fr, exact: true })).toBeVisible();
  await rate.getByRole("radio", { name: q.cantFind.fr }).check();
  await expect(rate.getByTestId("engine-triage").getByRole("radio", { name: ENGINE_COPY.cause.conflicting.fr })).toHaveCount(1);
});

test("the step-by-step calls the activation event « Point 4 sur 15 », not « Chiffre 4 sur 15 »", async ({ page }) => {
  await open(page, "fr");
  await page.getByTestId("engine-setup-start").click();
  await page.getByTestId("engine-steps-next").click();
  await page.getByTestId("engine-steps-next").click();
  const number = page.getByTestId("engine-steps-number");
  const eyebrow = (i: number, key: "numberOf" | "answerOf") =>
    ENGINE_COPY.steps[key].fr.replace("{i}", String(i)).replace("{n}", "15").replace("{stage}", ENGINE_COPY.stages.acquisition.fr);
  await expect(number).toHaveAttribute("data-metric", "acq.signup-rate");
  await expect(number).toContainText(eyebrow(1, "numberOf"));
  for (let i = 0; i < 3; i += 1) await page.getByTestId("engine-steps-skip").click();
  await expect(number).toHaveAttribute("data-metric", "act.event");
  await expect(number).toContainText(
    ENGINE_COPY.steps.answerOf.fr.replace("{i}", "4").replace("{n}", "15").replace("{stage}", ENGINE_COPY.stages.activation.fr),
  );
  await expect(number).not.toContainText("Chiffre 4");
  await expect(number.getByRole("group", { name: ENGINE_COPY.sheet.statusQuestionAnswer.fr, exact: true })).toBeVisible();
});

/**
 * Antoine, 2026-09-26: an MRR of 2 000 000 typed as "2000000" stayed a row of
 * zeros. The field groups as it goes — U+00A0 in French, a comma in English —
 * keeps the caret where the person is typing, lets a decimal separator be
 * typed, and still stores the number. The value is compared with `toBe` on
 * `inputValue()`, never `toHaveValue`: a NBSP must be proved, not normalised.
 */
for (const [locale, big, middle, decimal] of [
  ["fr", "2 000 000", "129 834", ["12,", "12,5"]],
  ["en", "2,000,000", "129,834", ["12.", "12.5"]],
] as const) {
  test(`${locale}: big numbers group as they are typed, the caret stays put, and 2000000 is saved`, async ({ page }) => {
    await open(page, locale);
    await page.getByTestId("engine-setup-start").click();

    // A rate field: a trailing decimal separator is half a number, not something to clean up.
    const target = page.locator("#engine-step-target-act-rate");
    await target.pressSequentially(decimal[0]);
    expect(await target.inputValue()).toBe(decimal[0]);
    await target.pressSequentially("5");
    expect(await target.inputValue()).toBe(decimal[1]);
    await page.getByTestId("engine-steps-next").click();
    await expect(page.getByTestId("engine-steps")).toHaveAttribute("data-phase", "base");

    // A count, typed digit by digit.
    const cohort = page.locator("#engine-base-cohort");
    await cohort.pressSequentially("2000000");
    expect(await cohort.inputValue()).toBe(big);

    // Typing in the middle: the caret follows the digit just typed, not the end of the box.
    const month = page.locator("#engine-base-month");
    await month.pressSequentially("1234");
    await month.press("ArrowLeft");
    await month.press("ArrowLeft");
    await month.pressSequentially("9");
    expect(await month.evaluate((el: HTMLInputElement) => el.selectionStart)).toBe(4);
    await month.pressSequentially("8");
    expect(await month.inputValue()).toBe(middle);

    await page.getByTestId("engine-steps-next").click();
    await expect(page.getByTestId("engine-steps")).toHaveAttribute("data-phase", "number");
    const saved = (await stored(page))?.state.snapshots[0];
    expect(saved?.base).toEqual({ cohortSignups: 2000000, monthSignups: 129834 });
    expect(saved?.targets["act.rate"]).toBe(12.5);
  });
}

/** Opens a stage's drawer if it isn't already the one showing, then one metric's sheet on the board. */
async function boardSheet(page: Page, stage: string, metricDomId: string) {
  const row = page.getByTestId(`engine-row-${stage}`);
  if ((await row.getAttribute("aria-expanded")) !== "true") await row.click();
  const toggle = page.getByTestId(`engine-metric-${metricDomId}`);
  if ((await toggle.getAttribute("aria-expanded")) !== "true") await toggle.click();
  const sheet = page.getByTestId(`engine-sheet-${metricDomId}`);
  await expect(sheet).toBeVisible();
  return sheet;
}
