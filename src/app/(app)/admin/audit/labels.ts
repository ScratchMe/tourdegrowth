import type { AuditPillar } from "@/content/audit-catalog";
import type { ObservationGap } from "@/lib/audit/observation-fields";
import type { Quadrant } from "@/lib/audit/quadrants";
import type { ChaseState } from "@/lib/audit/tracking";
import type {
  AbsentCause,
  AcvBand,
  Confidence,
  ContractTerm,
  Mandate,
  CriterionKind,
  MandateLevel,
  MetricDefinition,
  ObtainedHow,
  PeriodType,
  RepairScale,
  SourceKind,
  SystemCause,
  ValueStatus,
} from "@/lib/audit/schema";
import type { AuditProfileModel } from "@/lib/audit/profiles";

/**
 * Les libellés français des vocabulaires fermés du schéma.
 *
 * L'outil est en français quelle que soit la langue du livrable (`q9` :
 * `deliverableLocale` est un champ de mission, pas la langue de l'écran) —
 * donc pas de dictionnaire, pas de `Translatable`, pas d'îlot qui rapatrie
 * `UI_STRINGS` dans son bundle (R2-14). Des constantes, ici.
 *
 * Chaque table est typée `Record<T, string>` : ajouter une valeur au schéma
 * sans lui donner de libellé ne compile pas.
 */
export const MANDATE_LABELS: Record<Mandate, string> = {
  "no-mandate": "Sans mandat",
  mandated: "Avec mandat",
};

export const PROFILE_MODEL_LABELS: Record<AuditProfileModel, string> = {
  "b2b-assiste": "B2B assisté (commerciaux)",
  "b2b-selfserve": "B2B self-serve",
  b2c: "B2C",
  marketplace: "Marketplace",
};

export const ACV_BAND_LABELS: Record<AcvBand, string> = {
  "lt-5k": "Moins de 5 k",
  "5k-25k": "5 k à 25 k",
  "25k-100k": "25 k à 100 k",
  "100k-250k": "100 k à 250 k",
  "gt-250k": "Plus de 250 k",
  "not-applicable": "Sans objet",
};

export const CONTRACT_TERM_LABELS: Record<ContractTerm, string> = {
  monthly: "Mensuel",
  annual: "Annuel",
  "multi-year": "Pluriannuel",
  transactional: "Transactionnel",
};

/** `["a","b"]` + une table → les options d'un `Select`, dans l'ordre du schéma. */
export function optionsFrom<Id extends string>(ids: readonly Id[], labels: Record<Id, string>) {
  return ids.map((id) => ({ id, label: labels[id] }));
}

/**
 * Les sept statuts. Les libellés disent ce que le statut AFFIRME, pas un
 * jargon de schéma : « communiqué sans définition » est le cas modal en
 * entreprise financée, et il compte pour moitié dans chaque sens
 * (`coverage.ts`) — le libellé doit donc se lire comme un constat, pas comme
 * une case.
 */
export const VALUE_STATUS_LABELS: Record<ValueStatus, string> = {
  measured: "Mesuré",
  estimated: "Estimé",
  "reported-without-definition": "Communiqué sans définition",
  contested: "Contesté (deux chiffres divergents)",
  absent: "L'entreprise ne l'a pas",
  "not-accessible": "Pas accessible (mon accès)",
  "not-applicable": "Hors profil",
};

/** Une phrase d'aide par statut — ce que choisir celui-ci veut dire, pas sa définition. */
export const VALUE_STATUS_HINTS: Record<ValueStatus, string> = {
  measured: "Le chiffre existe, sa définition est établie, je peux le reconstruire.",
  estimated: "Le chiffre existe mais repose sur une approximation assumée.",
  "reported-without-definition": "On me donne un chiffre que personne ne sait reconstruire. Compte pour moitié des deux côtés.",
  contested: "Deux sources donnent deux chiffres. C'est un constat en soi, pas un problème de collecte.",
  absent: "Personne dans l'entreprise ne peut produire ce chiffre aujourd'hui.",
  "not-accessible": "Un fait sur mon accès, jamais sur eux. Ce qui le débloquerait est politique.",
  "not-applicable": "Posé depuis le catalogue selon le profil — jamais choisi à la main.",
};

export const ABSENT_CAUSE_LABELS: Record<AbsentCause, string> = {
  "not-instrumented": "Pas instrumenté (l'événement n'existe pas)",
  "not-computed": "Pas calculé (la donnée existe, personne ne l'agrège)",
  "not-reliable": "Pas fiable (le chiffre existe et personne ne s'y fie)",
  "type-not-established": "Type d'absence pas encore établi",
};

export const SYSTEM_CAUSE_LABELS: Record<SystemCause, string> = {
  "no-owner": "Personne n'en est propriétaire",
  "tool-does-not-emit": "L'outil ne l'émet pas",
  "definition-never-settled": "La définition n'a jamais été tranchée",
  "data-exists-nobody-queries": "La donnée existe, personne ne l'interroge",
  "collection-stopped": "La collecte s'est arrêtée",
};

/** q10 : une échelle fermée, jamais un nombre d'heures inventé (AUDIT-PLAN.md §3.3, décision 4). */
export const REPAIR_SCALE_LABELS: Record<RepairScale, string> = {
  meeting: "Une réunion",
  afternoon: "Une après-midi",
  sprint: "Un sprint",
  quarter: "Un trimestre",
};

/**
 * Les champs d'une `MetricDefinition`. Les quatre premiers sont requis par le
 * validateur (`REQUIRED_DEFINITION_FIELDS`) ; les suivants sont les axes qui
 * font qu'un même chiffre veut dire deux choses.
 */
