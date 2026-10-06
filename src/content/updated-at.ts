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
  "/": "2026-09-29", // bande « Le Tour en trois parties » (design I + B)
  "/how-it-works": "2026-09-24", // « étape », intro et CTA (revue de copie v1)
  "/about": "2026-09-24", // questions, calcul et CTA (revue de copie v1)
  "/glossary": "2026-09-30", // les quatre termes de la vente assistée (A7.3.e)
  "/growth-audit-checklist": "2026-09-24", // intro, section et CTA (revue de copie v1)
  "/startup-growth-diagnostic": "2026-09-24", // intro et CTA (revue de copie v1)
  // Le cluster « frameworks comparés » (GROWTH-PLAN.md vague 2.3).
  "/aarrr-vs-north-star-metric": "2026-09-24", // deux phrases (revue de copie v1)
  "/aarrr-vs-rarra": "2026-09-23", // deux phrases FR réécrites (bon à tirer nº5)
  "/aarrr-vs-growth-loops": "2026-09-24", // deux phrases (revue de copie v1)
  "/aarrr-vs-okr": "2026-09-25", // « des quatre » → « de cette série » (revue adversariale R12)
  "/aarrr-vs-heart": "2026-09-25", // ce que les deux acronymes partagent (revue adversariale R11)
  // Le jeu (GAME-BRIEF 9.3). Listed in the sitemap only when the game is
  // open at build (lib/game/build-flag.ts); dated here like every other page.
  "/game": "2026-10-06", // le niveau 5 ouvert : sa zone devient jouable et nomme Gainix, et l'image dit cinq niveaux ouverts (A24, REV-3) ; avant, le niveau 4 ouvert : sa zone devient jouable et nomme Partix, et l'image dit quatre niveaux ouverts (A24, REF-3) ; avant, le niveau 3 le même jour : sa zone nomme Quandi, et l'image dit trois niveaux ouverts (A24, ACT-3) ; avant, le niveau 2 le 2026-10-01 (A12.f)
  "/game/acquisition": "2026-10-06", // la zone du revenue devient un lien, et le bloc « Niveau suivant » peut la viser (A24, REV-3) ; avant, la zone du referral devient un lien, et le bloc « Niveau suivant » peut la viser (A24, REF-3) ; avant, la zone de l'activation devient un lien, et le bloc « Niveau suivant » peut la viser (A24, ACT-3) ; avant, le bandeau dit l'étape, sans numéro (C76, A24.T0) ; created 2026-10-01 (A12.f)
  "/game/activation": "2026-10-06", // la zone du revenue devient un lien, et le bloc « Niveau suivant » peut la viser (A24, REV-3) ; avant, la zone du referral devient un lien, et le bloc « Niveau suivant » peut la viser (A24, REF-3) ; created (A24, ACT-3)
  "/game/referral": "2026-10-06", // la zone du revenue devient un lien, et le bloc « Niveau suivant » peut la viser (A24, REV-3) ; created 2026-10-05 (A24, REF-3)
  "/game/revenue": "2026-10-06", // created (A24, REV-3)
  "/game/retention": "2026-10-06", // la zone du revenue devient un lien, et le bloc « Niveau suivant » peut la viser (A24, REV-3) ; avant, la zone du referral devient un lien, et le bloc « Niveau suivant » peut la viser (A24, REF-3) ; avant, la zone de l'activation devient un lien, et le bloc « Niveau suivant » peut la viser (A24, ACT-3) ; avant, le bandeau dit l'étape, sans numéro (C76, A24.T0) ; le bloc « Niveau suivant » devient un lien vers le niveau 2 le 2026-10-01 (C31)
  // Le moteur de growth (engine spec §11.1). Same rule as the game: in the
  // sitemap only when ENGINE_ENABLED is open at build (app/sitemap.ts).
  "/aarrr-funnel-template": "2026-10-03", // A20.d T6 (C52) : la promesse dit ce que rapporte chaque nouveau client, et le board ou les investisseurs à côté du CODIR ; avant, A18 T5 : la FAQ de la vente assistée ne dit plus « côte à côte » ; A18 T4 : la promesse en une ligne pour un lecteur qui revient (page.promiseLine), « Combien de temps ça prend » sous l'outil ; avant, A18 T3.b : la durée ne promet plus que « le pas à pas garde ta place » (page.durationReady) ; avant, A7.3.c S3 : la promesse, la durée et le catalogue comptent les deux motions ; S2 : la sixième question de la FAQ, la vente assistée ; avant, A7.1 (C1) : la promesse, la FAQ et les réserves des repères, qui ne désignent plus
};

/** The day the long-form `extended` copy of every term was approved. */
export const GLOSSARY_UPDATED_AT = "2026-08-29";

/**
 * When each `Article` page was first published — the `datePublished` of its
 * JSON-LD (SEO audit v1 §1.5). Only the pages that declare an `Article` are
 * listed: `/how-it-works`, the two open-door pages and the comparison
 * cluster. A publication date never moves; `CONTENT_UPDATED_AT` above is the
 * one that does.
 */
export const CONTENT_PUBLISHED_AT: Record<string, string> = {
  // The explainer of the score, public since #14; an `Article` since the GEO
  // audit (A8.2, 2026-09-30), which found it the one prose page without a date.
  "/how-it-works": "2026-08-28",
  "/growth-audit-checklist": "2026-09-14",
  "/startup-growth-diagnostic": "2026-09-14",
  "/aarrr-vs-north-star-metric": "2026-09-14",
  "/aarrr-vs-rarra": "2026-09-14",
  "/aarrr-vs-growth-loops": "2026-09-14",
  "/aarrr-vs-okr": "2026-09-14",
  // Written on a branch on the 24th, public on the 25th (#164): a publication
  // date is when readers could see it (SEO lot 4, 2026-09-28).
  "/aarrr-vs-heart": "2026-09-25",
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

/**
 * When a glossary term's words last changed: its own `updatedAt` when it has
 * one, else the day the long-form copy was approved. One function for the
 * sitemap's `<lastmod>` and the date printed on the term's page (GEO audit,
 * A8.2), so the two can never disagree.
 */
export function termUpdatedAt(entry: { updatedAt?: string }): string {
  return entry.updatedAt ?? GLOSSARY_UPDATED_AT;
}
