import { answerAllQuestions, expect, stubSubmissions, test } from "./helpers";

/**
 * REVIEW.md R-19 — what axe structurally cannot see.
 *
 * The contrast and naming checks live in `accessibility.spec.ts`; these are
 * the behavioural ones: where focus goes when the screen changes. Answering
 * removes the button that had focus, so without this a keyboard user landed
 * back on `<body>` and had to tab from the top of the page — fifteen times
 * in a row.
 */
async function focusedRole(page: import("@playwright/test").Page): Promise<string> {
  return page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return "body";
    return el.getAttribute("role") ?? el.tagName.toLowerCase();
  });
}

test.describe("keyboard and screen-reader flow", () => {
  test("focus follows each new question instead of falling back to the page", async ({ page }) => {
    await page.goto("/quiz");
    await page.getByTestId("answer-option").first().click();

    expect(await focusedRole(page)).toBe("group");
    await expect(page.locator(":focus")).toHaveAttribute("aria-label", /Q 2 \/ 15/);

    // And it keeps up when going back, not only forward.
    await page.getByTestId("back-button").click();
    await expect(page.locator(":focus")).toHaveAttribute("aria-label", /Q 1 \/ 15/);
  });

  test("focus lands on the tone selector once the last question is answered", async ({ page }) => {
    await stubSubmissions(page);
    await page.goto("/quiz");
    await answerAllQuestions(page);

    await expect(page.locator(":focus")).toHaveText(/How do you want your results\?/i);
  });

  test("focus lands on the error screen when the calculation fails", async ({ page }) => {
    await stubSubmissions(page, 500);
    await page.goto("/quiz");
    await answerAllQuestions(page);
    await page.getByTestId("get-score-cta").click();

    await expect(page.getByTestId("retry-button")).toBeVisible();
    expect(await focusedRole(page)).toBe("alert");
  });

  test("the progress bar reports where you are, not just how it looks", async ({ page }) => {
    await page.goto("/quiz");
    const bar = page.getByRole("progressbar").first();

    await expect(bar).toHaveAttribute("aria-valuemin", "1");
    await expect(bar).toHaveAttribute("aria-valuemax", "5");
    await expect(bar).toHaveAttribute("aria-valuenow", "1");
    await expect(bar).toHaveAttribute("aria-label", /Stage 1 of 5/i);

    // Three answers complete the first pillar.
    for (let i = 0; i < 3; i += 1) await page.getByTestId("answer-option").first().click();
    await expect(bar).toHaveAttribute("aria-valuenow", "2");
  });

  test("the glossary definition takes focus, and gives it back on Escape", async ({ page }) => {
    await page.goto("/quiz");
    // act-1 carries the "aha moment" trigger; walk to it.
    for (let i = 0; i < 3; i += 1) await page.getByTestId("answer-option").first().click();

    const trigger = page.getByRole("button", { name: /Definition:/i }).first();
    await trigger.click();

    expect(await focusedRole(page)).toBe("dialog");

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    // Focus must come back to what opened it, not to <body>.
    await expect(page.locator(":focus")).toHaveAttribute("aria-label", /Definition:/i);
  });
});
