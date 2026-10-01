import { expect, test } from "./helpers";
import { COMPARISON_ORDER } from "@/content/comparisons";
import { GLOSSARY } from "@/content/glossary";
import { CONTENT_PUBLISHED_AT, CONTENT_UPDATED_AT } from "@/content/updated-at";
import { formatLongDate } from "@/lib/i18n/format-date";

/**
 * The pages that declare an `Article`, from their own sources (a sixth
 * comparison is covered the day it lands). `/how-it-works` joined them with
 * the GEO audit (A8.2, 2026-09-30).
 */
const ARTICLE_PATHS = [
  "/how-it-works",
  "/growth-audit-checklist",
  "/startup-growth-diagnostic",
  ...COMPARISON_ORDER.map((slug) => `/${slug}`),
];

/**
 * REVIEW-02.md R2-15 — the JSON-LD the content pages actually emit. Read
 * from the served HTML, parsed, and checked for type and a few fields;
 * Google's Rich Results Test is the only full validator and needs the
 * production URL.
 */
async function jsonLdBlocks(page: import("@playwright/test").Page, path: string): Promise<Record<string, unknown>[]> {
  const html = await (await page.request.get(path)).text();
  return [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map((m) => JSON.parse(m[1]!));
}

test("the landing describes the application, in its own language, with its author", async ({ page }) => {
  const blocks = await jsonLdBlocks(page, "/fr");
  const app = blocks.find((b) => b["@type"] === "WebApplication") as Record<string, unknown>;
  expect(app).toBeDefined();
  expect(app.inLanguage).toBe("fr");
  expect(String(app.url)).toMatch(/\/fr$/);
  expect((app.author as Record<string, unknown>)["@type"]).toBe("Person");
});

test("the glossary index is one DefinedTermSet holding every term, with a breadcrumb", async ({ page }) => {
  const blocks = await jsonLdBlocks(page, "/en/glossary");
  const set = blocks.find((b) => b["@type"] === "DefinedTermSet") as Record<string, unknown>;
  expect(set).toBeDefined();
  // Derived, not a literal: the assertion claims "every term", so it has to
  // read the glossary rather than a number that has to be edited by hand
  // every time a term ships (GROWTH-PLAN.md wave 2.2 adds them in batches).
  expect((set.hasDefinedTerm as unknown[]).length).toBe(Object.keys(GLOSSARY).length);
  expect(blocks.some((b) => b["@type"] === "BreadcrumbList")).toBe(true);
});

test("a term page is a DefinedTerm tied to the set, with a three-step breadcrumb", async ({ page }) => {
  const blocks = await jsonLdBlocks(page, "/en/glossary/cac");
  const term = blocks.find((b) => b["@type"] === "DefinedTerm") as Record<string, unknown>;
  expect(term).toBeDefined();
  // Dérivé, jamais un littéral — la même discipline que le compte ci-dessus,
  // que je n'avais pas appliquée ici : le titre du terme est de la copie, et
  // le développer en « CAC — Customer Acquisition Cost » a fait rougir la CI.
  expect(term.name).toBe(GLOSSARY.cac.term.en);
  expect(String((term.inDefinedTermSet as Record<string, unknown>)["@id"])).toMatch(/\/en\/glossary#set$/);
  const crumbs = blocks.find((b) => b["@type"] === "BreadcrumbList") as Record<string, unknown>;
  expect((crumbs.itemListElement as unknown[]).length).toBe(3);
});

/**
 * SEO audit v1 §1.5/§1.6 — every Article carries its dates, from the same
 * table as the sitemap's `<lastmod>`, and the Person as publisher. Read from
 * the served HTML of each Article page, in both languages.
 */
test("every Article page declares its dates and the author as publisher", async ({ page }) => {
  for (const locale of ["en", "fr"]) {
    for (const path of ARTICLE_PATHS) {
      const blocks = await jsonLdBlocks(page, `/${locale}${path}`);
      const article = blocks.find((b) => b["@type"] === "Article") as Record<string, unknown>;
      expect(article, `${locale}${path}`).toBeDefined();
      expect(article.datePublished, `${locale}${path}`).toBe(CONTENT_PUBLISHED_AT[path]);
      expect(article.dateModified, `${locale}${path}`).toBe(CONTENT_UPDATED_AT[path]);
      expect((article.publisher as Record<string, unknown>)["@type"]).toBe("Person");
    }
  }
});

/**
 * SEO lot 4 (2026-09-28) — the CV site declares a WebApplication with the id
 * `https://www.tourdegrowth.com/#app`; the landing declares the same one in
 * both languages, and About points at it. Derived from the page's own
 * canonical origin, so the spec holds on any build — on a build with the
 * production `NEXT_PUBLIC_SITE_URL`, it IS that address.
 *
 * Non-vacuity (2026-09-28): an id built per language (`…/en#app`) fails it.
 */
test("the Tour's WebApplication carries one site-wide @id, and About points at it", async ({ page }) => {
  for (const locale of ["en", "fr"]) {
    const html = await (await page.request.get(`/${locale}`)).text();
    const origin = new URL(/<link rel="canonical" href="([^"]*)"/.exec(html)![1]!).origin;
    const blocks = await jsonLdBlocks(page, `/${locale}`);
    const app = blocks.find((b) => b["@type"] === "WebApplication") as Record<string, unknown>;
    expect(app["@id"], locale).toBe(`${origin}/#app`);
    const about = (await jsonLdBlocks(page, `/${locale}/about`)).find((b) => b["@type"] === "AboutPage") as Record<string, unknown>;
    expect((about.about as Record<string, unknown>)["@id"], `${locale}/about`).toBe(`${origin}/#app`);
  }
});

/**
 * SEO lot 4 — `og:type` is `article` on exactly the Article pages, with
 * `article:*` dates equal to the JSON-LD's and to the sitemap's `<lastmod>`
 * for the same URL (one source, `content/updated-at.ts`), a publication date
 * no later than the update, and the CV as author. Every other sitemap page is
 * a `website` with no `article:*` tag.
 *
 * Non-vacuity (2026-09-28), one build: `/aarrr-vs-okr` stripped of its
 * article dates and `/aarrr-vs-heart` published after its update — exactly
 * those four URLs were named, and no other.
 */
test("og:type is article on exactly the Article pages, with the sitemap's dates", async ({ page }) => {
  test.setTimeout(120_000);
  const xml = await (await page.request.get("/sitemap.xml")).text();
  // One `<url>` block at a time: the hreflang links sit between `<loc>` and `<lastmod>`.
  const entries = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => ({
    path: new URL(/<loc>([^<]+)<\/loc>/.exec(m[1]!)![1]!).pathname,
    lastmod: /<lastmod>([^<]+)<\/lastmod>/.exec(m[1]!)?.[1] ?? "(none)",
  }));
  expect(entries.length).toBeGreaterThan(60);
  const articles = new Set(ARTICLE_PATHS);
  const meta = (html: string, property: string) =>
    [...html.matchAll(new RegExp(`<meta property="${property}" content="([^"]*)"`, "g"))].map((m) => m[1]!);

  const off: string[] = [];
  let articlePages = 0;
  for (const { path, lastmod } of entries) {
    const html = await (await page.request.get(path)).text();
    const isArticle = articles.has(path.replace(/^\/(en|fr)/, ""));
    const type = meta(html, "og:type");
    if (!isArticle) {
      if (type.join() !== "website") off.push(`${path}: og:type ${type.join() || "(none)"}`);
      if (/<meta property="article:/.test(html)) off.push(`${path}: article:* on a non-article page`);
      continue;
    }
    articlePages++;
    if (type.join() !== "article") off.push(`${path}: og:type ${type.join() || "(none)"}`);
    const published = meta(html, "article:published_time");
    const modified = meta(html, "article:modified_time");
    const author = meta(html, "article:author");
    const ld = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)]
      .map((m) => JSON.parse(m[1]!) as Record<string, unknown>)
      .find((b) => b["@type"] === "Article");
    if (modified.join() !== lastmod) off.push(`${path}: article:modified_time ${modified.join()} ≠ lastmod ${lastmod}`);
    if (ld?.dateModified !== lastmod) off.push(`${path}: JSON-LD dateModified ${String(ld?.dateModified)} ≠ lastmod ${lastmod}`);
    if (published.length !== 1 || published[0] !== ld?.datePublished) off.push(`${path}: article:published_time ${published.join()}`);
    if (!(published[0]! <= lastmod)) off.push(`${path}: published ${published[0]} after lastmod ${lastmod}`);
    if (author.join() !== "https://cv.antoine.berthaud.me/") off.push(`${path}: article:author ${author.join()}`);
  }
  // Two languages of every Article page: a sitemap that lost them would pass the loop by skipping it.
  expect(articlePages).toBe(articles.size * 2);
  expect(off).toEqual([]);
});

