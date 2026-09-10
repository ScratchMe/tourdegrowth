import type { Locale } from "@/lib/i18n/locale";
import type { Pillar } from "@/lib/scoring/pillars";
import { buildQuickVerdict, type QuickVerdict } from "@/lib/scoring/verdict";
import type { DeepDiveResult, DeepDiveView } from "./types";

/** What the result page is allowed to know about a pillar: its name and its score out of 20. */
export interface PillarView {
  pillar: Pillar;
  score: number;
}

/**
 * Strips a stored `PillarScore` down to what the browser may see — the same
 * job `toDeepDiveView` does below, for the field R2-24 missed.
 *
 * `PillarScore` also carries `rawPoints`, the un-rounded 0-60 sum of that
 * pillar's three answers. R2-24 removed it from `BreakdownData` for a stated
 * reason — with options worth 20, 7 and 0, every reachable sum identifies the
 * exact multiset of answers behind it, which the rounded score does not (7/20
 * covers both 20+0+0 and 7+7+7) — but left this path alone, and this is the
 * path that matters more: `page.tsx` passed `submission.pillars` straight
 * through to a Client Component. The prop was *declared* `{pillar, score}[]`,
 * and TypeScript accepts a wider object outside an object literal, so nothing
 * complained; RSC then serialised the runtime object, `rawPoints` included,
 * into the payload of every publicly shared result.
 *
 * A declared type is not a boundary. This function is.
 */
export function toPillarViews(pillars: readonly { pillar: Pillar; score: number }[]): PillarView[] {
  return pillars.map(({ pillar, score }) => ({ pillar, score }));
}

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
 * Pure function, no I/O.
 *
 * It also picks the READER's language, the same principle R-09 applied to the
 * Quick verdict — and the gap R-09 left, because a Deep dive replaces those
 * very sentences on the result page. Reported by Antoine: his own English
 * result, opened in French, kept the per-pillar explanations and the priority
 * action in English.
 *
 * Falls back to the generation locale rather than hiding anything: a Deep
 * dive in the wrong language is worse than one in the right language, but far
 * better than an owner losing the recommendation they answered ten extra
 * questions for. Documents written before `localized` existed only have that
 * fallback, which is exactly the old behaviour.
 */
export function toDeepDiveView(
  deepDive: DeepDiveResult | null | undefined,
  readerLocale: Locale,
): DeepDiveView | null {
  if (!deepDive) return null;

  const verdicts = deepDive.localized?.[readerLocale] ?? deepDive.verdicts;

  return {
    verdicts: {
      neutral: {
        pillarRecommendations: verdicts.neutral.pillarRecommendations,
        priorityAction: verdicts.neutral.priorityAction,
      },
      roast: {
        pillarRecommendations: verdicts.roast.pillarRecommendations,
        priorityAction: verdicts.roast.priorityAction,
      },
    },
  };
}
