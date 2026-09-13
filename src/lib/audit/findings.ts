import { shouldRefuseToConclude, type Coverage } from "./coverage";
import { BRIEF_WORD_BUDGET, HEADLINE_CAP, type Criterion, type Entry, type Finding, type Mandate } from "./schema";

/**
 * findings.ts — ce qui devient un constat imprimable, et dans quel vocabulaire.
 *
 * Trois règles que le code applique plutôt que la discipline :
 *
 * - **Promotion.** Une ligne ne devient un constat que si elle a un critère
 *   ET une décision en jeu. Sans critère, un nombre reste un nombre et se
 *   range en annexe. Un benchmark public auquel il manque sa population ou
 *   son n est RÉTROGRADÉ en tendance interne, avec la mention imprimée « pas
 *   de repère externe pour ce chiffre » — cette catégorie s'imprime au lieu
 *   de se masquer, c'est elle qui protège la crédibilité des deux autres.
 * - **Rareté structurelle.** L'action prioritaire est exclusive : en marquer
 *   une seconde démarque la première. Les autres headlines sont plafonnées à
 *   `HEADLINE_CAP`, une constante (q7 : « elle doit rester une constante »).
 * - **Vocabulaire par mandat.** En mode `no-mandate` (le défaut, q1), le
 *   document s'appelle « Diagnostic growth » et non « Audit growth » (q2 :
 *   Antoine laisse le choix du synonyme ; « diagnostic » est le mot que le
 *   produit emploie déjà pour le Deep dive), le bloc « je n'y ai pas eu
 *   accès » part dans l'annexe de travail, et « limitation d'étendue » comme
 *   « refus de conclure » ne s'impriment jamais — c'est le vocabulaire d'un
 *   auditeur externe mandaté, pas d'un salarié. `FORBIDDEN_WITHOUT_MANDATE`
 *   est exporté pour qu'un test balaie ce que ce module produit.
 */

export interface EffectiveCriterion extends Criterion {
  /** `true` quand un benchmark public a été rétrogradé en tendance interne faute de population ou de n. */
  degraded: boolean;
  /** La mention à imprimer à la place du repère quand il est rétrogradé. */
  note?: string;
}

export const NO_EXTERNAL_BENCHMARK_NOTE =
  "Pas de repère externe pour ce chiffre : comparaison à votre propre trimestre précédent.";

export function effectiveCriterion(criterion: Criterion): EffectiveCriterion {
  if (criterion.kind === "public-benchmark" && (!criterion.population?.trim() || !criterion.n || criterion.n <= 0)) {
    return { ...criterion, kind: "internal-trend", degraded: true, note: NO_EXTERNAL_BENCHMARK_NOTE };
  }
  return { ...criterion, degraded: false };
}

/** Critère renseigné ET décision en jeu non vide. Rien d'autre n'entre dans la grille des constats. */
export function isPromotable(entry: Entry): boolean {
  return entry.criterion !== undefined && (entry.decisionAtStake?.trim() ?? "") !== "";
}

export function headlineCount(findings: readonly Finding[]): number {
  return findings.filter((f) => f.headline && !f.priority).length;
}

export function canMarkHeadline(findings: readonly Finding[], id: string): boolean {
  const target = findings.find((f) => f.id === id);
  if (!target || target.priority || target.headline) return false;
  return headlineCount(findings) < HEADLINE_CAP;
}

/** Marque `id` prioritaire et démarque toute autre priorité — un seul flag, jamais une colonne de cases à cocher. */
export function setPriority(findings: readonly Finding[], id: string): Finding[] {
  if (!findings.some((f) => f.id === id)) throw new Error(`Unknown finding ${id}`);
  return findings.map((f) => (f.id === id ? { ...f, priority: true, headline: true } : f.priority ? { ...f, priority: false } : f));
}

// ---------------------------------------------------------------------------
// Vocabulaire du livrable
// ---------------------------------------------------------------------------

/** Ce qu'un livrable sans mandat n'imprime jamais. Balayé par les tests sur tout ce que ce module produit. */
export const FORBIDDEN_WITHOUT_MANDATE = ["audit", "limitation d'étendue", "refus de conclure"] as const;

export interface DeliverableVocabulary {
  /** « Audit growth » ou « Diagnostic growth ». */
  documentTitle: string;
  /** Le mot seul, pour les phrases (« cet audit » / « ce diagnostic »). */
  documentWord: string;
  /** Où va le bloc des lignes non accessibles. */
  accessBlock: "reading-build" | "working-annex";
  /** La thèse par défaut du bloc de tête. */
  thesis: string;
  /** Le titre d'escalade quand la couverture est sous le tiers — ou `null` quand elle ne l'est pas. */
  escalationTitle: string | null;
}

export function deliverableVocabulary(mandate: Mandate, coverage: Coverage, weakestStage: string): DeliverableVocabulary {
  const D = coverage.denominator;
  const notDocumented = D - coverage.documented;
  const missing = Number.isInteger(notDocumented) ? String(notDocumented) : notDocumented.toFixed(1).replace(".", ",");
  const refuse = shouldRefuseToConclude(coverage);

  if (mandate === "mandated") {
    return {
      documentTitle: "Audit growth",
      documentWord: "audit",
      accessBlock: "reading-build",
      thesis: `Une revue de croissance a besoin de répondre à ${D} questions ; vous pouvez en documenter ${formatCount(coverage.documented)}.`,
      escalationTitle: refuse
        ? `Sur ${missing} des ${D} lignes applicables, aucun chiffre n'a pu être obtenu ; cet audit ne peut pas conclure sur ${weakestStage}, et c'est le constat principal.`
        : null,
    };
  }
  return {
    documentTitle: "Diagnostic growth",
    documentWord: "diagnostic",
    accessBlock: "working-annex",
    thesis:
      "Voici ce que je peux établir aujourd'hui, voici ce que personne ne peut établir, et voici ce qu'il faudrait ouvrir pour aller plus loin.",
    escalationTitle: refuse
      ? `Sur ${missing} des ${D} lignes applicables, aucun chiffre n'a encore pu être établi ; ce diagnostic ne peut pas encore conclure sur ${weakestStage}, et c'est le point de départ.`
      : null,
  };
}

function formatCount(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace(".", ",");
}

// ---------------------------------------------------------------------------
// Le budget du bloc de tête
// ---------------------------------------------------------------------------

export function wordCount(text: string): number {
  const trimmed = text.trim();
  return trimmed === "" ? 0 : trimmed.split(/\s+/).length;
}

/**
 * Ce qui dépasse le budget bascule en annexe, jamais coupé en silence. Le
 * découpage se fait au mot ; l'UI affiche le compteur pendant la rédaction
 * (même mécanique que le compteur 500 du champ de contexte libre).
 */
export function splitAtBudget(text: string, budget = BRIEF_WORD_BUDGET): { kept: string; overflow: string } {
  const words = text.trim() === "" ? [] : text.trim().split(/\s+/);
  if (words.length <= budget) return { kept: text.trim(), overflow: "" };
  return { kept: words.slice(0, budget).join(" "), overflow: words.slice(budget).join(" ") };
}
