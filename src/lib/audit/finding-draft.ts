import { BRIEF_WORD_BUDGET, type Brief, type Finding, type Gap, type SystemCause } from "./schema";
import { splitAtBudget, wordCount } from "./findings";

/**
 * finding-draft.ts — ce qu'un constat doit porter pour exister, et ce que le
 * bloc de tête coûte en mots.
 *
 * Même motif que `entry-fields.ts` et `criterion-fields.ts` : pur, et testé
 * CONTRE le validateur plutôt qu'en répétant sa règle. Un formulaire qui
 * accepte un constat que l'export refusera est un aller-retour découvert des
 * semaines plus tard, quand le fichier part.
 *
 * **Trois choses seulement bloquent** : au moins une valeur référencée, un
 * écart, et une cause système. Le reste du 5C et le Decision Ledger partent
 * en chaînes vides si on les laisse vides — c'est voulu, et c'est la même
 * discipline que partout dans cet outil : le fichier dit ce qui reste à
 * faire plutôt que d'interdire de l'enregistrer.
 *
 * **Pourquoi l'écart et la cause bloquent, eux.** Ce sont des vocabulaires
 * FERMÉS (quatre écarts, cinq causes système), donc il n'existe pas de
 * « vide » valide : le validateur exige une des valeurs de la liste. Les
 * défauter reviendrait à écrire à la place de l'auditeur une phrase qui
 * s'imprimera dans un livrable — exactement ce que le statut d'une ligne ne
 * fait jamais (1.3a : rien n'est présélectionné).
 *
 * **Et la cause système est une liste fermée pour une raison de fond** : un
 * champ libre finirait par nommer quelqu'un. « Personne n'en est
 * propriétaire » est un constat sur l'organisation ; « Marc ne l'a jamais
 * fait » est un constat sur Marc, et ça n'a pas sa place dans ce document.
 */
export interface FindingDraft {
  id: string;
  title: string;
  refs: { metricId: string }[];
  gap?: Gap;
  cause?: SystemCause;
  criteria: string;
  condition: string;
  consequence: string;
  correctiveAction: string;
  ledger: { problem: string; evidence: string; hypothesis: string; decision: string; expected: string };
  agreedAction?: { action: string; ownerRole?: string; date?: string };
  headline: boolean;
  priority: boolean;
}

/** Ce qui manque pour enregistrer, dans l'ordre du formulaire. */
export const REQUIRED_FINDING_FIELDS = ["refs", "gap", "cause"] as const;
export type RequiredFindingField = (typeof REQUIRED_FINDING_FIELDS)[number];

export function missingFindingFields(draft: FindingDraft): RequiredFindingField[] {
  return REQUIRED_FINDING_FIELDS.filter((field) => {
    if (field === "refs") return draft.refs.length === 0;
    return draft[field] === undefined;
  });
}

/** Un brouillon vierge, rattaché aux valeurs d'où il part. */
export function emptyDraft(id: string, metricIds: readonly string[]): FindingDraft {
  return {
    id,
    title: "",
    refs: metricIds.map((metricId) => ({ metricId })),
    criteria: "",
    condition: "",
    consequence: "",
    correctiveAction: "",
    ledger: { problem: "", evidence: "", hypothesis: "", decision: "", expected: "" },
    headline: false,
    priority: false,
  };
}

/** Le brouillon d'un constat déjà enregistré — pour le rouvrir tel qu'il est. */
export function draftOf(finding: Finding): FindingDraft {
  return {
    id: finding.id,
    title: finding.title,
    refs: finding.refs.map((ref) => ({ metricId: ref.metricId })),
    gap: finding.gap,
    cause: finding.cause,
    criteria: finding.criteria,
    condition: finding.condition,
    consequence: finding.consequence,
    correctiveAction: finding.correctiveAction,
    ledger: {
      problem: finding.ledger.problem,
      evidence: finding.ledger.evidence,
      hypothesis: finding.ledger.hypothesis,
      decision: finding.ledger.decision,
      expected: finding.ledger.expected,
    },
    ...(finding.agreedAction ? { agreedAction: { ...finding.agreedAction } } : {}),
    headline: finding.headline,
    priority: finding.priority,
  };
}

/**
 * Le constat enregistrable, ou `null` tant qu'il manque quelque chose.
 *
 * `actual` / `learning` / `next` du Ledger ne sont JAMAIS écrits ici : ils se
 * remplissent à la passe suivante, quand on sait ce qui s'est passé. Les
 * poser vides maintenant donnerait un champ à remplir à la rédaction, ce qui
 * est exactement l'inverse de leur usage.
 *
 * `agreedAction` n'est écrit que s'il porte une action : un objet vide
 * voyagerait dans le fichier en promettant un accord qui n'a pas eu lieu.
 */
export function buildFinding(draft: FindingDraft): Finding | null {
  if (missingFindingFields(draft).length > 0) return null;
  const action = draft.agreedAction?.action.trim() ?? "";
  return {
    id: draft.id,
    title: draft.title.trim(),
    refs: draft.refs.map((ref) => ({ metricId: ref.metricId })),
    gap: draft.gap!,
    cause: draft.cause!,
    criteria: draft.criteria.trim(),
    condition: draft.condition.trim(),
    consequence: draft.consequence.trim(),
    correctiveAction: draft.correctiveAction.trim(),
    ledger: {
      problem: draft.ledger.problem.trim(),
      evidence: draft.ledger.evidence.trim(),
      hypothesis: draft.ledger.hypothesis.trim(),
      decision: draft.ledger.decision.trim(),
      expected: draft.ledger.expected.trim(),
    },
    ...(action
      ? {
          agreedAction: {
            action,
            ...(draft.agreedAction?.ownerRole?.trim() ? { ownerRole: draft.agreedAction.ownerRole.trim() } : {}),
            ...(draft.agreedAction?.date?.trim() ? { date: draft.agreedAction.date.trim() } : {}),
          },
        }
      : {}),
    headline: draft.headline,
    priority: draft.priority,
  };
}

// ---------------------------------------------------------------------------
// Le budget du bloc de tête
// ---------------------------------------------------------------------------

export interface BriefBudget {
  words: number;
  budget: number;
  /** Ce qui bascule en annexe — jamais coupé, montré. */
  overflow: string;
  over: boolean;
}

/**
 * Le budget porte sur le BLOC, pas sur chacun de ses trois champs : le §4.1
 * du readout donne 400 mots au bloc de tête entier. Le dépassement est donc
 * calculé sur les trois mis bout à bout dans l'ordre de lecture — constat
 * principal, action, preuve — ce qui dit exactement ce qui basculerait en
 * annexe si on s'arrêtait au budget.
 *
 * Rien n'est jamais coupé : `splitAtBudget` rend les deux moitiés, l'écran
 * montre la seconde, et c'est l'auditeur qui décide de raccourcir. Un texte
 * tronqué en silence dans un livrable est la pire des issues.
 */
export function briefBudget(brief: Brief, budget = BRIEF_WORD_BUDGET): BriefBudget {
  const joined = [brief.mainFinding, brief.priorityAction, brief.proof]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ");
  const words = wordCount(joined);
  const { overflow } = splitAtBudget(joined, budget);
  return { words, budget, overflow, over: words > budget };
}
