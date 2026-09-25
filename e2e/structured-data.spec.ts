import { expect, test } from "./helpers";
import { COMPARISON_ORDER } from "@/content/comparisons";
import { GLOSSARY } from "@/content/glossary";
import { CONTENT_PUBLISHED_AT, CONTENT_UPDATED_AT } from "@/content/updated-at";

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
  const paths = ["/growth-audit-checklist", "/startup-growth-diagnostic", ...COMPARISON_ORDER.map((slug) => `/${slug}`)];
  for (const locale of ["en", "fr"]) {
    for (const path of paths) {
      const blocks = await jsonLdBlocks(page, `/${locale}${path}`);
      const article = blocks.find((b) => b["@type"] === "Article") as Record<string, unknown>;
      expect(article, `${locale}${path}`).toBeDefined();
      expect(article.datePublished, `${locale}${path}`).toBe(CONTENT_PUBLISHED_AT[path]);
      expect(article.dateModified, `${locale}${path}`).toBe(CONTENT_UPDATED_AT[path]);
      expect((article.publisher as Record<string, unknown>)["@type"]).toBe("Person");
    }
  }
});
