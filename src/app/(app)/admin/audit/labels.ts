import type { AcvBand, ContractTerm, Mandate } from "@/lib/audit/schema";
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
