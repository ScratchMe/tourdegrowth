import type { Locale } from "@/lib/i18n/locale";
import type { Tone } from "@/lib/quiz/tone";
import type { Pillar } from "@/lib/scoring/pillars";
import type { PillarScore } from "@/lib/scoring/score";

export interface PromptAnswer {
  pillar: Pillar;
  question: string;
  answer: string;
}

export interface PromptInput {
  locale: Locale;
  tone: Tone;
  /** Canonical-order pillar scores from computeScore() — read-only input, see SCORE_INSTRUCTION below. */
  pillars: PillarScore[];
  total: number;
  weakestPillar: Pillar;
  /** The 15 questions/answers, already resolved to display text at `locale` — this module does no i18n lookups itself. */
  answers: PromptAnswer[];
}

/**
 * The non-negotiable anti-mockery guardrail (SPEC.md §6bis / CLAUDE.md):
 * hard-coded here, always injected into the Roast system prompt, never left
 * to the model's judgement at call time.
 */
const ANTI_MOCKERY_GUARDRAIL: Record<Locale, string> = {
  en: "Non-negotiable rule: NEVER mock the person, their team, or anything outside the product itself (no comments on intelligence, effort, or character). The tone stays playful, never humiliating, and always targets the PRODUCT STRATEGY — never the individual. Reread every sentence before finalizing it and rewrite anything that could be read as a personal attack.",
  fr: "Règle non négociable : ne te moque JAMAIS de la personne, de son équipe, ou de tout ce qui est hors du produit (aucun commentaire sur l'intelligence, l'effort ou le caractère). Le ton reste joueur, jamais humiliant, et vise toujours la STRATÉGIE PRODUIT — jamais l'individu. Relis chaque phrase avant de la valider et reformule tout ce qui pourrait passer pour une attaque personnelle.",
};

const ROAST_CALIBRATION: Record<Locale, string> = {
  en: 'Style: sharper and wittier than a neutral consultant — but calibrated. At most ONE playful Franco-English turn of phrase across the whole response (never in every sentence — surprise is the point, predictability kills it). Example calibration, do not reuse verbatim: "Your acquisition has panache. Your retention, on the other hand, waved goodbye."',
  fr: "Ton : plus mordant qu'un consultant neutre, mais calibré. Au maximum UNE tournure franco-anglaise sur l'ensemble de la réponse (jamais à chaque phrase — l'effet de surprise se perd s'il est prévisible). Exemple de calibrage, à ne pas réutiliser tel quel : « Votre acquisition a du panache. Votre rétention, elle, a préféré dire au revoir. »",
};

const NEUTRAL_STYLE: Record<Locale, string> = {
  en: "Style: consultant tone — factual, constructive, kind. No sugar-coating, but no edge either.",
  fr: "Ton : consultant — factuel, constructif, bienveillant. Sans complaisance, mais sans mordant non plus.",
};

const PERSONA: Record<Locale, string> = {
  en: "You are a senior growth consultant reviewing a founder's self-assessment across the AARRR framework (Acquisition, Activation, Retention, Referral, Revenue).",
  fr: "Tu es un consultant growth senior qui relit l'auto-évaluation d'un fondateur sur le framework AARRR (Acquisition, Activation, Rétention, Referral, Revenue).",
};

/** CLAUDE.md non-negotiable: Gemini only ever comments on the score, never influences it. */
const SCORE_INSTRUCTION: Record<Locale, string> = {
  en: "The scores below are FINAL and already calculated — never recompute, contradict, or alter them. Your job is only to comment on what they mean, using the 15 answers as evidence.",
  fr: "Les scores ci-dessous sont DÉFINITIFS et déjà calculés — ne les recalcule jamais, ne les contredis jamais, ne les modifie jamais. Ton rôle est uniquement de les commenter, en t'appuyant sur les 15 réponses comme preuves.",
};

const OUTPUT_INSTRUCTION: Record<Locale, string> = {
  en: 'Respond with ONLY a valid JSON object, no markdown fences, no text before or after, matching exactly this schema (keys stay in English, only the VALUES are in the requested language):\n{"strengths": ["<pillar-grounded strength 1>", "<pillar-grounded strength 2>"], "weaknesses": ["<pillar-grounded improvement area 1>", "<pillar-grounded improvement area 2>"], "recommendation": "<one specific, prioritized next action>"}',
  fr: 'Réponds UNIQUEMENT avec un objet JSON valide, sans balises markdown, sans texte avant ou après, respectant exactement ce schéma (les clés restent en anglais, seules les VALEURS sont dans la langue demandée) :\n{"strengths": ["<force ancrée dans un pilier 1>", "<force ancrée dans un pilier 2>"], "weaknesses": ["<axe d\'amélioration ancré dans un pilier 1>", "<axe d\'amélioration ancré dans un pilier 2>"], "recommendation": "<une action prioritaire précise>"}',
};

/**
 * Builds the full prompt sent to Gemini — one of 4 variants (2 tones × 2
 * locales, CLAUDE.md non-negotiable). Pure string-building: no i18n lookups,
 * no network calls, trivially unit-testable.
 */
export function buildGeminiPrompt(input: PromptInput): string {
  const { locale, tone, pillars, total, weakestPillar, answers } = input;

  const styleBlock =
    tone === "roast" ? `${ROAST_CALIBRATION[locale]}\n\n${ANTI_MOCKERY_GUARDRAIL[locale]}` : NEUTRAL_STYLE[locale];

  const scoresBlock = pillars.map((p) => `- ${p.pillar}: ${p.score}/20`).join("\n");
  const answersBlock = answers.map((a, i) => `${i + 1}. [${a.pillar}] ${a.question} -> ${a.answer}`).join("\n");

  return [
    PERSONA[locale],
    styleBlock,
    SCORE_INSTRUCTION[locale],
    `Total: ${total}/100\n${scoresBlock}\nWeakest pillar: ${weakestPillar}`,
    `Answers:\n${answersBlock}`,
    OUTPUT_INSTRUCTION[locale],
  ].join("\n\n");
}
