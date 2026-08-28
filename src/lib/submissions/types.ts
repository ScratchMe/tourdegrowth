import type { Locale } from "@/lib/i18n/locale";
import type { Tone } from "@/lib/quiz/tone";
import type { QuickVerdict } from "@/lib/scoring/verdict";
import type { Answers, PillarScore } from "@/lib/scoring/score";
import type { Pillar } from "@/lib/scoring/pillars";

/**
 * A completed questionnaire run, as stored in Firestore (collection
 * `submissions`) — SPEC.md §7/§8, extended by SPEC-ADDENDUM-01.md §2.7.
 * `pillars`/`total`/`weakestPillar` are `computeScore()`'s output, persisted
 * verbatim and never touched again (CLAUDE.md non-negotiable, reinforced by
 * the addendum: the score is identical whether or not Deep dive ever runs).
 *
 * `verdicts` (Quick mode) is now a deterministic lookup in
 * `content/copy-library.ts`, not a Gemini call — see
 * `lib/scoring/verdict.ts` and SPEC-ADDENDUM-01.md §0.
 */
export interface Submission {
  id: string;
  createdAt: string; // ISO 8601
  locale: Locale;
  /** The tone selected during the quiz — which of `verdicts` shows first on the result page. */
  tone: Tone;
  answers: Answers;
  pillars: PillarScore[];
  total: number;
  weakestPillar: Pillar;
  /** The submission id that referred this visitor here (`?ref=`), if any — SPEC.md §7. */
  refId: string | null;
  /**
   * BOTH tones' Quick verdicts, computed once at submission time — not just
   * `tone`'s — so the result page's tone switch is a client-side swap, never
   * a recomputation (DESIGN-BRIEF.md's interaction model). Deterministic and
   * synchronous now (SPEC-ADDENDUM-01.md §0): both are effectively free to
   * compute, so there's no cost trade-off left in generating both, same as
   * before.
   */
  verdicts: {
    neutral: QuickVerdict;
    roast: QuickVerdict;
  };
  /**
   * Deep dive addition (SPEC-ADDENDUM-01.md §2.7) — null until the user
   * completes the 10 extra contextual questions from the result page. A
   * result without it renders the classic Quick view; no regression on
   * results shared before this feature existed.
   */
  deepDive: DeepDiveResult | null;
}

export interface DeepDiveVerdict {
  /** 3-4 specific sentences per pillar, informed by the context answers (SPEC-ADDENDUM-01.md §2.4). Replaces the corresponding Quick `pillarSentences` entry in the result UI once present. */
  pillarRecommendations: Record<Pillar, string>;
  /** THE one next action — rendered in the dashed-red PriorityMove card. */
  priorityAction: string;
  /** Which Gemini model actually answered (fallback chain) — kept for observability, never shown to the end user. */
  modelUsed: string;
}

export interface DeepDiveResult {
  completed: true;
  /** questionId -> the selected option's resolved contextLabel, at the locale the Deep dive was completed in. */
  contextAnswers: Record<string, string>;
  /**
   * BOTH tones, same rationale as the Quick `verdicts` field: the result
   * page's tone switch must stay an instant client-side swap even after a
   * Deep dive, so both are generated once at completion time.
   */
  verdicts: {
    neutral: DeepDiveVerdict;
    roast: DeepDiveVerdict;
  };
}
