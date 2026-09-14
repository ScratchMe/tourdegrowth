import type { AbsentCause, AcvBand, ContractTerm, Mandate, RepairScale, SystemCause, ValueStatus } from "@/lib/audit/schema";
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
