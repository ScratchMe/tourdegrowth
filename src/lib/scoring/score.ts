import { QUESTIONS } from "@/content/copy-library";
import { computeScoreFrom, type Answers, type ScoringResult } from "./compute";

/**
 * score.ts — le point d'entrée du scoring pour toute l'application.
 *
 * La formule et ses types vivent dans `./compute`, qui n'importe aucun
 * contenu (voir l'en-tête de ce fichier-là pour le pourquoi). Ici, une seule
 * chose : l'appel avec les 15 vraies questions de `content/copy-library.ts`.
 *
 * Answer options and their point values live directly on each question in
 * `content/copy-library.ts` (3 options per question, 20/7/0 points) — the
 * delivered content library from the product agent (SPEC.md §12).
 *
 * Real, signalled change from the previously-shipped engine: the original
 * build used a fixed `ANSWER_POINTS = [0, 7, 13, 20]` array with 4 options
 * per question, because SPEC.md §6's text said "4 valeurs par réponse" even
 * though the design mock only ever showed 3 buttons (documented at the
 * time as a deliberate arbitration in favor of the spec text). The
 * delivered copy-library.ts only ever has 3 options — the product agent's
 * actual final content supersedes that earlier call. Points are now read
 * per-option from the question itself rather than a separate universal
 * array, which is both more correct (no assumption that every question
 * shares one scale) and removes the now-obsolete 4-way index.
 */
export { computeScoreFrom, findWeakestPillar } from "./compute";
export type { AnswerIndex, Answers, PillarScore, ScoredQuestion, ScoringResult } from "./compute";

/** The score of the 15 delivered questions. See `computeScoreFrom` for the rules. */
export function computeScore(answers: Answers): ScoringResult {
  return computeScoreFrom(answers, QUESTIONS);
}
