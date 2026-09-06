import { expect, test } from "./helpers";

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
  expect((set.hasDefinedTerm as unknown[]).length).toBe(15);
  expect(blocks.some((b) => b["@type"] === "BreadcrumbList")).toBe(true);
});

test("a term page is a DefinedTerm tied to the set, with a three-step breadcrumb", async ({ page }) => {
  const blocks = await jsonLdBlocks(page, "/en/glossary/cac");
  const term = blocks.find((b) => b["@type"] === "DefinedTerm") as Record<string, unknown>;
  expect(term).toBeDefined();
  expect(term.name).toBe("CAC");
  expect(String((term.inDefinedTermSet as Record<string, unknown>)["@id"])).toMatch(/\/en\/glossary#set$/);
  const crumbs = blocks.find((b) => b["@type"] === "BreadcrumbList") as Record<string, unknown>;
  expect((crumbs.itemListElement as unknown[]).length).toBe(3);
});
