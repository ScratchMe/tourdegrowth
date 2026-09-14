import { AUDIT_CATALOG, AUDIT_CATALOG_VERSION } from "@/content/audit-catalog";
import { QUESTIONS } from "@/content/copy-library";
import { tc } from "@/lib/i18n/translatable";
import type { EmbeddedCatalog } from "./schema";

/**
 * server.ts — le SEUL module de l'instrument qui lit du contenu.
 *
 * Le reste de `lib/audit` est pur et n'importe du catalogue que des types
 * (effacés à la compilation), pour qu'un îlot client qui importe
 * l'instrument n'embarque ni les 39 lignes du catalogue ni la bibliothèque
 * de copie. Ce fichier-ci est appelé par le Server Component de
 * `/admin/audit`, qui passe ses résultats en props — même discipline que
 * `lib/seo/jsonld.tsx` et `content/glossary-deep.ts` (R2-14).
 *
 * `audit-boundary.test.ts` marche les imports depuis l'îlot et échoue s'il
 * atteint `content/` par un chemin de valeur, celui-ci compris.
 */

/** Une copie du catalogue du jour, à embarquer dans une mission neuve. */
export function snapshotCatalog(): EmbeddedCatalog {
  return {
    version: AUDIT_CATALOG_VERSION,
    rows: AUDIT_CATALOG.map((row) => ({ ...row, appliesTo: [...row.appliesTo] })),
  };
}

/** Une question du Tour telle que l'écran de l'auditeur l'affiche (étape 1.4). */
export interface TourQuestionView {
  id: string;
  pillar: string;
  question: string;
  options: { label: string; points: number }[];
}

/**
 * Les 15 questions du Tour résolues en français — l'outil est en français,
 * quelle que soit la langue du livrable (`deliverableLocale`, q9).
 *
 * Les points voyagent avec les options parce que l'écran de l'auditeur les
 * montre : contrairement à `/quiz`, où les cacher est la règle
 * (`AnswerOption` : "scoring stays invisible to the user"), ici l'auditeur
 * DOIT voir ce que sa réponse vaut — c'est lui qui note.
 */
export function tourQuestions(): TourQuestionView[] {
  return QUESTIONS.map((q) => ({
    id: q.id,
    pillar: q.pillar,
    question: tc(q.question, "fr"),
    options: q.options.map((o) => ({ label: tc(o.label, "fr"), points: o.points })),
  }));
}
