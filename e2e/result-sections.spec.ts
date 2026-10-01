import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import { expect, seedOwnedResult, test } from "./helpers";
import { EMULATOR_HOST, REAL_RESULTS, SKIP_EMULATOR_REASON } from "./real-results";

/**
 * A15.13, A15.14 and A15.17 (2026-10-01).
 *
 * The result's sections were titled by `div`s: the page's only heading was a
 * hidden `h1`, and a screen reader could not go from section to section.
 * « Strengths » listed the two highest stages under that title even when
 * both were weak. And the owner's page ended on a block of Markdown for
 * developers, the last and lowest thing on a desktop.
 *
 * Non-vacuity: see A15's sabotage build, recorded in the journal.
 */
const t = UI_STRINGS.result;

for (const locale of ["en", "fr"] as const) {
  test(`the sections are headings a screen reader can go to (${locale})`, async ({ page }) => {
    await page.goto(`/r/sample?lang=${locale}`);
    await expect(page.getByRole("heading", { level: 2, name: tc(t.strengthsTitle, locale) })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: tc(t.weaknessesTitle, locale) })).toBeVisible();
  });
}

test.describe("on real results", () => {
  test.skip(!EMULATOR_HOST, SKIP_EMULATOR_REASON);

  test("a board with no strong stage says what holds up best, not « strengths »", async ({ page }) => {
    const { low } = REAL_RESULTS;
    await page.goto(`/r/${low.id}?lang=fr`);
    await expect(page.getByRole("heading", { level: 2, name: tc(t.strengthsTitleRelative, "fr") })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: tc(t.strengthsTitle, "fr") })).toHaveCount(0);
  });

  test("the owner's share block ends on sharing: the README badge comes before, folded", async ({ page }) => {
    const { clear } = REAL_RESULTS;
    await page.goto(`/r/${clear.id}?lang=en`);
    await seedOwnedResult(page, clear.id, clear.total, clear.answers);
    await page.reload();
    const fold = page.getByTestId("badge-fold");
    await expect(fold).toBeVisible();
    expect(await fold.evaluate((el) => (el as HTMLDetailsElement).open)).toBe(false);
    const order = await page.evaluate(() => {
      const fold = document.querySelector('[data-testid="badge-fold"]')!;
      const card = document.querySelector('[data-testid="share-card"]')!;
      return Boolean(fold.compareDocumentPosition(card) & Node.DOCUMENT_POSITION_FOLLOWING) && fold.parentElement!.lastElementChild === card;
    });
    expect(order).toBe(true);
  });
});
