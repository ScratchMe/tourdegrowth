import { expect, seedOwnedResult, stubDeepDive, test } from "./helpers";

/**
 * The question screens keep the column rhythm R-19 took away.
 *
 * R-19 wrapped the question card, the answers and the footer in a
 * `role="group"` so a screen reader announces "Q 3 / 15" and then the
 * question. The three used to be direct children of `.main`, whose
 * `gap: 20px` spaced them; the new wrapper had no layout of its own, so the
 * gap applied to a single child and the question card sat flush against the
 * first answer — with its 7px hard shadow (`--shadow-card`) falling behind
 * the button rather than onto the page.
 *
 * Measured rather than asserted as a class: what a reader sees is the
 * distance between two boxes, and a rule can be present and still be beaten
 * in the cascade. The expected value is `.main`'s own 20px, restored — this
 * is a regression fix, not a new spacing decision — so the window is tight
 * on both sides rather than a floor: a gap that grows is as much a change as
 * one that vanishes.
 */

const EXPECTED_GAP = 20;

async function verticalGaps(page: import("@playwright/test").Page, answerTestId: string) {
  return page.evaluate((testId) => {
    const region = [...document.querySelectorAll<HTMLElement>('[role="group"]')].find(
      (el) => el.querySelector("h2") && el.querySelector(`[data-testid="${testId}"]`),
    );
    if (!region) throw new Error("question region not found");
    const heading = region.querySelector("h2");
    const card = heading?.parentElement;
    const [first, second] = [...region.querySelectorAll<HTMLElement>(`[data-testid="${testId}"]`)];
    if (!card || !first || !second) throw new Error("card or answers not found");
    const cardBox = card.getBoundingClientRect();
    return {
      cardToFirstAnswer: first.getBoundingClientRect().top - cardBox.bottom,
      betweenAnswers: second.getBoundingClientRect().top - first.getBoundingClientRect().bottom,
      shadow: getComputedStyle(card).boxShadow,
    };
  }, answerTestId);
}

test.describe("the question card never touches the answers", () => {
  for (const width of [1280, 390]) {
    test(`Quick questionnaire keeps its rhythm at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/quiz");
      await expect(page.getByTestId("answer-option").first()).toBeVisible();

      const gaps = await verticalGaps(page, "answer-option");
      expect(gaps.cardToFirstAnswer).toBeGreaterThan(EXPECTED_GAP - 1);
      expect(gaps.cardToFirstAnswer).toBeLessThan(EXPECTED_GAP + 1);

      // The answers keep their own, deliberately tighter rhythm
      // (DESIGN-BRIEF.md §05: "full-width stacked buttons, gap 12px"). Asserted
      // alongside so a fix that spaced everything equally would be caught too.
      expect(gaps.betweenAnswers).toBeGreaterThan(11);
      expect(gaps.betweenAnswers).toBeLessThan(13);

      // The gap has to clear the card's hard shadow, which is what made the
      // regression look like a rendering fault rather than a spacing one.
      expect(gaps.shadow).toContain("7px");
    });
  }

  test("the Deep dive's eleven screens keep it too", async ({ page }) => {
    await stubDeepDive(page);
    // localStorage is per-origin, so the page has to be on one before the
    // owner token can be seeded (R-01 keeps the token on the device).
    await page.goto("/r/sample");
    await seedOwnedResult(page);
    await page.goto("/deep-dive/sample");
    await expect(page.getByTestId("deep-dive-answer-option").first()).toBeVisible();

    const gaps = await verticalGaps(page, "deep-dive-answer-option");
    expect(gaps.cardToFirstAnswer).toBeGreaterThan(EXPECTED_GAP - 1);
    expect(gaps.cardToFirstAnswer).toBeLessThan(EXPECTED_GAP + 1);
  });

  test("the footer below the answers is spaced on the same rhythm", async ({ page }) => {
    await page.goto("/quiz");
    // One answer is enough: the Back button only appears from question 2 on.
    await page.getByTestId("answer-option").first().click();
    await expect(page.getByTestId("back-button")).toBeVisible();

    const gap = await page.evaluate(() => {
      const region = [...document.querySelectorAll<HTMLElement>('[role="group"]')].find((el) =>
        el.querySelector('[data-testid="answer-option"]'),
      );
      const answers = [...region!.querySelectorAll<HTMLElement>('[data-testid="answer-option"]')];
      const last = answers[answers.length - 1];
      const back = region!.querySelector<HTMLElement>('[data-testid="back-button"]');
      const footer = back?.parentElement;
      if (!last || !footer) throw new Error("answers or footer not found");
      return footer.getBoundingClientRect().top - last.getBoundingClientRect().bottom;
    });
    expect(gap).toBeGreaterThan(EXPECTED_GAP - 1);
    expect(gap).toBeLessThan(EXPECTED_GAP + 1);
  });
});
