import { computeCoverage, type Coverage } from "./coverage";
import type { Mission, Pass, ValueStatus } from "./schema";

/**
 * diff.ts — ce qui a changé entre deux passes de la même mission.
 *
 * « La couverture est passée de 16/24 à 21/24 » est la seule phrase qui
 * prouve que l'instrument a servi, et c'est exactement celle qui vaut en
 * entretien (q8). Elle ne peut se calculer que parce que les deux passes
 * partagent le catalogue embarqué de la mission : le dénominateur est le
 * même des deux côtés par construction.
 */
export interface StatusChange {
  metricId: string;
  from: ValueStatus | null;
  to: ValueStatus | null;
}

export interface PassDiff {
  before: { passId: string; date: string; coverage: Coverage };
  after: { passId: string; date: string; coverage: Coverage };
  /** Les lignes dont le statut a changé, dans l'ordre du catalogue. `null` = pas d'entrée. */
  changes: StatusChange[];
}

export function diffPasses(mission: Mission, beforeId: string, afterId: string): PassDiff {
  const before = findPass(mission, beforeId);
  const after = findPass(mission, afterId);
  const byMetric = (pass: Pass) => new Map(pass.entries.map((entry) => [entry.metricId, entry.status]));
  const a = byMetric(before);
  const b = byMetric(after);
  const changes: StatusChange[] = [];
  for (const row of mission.catalog.rows) {
    const from = a.get(row.id) ?? null;
    const to = b.get(row.id) ?? null;
    if (from !== to) changes.push({ metricId: row.id, from, to });
  }
  return {
    before: { passId: before.id, date: before.date, coverage: computeCoverage(before, mission) },
    after: { passId: after.id, date: after.date, coverage: computeCoverage(after, mission) },
    changes,
  };
}

function findPass(mission: Mission, id: string): Pass {
  const pass = mission.passes.find((p) => p.id === id);
  if (!pass) throw new Error(`Unknown pass ${id}`);
  return pass;
}
