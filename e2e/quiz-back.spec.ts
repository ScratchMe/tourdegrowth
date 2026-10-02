import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import { answerQuestionsOnly, expect, test } from "./helpers";

/**
 * A15.7 (2026-10-01, Jakob's law): once the fifteenth answer was given, the
 * profile and tone screens had no way back, and a reload with fifteen answers
 * landed on the profile again — a misclick on the last question was final.
 * Both screens now go back, and their header says what is left instead of
 * « 15 / 15 answered » over two screens still to pass.
 *
 * Non-vacuity: see A15's sabotage build, recorded in the journal.
 */
for (const locale of ["en", "fr"] as const) {
  test(`after the fifteenth answer, every screen goes back, and the header says what is left (${locale})`, async ({ page }) => {
    await page.goto(`/quiz?lang=${locale}`);
    await answerQuestionsOnly(page);

    const header = page.locator("header");
    await expect(header).toContainText(tc(UI_STRINGS.toneSelector.headerTwoLeft, locale));
    await page.getByTestId("segment-back").click();
    // Back on the fifteenth question, its answer still marked, and changeable.
    await expect(page.getByTestId("answer-option").first()).toBeVisible();
    await page.getByTestId("answer-option").last().click();
    await expect(page.getByTestId("segment-screen")).toBeVisible();
    const stored = await page.evaluate(() => JSON.parse(window.localStorage.getItem("tdg.quiz.answers.v1") ?? "{}"));
    expect(Object.values(stored).at(-1)).toBe(2);

    await page.getByTestId("segment-continue").click();
    await expect(page.getByTestId("get-score-cta")).toBeVisible();
    await expect(header).toContainText(tc(UI_STRINGS.toneSelector.headerLast, locale));
    await page.getByTestId("tone-back").click();
    await expect(page.getByTestId("segment-screen")).toBeVisible();
  });
}