/**
 * GEO audit (A8.2, 2026-09-30) — the date a reader sees is the date the
 * machines read. Every article, every glossary term and both legal pages
 * print « Dernière mise à jour : … » / "Last updated: …" in the served HTML,
 * with the sitemap's `<lastmod>` for that URL in the `<time datetime>` and the
 * same day, written out in the page's language, as its text. Walked from the
 * sitemap, so a page added there is checked the day it lands.
 */
test("every dated prose page prints the sitemap's date, in its language", async ({ page }) => {
  test.setTimeout(120_000);
  const xml = await (await page.request.get("/sitemap.xml")).text();
  const entries = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => ({
    path: new URL(/<loc>([^<]+)<\/loc>/.exec(m[1]!)![1]!).pathname,
    lastmod: /<lastmod>([^<]+)<\/lastmod>/.exec(m[1]!)?.[1] ?? "(none)",
  }));
  const articles = new Set(ARTICLE_PATHS);
  const dated = (path: string) =>
    articles.has(path) || /^\/glossary\/[^/]+$/.test(path) || path === "/privacy" || path === "/terms";

  const off: string[] = [];
  let checked = 0;
  for (const { path, lastmod } of entries) {
    const [, locale, rest] = /^\/(en|fr)(\/.*)?$/.exec(path) ?? [];
    if (!locale || !dated(rest ?? "/")) continue;
    checked++;
    const html = await (await page.request.get(path)).text();
    const line = /data-testid="updated-line"[^>]*>([\s\S]*?)<\/div>/.exec(html)?.[1];
    if (!line) {
      off.push(`${path}: no date line`);
      continue;
    }
    const time = /<time dateTime="([^"]+)"[^>]*>([^<]*)<\/time>/i.exec(line);
    if (time?.[1] !== lastmod) off.push(`${path}: <time> ${time?.[1] ?? "(none)"} ≠ lastmod ${lastmod}`);
    const shown = formatLongDate(lastmod, locale as "en" | "fr");
    if (time?.[2] !== shown) off.push(`${path}: shows "${time?.[2] ?? ""}", expected "${shown}"`);
  }
  // Both languages of every article, term and legal page: a sitemap that
  // lost a family would pass the loop by skipping it.
  expect(checked).toBe((articles.size + Object.keys(GLOSSARY).length + 2) * 2);
  expect(off).toEqual([]);
});
