import type { Mission } from "./schema";
import { validateMission, type ValidationResult } from "./validate";

/**
 * io.ts — le fichier de mission : ce qui sort, ce qui rentre.
 *
 * Le fichier JSON est la seule copie durable d'une mission (AUDIT.md §5 :
 * pas de serveur, `localStorage` et un fichier). Deux conséquences que ce
 * module tient :
 *
 * 1. **Il doit se relire dans un diff Git.** Antoine peut vouloir versionner
 *    ses missions dans un dépôt privé à lui ; un JSON minifié y serait
 *    illisible. D'où l'indentation, et surtout des CLÉS TRIÉES : sans ça,
 *    deux exports de la même mission diffèrent sur l'ordre d'insertion des
 *    propriétés et le diff devient du bruit.
 * 2. **Une lecture ne lève JAMAIS.** Un fichier corrompu, tronqué par un
 *    transfert ou d'une version future doit produire un message à l'écran,
 *    pas un écran blanc. `parseMissionFile` renvoie toujours un résultat.
 */

/** Le fichier d'une mission : JSON indenté, clés triées, stable d'un export à l'autre. */
export function serializeMission(mission: Mission): string {
  return `${JSON.stringify(mission, sortedKeys, 2)}\n`;
}

/**
 * Le replacer qui trie. Les tableaux gardent leur ordre — c'est de la donnée
 * (l'ordre des passes, des observations d'une série, des constats) ; seules
 * les clés d'objet sont réordonnées, ce qui ne change aucun sens.
 */
function sortedKeys(_key: string, value: unknown): unknown {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return value;
  const source = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(source).sort()) out[k] = source[k];
  return out;
}

/**
 * Le nom du fichier téléchargé : `diagnostic-growth-<entreprise>-<date>.json`,
 * suffixé `-purge` pour une copie purgée — le suffixe est ce qui empêche
 * d'envoyer par erreur le fichier complet quand on voulait la copie sans
 * absolus.
 *
 * « diagnostic » et non « audit » : décision du §2 d'`AUDIT.md` — sans
 * mandat, le mot « audit » promet autre chose que ce que l'exercice est.
 */
export function fileNameFor(mission: Mission, date = mission.createdAt.slice(0, 10)): string {
  const company = slug(mission.header.company) || "sans-nom";
  return `diagnostic-growth-${company}-${date}${mission.purged ? "-purge" : ""}.json`;
}

/**
 * Un segment de nom de fichier sûr : accents aplatis, tout le reste réduit à
 * des tirets. Volontairement agressif — ce nom traverse un téléchargement,
 * une pièce jointe et peut-être un système de fichiers Windows.
 */
function slug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export type ParseResult = { ok: true; mission: Mission } | { ok: false; errors: string[]; mission: Mission | null };

/**
 * Lit un fichier de mission. Ne lève jamais.
 *
 * Trois issues, et la troisième est celle qui compte : un fichier bien formé
 * mais que le validateur refuse est RENDU QUAND MÊME, avec ses erreurs — une
 * mission à moitié saisie est exactement ce qu'on transporte entre deux
 * appareils, et refuser de l'ouvrir parce qu'une ligne `contested` n'a
 * qu'une observation ferait perdre le reste. L'écran d'import montre les
 * erreurs et laisse décider (AUDIT-PLAN.md §3.3, décision 2).
 */
export function parseMissionFile(text: string): ParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    return { ok: false, errors: [`Fichier illisible : ${err instanceof Error ? err.message : "JSON invalide"}`], mission: null };
  }
  if (!looksLikeMission(parsed)) {
    return { ok: false, errors: ["Ce fichier n'est pas une mission : il lui manque un identifiant, un en-tête ou des passes."], mission: null };
  }
  const result: ValidationResult = validateMission(parsed);
  if (result.ok) return { ok: true, mission: result.mission };
  return { ok: false, errors: result.errors, mission: parsed as unknown as Mission };
}

/**
 * Contrôle de forme, avant le validateur : « est-ce que ça a la tête d'une
 * mission ? ». Assez lâche pour laisser passer un brouillon, assez strict
 * pour qu'un autre JSON déposé par erreur ne soit pas listé comme une
 * mission vide sur l'écran d'import.
 */
function looksLikeMission(value: unknown): boolean {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const m = value as Record<string, unknown>;
  if (typeof m.id !== "string" || !Array.isArray(m.passes)) return false;
  const header = m.header;
  return typeof header === "object" && header !== null && typeof (header as Record<string, unknown>).company === "string";
}
