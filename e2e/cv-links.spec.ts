import { expect, test } from "./helpers";

/**
 * SEO lot 6 (2026-09-28, confirmed by Antoine) — every visible link to the CV
 * opens it in the language of the page it sits on: `/en/` from an English
 * page, the bare address from a French one. Read from the HTML the server
 * sends, on every sitemap URL (the footer carries the link everywhere, About
 * a second one) and on the result page, which renders in the reader's
 * language (`/deep-dive/<id>` carries no CV link).
 *
 * The Deep dive credit card is not reachable here (the sample result has no
 * Deep dive); `content/__tests__/antoine-credit.test.ts` keeps its link on
 * `cvUrl` statically.
 *
 * Non-vacuity (2026-09-28): against the build before this change, exactly
 * the English pages were named — the 37 English sitemap URLs of a production
 * build and the English sample result — and no French one.
 */
const CV = "https://cv.antoine.berthaud.me";

function cvLinks(html: string): string[] {
  return [...html.matchAll(/<a[^>]*\shref="(https:\/\/cv\.antoine\.berthaud\.me[^"]*)"/g)].map((m) => m[1]!);
}

test("every CV link opens the CV in the page's own language", async ({ request }) => {
  test.setTimeout(120_000);
  const xml = await (await request.get("/sitemap.xml")).text();
  const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]!).pathname);
  expect(paths.length).toBeGreaterThan(60);
  const pages: [string, "en" | "fr"][] = [
    ...paths.map((path) => [path, path.startsWith("/fr") ? "fr" : "en"] as [string, "en" | "fr"]),
    ["/r/sample?lang=en", "en"],
    ["/r/sample?lang=fr", "fr"],
  ];

  const off: string[] = [];
  for (const [path, locale] of pages) {
    const links = cvLinks(await (await request.get(path)).text());
    const expected = locale === "en" ? `${CV}/en/` : CV;
    // At least the footer's: a page that lost every link would pass the check below by having none.
    if (links.length === 0) off.push(`${path}: no CV link`);
    for (const href of links) if (href !== expected) off.push(`${path}: ${href}`);
  }
  expect(off).toEqual([]);
});
