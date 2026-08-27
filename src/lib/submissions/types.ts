import type { Locale } from "@/lib/i18n/locale";
import type { Tone } from "@/lib/quiz/tone";
import type { Answers, PillarScore } from "@/lib/scoring/score";
import type { Pillar } from "@/lib/scoring/pillars";

/**
 * A completed questionnaire run, as stored in Firestore (collection
 * `submissions`) — SPEC.md §7/§8. `pillars`/`total`/`weakestPillar` are
 * `computeScore()`'s output, persisted verbatim; `verdicts` is Gemini's
 * qualitative synthesis, added after the fact and never allowed to change
 * the numbers above (CLAUDE.md non-negotiable).
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
   * BOTH tones' verdicts, generated once at submission time — not just
   * `tone`'s. DESIGN-BRIEF.md's interaction model requires the result
   * page's tone switch to "re-render... no recalculation, no reload" (i.e.
   * a client-side swap, not a second Gemini call at switch time), which
   * only works if both are already sitting in the document.
   */
  verdicts: {
    neutral: Verdict;
    roast: Verdict;
  };
}

export interface Verdict {
  /** One-line, mobile-friendly summary shown right under the score numeral (DESIGN-BRIEF.md screen 02: "Solid engine, one flat tyre…" — that exact sentence was an example, not approved copy; this is Gemini-generated per result, not a static per-band library, so SPEC.md §12's "not yet provided" restriction doesn't apply to it. */
  headline: string;
  /** SPEC.md §6: "forces/axes/recommandation" — 2 strengths, 2 improvement areas, 1 recommendation (matches the 2-up grid the result screens are designed around, DESIGN-BRIEF.md open question #1). */
  strengths: [string, string];
  weaknesses: [string, string];
  recommendation: string;
  /** Which Gemini model actually answered (fallback chain) — kept for observability, never shown to the end user. */
  modelUsed: string;
}
