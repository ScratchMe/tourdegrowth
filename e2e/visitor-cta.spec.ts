import { expect, test, trackedEvents } from "./helpers";

/**
 * REVIEW-02.md R2-02 — the result page used to hand a VISITOR the owner's
 * two buttons: "Share my score" in primary, and "Take the Tour AGAIN" for a
 * Tour they never took. The visitor is the person a shared link brings in,
 * the numerator of the K-factor, and nothing on the page told them what the
 * site was.
 *
 * `/r/sample` is the one result page that renders without Firestore, and it
 * carries no id, so it is always the visitor variant — which is also what a
 * sample page should be. The owner variant needs a real result and its
 * token on the device; it is exercised by the critical-path spec's share
 * click (the button keeps its test id in both variants) and was checked by
 * hand with a local, never-committed patch, like R-12's breakdown.
 */
test.describe("a visitor on a shared result", () => {
  test("gets their own Tour as the primary action, with one line saying what it is", async ({ page }) => {
    await page.goto("/r/sample?lang=en");
    await page.locator("main").waitFor();

    const own = page.getByTestId("own-tour-cta");
    await expect(own).toBeVisible();
    await expect(own).toHaveText(/take your own tour/i);
    await expect(own).toHaveAttribute("href", "/quiz");
    await expect(page.getByTestId("visitor-pitch")).toHaveText(/3 minutes/);

    // Sharing stays — secondary, and no longer "MY score" for someone else's result.
    await expect(page.getByTestId("share-button")).toHaveText(/share this result/i);
    await expect(page.getByRole("link", { name: /take the tour again/i })).toHaveCount(0);
  });

  test("the primary action still comes first in the row, and it reads right in French", async ({ page }) => {
    await page.goto("/r/sample?lang=fr");
    await page.locator("main").waitFor();

    await expect(page.getByTestId("own-tour-cta")).toHaveText(/fais ton propre tour/i);
    await expect(page.getByTestId("share-button")).toHaveText(/partager ce résultat/i);
    await expect(page.getByTestId("visitor-pitch")).toHaveText(/sans compte/);

    // Document order = reading order = focus order: own Tour before share.
    const order = await page.evaluate(() => {
      const own = document.querySelector('[data-testid="own-tour-cta"]');
      const share = document.querySelector('[data-testid="share-button"]');
      return own && share ? own.compareDocumentPosition(share) & Node.DOCUMENT_POSITION_FOLLOWING : 0;
    });
    expect(order).toBeTruthy();
  });

  test("clicking into their own Tour is measured, and lands on the quiz", async ({ page }) => {
    await page.goto("/r/sample?lang=en");
    await page.locator("main").waitFor();

    // Hold the navigation back for a moment so the event fired by the click
    // handler can be read from THIS document before it is torn down.
    await page.evaluate(() => {
      document
        .querySelector('[data-testid="own-tour-cta"]')
        ?.addEventListener("click", (e) => e.preventDefault(), { once: true });
    });
    await page.getByTestId("own-tour-cta").click();
    expect(await trackedEvents(page)).toContain("take_own_tour");

    await page.getByTestId("own-tour-cta").click();
    await page.waitForURL(/\/quiz/);
    await expect(page.getByTestId("answer-option").first()).toBeVisible();
  });
});
