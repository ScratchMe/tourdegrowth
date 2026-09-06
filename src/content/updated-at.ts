/**
 * When each indexable page's CONTENT last changed — the `<lastmod>` of the
 * sitemap (REVIEW-02.md R2-08). Hand-maintained on purpose: a build-time
 * `new Date()` would claim every page changed on every deploy, which is the
 * one thing that makes crawlers stop trusting the field. Update the date
 * when the words on the page change, not when its chrome or its code does.
 *
 * Glossary terms fall back to `GLOSSARY_UPDATED_AT` unless an entry carries
 * its own `updatedAt` (R2-11 will give the rewritten terms one each).
 */
export const CONTENT_UPDATED_AT: Record<string, string> = {
  "/": "2026-09-06", // title and share text (PR #58), visitor-facing copy
  "/how-it-works": "2026-09-06", // stage eyebrows (R2-17)
  "/glossary": "2026-08-29", // the 15 short definitions have not moved since the extended copy shipped
};

/** The day the long-form `extended` copy of every term was approved. */
export const GLOSSARY_UPDATED_AT = "2026-08-29";
