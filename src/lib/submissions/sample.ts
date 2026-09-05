import type { Locale } from "@/lib/i18n/locale";
import type { Tone } from "@/lib/quiz/tone";
import type { Pillar } from "@/lib/scoring/pillars";
import { buildQuickVerdict, type QuickVerdict } from "@/lib/scoring/verdict";
import { buildQuickVerdicts, type QuickVerdicts } from "./view-model";

/**
 * The landing page's "Sample B2B SaaS" score card and the full
 * `/r/sample` result page ("See a sample result") both show this exact,
 * fixed data — never computeScore() or a real Gemini call.
 *
 * Per SPEC.md §12: "un résultat fixe codé en dur, jamais recalculé, toujours
 * étiqueté visuellement comme échantillon". It also happens to be the
 * worked example from SPEC.md §6 (18+12+8+16+20 = 74), which is why some of
 * these per-pillar values (8, 12) aren't reachable via computeScore() — see
 * the note in score.ts. That's expected: this is display data, not a real
 * questionnaire result.
 *
 * The verdict text used to be hand-written here as a marked-temporary
 * placeholder (SPEC.md §12: the real verdict library hadn't been delivered
 * yet). It now comes straight from `content/copy-library.ts` — the same
 * final, delivered content every real Quick result reads from
 * (SPEC-ADDENDUM-01.md §0) — via the sample's fixed scores/bands, so the
 * sample stays a faithful preview of the real thing rather than
 * independently-authored copy that could drift from it.
 */
export const SAMPLE_RESULT: {
  total: number;
  pillars: { pillar: Pillar; score: number }[];
  weakestPillar: Pillar;
} = {
  total: 74,
  pillars: [
    { pillar: "acquisition", score: 18 },
    { pillar: "activation", score: 12 },
    { pillar: "retention", score: 8 },
    { pillar: "referral", score: 16 },
    { pillar: "revenue", score: 20 },
  ],
  weakestPillar: "retention",
};

/** Resolves the sample's Quick verdict for one tone/locale, from the real copy library (see module comment above). `modelUsed` doesn't apply — this was never AI-generated. */
export function getSampleVerdict(tone: Tone, locale: Locale): QuickVerdict {
  return buildQuickVerdict(tone, locale, SAMPLE_RESULT.pillars, SAMPLE_RESULT.weakestPillar);
}

/**
 * The sample resolved in the reader's locale, through the exact same helper
 * real results now use (REVIEW.md R-09) — so the sample stays a faithful
 * preview rather than a separately-wired path that could drift.
 */
export function getSampleVerdicts(locale: Locale): QuickVerdicts {
  return buildQuickVerdicts(locale, SAMPLE_RESULT.pillars, SAMPLE_RESULT.weakestPillar);
}
