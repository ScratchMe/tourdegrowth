import { PILLARS, type Pillar } from "./pillars";

/**
 * compute.ts — le moteur de score, sans aucune dépendance au contenu.
 *
 * La formule et les types vivaient dans `score.ts`, qui importe `QUESTIONS`
 * de `content/copy-library.ts` — donc quiconque voulait la formule tirait
 * aussi les 483 lignes de la bibliothèque de copie. C'est ce qui empêchait
 * `lib/audit/quadrants.ts` (et, derrière lui, l'îlot de `/admin/audit`) de
 * rester léger : AUDIT-PLAN.md §3.4/1.1 demandait un `computeScoreFrom`
 * dans `score.ts`, mais l'y laisser n'aurait rien changé au bundle, qui est
 * le but de l'étape. Écart signalé, pas silencieux.
 *
 * `score.ts` reste le point d'entrée de toute l'app : il réexporte tout ce
 * fichier et n'ajoute que `computeScore`, l'appel avec les 15 vraies
 * questions. Aucun importeur existant ne change, aucun test du moteur non
 * plus — c'est le critère de cette étape.
 *
 * La formule elle-même est inchangée : sommer les 3 points bruts d'un
 * pilier, arrondir à l'entier, puis sommer les 5 scores DÉJÀ arrondis pour
 * le total (SPEC.md §6) — jamais une moyenne recalculée des points bruts.
 */
export type AnswerIndex = 0 | 1 | 2;

export type Answers = Record<string, AnswerIndex>;

export interface PillarScore {
  pillar: Pillar;
  /** Sum of the 3 raw answer points for this pillar, 0-60. */
  rawPoints: number;
  /** rawPoints scaled to /20 and rounded to the nearest integer — always an
   * integer per SPEC.md §6 ("jamais 07.5/20"). */
  score: number;
}

export interface ScoringResult {
  /** One entry per pillar, in canonical AARRR order. */
  pillars: PillarScore[];
  /** Sum of the already-rounded pillar scores, 0-100 — NOT a recomputed
   * average of raw points (SPEC.md §6: this is what keeps the displayed
   * total always adding up to what's shown per pillar). */
  total: number;
  /** The lowest-scoring pillar; ties broken by canonical AARRR order
   * (SPEC.md §6). */
  weakestPillar: Pillar;
}

/**
 * The shape the engine actually needs from a question: which pillar it
 * belongs to, and what each option is worth. `CopyLibraryQuestion` satisfies
 * it structurally, so `computeScore` passes `QUESTIONS` straight through —
 * but nothing here depends on the copy library's labels, locales or types.
 */
export interface ScoredQuestion {
  id: string;
  pillar: Pillar;
  options: readonly { points: number }[];
}

function isAnswerIndex(value: unknown): value is AnswerIndex {
  return value === 0 || value === 1 || value === 2;
}

/**
 * The deterministic, rule-based score for a completed questionnaire. Pure:
 * same input always produces the same output. Nothing — not Gemini, not the
 * Deep dive — ever feeds back into this (CLAUDE.md non-negotiable, reinforced
 * by SPEC-ADDENDUM-01.md §2.1: "le score chiffré ne change jamais entre Quick
 * et Détaillé").
 *
 * Throws if any question is missing or has an answer index that names no
 * option. That's an assertion, not a recoverable user-facing error: the
 * questionnaire UI must never call this before every question is answered.
 */
export function computeScoreFrom(answers: Answers, questions: readonly ScoredQuestion[]): ScoringResult {
  const pillars: PillarScore[] = PILLARS.map((pillar) => {
    const rawPoints = questions
      .filter((q) => q.pillar === pillar)
      .reduce((sum, question) => {
        const answerIndex = answers[question.id];
        const option = isAnswerIndex(answerIndex) ? question.options[answerIndex] : undefined;
        if (!option) {
          throw new Error(`Missing or invalid answer for question "${question.id}"`);
        }
        return sum + option.points;
      }, 0);

    // Round THIS pillar to the nearest integer now, before it's summed into
    // the total below — rounding after summing would silently break the
    // "these 5 numbers add up to that total" guarantee SPEC.md §6 asks for.
    const score = Math.round(rawPoints / 3);

    return { pillar, rawPoints, score };
  });

  const total = pillars.reduce((sum, p) => sum + p.score, 0);

  return { pillars, total, weakestPillar: findWeakestPillar(pillars) };
}

/**
 * The lowest-scoring pillar. On a tie, the pillar that appears first in
 * canonical AARRR order wins — simple, deterministic, per SPEC.md §6.
 */
export function findWeakestPillar(pillars: readonly PillarScore[]): Pillar {
  const [first, ...rest] = pillars;
  if (!first) {
    throw new Error("findWeakestPillar requires at least one pillar score");
  }
  return rest.reduce((weakest, candidate) => (candidate.score < weakest.score ? candidate : weakest), first)
    .pillar;
}
