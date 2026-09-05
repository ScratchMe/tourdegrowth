import type { Locale } from "@/lib/i18n/locale";
import type { Pillar } from "@/lib/scoring/pillars";
import { buildQuickVerdict, type QuickVerdict } from "@/lib/scoring/verdict";
import type { DeepDiveResult, DeepDiveView } from "./types";

export interface QuickVerdicts {
  neutral: QuickVerdict;
  roast: QuickVerdict;
}

/**
 * Both tones' Quick verdicts, resolved in the locale of whoever is LOOKING —
 * REVIEW.md R-09.
 *
 * These used to be resolved once at submission time, in the author's locale,
 * and persisted on the document. Everything else on the result page follows
 * the visitor's own locale, so a French founder sharing their result with an
 * English colleague showed them an English page with a French headline and
 * French pillar sentences — on the single screen the whole growth loop
 * depends on.
 *
 * They are a pure lookup over `content/copy-library.ts` keyed by score band
 * (see `scoring/verdict.ts`), so resolving them per request costs nothing and
 * removes the need to store derived data at all. Resolved on the SERVER
 * rather than in the client component on purpose: the payload stays the same
 * twelve short strings instead of shipping the whole copy library to the
 * browser.
 *
 * Note the deliberate asymmetry with the OG image, which still uses the
 * submission's OWN locale (`opengraph-image.tsx`): a social crawler doesn't
 * send the sharer's cookies, so there is no viewer locale to speak of there.
 */
export function buildQuickVerdicts(
  locale: Locale,
  pillars: readonly { pillar: Pillar; score: number }[],
  weakestPillar: Pillar,
): QuickVerdicts {
  return {
    neutral: buildQuickVerdict("neutral", locale, pillars, weakestPillar),
    roast: buildQuickVerdict("roast", locale, pillars, weakestPillar),
  };
}

/**
 * Maps what's stored on a submission to what the browser is allowed to see —
 * REVIEW.md R-02.
 *
 * `/r/<id>` is a Client Component page, so anything a Server Component hands
 * it is serialized into the RSC payload and readable by every visitor of a
 * shared link, whether or not it's rendered. `DeepDiveResult` carries three
 * things that must never travel that far:
 *
 *  - `freeContext`: free text where a founder describes their business, their
 *    blockers, their customers (SPEC-ADDENDUM-02.md §1) — written under the
 *    implicit promise that it feeds their recommendation, not that it gets
 *    published alongside the score;
 *  - `contextAnswers`: the 10 Deep dive answers, same kind of business detail;
 *  - `modelUsed`: internal observability, deliberately never shown to an end
 *    user (see types.ts).
 *
 * Only the generated verdicts are display data, so only they cross over.
 * Pure function, no I/O — R-09 will extend this module with the full result
 * view model (verdict resolved in the VIEWER's locale rather than the
 * author's).
 */
export function toDeepDiveView(deepDive: DeepDiveResult | null | undefined): DeepDiveView | null {
  if (!deepDive) return null;

  return {
    verdicts: {
      neutral: {
        pillarRecommendations: deepDive.verdicts.neutral.pillarRecommendations,
        priorityAction: deepDive.verdicts.neutral.priorityAction,
      },
      roast: {
        pillarRecommendations: deepDive.verdicts.roast.pillarRecommendations,
        priorityAction: deepDive.verdicts.roast.priorityAction,
      },
    },
  };
}
