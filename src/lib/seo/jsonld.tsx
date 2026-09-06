import type { ReactElement } from "react";
import { GLOSSARY, type GlossaryTermId } from "@/content/glossary";
import { ANTOINE_LINKS, QUICK_CREDIT } from "@/content/antoine-credit";
import { HOW_IT_WORKS } from "@/content/how-it-works";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";
import { localePath } from "@/lib/i18n/routes";
import { SITE_URL } from "@/lib/site";

/**
 * Structured data for the content pages — REVIEW-02.md R2-15.
 *
 * Before this module there was exactly one JSON-LD block on the whole site
 * (the landing's `WebApplication`), its `url` was the bare site URL on the
 * French page too, and the glossary — fifteen definitions, the schema.org
 * vocabulary literally has a type for it — declared nothing. Server-only:
 * it imports the long-form glossary, which must never reach a client bundle
 * (see `src/__tests__/client-bundles.test.ts`).
 *
 * `aggregateRating` stays deliberately absent from the WebApplication
 * (SPEC-ADDENDUM-02.md §3.2: "une fois qu'il y aura un volume d'usage
 * suffisant pour l'alimenter honnêtement").
 */

const SITE_NAME = "Tour de Growth";

function absolute(locale: Locale, path = "/"): string {
  return `${SITE_URL}${localePath(locale, path)}`;
}

/**
 * The same Person node the CV site declares (`…/#person` is its JSON-LD
 * `@id`), so search engines tie the product to its author instead of reading
 * two unrelated sites — the point of the "sites liés" pass of the CV audit.
 */
export function personNode() {
  return {
    "@type": "Person",
    "@id": `${ANTOINE_LINKS.cv}/#person`,
    name: QUICK_CREDIT.name,
    url: `${ANTOINE_LINKS.cv}/`,
    sameAs: [ANTOINE_LINKS.linkedin],
  };
}

/** `WebApplication`, not `Person`: Tour de Growth is the product being described, not Antoine. Built per language. */
export function webApplicationSchema(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    description: tc(UI_STRINGS.landing.subtitle, locale),
    // This page's own address, not the bare site URL — the French page used
    // to declare a `url` that was not itself.
    url: absolute(locale),
    inLanguage: locale,
    applicationCategory: "BusinessApplication",
    // Free, and built in France for a European first audience: EUR, not USD.
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    author: personNode(),
  };
}

/** Breadcrumbs, as rendered visually ("← Glossary") but until now never declared. */
export function breadcrumbSchema(locale: Locale, trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: SITE_NAME, path: "/" }, ...trail].map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absolute(locale, item.path),
    })),
  };
}

/** The glossary as one curated vocabulary rather than fifteen unrelated stubs. */
export function definedTermSetSchema(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "@id": `${absolute(locale, "/glossary")}#set`,
    name: tc(UI_STRINGS.glossaryPage.indexTitle, locale),
    description: tc(UI_STRINGS.glossaryPage.indexIntro, locale),
    url: absolute(locale, "/glossary"),
    inLanguage: locale,
    author: personNode(),
    hasDefinedTerm: (Object.keys(GLOSSARY) as GlossaryTermId[]).map((id) => ({
      "@type": "DefinedTerm",
      "@id": absolute(locale, `/glossary/${id}`),
      name: tc(GLOSSARY[id].term, locale),
      url: absolute(locale, `/glossary/${id}`),
    })),
  };
}

/** One term page: the term, its short definition, and the set it belongs to. */
export function definedTermSchema(locale: Locale, id: GlossaryTermId) {
  const entry = GLOSSARY[id];
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "@id": absolute(locale, `/glossary/${id}`),
    name: tc(entry.term, locale),
    description: tc(entry.definition, locale),
    url: absolute(locale, `/glossary/${id}`),
    inLanguage: locale,
    inDefinedTermSet: { "@type": "DefinedTermSet", "@id": `${absolute(locale, "/glossary")}#set` },
  };
}

/** Localized breadcrumb names for the three content areas. */
export const CRUMBS = {
  glossary: (locale: Locale) => ({ name: tc(UI_STRINGS.glossaryPage.indexTitle, locale), path: "/glossary" }),
  term: (locale: Locale, id: GlossaryTermId) => ({ name: tc(GLOSSARY[id].term, locale), path: `/glossary/${id}` }),
  howItWorks: (locale: Locale) => ({ name: tc(HOW_IT_WORKS.title, locale), path: "/how-it-works" }),
};

/**
 * Renders one JSON-LD block. `<` is escaped so a value containing
 * `</script>` could never end the tag early — every value here is
 * developer-authored copy, so this is belt-and-braces, not a live risk.
 */
export function JsonLd({ data }: { data: object }): ReactElement {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />
  );
}
