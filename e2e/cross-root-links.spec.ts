import type { Locator, Page, Request } from "@playwright/test";
import { expect, seedOwnedResult, test } from "./helpers";

/**
 * The content pages and the app routes have separate root layouts (REVIEW.md
 * R-24), so a link from the landing to `/quiz` or `/r/<id>` is a full page
 * load whatever the element. With `next/link` it was also two invocations of
 * the app function that could never be used: a prefetch when the link
 * scrolled into view, a fetch again on click, and only then the reload. On
 * the real site (HAR of one homepage view, 2026-09-14) that was six dynamic
 * renders per landing view before anyone clicked — `/quiz`, `/r/sample` and
 * the device's last result, each twice.
 *
 * These specs record every request the browser makes and assert the
 * absence. The anchor that keeps them from passing vacuously: the prefetch
 * machinery is proven to be running (a content page IS prefetched) before
 * the app routes are asserted untouched.
 */
const APP_ROUTE = /^\/(quiz|r\/|deep-dive)/;

function record(page: Page): Request[] {
  const seen: Request[] = [];
  page.on("request", (r) => seen.push(r));
  return seen;
}

function paths(seen: Request[], filter: (pathname: string) => boolean): string[] {
  return seen
    .map((r) => new URL(r.url()))
    .filter((u) => filter(u.pathname))
    .map((u) => u.pathname + u.search);
}

/**
 * Every link on the page into the viewport, then the page's main CTA under
 * the mouse — the two things that trigger a prefetch.
 *
 * No `networkidle`: under a parallel suite it timed out once at 30 s, and
 * Playwright's own docs advise against it. The wait is on the positive
 * signal instead — a content page prefetched, proof the machinery ran on
 * this page — plus a bounded settle after the hover, since a `<Link>` issues
 * its hover prefetch synchronously on mouseenter and a bare `<a>` issues
 * nothing there is to wait for.
 */
async function exerciseEveryLink(page: Page, cta: Locator): Promise<void> {
  const contentPrefetch = page.waitForRequest(
    (r) => r.url().includes("_rsc=") && /^\/(en|fr)(\/|$)/.test(new URL(r.url()).pathname),
  );
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await contentPrefetch;
  await cta.scrollIntoViewIfNeeded();
  await cta.hover();
  await page.waitForTimeout(500);
}

test.describe("links that cross a root layout", () => {
  test("a landing view wakes no app route, with a last result on the device and every link exercised", async ({ page }) => {
    const seen = record(page);
    await page.goto("/en");
    await seedOwnedResult(page);
    await page.reload();
    await expect(page.getByTestId("last-result-link")).toBeVisible();

    await exerciseEveryLink(page, page.getByTestId("hero-cta"));

    // Prefetching is alive (the helper waited for a content-route prefetch) — and never touched the app tree.
    expect(paths(seen, (p) => APP_ROUTE.test(p))).toEqual([]);
  });

  test("a glossary page — one more CTA into the app tree — wakes no app route either", async ({ page }) => {
    const seen = record(page);
    await page.goto("/en/glossary/cac");
    await page.locator("main").waitFor();
    await exerciseEveryLink(page, page.locator("main").getByRole("link", { name: /start your tour/i }));
    expect(paths(seen, (p) => APP_ROUTE.test(p))).toEqual([]);
  });

  test("clicking the hero CTA is one document load of /quiz, not a router fetch first", async ({ page }) => {
    const seen = record(page);
    await page.goto("/en");
    await page.getByTestId("hero-cta").click();
    await page.waitForURL(/\/quiz$/);
    await page.locator("main").waitFor();

    const quiz = seen.filter((r) => new URL(r.url()).pathname === "/quiz");
    expect(quiz.map((r) => r.resourceType())).toEqual(["document"]);
    expect(quiz[0]!.headers()["rsc"]).toBeUndefined();
  });

  test("the last-result link on the landing is a document load too", async ({ page }) => {
    const seen = record(page);
    await page.goto("/en");
    await seedOwnedResult(page);
    await page.reload();
    await page.getByTestId("last-result-link").click();
    await page.waitForURL(/\/r\/sample$/);
    await page.locator("main").waitFor();

    const result = seen.filter((r) => new URL(r.url()).pathname === "/r/sample");
    expect(result.map((r) => r.resourceType())).toEqual(["document"]);
  });
});
