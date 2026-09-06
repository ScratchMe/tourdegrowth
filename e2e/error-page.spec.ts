import { expect, test } from "./helpers";

/**
 * REVIEW-02.md R2-19 + R2-23 — what a result URL that names nothing does,
 * and what a server failure looks like.
 *
 * Two different ids on purpose:
 * - `not-a-result-id` cannot be one of ours (ids are UUID v4), so it is a
 *   404 BEFORE any Firestore read — deterministic in every environment.
 * - A well-formed but unknown UUID reaches Firestore. In CI and locally
 *   there are no Firebase credentials, so that read throws — which is
 *   exactly the server failure the error boundary exists for. In production
 *   the same URL is a 404. Both are OUR page; the assertion is that neither
 *   is Next's bare error document, which is what a reader used to get.
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
  await page.goto("/r/3f1c2a7e-9b4d-4e21-a8c6-000000000000");

  // Either our 404 (production: the id is unknown) or our fault card (here:
  // the read threw). Both carry the product's chrome; what they say differs.
  // Asserted FIRST because it auto-waits: when the failure happens in the
  // page's initial shell, Next serves its minimal document and the error
  // boundary is rendered on the client — the checks below only mean
  // something once that render has happened (see CLAUDE.md, R2-23).
  const title = page.getByRole("heading").first();
  await expect(title).toHaveText(/no result at this address|wrong turn/i);
  await expect(page.getByRole("link", { name: "Tour de Growth" })).toBeVisible();

  // Never left as `<html id="__next_error__">` — the unstyled fallback R-26
  // removed for 404s and R2-23 removes for failures.
  expect(await page.evaluate(() => document.documentElement.id)).not.toBe("__next_error__");
  const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(background).not.toBe("rgba(0, 0, 0, 0)");
  expect(background).not.toBe("rgb(255, 255, 255)");
});
