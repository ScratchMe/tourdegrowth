import type { Translatable } from "@/lib/i18n/translatable";
import type { GlossaryTermId } from "./glossary-terms";

/**
 * comparison-index.ts — the cluster's slugs, order and titles, and nothing
 * else: the part of `comparisons.ts` a page needs to LINK to the cluster.
 *
 * Split out for the same reason `glossary-terms.ts` was split from
 * `glossary.ts`: the pages that only list the comparisons (How it works, the
 * AARRR glossary term, the sitemap) would otherwise pull ~40 KB of comparison
 * prose into their SSR chunk, and function storage is counted per route
 * (VERCEL.md, `content-fan-in.test.ts`). The glossary term page alone is 48
 * routes. `comparisons.ts` reads its titles from here, so there is one copy.
 */

export type ComparisonSlug =
  | "aarrr-vs-north-star-metric"
  | "aarrr-vs-rarra"
  | "aarrr-vs-growth-loops"
  | "aarrr-vs-okr"
  | "aarrr-vs-heart";

/** L'ordre d'affichage des liens croisés. Du plus recherché au moins recherché. */
export const COMPARISON_ORDER: ComparisonSlug[] = [
  "aarrr-vs-north-star-metric",
  "aarrr-vs-rarra",
  "aarrr-vs-growth-loops",
  "aarrr-vs-okr",
  "aarrr-vs-heart",
];

/** The H1 of each page, and the label of every link to it. */
export const COMPARISON_TITLES: Record<ComparisonSlug, Translatable> = {
  "aarrr-vs-north-star-metric": { en: "AARRR vs North Star metric", fr: "AARRR ou North Star metric" },
  "aarrr-vs-rarra": { en: "AARRR vs RARRA", fr: "AARRR ou RARRA" },
  "aarrr-vs-growth-loops": { en: "AARRR vs growth loops", fr: "AARRR ou growth loops" },
  "aarrr-vs-okr": { en: "AARRR vs OKR", fr: "AARRR ou OKR" },
  // Validé au bon à tirer nº6 (2026-09-29) — audit SEO v1 (2026-09-24), §3.1 : titre de la cinquième page du cluster.
  "aarrr-vs-heart": { en: "AARRR vs HEART", fr: "AARRR ou HEART" },
};

/**
 * The glossary terms that link into the cluster, and to which pages — SEO
 * lot 3 (2026-09-28, decided by Antoine). AARRR, the framework every page of
 * the cluster is about, links all of them; a term that IS the other side of
 * one comparison links that one. All four already draw Search Console
 * impressions: the point is to pass that traffic on, not to link everything
 * to everything. `related` stays for glossary terms only (its 2-4 slots).
 */
export const TERM_COMPARISONS: Partial<Record<GlossaryTermId, readonly ComparisonSlug[]>> = {
  aarrr: COMPARISON_ORDER,
  "north-star-metric": ["aarrr-vs-north-star-metric"],
  "growth-loop": ["aarrr-vs-growth-loops"],
  // RARRA is AARRR reordered around retention: the comparison is this term's.
  retention: ["aarrr-vs-rarra"],
};
