import { expect, test } from "./helpers";

/**
 * REVIEW.md R-13 — one URL per language.
 *
 * Before this, the same address served French or English depending on a
 * cookie, so a crawler only ever saw one of them and the whole French
 * glossary was invisible to search: exactly the content the growth plan's
 * SEO phase depends on.
 */
test.describe("locale in the URL", () => {
  test("the bare homepage redirects to the reader's language", async ({ browser }) => {
    for (const [acceptLanguage, expected] of [
      ["fr-FR,fr;q=0.9", "/fr"],
      ["en-US,en;q=0.9", "/en"],
    ] as const) {
      const context = await browser.newContext({ locale: acceptLanguage.slice(0, 5), extraHTTPHeaders: { "accept-language": acceptLanguage } });
      const page = await context.newPage();
      await page.goto("/");
      expect(new URL(page.url()).pathname).toBe(expected);
      await context.close();
    }
  });

  test("URLs published before the split still resolve", async ({ page }) => {
    for (const legacy of ["/how-it-works", "/glossary", "/glossary/viral-coefficient"]) {
      await page.goto(legacy);
      expect(new URL(page.url()).pathname).toBe(`/en${legacy}`);
      await expect(page.locator("main")).toBeVisible();
    }
  });

  test("a shared referral link survives the redirect", async ({ page }) => {
    await page.goto("/?ref=8a2b1c3d-4e5f-4a6b-9c8d-0e1f2a3b4c5d");
    expect(new URL(page.url()).search).toContain("ref=8a2b1c3d");
  });

  test("the page's language comes from the URL, never from a stale cookie", async ({ page, context }) => {
    await context.addCookies([{ name: "tdg_locale", value: "en", url: "http://localhost:3210" }]);

    await page.goto("/fr/glossary/cac");
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    await expect(page.getByText(/En pratique/)).toBeVisible();

    await page.goto("/en/glossary/cac");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByText(/In practice/)).toBeVisible();
  });

  test("each localized page declares its alternates", async ({ page }) => {
    await page.goto("/fr/how-it-works");

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /\/fr\/how-it-works$/,
    );
    for (const lang of ["en", "fr", "x-default"]) {
      await expect(page.locator(`link[rel="alternate"][hreflang="${lang}"]`)).toHaveCount(1);
    }
  });

  /*
   * The switch is a named GROUP of links, not a `nav` landmark: design system
   * extension 01 rebased it on `core/Segmented`, whose container is
   * `role="group"` (`Segmented.prompt.md`). Its accessible name is localized,
   * so these specs click FR from an English page where it reads "Language".
   */
  test("the language switcher lands on the same page in the other language", async ({ page }) => {
    await page.goto("/en/glossary/churn");
    await page.getByRole("group", { name: "Language" }).getByRole("link", { name: "FR" }).click();
    await page.waitForURL("**/fr/glossary/churn");
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  });

  test("switching language carries over to the unprefixed app pages", async ({ page }) => {
    await page.goto("/en");
    await page.getByRole("group", { name: "Language" }).getByRole("link", { name: "FR" }).click();
    await page.waitForURL("**/fr");

    // /quiz has no locale of its own; it must follow the choice just made,
    // or "Démarre ton Tour" would open an English questionnaire.
    await page.goto("/quiz");
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    await expect(page.getByText(/Réponds pour continuer/i)).toBeVisible();
  });

  test("app routes are never prefixed — shared result links keep working as-is", async ({ page }) => {
    for (const path of ["/quiz", "/r/sample"]) {
      await page.goto(path);
      expect(new URL(page.url()).pathname).toBe(path);
    }
  });

  test("an unknown first segment is a 404, not the landing page in disguise", async ({ page }) => {
    const response = await page.goto("/definitely-not-a-locale");
    expect(response?.status()).toBe(404);
  });
});

/**
 * REVIEW.md R-14 — a dead link must not preview as a real, terrible score.
 *
 * The precise status can't be asserted here: reaching a missing submission
 * means reaching Firestore, which has no credentials in CI, so this run gets
 * a 500 where production gets the 404 the route now returns. What the check
 * is actually for is the OLD behaviour — a 200 carrying a fabricated
 * "0/100" frame — and "never a real image" holds in both environments.
 */
test("an unknown result never previews as a real image", async ({ request }) => {
  // An id that is not even a UUID is refused before any Firestore read
  // (REVIEW-02.md R2-19), so this is a real 404 in every environment — CI has
  // no Firebase credentials, and the old valid-looking id only "worked" here
  // because the read threw (R2-25: that error line was the noisiest thing in
  // the Playwright output). The valid-but-unknown case is the error-page spec.
  const missing = await request.get("/r/not-a-result-id/opengraph-image");
  expect(missing.status()).toBe(404);

  // The sample still renders a genuine image, so the above is about the id,
  // not a broken route.
  const sample = await request.get("/r/sample/opengraph-image");
  expect(sample.status()).toBe(200);
  expect(sample.headers()["content-type"]).toContain("image/png");
});

