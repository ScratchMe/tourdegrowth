import { definitionRef, parseDefinitionRef, registerDefinition, type MetricDefinition, type Mission } from "./schema";

/**
 * definitions.ts — poser une définition sans jamais en modifier une qui sert.
 *
 * Une `MetricDefinition` est IMMUABLE et adressée par `id@version`
 * (AUDIT.md §3). La raison n'est pas la pureté : une observation référence
 * une version précise, donc éditer une définition en place changerait
 * rétroactivement ce que des chiffres déjà relevés veulent dire — et
 * personne ne s'en apercevrait. `registerDefinition` refuse d'écraser une
 * référence existante avec un contenu différent ; ce module est ce qui
 * décide, à l'écran, quelle version écrire.
 *
 * Trois cas, dans cet ordre :
 * 1. **Contenu identique à une version déjà enregistrée** → on réutilise sa
 *    référence. Rouvrir un formulaire et le fermer sans rien changer ne doit
 *    pas créer une v2 identique à la v1.
 * 2. **Aucune version pour cette métrique** → v1.
 * 3. **Contenu différent** → version suivante (max + 1), jamais une
 *    réécriture. C'est ce que le plan appelle « frapper une nouvelle
 *    version ».
 *
 * Le cas 1 ne tient que si un champ optionnel VIDE est indistinguable d'un
 * champ absent — un formulaire rend `""` là où le schéma n'a rien, et sans
 * `normalizeDraft` rouvrir l'écran frapperait une v2 dont le seul contenu
 * serait des chaînes vides. La normalisation est faite ICI, à la frontière,
 * plutôt qu'à chaque point d'appel (leçon des deux fuites `rawPoints`).
 */
export interface DefinitionDraft extends Omit<MetricDefinition, "id" | "version"> {
  /** L'identité stable de la définition — `metricId` par défaut, une mission n'en a qu'une par ligne. */
  id?: string;
}

export interface UpsertResult {
  mission: Mission;
  /** `definitionId@version` — à poser sur l'entrée. */
  ref: string;
  /** Vrai quand une nouvelle version a été frappée, pour que l'écran puisse le dire. */
  bumped: boolean;
}

/**
 * Ce qu'un formulaire produit et que le schéma n'a pas : chaîne vide, tableau
 * vide, espaces autour. Retirés — et les chaînes conservées sont rognées, pour
 * qu'une espace de trop ne frappe pas une version.
 */
export function normalizeDraft(draft: DefinitionDraft): DefinitionDraft {
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(draft)) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) cleaned[key] = trimmed;
    } else if (Array.isArray(value)) {
      const items = value.map((item) => (typeof item === "string" ? item.trim() : item)).filter((item) => item !== "");
      if (items.length) cleaned[key] = items;
    } else if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned as unknown as DefinitionDraft;
}

/** Les quatre champs que le validateur exige — une définition incomplète ne s'enregistre pas. */
export const REQUIRED_DEFINITION_FIELDS = ["unit", "numeratorPopulation", "denominatorPopulation", "scope"] as const;
export type RequiredDefinitionField = (typeof REQUIRED_DEFINITION_FIELDS)[number];

/** Ce qui manque pour que la définition soit enregistrable, dans l'ordre du formulaire. */
export function missingDefinitionFields(draft: DefinitionDraft): RequiredDefinitionField[] {
  const normalized = normalizeDraft(draft);
  return REQUIRED_DEFINITION_FIELDS.filter((field) => !normalized[field]);
}

/** Le contenu d'une définition, sans son identité — c'est lui qu'on compare. */
function contentOf(definition: MetricDefinition): string {
  const { id: _id, version: _version, ...content } = definition;
  return JSON.stringify(Object.fromEntries(Object.entries(content).sort(([a], [b]) => a.localeCompare(b))));
}

export function upsertDefinition(mission: Mission, raw: DefinitionDraft): UpsertResult {
  const draft = normalizeDraft(raw);
  const id = draft.id ?? draft.metricId;
  const existing = Object.values(mission.definitions).filter((d) => d.id === id);

  const candidate: MetricDefinition = { ...draft, id, version: 1 };
  const identical = existing.find((d) => contentOf(d) === contentOf(candidate));
  if (identical) {
    return { mission, ref: definitionRef(identical.id, identical.version), bumped: false };
  }

  const highest = existing.reduce((max, d) => Math.max(max, d.version), 0);
  const next: MetricDefinition = { ...candidate, version: highest + 1 };
  return {
    mission: registerDefinition(mission, next),
    ref: definitionRef(next.id, next.version),
    bumped: highest > 0,
  };
}

/** La définition référencée par une entrée, ou `undefined` — jamais une exception sur une référence cassée. */
export function definitionFor(mission: Mission, ref: string | undefined): MetricDefinition | undefined {
  if (!ref) return undefined;
  const parsed = parseDefinitionRef(ref);
  if (!parsed) return undefined;
  return mission.definitions[ref];
}
