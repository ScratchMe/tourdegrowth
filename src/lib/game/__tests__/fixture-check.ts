/**
 * The reference-year check of the three draft levels (activation, referral,
 * revenue — `docs/game/`): one function, so their fixtures read the same way
 * level 2's do (`acquisition.test.ts`) without three copies of the loop.
 *
 * Relative imports only: e2e specs may import the paths this reads.
 */
import { moodNow } from "../model";
import type { EndingId, GameState, LevelDefinition, ModelSlug, Mood } from "../types";

export interface Fixture<Id extends string> {
  path: readonly (readonly [Id, Id])[];
  /** The level's number at the end of each quarter, as the spec's table prints it. */
  metric: number[];
  patience: number[];
  mood?: Mood[];
  order?: (Id | null)[];
  ending: EndingId;
  trust?: number;
  radar?: number;
}

/**
 * Every departure from the spec's table, as readable lines. `tolerance` is
 * half the tile's step (the table prints the number as the tile rounds it);
 * ±1 elsewhere.
 */
export function mismatches<Id extends string>(
  fixture: Fixture<Id>,
  level: LevelDefinition<Id, ModelSlug>,
  playPath: (path: Fixture<Id>["path"], level: LevelDefinition<Id, ModelSlug>) => GameState<Id>[],
  tolerance: number,
): string[] {
  const states = playPath(fixture.path, level);
  const out: string[] = [];
  fixture.metric.forEach((expected, i) => {
    const got = states[i + 1]?.metric ?? NaN;
    if (!(Math.abs(got - expected) <= tolerance + 1e-9)) out.push(`T${i + 1} metric ${got} ≠ ${expected}`);
  });
  fixture.patience.forEach((expected, i) => {
    const got = states[i + 1]?.patience ?? NaN;
    if (!(Math.abs(got - expected) <= 1)) out.push(`T${i + 1} patience ${got} ≠ ${expected}`);
  });
  fixture.mood?.forEach((expected, i) => {
    const s = states[i];
    const got = s ? moodNow(level, s) : undefined;
    if (got !== expected) out.push(`T${i + 1} mood ${got} ≠ ${expected}`);
  });
  fixture.order?.forEach((expected, i) => {
    const got = states[i]?.order;
    if (got !== expected) out.push(`T${i + 1} order ${got} ≠ ${expected}`);
  });
  const last = states.at(-1);
  if (!last) return ["no state"];
  if (last.ending !== fixture.ending) out.push(`ending ${last.ending} ≠ ${fixture.ending}`);
  if (fixture.trust !== undefined && !(Math.abs(last.trust - fixture.trust) <= 1)) out.push(`trust ${last.trust} ≠ ${fixture.trust}`);
  if (fixture.radar !== undefined && !(Math.abs(last.radar - fixture.radar) <= 1)) out.push(`radar ${last.radar} ≠ ${fixture.radar}`);
  return out;
}
