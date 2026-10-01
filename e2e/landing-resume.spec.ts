import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import { expect, test } from "./helpers";

/**
 * A15.15 and A15.16 (2026-10-01, decided by Antoine).
 *
 * On a phone the header's « Start your Tour » is hidden, so nothing past the
 * first screen started the Tour: the same button closes the page there, and
 * only there — a wider screen keeps the sticky header's own, and two
 * primaries would be in view.
 *
 * A Tour left half-way resumed in silence: the landing invited the person
 * to « start » it. It now says « resume », and where.
 *
 * Non-vacuity: see A15's sabotage build, recorded in the journal.
 */
const t = UI_STRINGS.landing;

test("on a phone the page closes on « Start your Tour »; on a desktop, the header keeps it", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en");
  const closing = page.getByTestId("closing-cta");
  await closing.scrollIntoViewIfNeeded();
  await expect(closing).toBeVisible();
  await expect(closing).toHaveText(tc(t.ctaPrimary, "en"));
  await expect(closing).toHaveAttribute("href", "/quiz");

  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(closing).toBeHidden();
});

for (const locale of ["en", "fr"] as const) {
  test(`a Tour in progress is offered to resume, at its question (${locale})`, async ({ page }) => {
    await page.goto(`/${locale}`);
    await expect(page.getByTestId("hero-cta")).toHaveText(tc(t.ctaPrimary, locale));
    // Seven answers kept on this device: the eighth question is next.
    await page.evaluate(() => {
      const ids = ["acq-1", "acq-2", "acq-3", "act-1", "act-2", "act-3", "ret-1"];
      window.localStorage.setItem("tdg.quiz.answers.v1", JSON.stringify(Object.fromEntries(ids.map((id) => [id, 1]))));
    });
    await page.reload();
    await expect(page.getByTestId("hero-cta")).toHaveText(tc(t.ctaResume, locale).replace("{n}", "8"));
    await expect(page.getByTestId("closing-cta")).toHaveText(tc(t.ctaResume, locale).replace("{n}", "8"));
  });
}
