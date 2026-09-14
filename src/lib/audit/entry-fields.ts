import { type ValueStatus } from "./schema";

/**
 * entry-fields.ts — quels champs une entrée fait apparaître, selon son statut.
 *
 * Pur et testé à part, pour deux raisons. D'abord parce que c'est la règle
 * la plus facile à casser en éditant du JSX : un champ qui reste visible
 * après un changement de statut laisse saisir une donnée que le validateur
 * refusera plus tard, et le seul endroit où ça se verra est le message
 * d'erreur d'un export. Ensuite parce que la règle vient du schéma
 * (`validate.ts`), pas du dessin : elle doit se relire à côté de lui.
 *
 * Les groupes, et ce que chacun exige (AUDIT.md §3) :
 * - `absence` : cause (défaut `type-not-established`, jamais autre chose),
 *   coût de réparation REQUIS, cause système dans une liste fermée ;
 * - `value` : la définition versionnée et la série d'observations —
 *   `contested` en exige deux qui divergent, c'est le constat lui-même ;
 * - `access` : le niveau de mandat, parce qu'une ligne non accessible est un
 *   fait sur MON accès et pas sur l'entreprise, et que ce qui la débloquerait
 *   est politique, pas technique.
 */
export type EntryFieldGroup = "absence" | "value" | "access";

export function entryFieldGroups(status: ValueStatus): EntryFieldGroup[] {
  switch (status) {
    case "absent":
      return ["absence"];
    case "contested":
      // Contesté = deux chiffres qui ne disent pas la même chose. Il faut
      // donc les observations, ET la cause système qui explique pourquoi
      // personne n'a tranché.
      return ["absence", "value"];
    case "measured":
    case "estimated":
    case "reported-without-definition":
      return ["value"];
    case "not-accessible":
      return ["access"];
    case "not-applicable":
      return [];
  }
}

/**
 * Les statuts qu'un auditeur peut choisir sur une ligne APPLICABLE.
 *
 * `not-applicable` n'en est jamais : il est posé par `newPass` depuis
 * l'`appliesTo` du catalogue, avec sa raison, et le validateur le refuse
 * ailleurs. Le proposer à l'écran inviterait à vider le dénominateur ligne
 * par ligne — ce qui transformerait la couverture en opinion.
 */
export function selectableStatuses(all: readonly ValueStatus[]): ValueStatus[] {
  return all.filter((status) => status !== "not-applicable");
}
