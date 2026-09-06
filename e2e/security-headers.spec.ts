import { expect, test } from "./helpers";

/**
 * REVIEW-02.md R2-18 — the app shipped no security headers of its own
 * (only the HSTS Vercel adds), so a public result page could be framed by
 * any site. The headers are declared in `next.config.mjs`; this reads what
 * the server actually sends, on each kind of route the app has.
 */
const ROUTES: [name: string, path: string][] = [
  ["a prerendered content page", "/en/glossary/cac"],
  ["a dynamic result page", "/r/sample"],
  ["the quiz", "/quiz"],
  ["an API route", "/api/submissions"],
];

for (const [name, path] of ROUTES) {
  test(`${name} carries the security headers`, async ({ page }) => {
    const response = await page.request.get(path, { maxRedirects: 0, failOnStatusCode: false });
    const h = response.headers();

    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(h["x-frame-options"]).toBe("DENY");
    expect(h["permissions-policy"]).toContain("camera=()");

    // The one value that must not be "hardened": `no-referrer` would strip the
    // Referer the CV links deliberately keep (they are `noopener` without
    // `noreferrer` so Antoine's CV analytics can attribute this traffic).
    expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["referrer-policy"]).not.toBe("no-referrer");
  });
}
