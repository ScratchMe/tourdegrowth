import { PILLAR_VERDICTS, scoreBand, SUMMARY_HEADLINES } from "@/content/copy-library";
import { tc } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";
import type { Tone } from "@/lib/quiz/tone";
import type { Pillar } from "./pillars";

export interface QuickVerdict {
  /** One-line summary under the score numeral, from SUMMARY_HEADLINES — keyed by the weakest pillar. */
  headline: string;
  /** One sentence per pillar, from PILLAR_VERDICTS — keyed by that pillar's score band. The result page picks which pillars to show as Strengths/Where you're losing time (rankPillarsAscending), this just resolves the text for every pillar. */
  pillarSentences: Record<Pillar, string>;
}

/**
 * Builds the deterministic Quick-mode verdict for one tone
 * (SPEC-ADDENDUM-01.md §0): the Quick score/verdict pipeline no longer calls
 * Gemini at all — it reads pre-written sentences straight out of
 * `content/copy-library.ts`. Pure and synchronous, unlike the Deep dive
 * verdict (`gemini/deep-dive-prompt.ts`), which still calls Gemini.
 */
export function buildQuickVerdict(
  tone: Tone,
  locale: Locale,
  pillars: readonly { pillar: Pillar; score: number }[],
  weakestPillar: Pillar,
): QuickVerdict {
  const headline = tc(SUMMARY_HEADLINES[weakestPillar][tone], locale);

  const pillarSentences = {} as Record<Pillar, string>;
  for (const p of pillars) {
    pillarSentences[p.pillar] = tc(PILLAR_VERDICTS[p.pillar][scoreBand(p.score)][tone], locale);
  }

  return { headline, pillarSentences };
}
