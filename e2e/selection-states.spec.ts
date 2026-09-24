import type { Locator, Page } from "@playwright/test";
import { answerQuestionsOnly, expect, test } from "./helpers";

/**
 * ds-critique H-5 / H-6 — one selection language, and hover that is not it.
 *
 * Until 2026-09-24 the tunnel spoke three dialects of "chosen": an answer
 * lifted to paper with a 4px shadow, a segment chip went solid ink, a tone
 * card lifted with a 6px shadow. And an answer's hover was the very same
 * rule as its selected state, so on a phone — where the hover sticks where
 * the finger was — the option under the finger on the NEXT question looked
 * already chosen. These specs read computed styles, not class names: the bug
 * was never a wrong class, it was two states that painted identically.
 *
 * Transitions are switched off (reduced motion — the app honours it
 * globally) so a computed style is the settled one, not a frame mid-fade.
 */
test.use({ contextOptions: { reducedMotion: "reduce" } });

interface Look {
  background: string;
  color: string;
  shadow: string;
  transform: string;
}

async function look(locator: Locator): Promise<Look> {
  return locator.evaluate((el) => {
    const s = getComputedStyle(el);
    return { background: s.backgroundColor, color: s.color, shadow: s.boxShadow, transform: s.transform };
  });
}

/** A token resolved to the rgb() string computed styles report, through a throwaway element. */
async function tokenColor(page: Page, token: string): Promise<string> {
  return page.evaluate((name) => {
    const probe = document.createElement("div");
    probe.style.background = `var(${name})`;
    document.body.append(probe);
    const value = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return value;
  }, token);
}

/** Parks the mouse where no control is, so nothing is hovered. */
async function unhover(page: Page): Promise<void> {
  await page.mouse.move(1, 1);
}

test.describe("selection states — pointer", () => {
  test("an answer's selected state and its hover no longer paint the same", async ({ page }) => {
    await page.goto("/quiz");
    await page.getByTestId("answer-option").nth(1).click();
    await page.getByTestId("back-button").click();

    const options = page.getByTestId("answer-option");
    const chosen = options.nth(1);
    const other = options.nth(0);
    await expect(chosen).toHaveAttribute("aria-pressed", "true");

    await unhover(page);
    const rest = await look(other);
    const selected = await look(chosen);
    await other.hover();
    const hovered = await look(other);

    const ink = await tokenColor(page, "--state-selected-bg");
    expect(selected.background).toBe(ink);
    expect(selected.color).toBe(await tokenColor(page, "--state-selected-text"));

    // Hover lifts the shadow and leaves the fill alone…
    expect(hovered.background).toBe(rest.background);
    expect(hovered.shadow).not.toBe("none");
    expect(rest.shadow).toBe("none");
    // …so "the one under the pointer" and "the one chosen" differ in fill,
    // which is the difference a glance reads.
    expect(hovered.background).not.toBe(selected.background);
  });

  test("segment chips and tone cards speak the same language as the answers", async ({ page }) => {
    await page.goto("/quiz");
    await answerQuestionsOnly(page);

    const ink = await tokenColor(page, "--state-selected-bg");
    const onInk = await tokenColor(page, "--state-selected-text");

    // Segment: "rather not say" is pre-selected on both questions (R2-26).
    const stage = page.getByTestId("segment-stage-option");
    const stageChosen = page.locator('[data-testid="segment-stage-option"][aria-pressed="true"]');
    const stageOther = page.locator('[data-testid="segment-stage-option"][aria-pressed="false"]').first();
    await expect(stage.first()).toBeVisible();
    await unhover(page);
    const chipRest = await look(stageOther);
    expect((await look(stageChosen)).background).toBe(ink);
    expect((await look(stageChosen)).color).toBe(onInk);
    await stageOther.hover();
    const chipHover = await look(stageOther);
    expect(chipHover.background).toBe(chipRest.background);
    expect(chipHover.shadow).not.toBe("none");

    await page.getByTestId("segment-continue").click();

    // Tone: neutral is the default (SPEC.md §6bis).
    const tones = page.getByTestId("tone-option");
    await expect(tones.nth(0)).toHaveAttribute("aria-pressed", "true");
    await expect(tones.nth(1)).toHaveAttribute("aria-pressed", "false");
    await unhover(page);
    const toneRest = await look(tones.nth(1));
    const toneSelected = await look(tones.nth(0));
    expect(toneSelected.background).toBe(ink);
    await tones.nth(1).hover();
    const toneHover = await look(tones.nth(1));
    expect(toneHover.background).toBe(toneRest.background);
    expect(toneHover.shadow).not.toBe("none");
    expect(toneHover.background).not.toBe(toneSelected.background);

    // The tone card's own muted description is told about the fill: muted
    // ink on ink would not pass (the axe pass on this screen covers the ratio).
    const description = tones.nth(0).locator("span").last();
    expect(await description.evaluate((el) => getComputedStyle(el).color)).toBe(onInk);
  });

  test("a primary button peels up under the mouse and flattens when pressed", async ({ page }) => {
    await page.goto("/quiz");
    await answerQuestionsOnly(page);
    const cta = page.getByTestId("segment-continue");

    await unhover(page);
    expect((await look(cta)).transform).toBe("none");
    await cta.hover();
    const lifted = await look(cta);
    expect(lifted.transform).not.toBe("none");
    expect(lifted.shadow).not.toBe("none");

    await page.mouse.down();
    const pressed = await look(cta);
    expect(pressed.transform).toBe("none");
    expect(pressed.shadow).toBe("none");
  });
});

