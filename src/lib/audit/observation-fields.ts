import type { AuditCatalogRow } from "@/content/audit-catalog";
import type { Observation, ValueStatus } from "./schema";

/**
 * observation-fields.ts — quel éditeur de valeur une ligne appelle, et ce
 * qu'il manque encore à sa série.
 *
 * Pur et testé à part, pour la même raison qu'`entry-fields.ts` : la règle
 * vient du validateur, pas du dessin, et elle doit se relire à côté de lui.
 * Un écran qui laisse enregistrer une série que l'export refusera ne se voit
 * qu'au moment de l'export, c'est-à-dire trop tard.
 *
 * **Six formes de valeur, quatre éditeurs** (AUDIT-PLAN.md §3.3, décision 5).
 * `valueShape` est un INDICE du catalogue, pas une contrainte du schéma :
 * `ObservationValue` accepte déjà `number | string | boolean | Matrix | null`,
 * donc aucun changement de schéma n'est nécessaire pour les couvrir toutes.
 * Un couple, une distribution et un composite sont **la même matrice réduite
 * à une ligne** — un couple a deux colonnes, une distribution en a N. Leur
 * donner trois éditeurs séparés aurait été trois fois le même code, et trois
 * endroits où la forme stockée peut diverger.
 */
export const VALUE_EDITORS = ["number", "text", "row", "matrix"] as const;
export type ValueEditor = (typeof VALUE_EDITORS)[number];

export function valueEditorFor(shape: AuditCatalogRow["valueShape"]): ValueEditor {
  switch (shape) {
    case "scalar":
      return "number";
    case "qualitative":
      return "text";
    case "matrix":
      return "matrix";
    case "couple":
    case "distribution":
    case "composite":
      return "row";
  }
}

/**
 * Ce qui manque encore à la série d'une entrée, du point de vue du
 * validateur. Liste FERMÉE : l'écran choisit sa phrase, il n'en invente pas.
 *
 * - `needs-value` : `measured` / `estimated` exigent au moins une observation
 *   dont la valeur n'est pas nulle. Une observation sans valeur est légitime
 *   (« demandé, pas encore reçu »), elle ne suffit simplement pas.
 * - `needs-second` : `contested` garde les DEUX chiffres côte à côte. Un seul
 *   n'est pas un désaccord, c'est une mesure.
 */
export const OBSERVATION_GAPS = ["needs-value", "needs-second"] as const;
export type ObservationGap = (typeof OBSERVATION_GAPS)[number];

export function observationGaps(status: ValueStatus, observations: readonly Observation[]): ObservationGap[] {
  const gaps: ObservationGap[] = [];
  const withValue = observations.filter((obs) => obs.value !== null && obs.value !== undefined);
  if ((status === "measured" || status === "estimated") && withValue.length === 0) gaps.push("needs-value");
  if (status === "contested" && observations.length < 2) gaps.push("needs-second");
  return gaps;
}
