import type { Locale } from "@/lib/i18n/locale";
import type { Tone } from "@/lib/quiz/tone";
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
   * SHA-256 of the one-time owner token handed to the creating browser
   * (REVIEW.md R-01, see `owner-token.ts`). Proves "this browser created
   * this submission" for the one action that must not be open to every
   * recipient of a shared link: completing the Deep dive.
   *
   * `null` for submissions created before R-01 existed — those simply can
   * no longer be deep-dived (fail closed; the volume is small and the
   * alternative is a bypass anyone could use). NEVER serialize this to the
   * browser — see `view-model.ts`.
   */
  ownerTokenHash: string | null;
  /*
   * There is deliberately no `verdicts` field (REVIEW.md R-09). Both tones'
   * Quick verdicts used to be resolved at submission time and persisted
   * here — which froze them in the AUTHOR's language, so a shared result
   * rendered half in the wrong one. They are a pure lookup over
   * `content/copy-library.ts` keyed by score band, so they are now resolved
   * per request in the READER's locale instead
   * (`view-model.ts#buildQuickVerdicts`). Documents created before this
   * change still carry the old field; nothing reads it.
   */
  /**
   * Deep dive addition (SPEC-ADDENDUM-01.md §2.7) — null until the user
   * completes the 10 extra contextual questions from the result page. A
   * result without it renders the classic Quick view; no regression on
   * results shared before this feature existed.
   */
  deepDive: DeepDiveResult | null;
}

/**
 * The display-safe subset of a `DeepDiveVerdict` — the only part that ever
 * reaches the browser (REVIEW.md R-02). Deliberately has no `modelUsed`.
 */
export interface DeepDiveVerdictView {
  pillarRecommendations: Record<Pillar, string>;
  priorityAction: string;
}

/**
 * The display-safe subset of a `DeepDiveResult`, built by
 * `view-model.ts#toDeepDiveView`. `/r/<id>` is public: `freeContext` and
 * `contextAnswers` stay on the server, always.
 */
export interface DeepDiveView {
  verdicts: {
    neutral: DeepDiveVerdictView;
    roast: DeepDiveVerdictView;
  };
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
   * The optional free-text field from the Deep dive's last screen
   * (SPEC-ADDENDUM-02.md §1) — already truncated to 500 characters, `null`
   * when left empty/skipped. Stored verbatim (not re-derived from the
   * prompt) for transparency/debugging; never re-sent anywhere as an
   * instruction — see gemini/prompt.ts's FREE_CONTEXT_INSTRUCTION.
   */
  freeContext: string | null;
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
