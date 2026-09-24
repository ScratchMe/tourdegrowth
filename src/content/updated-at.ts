/**
 * When each indexable page's CONTENT last changed — the `<lastmod>` of the
 * sitemap (REVIEW-02.md R2-08). Hand-maintained on purpose: a build-time
 * `new Date()` would claim every page changed on every deploy, which is the
 * one thing that makes crawlers stop trusting the field. Update the date
 * when the words on the page change, not when its chrome or its code does.
 *
 * Glossary terms fall back to `GLOSSARY_UPDATED_AT` unless an entry carries
 * its own `updatedAt` (R2-11 will give the rewritten terms one each). The
 * legal pages are not listed here: their date is printed on the page itself
 * (`content/legal.ts`, `updatedAt`), and the sitemap reads that one.
 */
export const CONTENT_UPDATED_AT: Record<string, string> = {
  "/": "2026-09-06", // title and share text (PR #58), visitor-facing copy
  "/how-it-works": "2026-09-06", // stage eyebrows (R2-17)
  "/about": "2026-09-06", // created (R2-04)
  "/glossary": "2026-09-14", // dix termes ajoutés (GROWTH-PLAN.md 2.2, lots 1-3), puis activation-rate coupé comme doublon d'activation
  "/growth-audit-checklist": "2026-09-14", // created (GROWTH-PLAN.md wave 2.1)
  "/startup-growth-diagnostic": "2026-09-14", // created (GROWTH-PLAN.md wave 2.1)
  // Le cluster « frameworks comparés » (GROWTH-PLAN.md vague 2.3).
  "/aarrr-vs-north-star-metric": "2026-09-14",
  "/aarrr-vs-rarra": "2026-09-23", // deux phrases FR réécrites (bon à tirer nº5)
  "/aarrr-vs-growth-loops": "2026-09-14",
  "/aarrr-vs-okr": "2026-09-14",
  "/aarrr-vs-heart": "2026-09-24", // created (audit SEO v1 §3.1)
};

/** The day the long-form `extended` copy of every term was approved. */
export const GLOSSARY_UPDATED_AT = "2026-08-29";

/**
 * When each `Article` page was first published — the `datePublished` of its
 * JSON-LD (SEO audit v1 §1.5). Only the pages that declare an `Article` are
 * listed: the two open-door pages and the comparison cluster. A publication
 * date never moves; `CONTENT_UPDATED_AT` above is the one that does.
 */
export const CONTENT_PUBLISHED_AT: Record<string, string> = {
  "/growth-audit-checklist": "2026-09-14",
  "/startup-growth-diagnostic": "2026-09-14",
  "/aarrr-vs-north-star-metric": "2026-09-14",
  "/aarrr-vs-rarra": "2026-09-14",
  "/aarrr-vs-growth-loops": "2026-09-14",
  "/aarrr-vs-okr": "2026-09-14",
  "/aarrr-vs-heart": "2026-09-24", // created (audit SEO v1 §3.1)
};

/**
 * Both dates of an `Article` page, from the two tables above — one source for
 * the JSON-LD and the sitemap. Throws on a path missing from either table:
 * the pages are prerendered, so a forgotten date fails the build instead of
 * shipping an `Article` without the one field Google requires.
 */
export function articleDates(path: string): { published: string; modified: string } {
  const published = CONTENT_PUBLISHED_AT[path];
  const modified = CONTENT_UPDATED_AT[path];
  if (!published || !modified) throw new Error(`articleDates: no publication or update date for "${path}" in content/updated-at.ts`);
  return { published, modified };
}
