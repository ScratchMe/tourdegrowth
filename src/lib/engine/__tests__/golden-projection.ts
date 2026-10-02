import type { ListStage, RowStatus } from "@/app/[locale]/aarrr-funnel-template/_engine/number-list";
import type { LeverId } from "../types";

/**
 * What the complete engine adds to « Et si » (§19.3, A14 T3), and the goldens'
 * projection drops — the golden rule allows it for a field that is ADDED,
 * never for what a v1 or v2 build printed:
 *
 * - two levers: day-30 retention in self-serve, the referred share of
 *   opportunities in sales-assisted. A v1 or v2 engine gets them, a slider
 *   where it has the number, none where it doesn't;
 * - the sales-assisted scenario's opportunities (`opps`), today and
 *   projected, which the slide read from the link alone before.
 *
 * No slide, no title, no text of a v1 or v2 engine moves: a target on these
 * levers didn't exist before them.
 */
export const LEVERS_ADDED_BY_A14_T3: readonly LeverId[] = ["ret.d30", "slg.ref.referred-share"];

interface ScenarioLike {
  levers: { id: LeverId }[];
  today: Record<string, unknown>;
  projected: Record<string, unknown>;
}

/** The scenario as a v2 build derived it: without the levers A14 T3 adds, nor the opportunities. In place, on a JSON copy. */
export function asBeforeT3(scenario: unknown, slg: boolean): number {
  if (!scenario) return 0;
  const s = scenario as ScenarioLike;
  const before = s.levers.length;
  s.levers = s.levers.filter((l) => !LEVERS_ADDED_BY_A14_T3.includes(l.id));
  if (slg) {
    delete s.today.opps;
    delete s.projected.opps;
  }
  return before - s.levers.length;
}

/**
 * The board's stage tabs as v1 and v2 builds printed them, from the list that
 * replaced them (« Tes chiffres », C41, A18 T2.b). The list says the same
 * things — one mark per number, ★ first, found out of those that apply, the
 * stage the diagnosis names — so the goldens keep holding them: this is the
 * old shape rebuilt from the new, nothing added, nothing dropped.
 */
export function asTabs(stages: readonly ListStage[]) {
  const KIND: Record<RowStatus, string> = { found: "found", est: "approximate", asked: "inProgress", todo: "inProgress", cant: "missing", na: "notApplicable" };
  return stages.map((s) => ({
    stage: s.stage,
    marks: s.rows.map((r) => ({ id: r.id, kind: KIND[r.status] })),
    found: s.found,
    applicable: s.applicable,
    named: s.holdsBack,
  }));
}