/**
 * REVIEW.md R-24 — the two OG image addresses, and why both must answer.
 *
 * The `og:image` tag is what every crawler actually fetches, so it is the one
 * that must resolve: this asserts the URL the page really declares, not a
 * path hard-coded here that could drift from it.
 *
 * The bare `/r/<id>/opengraph-image` above is the address shares scraped
 * before the `(app)` route group existed still point at. It only answers
 * because `next.config.mjs` rewrites it, and the hash in that rewrite is
 * generated by Next at build time — so this pair is also what stops that
 * hard-coded suffix from silently rotting.
 */
test("the OG image URL the page declares is the one that serves it", async ({ page, request }) => {
  await page.goto("/r/sample");
  const declared = await page.locator('meta[property="og:image"]').getAttribute("content");
  expect(declared).toBeTruthy();

  const image = await request.get(new URL(declared!).pathname + new URL(declared!).search);
  expect(image.status()).toBe(200);
  expect(image.headers()["content-type"]).toContain("image/png");
});

/**
 * The result page renders in the READER's language (R-09), but until now
 * nothing let a reader say what that was — reported by Antoine, who had to
 * reach for `?lang=` by hand on his own shared result.
 */
test.describe("switching language on a shared result", () => {
  test("the switch is there and actually changes the page", async ({ page }) => {
    await page.goto("/r/sample");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    await page.getByRole("group", { name: "Language" }).getByText("FR", { exact: true }).click();
    await page.waitForURL(/lang=fr/);

    // Not just the chrome: the verdict itself, which is the point of R-09.
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    await expect(page.getByTestId("score-verdict")).toContainText(/[àâéèêîôùûç]/);
  });

  test("the choice follows the reader into their own Tour", async ({ page }) => {
    await page.goto("/r/sample");
    await page.getByRole("group", { name: "Language" }).getByText("FR", { exact: true }).click();
    await page.waitForURL(/lang=fr/);

    // `/quiz` carries no locale prefix, so this only works because the proxy
    // folded `?lang=` into the cookie.
    await page.goto("/quiz");
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  });

  test("the questionnaire itself stays free of it", async ({ page }) => {
    // Deliberate, same reasoning as the site footer: /quiz and /deep-dive are
    // the two flows the product exists to get people through, and a language
    // switch mid-funnel reloads the page. The choice is made before, on the
    // landing or on the result.
    await page.goto("/quiz");
    await expect(page.getByRole("group", { name: "Language" })).toHaveCount(0);
  });
});

/**
 * REVIEW.md R-26 — the 404 used to be the only surface of the product that
 * did not look like the product: Next's built-in `<html id="__next_error__">`,
 * unbranded, without one of our stylesheets. A link mistyped from a shared
 * result lands there.
 */
test.describe("the page that does not exist", () => {
  for (const [path, expected] of [
    ["/nonsense", "en"],
    ["/fr/pas-une-page", "fr"],
    ["/fr/glossary/pas-un-terme", "fr"],
    ["/en/glossary/not-a-term", "en"],
  ] as const) {
    test(`${path} is a branded 404 in ${expected}`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(404);

      // Ours, not Next's fallback document.
      await expect(page.locator("html")).not.toHaveAttribute("id", "__next_error__");
      await expect(page.locator("html")).toHaveAttribute("lang", expected);
      await expect(page.getByRole("link", { name: "Tour de Growth" }).first()).toBeVisible();

      // A stylesheet of ours actually applied — the wordmark is invisible
      // without it, so this is what "looks like the product" means.
      const styled = await page.evaluate(() => {
        const body = getComputedStyle(document.body);
        return { background: body.backgroundColor, family: body.fontFamily };
      });
      expect(styled.background).not.toBe("rgba(0, 0, 0, 0)");
      expect(styled.family).toMatch(/Inter/);
    });
  }

  test("and it offers a way back rather than being a cul-de-sac", async ({ page }) => {
    await page.goto("/fr/pas-une-page");
    await page.getByRole("link", { name: /Retour à Tour de Growth/i }).click();
    await page.waitForURL("**/fr");
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  });
});

test("the language redirect says it depends on the browser (Vary: Accept-Language)", async ({ request }) => {
  // The root redirect lands on /en or /fr depending on the browser.
  const root = await request.get("/", { maxRedirects: 0 });
  expect(root.status()).toBe(308);
  expect(root.headers().vary ?? "").toMatch(/accept-language/i);
  // A prefixed page's language is its URL: no Vary, or the CDN cache would fragment per browser.
  const en = await request.get("/en");
  expect(en.status()).toBe(200);
  expect(en.headers().vary ?? "").not.toMatch(/accept-language/i);
});
