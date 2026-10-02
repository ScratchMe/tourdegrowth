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
  // `&amp;` last: decoded first, it would turn a literal "&amp;lt;" into "<".
  return raw
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

const OG_IMAGE = /<meta property="og:image" content="([^"]*)"/;
const TWITTER_IMAGE = /<meta name="twitter:image" content="([^"]*)"/;
const CANONICAL = /<link rel="canonical" href="([^"]*)"/;

/** Every indexable page, read from the sitemap rather than listed here — a page added tomorrow is covered. */
async function sitemapLocs(request: import("@playwright/test").APIRequestContext): Promise<string[]> {
  const xml = await (await request.get("/sitemap.xml")).text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!);
  // Floor: a sitemap that parsed to nothing would make every loop below pass.
  expect(locs.length).toBeGreaterThan(60);
  return locs;
}

async function sitemapPaths(request: import("@playwright/test").APIRequestContext): Promise<string[]> {
  return (await sitemapLocs(request)).map((loc) => new URL(loc).pathname);
}

/** An alternates map as one comparable string, whatever order the tags came in. */
function sameSet(alt: Record<string, string>): string {
  return JSON.stringify(Object.entries(alt).sort(([a], [b]) => a.localeCompare(b)));
}

/** `hreflang → href` of every alternate link in the `<head>`. */
function alternates(html: string): Record<string, string> {
  const head = html.split("</head>")[0] ?? "";
  return Object.fromEntries(
    [...head.matchAll(/<link rel="alternate" hrefLang="([^"]+)" href="([^"]*)"/g)].map((m) => [m[1]!, m[2]!]),
  );
}

/**
 * Next.js does not inherit an `opengraph-image` down the tree, so About, the
 * open-door pages, the comparison cluster and the legal pages used to unfurl
 * with no picture — found while fixing `/quiz`, the same hole one level up.
 * `contentMetadata` now declares the landing image as a fallback; a page with
 * its own file keeps that one. Exactly one tag either way: two `og:image`
 * tags would let each platform pick a different picture. And the same one
 * for X, which reads `twitter:image` and falls back to nothing.
 *
 * The image itself is checked as a 1200×630 PNG, read from its bytes: a 200
 * with an error body, or a frame at the wrong size, is what a platform would
 * crop or refuse.
 *
 * Non-vacuity (2026-09-28, SEO lot 1): with the fallback removed from
 * `contentMetadata`, exactly the 20 pages that rely on it failed (About, the
 * two open-door pages, the five comparisons, the two legal pages, in both
 * languages) — and none of the pages with their own file.
 */
