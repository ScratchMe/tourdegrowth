import { expect, test } from "./helpers";
import { EMULATOR_HOST, MALFORMED_ID } from "./real-results";

/**
 * REVIEW-02.md R2-19 + R2-23 — what a result URL that names nothing does,
 * and what a server failure looks like.
 *
 * Two different ids on purpose:
 * - `not-a-result-id` cannot be one of ours (ids are UUID v4), so it is a
 *   404 BEFORE any Firestore read — deterministic in every environment.
 * - A well-formed but unknown UUID reaches Firestore. Without Firebase
 *   credentials that read throws — the server failure the error boundary
 *   exists for; in production, and on the Firestore emulator CI has run
 *   since A7.11, the same URL is a 404. Both are OUR page; the assertion is
 *   that neither is Next's bare error document, which is what a reader used
 *   to get.
 * - With the emulator, a failure no longer comes for free, so it is made:
 *   `global-setup.ts` writes a document that is not a submission
 *   (`MALFORMED_ID`), and reading it throws. Without that, R2-23 would pass
 *   on the 404 and test nothing (found by the security review of A7.11).
 */
test("an id that cannot be a result is a 404 without touching Firestore, on the page and on its image", async ({
  page,
}) => {
  const res = await page.request.get("/r/not-a-result-id");
  expect(res.status()).toBe(404);
  const image = await page.request.get("/r/not-a-result-id/opengraph-image");
  expect(image.status()).toBe(404);

  await page.goto("/r/not-a-result-id");
  await expect(page.getByRole("heading", { name: /no result at this address/i })).toBeVisible();
});

test("a server failure renders the product's own error screen, not Next's bare document", async ({ page }) => {
  await page.goto(EMULATOR_HOST ? `/r/${MALFORMED_ID}` : "/r/3f1c2a7e-9b4d-4e21-a8c6-000000000000");

  // With the emulator: always our fault card, the document cannot be read as
  // a result. Without it: either our 404 or our fault card, depending on
  // whether the read threw. Both carry the product's chrome.
  // Asserted FIRST because it auto-waits: when the failure happens in the
  // page's initial shell, Next serves its minimal document and the error
  // boundary is rendered on the client — the checks below only mean
  // something once that render has happened (see CLAUDE.md, R2-23).
  const title = page.getByRole("heading").first();
  await expect(title).toHaveText(EMULATOR_HOST ? /wrong turn/i : /no result at this address|wrong turn/i);
  await expect(page.getByRole("link", { name: "Tour de Growth" })).toBeVisible();

  // Never left as `<html id="__next_error__">` — the unstyled fallback R-26
  // removed for 404s and R2-23 removes for failures.
  expect(await page.evaluate(() => document.documentElement.id)).not.toBe("__next_error__");
  const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(background).not.toBe("rgba(0, 0, 0, 0)");
  expect(background).not.toBe("rgb(255, 255, 255)");
});

test("an unknown but well-formed id is our 404 when Firestore answers", async ({ page }) => {
  test.skip(!EMULATOR_HOST, "needs the Firestore emulator: without it the read throws instead (see the test above)");
  const res = await page.request.get("/r/3f1c2a7e-9b4d-4e21-a8c6-000000000000");
  expect(res.status()).toBe(404);
  await page.goto("/r/3f1c2a7e-9b4d-4e21-a8c6-000000000000");
  await expect(page.getByRole("heading", { name: /no result at this address/i })).toBeVisible();
});

/*
 * A15.5 (2026-10-01): « Try again » on our error screen called Next's
 * `reset`, which re-renders the segment WITHOUT fetching it — after a server
 * failure, it could only show the same failure. `retry` (stable since Next
 * 16.3) fetches it again. Behaviour, not the prop: the click must send a
 * request for the page that failed.
 *
 * Non-vacuity (2026-10-01), on the emulator: the same button wired back to
 * `reset` sends nothing (0 requests) and fails exactly this test; the three
 * others pass. Without the emulator the page may be a 404, and it skips.
 */
test("« Try again » on the error screen asks the server for the page again", async ({ page }) => {
  const url = EMULATOR_HOST ? `/r/${MALFORMED_ID}` : "/r/3f1c2a7e-9b4d-4e21-a8c6-000000000000";
  await page.goto(url);
  const retry = page.getByTestId("error-retry");
  // Without the emulator the read may answer a 404 instead (see above): nothing to retry then.
  const shown = await retry.waitFor({ timeout: 10_000 }).then(() => true, () => false);
  test.skip(!shown, "this environment answered a 404, not a server failure");

  const id = url.split("/").pop()!;
  const asked: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes(id)) asked.push(request.url());
  });
  await retry.click();
  await expect.poll(() => asked.length).toBeGreaterThan(0);
  // Still our screen: the document cannot be read, so the failure comes back, ours.
  await expect(page.getByTestId("error-retry")).toBeVisible();
});