test.describe("selection states — touch", () => {
  // A phone: coarse pointer, `(hover: none)`. A finger resting where it
  // tapped still leaves Chromium's hover point on that element, and whatever
  // renders under it next — Q2's first option, after answering Q1 — matches
  // `:hover` without anyone pointing at it. Whether a given tap moves the
  // hover point is up to the engine (measured: after the re-render it did
  // not, here), so these specs put the pointer there explicitly and assert
  // what matters: an element that matches `:hover` on a touch screen looks
  // exactly like its neighbours.
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });

  test("an answer under a resting finger does not look lifted", async ({ page }) => {
    await page.goto("/quiz");
    expect(await page.evaluate(() => matchMedia("(hover: none)").matches)).toBe(true);

    await page.getByTestId("answer-option").first().tap();
    await expect(page.locator(":focus")).toHaveAttribute("aria-label", /Q 2 \/ 15/);

    const underFinger = page.getByTestId("answer-option").first();
    await expect(underFinger).toHaveAttribute("aria-pressed", "false");
    await underFinger.hover();
    // Guard: the premise of the assertions below, or they prove nothing.
    expect(await underFinger.evaluate((el) => el.matches(":hover"))).toBe(true);

    const stuck = await look(underFinger);
    const neighbour = await look(page.getByTestId("answer-option").nth(1));
    expect(stuck.shadow).toBe("none");
    expect(stuck.background).toBe(neighbour.background);
  });

  test("a tapped chip reads as chosen, not hovered, and a button does not stay peeled up", async ({ page }) => {
    await page.goto("/quiz");
    await answerQuestionsOnly(page);

    // "Rather not say" is the pre-selected last option, so the first is free.
    const chip = page.getByTestId("segment-model-option").first();
    await expect(chip).toHaveAttribute("aria-pressed", "false");
    await chip.tap();
    await expect(chip).toHaveAttribute("aria-pressed", "true");
    await chip.hover();
    expect(await chip.evaluate((el) => el.matches(":hover"))).toBe(true);
    const tapped = await look(chip);
    expect(tapped.background).toBe(await tokenColor(page, "--state-selected-bg"));
    expect(tapped.shadow).toBe("none");

    const other = page.getByTestId("segment-model-option").nth(1);
    await other.hover();
    expect((await look(other)).shadow).toBe("none");

    const cta = page.getByTestId("segment-continue");
    await cta.hover();
    expect(await cta.evaluate((el) => el.matches(":hover"))).toBe(true);
    const peeled = await look(cta);
    expect(peeled.transform).toBe("none");
    expect(peeled.shadow).toBe("none");
  });
});

test.describe("selection states — keyboard", () => {
  test("answers, chips and tone cards are chosen with the keyboard and show it", async ({ page }) => {
    await page.goto("/quiz");
    const ink = await tokenColor(page, "--state-selected-bg");

    // An answer: Enter on the focused option answers and moves on…
    await page.getByTestId("answer-option").nth(2).focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(":focus")).toHaveAttribute("aria-label", /Q 2 \/ 15/);
    // …and going back shows it chosen.
    await page.getByTestId("back-button").focus();
    await page.keyboard.press("Enter");
    const answered = page.getByTestId("answer-option").nth(2);
    await expect(answered).toHaveAttribute("aria-pressed", "true");
    await unhover(page);
    expect((await look(answered)).background).toBe(ink);

    // Q1 is answered; answer the rest to reach the chips.
    await answered.click();
    for (let i = 1; i < 15; i += 1) await page.getByTestId("answer-option").first().click();
    await page.getByTestId("segment-screen").waitFor();

    // Pinned by position: a locator filtered on aria-pressed would re-resolve
    // to another chip the moment this one is chosen.
    const chip = page.getByTestId("segment-stage-option").first();
    await expect(chip).toHaveAttribute("aria-pressed", "false");
    await chip.focus();
    await page.keyboard.press("Space");
    await expect(chip).toHaveAttribute("aria-pressed", "true");
    expect((await look(chip)).background).toBe(ink);

    await page.getByTestId("segment-continue").focus();
    await page.keyboard.press("Enter");

    const roast = page.getByTestId("tone-option").nth(1);
    await roast.focus();
    await page.keyboard.press("Enter");
    await expect(roast).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("tone-option").nth(0)).toHaveAttribute("aria-pressed", "false");
    expect((await look(roast)).background).toBe(ink);
  });
});
