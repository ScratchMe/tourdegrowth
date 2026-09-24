import type { ReactElement } from "react";
import { ABOUT } from "@/content/about";
/*
 * `glossary-terms` and not `glossary`: these two builders read only `term`
 * and `definition`, and this module is imported by all nine content page
 * families. Reaching for the full entry would pull the long-form `extended`
 * copy — ~50 KB of SSR chunk — into every one of them. Same reasoning as
 * REVIEW-02.md R2-14, one level up: a server fan-in costs per route.
 */
import { GLOSSARY_TERMS, type GlossaryTermId } from "@/content/glossary-terms";
import { ANTOINE_LINKS, QUICK_CREDIT } from "@/content/antoine-credit";
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

/**
 * Un `Article` pour les pages de fond qui ne sont ni l'application, ni un
 * terme de glossaire — les deux pages « porte ouverte » du plan de
 * distribution (vague 2.1) et le cluster « AARRR vs X » (vague 2.3).
 *
 * **Les dates arrivent en paramètre** (audit SEO v1 §1.5) : `datePublished`
 * est ce que Google demande pour un `Article`, `dateModified` ce qu'il
 * recommande. Elles viennent de `content/updated-at.ts#articleDates`, la même
 * source que le `<lastmod>` du sitemap — jamais un `new Date()` de build
 * (R2-08), et jamais importées ici : ce module est traversé par toutes les
 * pages de contenu, et un module partagé reçoit les données de la page au lieu
 * de les tirer (`content-fan-in.test.ts`, la leçon de `CRUMBS`).
 *
 * **`publisher` reste la personne, pas une `Organization`** (audit SEO v1
 * §1.6, décision : ne pas corriger). Tour de Growth n'est pas une entreprise,
 * c'est le projet d'une personne, et le même nœud `Person` répété partout est
 * le signal cohérent que R2-15 a construit. Une `Organization` inventée pour
 * cocher la case des résultats enrichis introduirait une incohérence pire que
 * le gain — un test l'épingle pour que personne ne la « corrige » par réflexe.
 */
export function articleSchema(
  locale: Locale,
  path: string,
  headline: string,
  description: string,
  dates: { published: string; modified: string },
) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    url: absolute(locale, path),
    inLanguage: locale,
    datePublished: dates.published,
    dateModified: dates.modified,
    author: personNode(),
    publisher: personNode(),
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: absolute(locale) },
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
    hasDefinedTerm: (Object.keys(GLOSSARY_TERMS) as GlossaryTermId[]).map((id) => ({
      "@type": "DefinedTerm",
      "@id": absolute(locale, `/glossary/${id}`),
      name: tc(GLOSSARY_TERMS[id].term, locale),
      url: absolute(locale, `/glossary/${id}`),
    })),
  };
}

/** One term page: the term, its short definition, and the set it belongs to. */
export function definedTermSchema(locale: Locale, id: GlossaryTermId) {
  const entry = GLOSSARY_TERMS[id];
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

/**
 * `/about` — REVIEW-02.md R2-04: the one page a search engine can attach the
 * author entity to. `AboutPage` whose `mainEntity` is the same Person node
 * as everywhere else, with the job title spelled out.
 */
export function aboutPageSchema(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: tc(ABOUT.title, locale),
    url: absolute(locale, "/about"),
    inLanguage: locale,
    about: { "@type": "WebApplication", name: SITE_NAME, url: absolute(locale) },
    mainEntity: { ...personNode(), jobTitle: "Senior Growth Product Manager" },
  };
}

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
