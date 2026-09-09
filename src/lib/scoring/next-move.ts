import { QUESTIONS, scoreBand } from "@/content/copy-library";
import { LEVEL_MOVE, NEXT_MOVES, type ActionablePoints } from "@/content/next-moves";
import { tc } from "@/lib/i18n/translatable";
import type { Locale } from "@/lib/i18n/locale";
import type { Pillar } from "./pillars";
import type { Answers } from "./score";

/**
 * The one action to show for the stage that is holding this product back —
 * `REVIEW-03.md` lot A, item A2.
 *
 * Pure and synchronous, like `buildQuickVerdict`: the Quick mode has made no
 * network call since `SPEC-ADDENDUM-01.md` §0 and this must not be the thing
 * that reintroduces one.
 *
 * ## The rule, in one sentence
 *
 * *The first thing missing in the stage that is holding you back.*
 *
 * Concretely: take the bottleneck pillar's three questions in the order they
 * were asked — they run from foundational to advanced, which is why the
 * order is the right tiebreak and not an arbitrary one — and answer the
 * first that did not earn full marks. Someone with no acquisition channel
 * identified is told to pick one; someone who has one but doesn't measure it
 * is told to measure it. Both are "Acquisition is your bottleneck"; they are
 * not the same next move.
 *
 * ## Why it is resolved server-side
 *
 * The answers live on the submission, never in the public payload (R-02,
 * R2-19): they describe a business far more than the score does, and
 * `/r/<id>` is a shared, public URL. So the server resolves this to a single
 * sentence and sends that. It also means a **visitor** sees the action —
 * which matters, since they are the numerator of the whole sharing loop, and
 * they have no answers on their device to derive it from.
 */
export function resolveNextMove(
  locale: Locale,
  pillars: readonly { pillar: Pillar; score: number }[],
  weakestPillar: Pillar,
  answers: Answers,
): string {
  const weakest = pillars.find((p) => p.pillar === weakestPillar);

  // The stage holding you back is itself strong, which can only happen when
  // all five are. Naming a bottleneck here would be false precision, and the
  // whole credibility of this score is that it survives being re-explained.
  if (weakest && scoreBand(weakest.score) === "strong") return tc(LEVEL_MOVE, locale);

  const move = findFirstGap(weakestPillar, answers);
  // No gap in a pillar that isn't strong should be unreachable — a pillar
  // whose three answers are all full marks scores 20. Falling back rather
  // than throwing: a missing sentence is a small loss, a 500 on a result
  // page someone just waited for is not.
  return tc(move ?? LEVEL_MOVE, locale);
}

function findFirstGap(pillar: Pillar, answers: Answers) {
  for (const question of QUESTIONS) {
    if (question.pillar !== pillar) continue;
    const answer = answers[question.id];
    if (answer === undefined) continue;
    const chosen = question.options[answer];
    if (!chosen || chosen.points === 20) continue;
    return NEXT_MOVES[question.id]?.[chosen.points as ActionablePoints];
  }
  return undefined;
}
