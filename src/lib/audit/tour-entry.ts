import type { Answers, ScoredQuestion } from "@/lib/scoring/compute";
import { definitionRef, normalizeEntry, type Entry, type MetricDefinition, type Observation } from "./schema";
import { tourScore } from "./quadrants";

/**
 * tour-entry.ts — le Tour de l'auditeur devient une ligne comme les autres.
 *
 * `m19` est une ligne T0 : elle n'est pas collectée chez l'entreprise, elle
 * est **produite par l'audit lui-même**. Une fois les 15 réponses posées, le
 * score est un chiffre au même titre que le MRR — il doit donc porter tout ce
 * que le validateur exige d'une valeur mesurée : une définition enregistrée et
 * une observation valuée. Sans définition, le validateur refuserait
 * précisément la ligne que l'outil produit le mieux.
 *
 * **Rien n'est écrit tant que les 15 réponses ne sont pas là.** Un score
 * partiel n'existe pas (`tourScore` rend `null`), et poser une valeur
 * intermédiaire ferait entrer dans la couverture une ligne dont le chiffre
 * changera encore — exactement ce que « documenté » ne doit pas vouloir dire.
 */
export const TOUR_METRIC_ID = "m19";

/** L'identité de la définition du Tour. Stable : c'est toujours le même calcul. */
export const TOUR_DEFINITION_ID = "tour-score";

/**
 * La définition du score, écrite d'office plutôt que saisie. Elle décrit un
 * calcul que le code applique (`lib/scoring/compute.ts`), donc la laisser à la
 * main d'un opérateur n'ajouterait qu'une occasion de la décrire faux.
 */
export function tourDefinition(scope: string): MetricDefinition {
  return {
    id: TOUR_DEFINITION_ID,
    version: 1,
    metricId: TOUR_METRIC_ID,
    unit: "points sur 100",
    numeratorPopulation: "les 15 questions du Tour et leurs points (20 / 7 / 0 par réponse)",
    denominatorPopulation: "les 5 piliers AARRR, chacun arrondi à l'entier avant sommation",
    scope,
  };
}

export interface TourEntryResult {
  entry: Entry;
  definition: MetricDefinition;
  /** Le détail par pilier, pour l'écran — jamais stocké, il se recalcule. */
  total: number;
}

/**
 * La ligne `m19` pour un Tour complet, ou `null` tant qu'il ne l'est pas.
 *
 * La source est `raw-extract-self` — l'auditeur a tiré ce chiffre lui-même,
 * c'est la sorte la plus fiable de l'échelle, et c'est vrai : il n'y a pas
 * d'intermédiaire. `obtainedHow` est `self-service` pour la même raison.
 *
 * La période est un **point** et non un mois : le Tour photographie des
 * pratiques au moment des entretiens, il ne couvre pas un intervalle.
 */
export function buildTourEntry(
  answers: Partial<Answers>,
  questions: readonly ScoredQuestion[],
  scope: string,
  todayISO: string,
  existing?: Entry,
): TourEntryResult | null {
  const score = tourScore({ tourAnswers: answers } as Parameters<typeof tourScore>[0], questions);
  if (!score) return null;

  const observation: Observation = {
    // Stable : re-remplir le Tour remplace l'observation plutôt que d'en
    // empiler une seconde qui dirait la même chose à un jour près.
    id: `${TOUR_METRIC_ID}-score`,
    periodStart: todayISO,
    periodEnd: todayISO,
    periodType: "point",
    value: score.total,
    sourceKind: "raw-extract-self",
    obtainedHow: "self-service",
    asOf: todayISO,
  };

  return {
    total: score.total,
    definition: tourDefinition(scope),
    // `normalizeEntry` plutôt qu'un objet posé tel quel : la ligne pouvait être
    // marquée absente avant que le Tour soit rempli, et l'étalement de
    // `existing` garderait sa cause d'absence à côté d'un statut `measured` —
    // une contradiction que le validateur refuse, et que seule cette
    // normalisation retire au bon endroit pour tout le monde.
    entry: normalizeEntry({
      // Ce que l'auditeur a pu écrire sur cette ligne (décision en jeu,
      // exposition, pilotage) est conservé : seule la valeur est produite.
      ...(existing ?? { metricId: TOUR_METRIC_ID, status: "measured", observations: [] }),
      metricId: TOUR_METRIC_ID,
      status: "measured",
      definitionRef: definitionRef(TOUR_DEFINITION_ID, 1),
      observations: [observation],
    }),
  };
}
