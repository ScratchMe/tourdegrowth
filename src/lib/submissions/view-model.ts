import type { DeepDiveResult, DeepDiveView } from "./types";

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
