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
