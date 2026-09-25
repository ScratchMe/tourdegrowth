import { describe, expect, it } from "vitest";
import { COMPARISON_ORDER, COMPARISONS, isComparisonSlug, type ComparisonSlug } from "../comparisons";
import { GLOSSARY_TERMS, type GlossaryTermId } from "../glossary-terms";
import { CONTENT_UPDATED_AT } from "../updated-at";
import { isLocalizableContentPath } from "@/lib/i18n/routes";
import { LOCALES, type Locale } from "@/lib/i18n/locale";

const SLUGS = Object.keys(COMPARISONS) as ComparisonSlug[];

/** Words, near enough for a floor: the point is "this is a page, not a stub". */
function words(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function allProse(slug: ComparisonSlug, locale: Locale): string {
  const c = COMPARISONS[slug];
  return [
    c.title[locale],
    c.intro[locale],
    ...c.rows.flatMap((r) => [r.aspect[locale], r.aarrr[locale], r.other[locale]]),
    ...c.sections.flatMap((s) => [s.heading[locale], ...s.body.map((p) => p[locale])]),
    c.verdict[locale],
  ].join(" ");
}

describe("COMPARISONS (GROWTH-PLAN.md wave 2.3: the compared-frameworks cluster)", () => {
  it("COMPARISON_ORDER lists every slug exactly once", () => {
    expect([...COMPARISON_ORDER].sort()).toEqual([...SLUGS].sort());
    expect(new Set(COMPARISON_ORDER).size).toBe(COMPARISON_ORDER.length);
  });

  it("isComparisonSlug accepts every slug and refuses anything else", () => {
    for (const slug of SLUGS) expect(isComparisonSlug(slug)).toBe(true);
    for (const other of ["aarrr", "glossary", "aarrr-vs-", "__proto__", ""]) {
      expect(isComparisonSlug(other), other).toBe(false);
    }
  });

  /**
   * GROWTH-PLAN.md 2.3 asks for 600-800 words. The floor is what matters —
   * a comparison page that says less than this is the thin content the plan
   * exists to avoid. The ceiling is loose: these are prose pages, and FR
   * runs about 10% longer than EN for the same argument.
   */
  it("every page carries 550-1000 words in each language", () => {
    for (const slug of SLUGS) {
      for (const locale of LOCALES) {
        const count = words(allProse(slug, locale));
        expect(count, `${slug}.${locale} has ${count} words`).toBeGreaterThanOrEqual(550);
        expect(count, `${slug}.${locale} has ${count} words`).toBeLessThanOrEqual(1000);
      }
    }
  });

  /**
   * The pages must not be variants of one text — that is the
   * near-duplicate the plan warned about when it dropped "expansion revenue"
   * from wave 2.2. Section headings are the cheapest proxy for "did this page
   * make its own argument".
   */
  it("no two pages share a section heading", () => {
    const seen = new Map<string, ComparisonSlug>();
    for (const slug of SLUGS) {
      for (const section of COMPARISONS[slug].sections) {
        for (const locale of LOCALES) {
          const key = `${locale}:${section.heading[locale].toLowerCase()}`;
          expect(seen.get(key), `${slug} repeats a heading from ${seen.get(key)}`).toBeUndefined();
          seen.set(key, slug);
        }
      }
    }
  });

  it("every page has four comparison rows and three sections", () => {
    for (const slug of SLUGS) {
      // Four rows: past that a reader is scanning a list, not comparing.
      expect(COMPARISONS[slug].rows, slug).toHaveLength(4);
      expect(COMPARISONS[slug].sections, slug).toHaveLength(3);
      for (const section of COMPARISONS[slug].sections) {
        expect(section.body.length, `${slug} / ${section.heading.en}`).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("every glossary link points at a real term, 3-4 of them, never repeated", () => {
    const termIds = Object.keys(GLOSSARY_TERMS) as GlossaryTermId[];
    for (const slug of SLUGS) {
      const { glossary } = COMPARISONS[slug];
      expect(glossary.length, slug).toBeGreaterThanOrEqual(3);
      expect(glossary.length, slug).toBeLessThanOrEqual(4);
      expect(new Set(glossary).size, `${slug} repeats a term`).toBe(glossary.length);
      for (const id of glossary) expect(termIds, `${slug} links "${id}"`).toContain(id);
    }
  });

  /**
   * The search snippet window. Same rule the glossary terms follow — outside
   * it, Google rewrites the description and the page loses the one line it
   * chose for itself.
   */
  it("every meta description is 70-160 characters in both languages", () => {
    for (const slug of SLUGS) {
      for (const locale of LOCALES) {
        const length = COMPARISONS[slug].metaDescription[locale].length;
        expect(length, `${slug}.${locale} is ${length} chars`).toBeGreaterThanOrEqual(70);
        expect(length, `${slug}.${locale} is ${length} chars`).toBeLessThanOrEqual(160);
      }
    }
  });

  /**
   * The wiring that is easy to forget and silent when missed: without the
   * slug in LOCALIZED_ROOTS the unprefixed URL is not redirected — it falls
   * through to the app routes and 404s — and without a sitemap date the
   * sitemap entry would throw on its non-null assertion.
   */
  it("every slug is a localizable content root and carries a sitemap date", () => {
    for (const slug of SLUGS) {
      expect(isLocalizableContentPath(`/${slug}`), slug).toBe(true);
      expect(CONTENT_UPDATED_AT[`/${slug}`], slug).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  /** Both halves of "AARRR vs X" must be in the title, or the query never matches it. */
  it("every title names AARRR and the other framework", () => {
    for (const slug of SLUGS) {
      for (const locale of LOCALES) {
        const title = COMPARISONS[slug].title[locale];
        expect(title, `${slug}.${locale}`).toContain("AARRR");
        expect(title.toLowerCase(), `${slug}.${locale}`).toContain(
          COMPARISONS[slug].other[locale].toLowerCase(),
        );
      }
    }
  });
});
