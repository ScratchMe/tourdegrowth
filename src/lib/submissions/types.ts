import type { Locale } from "@/lib/i18n/locale";
import type { Tone } from "@/lib/quiz/tone";
import type { Answers, PillarScore } from "@/lib/scoring/score";
import type { Pillar } from "@/lib/scoring/pillars";

/**
 * A completed questionnaire run, as stored in Firestore (collection
 * `submissions`) — SPEC.md §7/§8. `pillars`/`total`/`weakestPillar` are
 * `computeScore()`'s output, persisted verbatim; `verdict` is Gemini's
 * qualitative synthesis, added after the fact and never allowed to change
 * the numbers above (CLAUDE.md non-negotiable).
 */
export interface Submission {
  id: string;
  createdAt: string; // ISO 8601
  locale: Locale;
  tone: Tone;
  answers: Answers;
  pillars: PillarScore[];
  total: number;
  weakestPillar: Pillar;
  /** The submission id that referred this visitor here (`?ref=`), if any — SPEC.md §7. */
  refId: string | null;
  verdict: Verdict | null;
}

export interface Verdict {
  /** SPEC.md §6: "forces/axes/recommandation" — 2 strengths, 2 improvement areas, 1 recommendation (matches the 2-up grid the result screens are designed around, DESIGN-BRIEF.md open question #1). */
  strengths: [string, string];
  weaknesses: [string, string];
  recommendation: string;
  /** Which Gemini model actually answered (fallback chain) — kept for observability, never shown to the end user. */
  modelUsed: string;
}
