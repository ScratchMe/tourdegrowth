import type { Criterion, CriterionKind } from "./schema";

/**
 * criterion-fields.ts — ce qu'un repère demande selon sa sorte.
 *
 * Même motif qu'`entry-fields.ts` et `observation-fields.ts` : pur, testé
 * contre le validateur plutôt qu'en redisant sa règle, et lu à côté de lui.
 *
 * **Le validateur n'exige qu'une chose** — l'argument d'un seuil argumenté
 * (q5 : un seuil de praticien est admis s'il est argumenté). Le reste de ce
 * module n'est pas de la validation mais de la **provenance** : un repère
 * public sans sa source, sa population et son année est un nombre que
 * personne ne peut défendre en réunion, et c'est précisément le genre de
 * chiffre qu'un audit existe pour ne plus produire. L'écran les demande donc,
 * sans les imposer.
 */
export const CRITERION_FIELD_GROUPS = ["value", "provenance", "argument", "comparability"] as const;
export type CriterionFieldGroup = (typeof CRITERION_FIELD_GROUPS)[number];

export function criterionFieldGroups(kind: CriterionKind): CriterionFieldGroup[] {
  switch (kind) {
    case "public-benchmark":
      // D'où il vient, sur qui il porte, quand — et sa définition, parce
      // qu'un « churn médian de 3 % » ne veut rien dire tant qu'on ne sait
      // pas si c'est du logo ou du revenu.
      return ["value", "provenance", "comparability"];
    case "argued-threshold":
      return ["value", "argument"];
    case "internal-trend":
      // Se compare à soi-même : ni source externe ni argument, mais la
      // période de référence doit être dite.
      return ["value", "comparability"];
  }
}

/**
 * Ce que le validateur REFUSERA, par opposition à ce que l'écran conseille.
 * Liste fermée, dans l'ordre du formulaire.
 */
export const REQUIRED_CRITERION_FIELDS = ["justification"] as const;
export type RequiredCriterionField = (typeof REQUIRED_CRITERION_FIELDS)[number];

export function missingCriterionFields(criterion: Criterion): RequiredCriterionField[] {
  if (criterion.kind === "argued-threshold" && !criterion.justification?.trim()) return ["justification"];
  return [];
}

/**
 * La provenance manquante — signalée, jamais bloquante. Ce sont les champs
 * qu'un repère doit porter pour être opposable, pas ceux sans lesquels le
 * fichier est invalide.
 */
export function weakProvenance(criterion: Criterion): string[] {
  if (criterion.kind !== "public-benchmark") return [];
  const gaps: string[] = [];
  if (!criterion.source?.trim()) gaps.push("source");
  if (!criterion.population?.trim()) gaps.push("population");
  if (criterion.year === undefined) gaps.push("year");
  return gaps;
}
