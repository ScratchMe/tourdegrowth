import { tc, type Translatable } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";
import type { Tone } from "@/lib/quiz/tone";
import type { Pillar } from "@/lib/scoring/pillars";
import type { Verdict } from "./types";

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
 * // TODO: copie temporaire — voir SPEC.md §12. Le headline roast
 * ("Not bad for someone whose users leave before the second week.") et la
 * phrase de calibrage retention ("Your retention took one look at your
 * product and rode straight past the finish line.") sont les exemples
 * donnés tels quels par DESIGN-BRIEF.md ; le reste (FR, neutre, autres
 * piliers) est rédigé ici pour avoir un échantillon complet, pas une copie
 * finale approuvée par l'agent produit.
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

interface SampleVerdictContent {
  headline: Translatable;
  strengths: [Translatable, Translatable];
  weaknesses: [Translatable, Translatable];
  recommendation: Translatable;
}

const SAMPLE_VERDICTS: Record<Tone, SampleVerdictContent> = {
  neutral: {
    headline: { en: "Solid engine, one flat tyre.", fr: "Un bon moteur, un pneu à plat." },
    strengths: [
      {
        en: "Your pricing has been tested and your expansion playbook is already paying off.",
        fr: "Ton pricing a été testé et ton playbook d'expansion porte déjà ses fruits.",
      },
      {
        en: "You've identified and are actively measuring your primary acquisition channel.",
        fr: "Tu as identifié ton canal d'acquisition principal et tu le mesures activement.",
      },
    ],
    weaknesses: [
      {
        en: "You're not tracking retention, so churn is happening invisibly.",
        fr: "Tu ne suis pas ta rétention, donc le churn se produit sans que tu le voies.",
      },
      {
        en: 'Your "aha" moment exists but isn\'t measured or optimized yet.',
        fr: "Ton moment « aha » existe mais n'est ni mesuré ni optimisé.",
      },
    ],
    recommendation: {
      en: "Set up a D7/D30 retention dashboard before investing further in acquisition.",
      fr: "Mets en place un suivi de rétention J7/J30 avant d'investir davantage en acquisition.",
    },
  },
  roast: {
    // Literal DESIGN-BRIEF.md example (screen 04's verdict-line copy).
    headline: {
      en: "Not bad for someone whose users leave before the second week.",
      fr: "Pas mal pour quelqu'un dont les utilisateurs partent avant la deuxième semaine.",
    },
    // Roast only shows ONE strength card ("Credit where it's due" —
    // DESIGN-BRIEF.md §04) — the UI drops strengths[1], not this data.
    strengths: [
      {
        en: "Your pricing has been tested and your expansion playbook is already paying off.",
        fr: "Ton pricing a été testé et ton playbook d'expansion porte déjà ses fruits.",
      },
      {
        en: "You've identified and are actively measuring your primary acquisition channel.",
        fr: "Tu as identifié ton canal d'acquisition principal et tu le mesures activement.",
      },
    ],
    weaknesses: [
      // Literal DESIGN-BRIEF.md roast calibration example.
      {
        en: "Your retention took one look at your product and rode straight past the finish line.",
        fr: "Votre rétention a jeté un œil à votre produit et a filé droit vers la ligne d'arrivée.",
      },
      {
        en: 'Your users find the "aha" moment eventually — if they stick around long enough to trip over it.',
        fr: "Ton moment « aha », tes utilisateurs finissent par le trouver — s'ils restent assez longtemps pour tomber dessus.",
      },
    ],
    recommendation: {
      en: "Fix retention before you burn one more euro on acquisition.",
      fr: "Corrige ta rétention avant de cramer un euro de plus en acquisition.",
    },
  },
};

function resolve(content: Translatable, locale: Locale): string {
  return tc(content, locale);
}

/** Resolves the fixed sample verdict for one tone/locale — same shape as a real Verdict, `modelUsed: "sample"` marks it as never AI-generated. */
export function getSampleVerdict(tone: Tone, locale: Locale): Verdict {
  const content = SAMPLE_VERDICTS[tone];
  return {
    headline: resolve(content.headline, locale),
    strengths: [resolve(content.strengths[0], locale), resolve(content.strengths[1], locale)],
    weaknesses: [resolve(content.weaknesses[0], locale), resolve(content.weaknesses[1], locale)],
    recommendation: resolve(content.recommendation, locale),
    modelUsed: "sample",
  };
}
