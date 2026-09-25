import { describe, expect, it } from "vitest";
import { ABOUT } from "../about";
import { COMPARISONS, type ComparisonSlug } from "../comparisons";
import { ENGINE_COPY } from "../engine-copy";
import { GLOSSARY, type GlossaryTermId } from "../glossary";
import { HOW_IT_WORKS } from "../how-it-works";
import { PRIVACY, TERMS } from "../legal";
import { METRICS } from "../metrics";
import { CHECKLIST, DIAGNOSTIC } from "../open-door";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import { LOCALES, type Locale } from "@/lib/i18n/locale";
import { glossaryTermTitle, SEARCH_DESCRIPTION_MAX, SEARCH_DESCRIPTION_MIN, SEARCH_TITLE_MAX } from "@/lib/i18n/meta";

/**
 * The `<title>` and meta description of every indexable page, held to the
 * search-snippet window — SEO audit v1 §1.2/§1.3.
 *
 * Until this file only the glossary and the comparison cluster had a length
 * guard, so the pages written without one drifted: seven descriptions past
 * 160 characters (How it works reused its on-page intro), eleven titles past
 * 60. Each entry below is what that page's `generateMetadata` passes — the
 * same fields, and for the glossary the same title builder — named by path so
 * a failure says which page and which language. The rendered HTML of every
 * sitemap URL is checked too (`e2e/share-previews.spec.ts`); this is the half
 * that fails in seconds and names the source.
 */
function pages(locale: Locale): { path: string; title: string; description: string }[] {
  const meta = UI_STRINGS.meta;
  return [
    { path: "/", title: tc(meta.landingTitle, locale), description: tc(UI_STRINGS.landing.subtitle, locale) },
    { path: "/how-it-works", title: tc(meta.howItWorksTitle, locale), description: tc(HOW_IT_WORKS.metaDescription, locale) },
    { path: "/about", title: tc(ABOUT.title, locale), description: tc(ABOUT.metaDescription, locale) },
    { path: "/glossary", title: tc(meta.glossaryTitle, locale), description: tc(meta.glossaryDescription, locale) },
    ...(Object.keys(GLOSSARY) as GlossaryTermId[]).map((id) => ({
      path: `/glossary/${id}`,
      title: glossaryTermTitle(GLOSSARY[id], locale),
      description: tc(GLOSSARY[id].metaDescription ?? GLOSSARY[id].definition, locale),
    })),
    { path: "/growth-audit-checklist", title: tc(CHECKLIST.metaTitle, locale), description: tc(CHECKLIST.metaDescription, locale) },
    { path: "/startup-growth-diagnostic", title: tc(DIAGNOSTIC.metaTitle, locale), description: tc(DIAGNOSTIC.metaDescription, locale) },
    ...(Object.keys(COMPARISONS) as ComparisonSlug[]).map((slug) => ({
      path: `/${slug}`,
      title: tc(COMPARISONS[slug].metaTitle, locale),
      description: tc(COMPARISONS[slug].metaDescription, locale),
    })),
    { path: "/privacy", title: tc(PRIVACY.title, locale), description: tc(PRIVACY.metaDescription, locale) },
    { path: "/terms", title: tc(TERMS.title, locale), description: tc(TERMS.metaDescription, locale) },
    // Not in the sitemap while closed (R2-28), but it is shared in a post the
    // day it opens — its snippet is written now, not then.
    { path: "/metrics", title: tc(METRICS.title, locale), description: tc(METRICS.metaDescription, locale) },
    // An app page, but indexable on purpose (R2-08).
    { path: "/quiz", title: tc(meta.quizTitle, locale), description: tc(meta.quizDescription, locale) },
    // The growth engine: behind ENGINE_ENABLED and out of the sitemap until it
    // opens, but written now for the day it does — the same bargain as
    // /metrics. The title is the expression its page.tsx builds (engine
    // review R13: the first wording ran past 60 with the suffix).
    {
      path: "/aarrr-funnel-template",
      title: `${tc(ENGINE_COPY.meta.title, locale)} — Tour de Growth`,
      description: tc(ENGINE_COPY.meta.description, locale),
    },
  ];
}

describe("search snippets of every indexable page (SEO audit v1 §1.2, §1.3)", () => {
  it("covers every page family — a list that shrank would pass by checking less", () => {
    expect(pages("en").length).toBe(Object.keys(GLOSSARY).length + Object.keys(COMPARISONS).length + 11);
  });

  for (const locale of LOCALES) {
    it(`every title is at most ${SEARCH_TITLE_MAX} characters (${locale})`, () => {
      const long = pages(locale)
        .filter((p) => p.title.length > SEARCH_TITLE_MAX)
        .map((p) => `${p.path} (${p.title.length}): ${p.title}`);
      expect(long).toEqual([]);
    });

    it(`every description is ${SEARCH_DESCRIPTION_MIN}-${SEARCH_DESCRIPTION_MAX} characters (${locale})`, () => {
      const off = pages(locale)
        .filter((p) => p.description.length < SEARCH_DESCRIPTION_MIN || p.description.length > SEARCH_DESCRIPTION_MAX)
        .map((p) => `${p.path} (${p.description.length}): ${p.description}`);
      expect(off).toEqual([]);
    });
  }

  it("no two pages share a title in the same language", () => {
    for (const locale of LOCALES) {
      const titles = pages(locale).map((p) => p.title);
      expect(new Set(titles).size, locale).toBe(titles.length);
    }
  });

  /**
   * A glossary `metaTitle` is a shortening, not a second place to rewrite
   * the term: it may exist only in a language where the default title does
   * not fit. Same discipline as `metaDescription` (glossary.test.ts).
   */
  it("a glossary metaTitle is set only where the default title would run long", () => {
    for (const id of Object.keys(GLOSSARY) as GlossaryTermId[]) {
      const override = GLOSSARY[id].metaTitle;
      if (!override) continue;
      for (const locale of LOCALES) {
        if (override[locale] === undefined) continue;
        const fallback = glossaryTermTitle({ term: GLOSSARY[id].term }, locale);
        expect(fallback.length, `${id}.${locale} fits without an override`).toBeGreaterThan(SEARCH_TITLE_MAX);
      }
    }
  });
});
