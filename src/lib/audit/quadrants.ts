import type { AuditCatalogRow } from "@/content/audit-catalog";
import { computeScoreFrom, type Answers, type ScoredQuestion, type ScoringResult } from "@/lib/scoring/compute";
import { latestObservation, type Entry, type Pass } from "./schema";

/**
 * quadrants.ts — le croisement « méthode × réalité » (Method vs Reality,
 * document de l'expert §5), ligne par ligne.
 *
 * L'axe MÉTHODE est la réponse du Tour à la question qui porte littéralement
 * sur le fait de mesurer cette ligne (`row.tourQuestionId`, remplie par
 * l'auditeur, jamais en auto-évaluation). L'axe RÉALITÉ est le statut de
 * l'entrée et, quand il y a un critère, le verdict du chiffre contre lui.
 *
 * Les états, et ce que chacun dit à une direction :
 * - `measured-good` / `measured-bad` : documenté, et un repère tranche ;
 * - `measured-no-benchmark` : documenté, mais aucun repère ne peut trancher
 *   (pas de critère, valeur non numérique, ou `betterWhen: contextual`) — le
 *   readout l'écrit, il n'invente pas de verdict ;
 * - `blind-spot` : l'équipe déclare mesurer (réponse à 20 points) et rien ne
 *   le documente. C'est le quadrant le plus rentable de l'exercice : la
 *   maturité déclarée est haute, le système réel est faible ;
 * - `known-gap` : non documenté, et l'équipe le sait (ou aucune question du
 *   Tour ne porte dessus) ;
 * - `unverifiable` : non accessible — un fait sur mon accès, pas sur eux ;
 * - `not-applicable` et `pending` : hors profil, ou pas encore examiné.
 *
 * Les 15 questions du Tour arrivent en PARAMÈTRE et ne sont jamais lues
 * ici : ce module doit rester sans dépendance au contenu pour que l'îlot de
 * `/admin/audit` n'embarque pas `copy-library.ts` (AUDIT-PLAN.md §3.4/1.1).
 * L'appelant les obtient de `./server#tourQuestions` côté serveur, ou de
 * `QUESTIONS` dans un test.
 */
export const QUADRANTS = [
  "measured-good",
  "measured-bad",
  "measured-no-benchmark",
  "blind-spot",
  "known-gap",
  "unverifiable",
  "not-applicable",
  "pending",
] as const;
export type Quadrant = (typeof QUADRANTS)[number];

export type CriterionVerdict = "good" | "bad" | null;

/** Le point de la réponse choisie (20, 7 ou 0), ou `null` sans réponse. */
export function practicePoints(
  questionId: string,
  answers: Partial<Answers>,
  questions: readonly ScoredQuestion[],
): number | null {
  const question = questions.find((q) => q.id === questionId);
  const index = answers[questionId];
  if (!question || index === undefined) return null;
  return question.options[index]?.points ?? null;
}

/** Une réponse à 20 points = « nous mesurons ceci ». */
export function declaresMeasured(
  questionId: string | undefined,
  answers: Partial<Answers>,
  questions: readonly ScoredQuestion[],
): boolean {
  if (!questionId) return false;
  return practicePoints(questionId, answers, questions) === 20;
}

/**
 * Le verdict de la dernière observation contre le critère. `null` dès que
 * quelque chose manque : pas de critère, pas de valeur numérique, ou une ligne
 * dont le sens d'un « mieux » dépend du contexte.
 */
export function criterionVerdict(row: AuditCatalogRow, entry: Entry): CriterionVerdict {
  const target = entry.criterion?.value;
  const latest = latestObservation(entry);
  if (target === undefined || latest === undefined || typeof latest.value !== "number") return null;
  if (row.betterWhen === "contextual") return null;
  if (latest.value === target) return "good";
  const better = row.betterWhen === "higher" ? latest.value > target : latest.value < target;
  return better ? "good" : "bad";
}

export function methodVsReality(
  row: AuditCatalogRow,
  entry: Entry | undefined,
  answers: Partial<Answers>,
  questions: readonly ScoredQuestion[],
): Quadrant {
  if (!entry) return "pending";
  switch (entry.status) {
    case "not-applicable":
      return "not-applicable";
    case "measured":
    case "estimated":
    case "reported-without-definition": {
      const verdict = criterionVerdict(row, entry);
      return verdict === "good" ? "measured-good" : verdict === "bad" ? "measured-bad" : "measured-no-benchmark";
    }
    case "not-accessible":
      return "unverifiable";
    case "absent":
    case "contested":
      return declaresMeasured(row.tourQuestionId, answers, questions) ? "blind-spot" : "known-gap";
  }
}

/** Le score du Tour de cette passe — `null` tant que les 15 réponses ne sont pas là. */
export function tourScore(pass: Pass, questions: readonly ScoredQuestion[]): ScoringResult | null {
  const answered = Object.keys(pass.tourAnswers).length;
  if (answered < questions.length) return null;
  return computeScoreFrom(pass.tourAnswers as Answers, questions);
}
