import { describe, expect, it } from "vitest";
import { COMPARISON_ORDER } from "../comparisons";
import { GLOSSARY } from "../glossary";
import { articleDates, CONTENT_PUBLISHED_AT, CONTENT_UPDATED_AT, GLOSSARY_UPDATED_AT, termUpdatedAt } from "../updated-at";

/**
 * The dates an `Article` page declares — SEO audit v1 §1.5. Every page that
 * renders `articleSchema` is listed here from its own source (the comparison
 * cluster from `COMPARISON_ORDER`, so a fifth comparison is covered the day it
 * lands), and each must have both dates, in ISO form, in the right order.
 */
const ARTICLE_PATHS = [
  "/how-it-works",
  "/growth-audit-checklist",
  "/startup-growth-diagnostic",
  ...COMPARISON_ORDER.map((slug) => `/${slug}`),
];

describe("article dates (SEO audit v1 §1.5)", () => {
  it("every Article page has a publication and an update date, ISO, published never after updated", () => {
    for (const path of ARTICLE_PATHS) {
      const { published, modified } = articleDates(path);
      expect(published, path).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(modified, path).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(published <= modified, `${path}: published ${published} after modified ${modified}`).toBe(true);
    }
  });

  it("the update date is the sitemap's — one source, not a second copy", () => {
    for (const path of ARTICLE_PATHS) expect(articleDates(path).modified).toBe(CONTENT_UPDATED_AT[path]);
  });

  it("lists no publication date for a page that is not an Article", () => {
    expect(Object.keys(CONTENT_PUBLISHED_AT).sort()).toEqual([...ARTICLE_PATHS].sort());
  });

  it("fails loudly on a page it does not know, rather than emitting an Article without its date", () => {
    expect(() => articleDates("/not-a-page")).toThrow(/not-a-page/);
  });
});

/**
 * GEO audit (A8.2, 2026-09-30) — a term's page prints the date the sitemap
 * carries, through the one function both read. Its own date when it has one,
 * the approval day of the long-form copy otherwise, never a day before it.
 */
describe("glossary term dates (GEO audit, A8.2)", () => {
  it("is the term's own date when it has one, the long-form approval day otherwise", () => {
    expect(termUpdatedAt({ updatedAt: "2026-09-30" })).toBe("2026-09-30");
    expect(termUpdatedAt({})).toBe(GLOSSARY_UPDATED_AT);
  });

  it("gives every term an ISO day no earlier than the long-form approval", () => {
    for (const [id, entry] of Object.entries(GLOSSARY)) {
      const day = termUpdatedAt(entry);
      expect(day, id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(day >= GLOSSARY_UPDATED_AT, `${id}: ${day}`).toBe(true);
    }
  });
});
