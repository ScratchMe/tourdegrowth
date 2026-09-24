import { expect, test } from "./helpers";
import { SEARCH_DESCRIPTION_MAX, SEARCH_DESCRIPTION_MIN, SEARCH_TITLE_MAX } from "@/lib/i18n/meta";

/**
 * What a link preview and a search result are built from — SEO audit v1.
 *
 * None of it is painted on the page, so none of it is caught by looking at
 * the page: `/quiz`, the most-linked page of the site and the one the launch
 * posts point at, unfurled with no picture and no canonical for weeks while
 * every screenshot of it looked right. These specs read the HTML the server
 * sends — what a crawler reads — and fetch the image it declares.
 */

/** The value of a `<meta>` or `<link>` in raw HTML, entities decoded (React escapes `'` as `&#x27;`). */
function attr(html: string, pattern: RegExp): string | null {
  const raw = pattern.exec(html)?.[1];
  if (raw === undefined) return null;
  return raw
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

const OG_IMAGE = /<meta property="og:image" content="([^"]*)"/;
const TWITTER_IMAGE = /<meta name="twitter:image" content="([^"]*)"/;
const CANONICAL = /<link rel="canonical" href="([^"]*)"/;

/** Every indexable page, read from the sitemap rather than listed here — a page added tomorrow is covered. */
async function sitemapPaths(request: import("@playwright/test").APIRequestContext): Promise<string[]> {
  const xml = await (await request.get("/sitemap.xml")).text();
  const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]!).pathname);
  // Floor: a sitemap that parsed to nothing would make every loop below pass.
  expect(paths.length).toBeGreaterThan(60);
  return paths;
}

/**
 * Next.js does not inherit an `opengraph-image` down the tree, so About, the
 * open-door pages, the comparison cluster and the legal pages used to unfurl
 * with no picture — found while fixing `/quiz`, the same hole one level up.
 * `contentMetadata` now declares the landing image as a fallback; a page with
 * its own file keeps that one. Exactly one tag either way: two `og:image`
 * tags would let each platform pick a different picture.
 */
test("every sitemap page declares exactly one share image, and it is a real PNG", async ({ request }) => {
  test.setTimeout(120_000);
  const checked = new Map<string, boolean>();
  for (const path of await sitemapPaths(request)) {
    const html = await (await request.get(path)).text();
    const tags = html.match(/<meta property="og:image" content="/g) ?? [];
    expect(tags, `${path} og:image count`).toHaveLength(1);
    const image = new URL(attr(html, OG_IMAGE)!).pathname;
    if (!checked.has(image)) {
      const response = await request.get(image);
      checked.set(image, response.status() === 200 && (response.headers()["content-type"] ?? "").includes("image/png"));
    }
    expect(checked.get(image), `${path} → ${image}`).toBe(true);
  }
});

/**
 * SEO audit v1 §1.2/§1.3, on what the server actually sends. The unit test
 * (`content/__tests__/page-meta.test.ts`) checks the content modules and names
 * the source; this one checks the rendered `<title>` and description of every
 * sitemap URL, so a page whose `generateMetadata` composes its text differently
 * from what the unit test assumes still gets caught.
 */
test("every sitemap page's title and description fit a search result", async ({ request }) => {
  test.setTimeout(120_000);
  const off: string[] = [];
  // `/quiz` is not in the sitemap (an app page) but is indexable on purpose (R2-08).
  for (const path of [...(await sitemapPaths(request)), "/quiz?lang=en", "/quiz?lang=fr"]) {
    const html = await (await request.get(path)).text();
    const title = attr(html, /<title>([^<]*)<\/title>/) ?? "";
    const description = attr(html, /<meta name="description" content="([^"]*)"/) ?? "";
    if (title.length === 0 || title.length > SEARCH_TITLE_MAX) off.push(`${path} title (${title.length}): ${title}`);
    if (description.length < SEARCH_DESCRIPTION_MIN || description.length > SEARCH_DESCRIPTION_MAX) {
      off.push(`${path} description (${description.length}): ${description}`);
    }
  }
  expect(off).toEqual([]);
});

/**
 * The pages that carry their own `opengraph-image` file keep ITS address —
 * the one with the cache-busting hash. An image declared in the config
 * replaces the file-based one (measured, against what the docs suggest), so
 * these pages opt out of the fallback; this pins that they still do.
 */
test("pages with their own share-image file keep the file's hashed address", async ({ request }) => {
  for (const [path, own] of [
    ["/fr", "/fr/opengraph-image/fr"],
    ["/en/how-it-works", "/en/how-it-works/opengraph-image/en"],
    ["/fr/glossary", "/fr/glossary/opengraph-image/fr"],
    ["/en/glossary/cac", "/en/glossary/cac/opengraph-image/en"],
  ] as const) {
    const og = new URL(attr(await (await request.get(path)).text(), OG_IMAGE)!);
    expect(og.pathname, path).toBe(own);
    expect(og.search, `${path} keeps its hash`).toMatch(/^\?[0-9a-f]+$/);
  }
});

test.describe("/quiz share preview (SEO audit v1 §1.1, §1.4)", () => {
  for (const [lang, heading] of [
    ["en", "The Tour"],
    ["fr", "Le Tour"],
  ] as const) {
    test(`${lang}: declares an image in the reader's language, and that image is a real PNG`, async ({ request }) => {
      const html = await (await request.get(`/quiz?lang=${lang}`)).text();
      // A length floor before any absence-shaped conclusion: a failed fetch
      // would satisfy every "not there" at once (TESTING.md §2.3bis).
      expect(html.length).toBeGreaterThan(2000);

      const og = attr(html, OG_IMAGE);
      expect(og, "og:image").not.toBeNull();
      expect(new URL(og!).pathname).toBe(`/quiz/share/${lang}`);
      expect(attr(html, TWITTER_IMAGE)).toBe(og);
      expect(html).toContain('<meta name="twitter:card" content="summary_large_image"');
      expect(attr(html, /<meta property="og:title" content="([^"]*)"/)).toContain(heading);

      const image = await request.get(new URL(og!).pathname);
      expect(image.status()).toBe(200);
      expect(image.headers()["content-type"]).toContain("image/png");
      const body = await image.body();
      // PNG signature, and a real 1200×630 frame rather than an error body.
      expect(body.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
      expect(body.readUInt32BE(16)).toBe(1200);
      expect(body.readUInt32BE(20)).toBe(630);
    });
  }

  test("the canonical is the bare path — the same one whatever the reader's language", async ({ request }) => {
    for (const lang of ["en", "fr"]) {
      const html = await (await request.get(`/quiz?lang=${lang}&ref=00000000-0000-4000-8000-000000000000`)).text();
      expect(new URL(attr(html, CANONICAL)!).pathname).toBe("/quiz");
      expect(new URL(attr(html, CANONICAL)!).search).toBe("");
    }
  });

  test("an image address that is not a language is a 404, not a render", async ({ request }) => {
    expect((await request.get("/quiz/share/de")).status()).toBe(404);
  });
});
