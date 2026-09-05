import { expect, test } from "@playwright/test";
import { answerAllQuestions, expectStoredRefId, stubSubmissions } from "./helpers";

/**
 * The growth loop (SPEC.md §7) and the bilingual promise (CLAUDE.md, lesson
 * #5: test BOTH languages — several bugs on this project only ever showed up
 * on the language switch). REVIEW.md R-07.
 */
test.describe("referral attribution", () => {
  const REF = "8a2b1c3d-4e5f-4a6b-9c8d-0e1f2a3b4c5d";
  const OTHER_REF = "3f1c2a7e-9b4d-4e21-a8c6-5d0f9e7b1234";

  test("a ref captured on the landing survives the walk to the quiz and reaches the API", async ({ page }) => {
    const calls = await stubSubmissions(page);

    await page.goto(`/?ref=${REF}`);
    await expectStoredRefId(page, REF);

    await page.goto("/quiz"); // no ref in this URL at all
    await answerAllQuestions(page);
    await page.getByTestId("get-score-cta").click();
    await page.waitForURL("**/r/**");

    expect(calls[0]?.refId).toBe(REF);
  });

  // R-03: first-touch. The share that first brought someone here is credited.
  test("a later ref never overwrites the first one", async ({ page }) => {
    await page.goto(`/?ref=${REF}`);
    await expectStoredRefId(page, REF);
    await page.goto(`/?ref=${OTHER_REF}`);
    await expectStoredRefId(page, REF);
  });

  // R-03: re-taking your own Tour must credit nobody.
  test("a ref pointing at this browser's own result is not attributed", async ({ page }) => {
    const calls = await stubSubmissions(page);

    await page.goto("/quiz");
    await page.evaluate((id) => {
      window.localStorage.setItem(
        "tdg.results.v1",
        JSON.stringify([{ id, ownerToken: "tok", createdAt: "2026-09-05T10:00:00.000Z" }]),
      );
      window.localStorage.setItem("tdg.quiz.refId.v1", id);
    }, REF);
    await page.reload();

    await answerAllQuestions(page);
    await page.getByTestId("get-score-cta").click();
    await page.waitForURL("**/r/**");

    expect(calls[0]?.refId).toBeNull();
  });
});

test.describe("bilingual", () => {
  test("?lang= switches the interface and sticks across pages", async ({ page }) => {
    await page.goto("/?lang=fr");
    await expect(page.getByRole("link", { name: /Démarre ton Tour/i }).first()).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");

    // The cookie the proxy set must carry the choice to the next page.
    await page.goto("/how-it-works");
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");

    await page.goto("/?lang=en");
    await expect(page.getByRole("link", { name: /Start your Tour/i }).first()).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  // REVIEW.md R-09: the verdict used to be frozen at submission time in the
  // AUTHOR's locale, so a shared result rendered half in the wrong language.
  test("a result renders its verdict in the reader's language", async ({ page }) => {
    await page.goto("/r/sample?lang=en");
    const english = await page.getByTestId("score-verdict").innerText();
    await expect(page.getByText(/Where you're losing time/i)).toBeVisible();

    await page.goto("/r/sample?lang=fr");
    const french = await page.getByTestId("score-verdict").innerText();
    await expect(page.getByText(/Là où tu perds du temps/i)).toBeVisible();

    expect(french).not.toBe(english);
    expect(french).toMatch(/[àâäéèêëïîôöùûüç]/i);
  });

  test("the questionnaire itself is translated, not just the landing", async ({ page }) => {
    await page.goto("/quiz?lang=fr");
    await expect(page.locator("header")).toContainText("Q 1 / 15");
    await expect(page.getByText(/Réponds pour continuer/i)).toBeVisible();
  });
});

test.describe("Deep dive ownership", () => {
  // R-01: the Deep dive belongs to whoever took the Tour, not to everyone
  // holding the shared link.
  test("a visitor opening a Deep dive URL is sent to the result instead", async ({ page }) => {
    // `sample` as the id purely so the redirect lands on a page that renders
    // without Firestore credentials; what is under test is the redirect.
    await page.goto("/deep-dive/sample");
    await page.waitForURL("**/r/sample");
    await expect(page.getByTestId("deep-dive-answer-option")).toHaveCount(0);
  });
});