export const DEFINITION_FIELD_LABELS = {
  unit: "Unité",
  numeratorPopulation: "Population au numérateur",
  denominatorPopulation: "Population au dénominateur",
  scope: "Périmètre",
  grossOrNet: "Brut ou net",
  cohortOrSnapshot: "Cohorte ou photo",
  countingRule: "Règle de comptage",
  attributionModel: "Modèle d'attribution",
  attributionWindow: "Fenêtre d'attribution",
  costsIncluded: "Coûts inclus",
  costsExcluded: "Coûts exclus",
  horizon: "Horizon",
  toolDefault: "C'est le réglage par défaut de l'outil, que personne n'a choisi",
} as const satisfies Record<keyof Omit<MetricDefinition, "id" | "version" | "metricId">, string>;

export const PERIOD_TYPE_LABELS: Record<PeriodType, string> = {
  month: "Un mois",
  quarter: "Un trimestre",
  year: "Une année",
  "rolling-12m": "12 mois glissants",
  point: "Un instant (photo)",
};

/**
 * Les sortes de source, DANS L'ORDRE du schéma — du plus fiable au moins
 * fiable, et cet ordre est ce que `confidenceOf` lit. Les libellés disent
 * qui a produit le chiffre, parce que c'est ça qui fait la fiabilité : un
 * export tiré par quelqu'un d'autre peut être filtré sans qu'on le sache.
 */
export const SOURCE_KIND_LABELS: Record<SourceKind, string> = {
  "raw-extract-self": "Extrait brut, tiré par moi",
  "export-by-other": "Export fourni par quelqu'un d'autre",
  "aggregated-report": "Rapport déjà agrégé",
  "homemade-spreadsheet": "Tableur maison",
  "stated-orally": "Dit à l'oral",
  "interested-party": "Donné par une partie intéressée",
};

export const OBTAINED_HOW_LABELS: Record<ObtainedHow, string> = {
  "self-service": "En libre-service",
  "export-received": "Export reçu",
  oral: "À l'oral",
  "dashboard-capture": "Capture d'un tableau de bord",
};

/** Affichée, jamais saisie : une confiance notée au ressenti ne se défend pas en réunion. */
export const CONFIDENCE_LABELS: Record<Confidence, string> = {
  high: "Confiance haute",
  medium: "Confiance moyenne",
  low: "Confiance basse",
};

/**
 * Ce qui manque encore à une série, dit à l'auditeur plutôt qu'au validateur.
 * Liste fermée côté `observation-fields.ts` : l'écran choisit sa phrase, il
 * n'invente pas de manque.
 */
export const OBSERVATION_GAP_TEXT: Record<ObservationGap, string> = {
  "needs-value": "Il manque au moins une observation qui porte une valeur — une observation en attente ne suffit pas à dire « mesuré ».",
  "needs-second": "Contesté garde les deux chiffres côte à côte : il en faut une seconde. Un seul chiffre n'est pas un désaccord.",
};

/**
 * Les trois sortes de repère. Les libellés disent D'OÙ vient le seuil, parce
 * que c'est ça qui décide s'il est opposable : un chiffre de rapport public,
 * un seuil de praticien qu'on assume et qu'on argumente (q5), ou l'entreprise
 * comparée à elle-même.
 */
export const CRITERION_KIND_LABELS: Record<CriterionKind, string> = {
  "public-benchmark": "Repère public (rapport, étude)",
  "argued-threshold": "Seuil argumenté (praticien)",
  "internal-trend": "Tendance interne (eux contre eux-mêmes)",
};

/** Ce qui débloquerait une ligne — politique, jamais technique. */
export const MANDATE_LEVEL_LABELS: Record<MandateLevel, string> = {
  none: "Rien à débloquer",
  peer: "Un pair",
  director: "Un directeur",
  exec: "Le comité de direction",
};

export const CHASE_STATE_LABELS: Record<ChaseState, string> = {
  "not-requested": "Pas encore demandé",
  waiting: "En attente",
  overdue: "À relancer",
  received: "Reçu",
};

/**
 * Les huit quadrants méthode × réalité, dits comme on les dirait en réunion.
 *
 * Deux choix d'écriture qui portent tout le sens de cet écran :
 * - **« angle mort » nomme le croisement, pas la ligne.** Ce n'est pas un
 *   reproche sur le chiffre manquant, c'est l'écart entre ce que l'équipe
 *   croit mesurer et ce qu'elle peut montrer — et c'est cet écart qui vaut
 *   le déplacement.
 * - **« non vérifiable » est un fait sur mon accès, jamais sur eux.** La
 *   ligne existe peut-être très bien ; c'est moi qui n'ai pas pu la voir, et
 *   le livrable doit le dire dans ce sens-là.
 */
export const QUADRANT_LABELS: Record<Quadrant, string> = {
  "measured-good": "Documenté, le repère est tenu",
  "measured-bad": "Documenté, le repère n'est pas tenu",
  "measured-no-benchmark": "Documenté, aucun repère ne tranche",
  "blind-spot": "Angle mort — déclaré mesuré, rien ne le documente",
  "known-gap": "Écart connu",
  "unverifiable": "Non vérifiable — pas d'accès de mon côté",
  "not-applicable": "Hors profil",
  pending: "Pas encore examiné",
};

/**
 * Les noms d'étape restent en anglais dans les deux langues du produit, pour
 * préserver l'acronyme AARRR (convention du projet, SPEC.md l'emploie ainsi
 * dans sa propre prose française). Seul `transverse`, qui n'est pas une
 * étape du cadre, se dit en français.
 */
export const AUDIT_PILLAR_LABELS: Record<AuditPillar, string> = {
  acquisition: "Acquisition",
  activation: "Activation",
  retention: "Retention",
  referral: "Referral",
  revenue: "Revenue",
  transverse: "Transverse",
};
