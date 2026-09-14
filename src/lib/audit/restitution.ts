import type { AuditCatalogRow, AuditPillar } from "@/content/audit-catalog";
import type { Answers, ScoredQuestion } from "@/lib/scoring/compute";
import { PILLARS } from "@/lib/scoring/pillars";
import { methodVsReality, type Quadrant, QUADRANTS } from "./quadrants";
import { applicableRows, type Entry, type Mission, type Pass } from "./schema";

/**
 * restitution.ts — la vue par laquelle le diagnostic se raconte.
 *
 * La vue collecte (`RowList`) répond à « par quoi je commence » : elle trie
 * par coût. Celle-ci répond à « qu'est-ce que ça dit » : elle regroupe par
 * étape AARRR et pose sur chaque ligne son quadrant méthode × réalité. Ce
 * sont deux lectures du même jeu de lignes, et les confondre donnerait un
 * écran qui ne sert bien ni l'un ni l'autre.
 *
 * **Les angles morts passent en tête**, hors de leur pilier. C'est le
 * quadrant le plus rentable de l'exercice (AUDIT.md) : l'équipe déclare
 * mesurer, et rien ne le documente. Le ranger dans l'ordre alphabétique de
 * son pilier le noierait au milieu de lignes qui ne surprennent personne.
 *
 * **Un angle mort n'a pas besoin des 15 réponses.** Le croisement se fait
 * question par question (`row.tourQuestionId`), donc une seule réponse à 20
 * points suffit à en révéler un. Seul le SCORE exige le Tour complet
 * (`tourScore`) — ce sont deux choses différentes, et les lier ferait
 * attendre la fin des entretiens pour voir ce qui se voyait dès le premier.
 */
export interface RestitutionRow {
  row: AuditCatalogRow;
  entry: Entry | undefined;
  quadrant: Quadrant;
}

export interface RestitutionGroup {
  pillar: AuditPillar;
  rows: RestitutionRow[];
}

export interface Restitution {
  /** Les lignes regroupées par étape, dans l'ordre canonique AARRR puis `transverse`. */
  groups: RestitutionGroup[];
  /** Les angles morts, dans l'ordre du catalogue — remontés en tête de l'écran. */
  blindSpots: RestitutionRow[];
  /** Combien de lignes dans chaque quadrant, pour le résumé de tête. */
  counts: Record<Quadrant, number>;
}

/** L'ordre d'affichage : les 5 étapes AARRR, puis ce qui les traverse. */
export const RESTITUTION_PILLARS: readonly AuditPillar[] = [...PILLARS, "transverse"];

export function buildRestitution(mission: Mission, pass: Pass, questions: readonly ScoredQuestion[]): Restitution {
  const answers: Partial<Answers> = pass.tourAnswers;
  const byMetric = new Map<string, Entry>(pass.entries.map((e) => [e.metricId, e]));

  const rows: RestitutionRow[] = applicableRows(mission.catalog, mission.header.profile.model).map((row) => {
    const entry = byMetric.get(row.id);
    return { row, entry, quadrant: methodVsReality(row, entry, answers, questions) };
  });

  const counts = Object.fromEntries(QUADRANTS.map((q) => [q, 0])) as Record<Quadrant, number>;
  for (const item of rows) counts[item.quadrant] += 1;

  return {
    // Un pilier sans ligne applicable disparaît plutôt que d'afficher un
    // titre vide : le profil décide de ce qui s'applique, et une étape hors
    // profil n'a rien à dire dans une restitution.
    groups: RESTITUTION_PILLARS.map((pillar) => ({ pillar, rows: rows.filter((item) => item.row.pillar === pillar) })).filter(
      (group) => group.rows.length > 0,
    ),
    blindSpots: rows.filter((item) => item.quadrant === "blind-spot"),
    counts,
  };
}