test("every sitemap page declares exactly one share image, for X too, and it is a real 1200×630 PNG", async ({ request }) => {
  test.setTimeout(120_000);
  const checked = new Map<string, string>();
  const off: string[] = [];
  for (const path of await sitemapPaths(request)) {
    const html = await (await request.get(path)).text();
    const og = html.match(/<meta property="og:image" content="/g) ?? [];
    const twitter = html.match(/<meta name="twitter:image" content="/g) ?? [];
    if (og.length !== 1 || twitter.length !== 1) {
      off.push(`${path}: ${og.length} og:image, ${twitter.length} twitter:image`);
      continue;
    }
    if (attr(html, TWITTER_IMAGE) !== attr(html, OG_IMAGE)) off.push(`${path}: twitter:image differs from og:image`);
    const image = new URL(attr(html, OG_IMAGE)!).pathname;
    if (!checked.has(image)) {
      const response = await request.get(image);
      const body = await response.body();
      const png = body.subarray(0, 8).toString("hex") === "89504e470d0a1a0a";
      const size = png ? `${body.readUInt32BE(16)}×${body.readUInt32BE(20)}` : "not a PNG";
      checked.set(
        image,
        `${response.status()} ${(response.headers()["content-type"] ?? "").split(";")[0]} ${size}`,
      );
    }
    if (checked.get(image) !== "200 image/png 1200×630") off.push(`${path} → ${image}: ${checked.get(image)}`);
  }
  expect(off).toEqual([]);
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
 * The rest of what a crawler reads, on every sitemap URL at once (SEO lot 2,
 * 2026-09-28). Each of these held on the day of the audit, but only a few
 * pages per family were checked: one `<h1>`, a canonical that is the page's
 * own sitemap address, the en/fr/x-default trio pointing back at itself and
 * declared identically by the page in the other language, and JSON-LD that
 * parses. A new page family, or a layout change, is covered the day it ships.
 *
 * Non-vacuity (2026-09-28): one sabotage per check in a single build — a
 * second `<h1>` on About, a canonical dropping its locale on the legal pages,
 * `x-default` removed from every page, an unparseable block on the glossary
 * index — and the list below named exactly those pages, each for its own
 * reason. The reciprocity branch, hidden there by the missing `x-default`,
 * was sabotaged on its own in a second build (French `/terms` announcing
 * `/en/privacy` as its English version): both `/terms` pages were named.
 */
test("every sitemap page has one h1, a self canonical, reciprocal hreflang and parseable JSON-LD", async ({ request }) => {
  test.setTimeout(120_000);
  const locs = await sitemapLocs(request);
  const pages = new Map<string, { html: string; alternates: Record<string, string> }>();
  for (const loc of locs) {
    const html = await (await request.get(new URL(loc).pathname)).text();
    pages.set(loc, { html, alternates: alternates(html) });
  }

  const off: string[] = [];
  for (const [loc, { html, alternates: alt }] of pages) {
    const path = new URL(loc).pathname;
    // A length floor before any conclusion (TESTING.md §2.3bis).
    if (html.length < 2000) {
      off.push(`${path}: body of ${html.length} bytes`);
      continue;
    }
    const h1 = (html.match(/<h1[\s>]/g) ?? []).length;
    if (h1 !== 1) off.push(`${path}: ${h1} <h1>`);

    const canonical = attr(html, CANONICAL);
    if (canonical !== loc) off.push(`${path}: canonical ${canonical}`);

    const locale = path.split("/")[1]!;
    const other = locale === "en" ? "fr" : "en";
    if (Object.keys(alt).sort().join(",") !== "en,fr,x-default") {
      off.push(`${path}: hreflang set ${Object.keys(alt).sort().join(",") || "(none)"}`);
    } else {
      if (alt[locale] !== loc) off.push(`${path}: hreflang ${locale} → ${alt[locale]}`);
      if (alt["x-default"] !== alt.en) off.push(`${path}: x-default → ${alt["x-default"]}`);
      const twin = pages.get(alt[other]!);
      if (!twin) off.push(`${path}: its ${other} version ${alt[other]} is not in the sitemap`);
      else if (sameSet(twin.alternates) !== sameSet(alt)) off.push(`${path}: hreflang not reciprocal with ${alt[other]}`);
    }

    const blocks = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => m[1]!);
    if (blocks.length === 0) off.push(`${path}: no JSON-LD`);
    for (const block of blocks) {
      try {
        JSON.parse(block);
      } catch {
        off.push(`${path}: JSON-LD does not parse: ${block.slice(0, 60)}`);
      }
    }
  }
  expect(off).toEqual([]);
});

/**
 * The pages that carry their own `opengraph-image` file keep ITS address,
 * query string included. An image declared in the config replaces the
 * file-based one (measured, against what the docs suggest), so these pages
 * opt out of the fallback; this pins that they still do.
 *
 * That query string is a hash of the segment's SOURCE FILE, not of the
 * picture (measured 2026-09-28): the two identical re-export files of How it
 * works and the glossary index share `?1513d546…`, the 48 terms share one,
 * the landing has its own — for the very same image. It does not change when
 * the picture does, so it is kept for stability, not as a cache-buster.
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

/**
 * An image route answers under a language and nowhere else (the security
 * review of T6.2, `lib/og/image-metadata.ts`). The proxy closes only the
 * first segments it reads as a language, and `dynamicParams = false` does not
 * reach a metadata route: until this was pinned, `/xx/game/opengraph-image/en`
 * answered 200 with the closed game's picture, and so did the engine's, while
 * their pages were 404. The language-prefixed control first, so a 404 below
 * is the route refusing and not the route missing — under each flag, the
 * landing's image is the one that always answers.
 */
test("a share image answers under a language, and a 404 under anything else", async ({ request }) => {
  expect((await request.get("/fr/opengraph-image/fr")).status()).toBe(200);
  for (const image of [
    "opengraph-image/en",
    "glossary/opengraph-image/en",
    "glossary/cac/opengraph-image/en",
    "how-it-works/opengraph-image/en",
    "game/opengraph-image/en",
    "game/acquisition/opengraph-image/en",
    "game/retention/opengraph-image/en",
    "aarrr-funnel-template/opengraph-image/en",
  ]) {
    for (const first of ["xx", "EN", "en-US"]) {
      const path = `/${first}/${image}`;
      const res = await request.get(path, { maxRedirects: 0 });
      expect(res.status(), path).toBe(404);
      expect(res.headers()["content-type"] ?? "", path).not.toContain("image/png");
    }
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
