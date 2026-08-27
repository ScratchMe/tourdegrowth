import { PILLARS, type Pillar } from "./pillars";

export interface Question {
  /** Stable id, `${pillar}-${1|2|3}` — used as the key in the Answers record. */
  id: string;
  pillar: Pillar;
}

/**
 * The 15 questions (3 per pillar, canonical AARRR order), structure only.
 *
 * // TODO: la copie affichée (texte des questions et des réponses, FR + EN)
 * n'est pas encore fournie par l'agent produit — voir SPEC.md §12, qui liste
 * explicitement "copie française complète des 15 questions" comme non
 * tranchée. Cette structure (id -> pilier) est en revanche définitive : elle
 * fixe la répartition des questions pour le moteur de scoring. Le texte lui-
 * même vivra dans le dictionnaire i18n (étape 4 du plan de build), initialisé
 * avec les exemples de SPEC.md §6 marqués comme temporaires.
 */
export const QUESTIONS: readonly Question[] = PILLARS.flatMap((pillar) =>
  ([1, 2, 3] as const).map((n): Question => ({ id: `${pillar}-${n}`, pillar })),
);
