import { describe, expect, it } from "vitest";
import { COMPARISON_ORDER } from "../comparisons";
import { articleDates, CONTENT_PUBLISHED_AT, CONTENT_UPDATED_AT } from "../updated-at";

/**
 * The dates an `Article` page declares — SEO audit v1 §1.5. Every page that
 * renders `articleSchema` is listed here from its own source (the comparison
 * cluster from `COMPARISON_ORDER`, so a fifth comparison is covered the day it
 * lands), and each must have both dates, in ISO form, in the right order.
 */
const ARTICLE_PATHS = ["/growth-audit-checklist", "/startup-growth-diagnostic", ...COMPARISON_ORDER.map((slug) => `/${slug}`)];

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
