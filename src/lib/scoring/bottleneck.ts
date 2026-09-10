import { scoreBand } from "@/content/copy-library";
import type { Pillar } from "./pillars";
import { rankPillarsAscending, type Ranked } from "./rank";

/**
 * Which stage is holding this product back — and how honestly we can say so.
 *
 * Design system extension 03 (`design/ds-extension-03-return/`) gives the
 * result page a `Bottleneck` block stamped under the score numeral, in place
 * of the free-floating verdict line. Its prompt calls sharpness "the honesty
 * mechanism", and that is the whole reason this module is pure, separate and
 * tested: the block names a stage in 36px stencil, which is a claim, and the
 * claim has to be earned by the numbers rather than by the layout.
 *
 * Three states, in the order they are decided:
 *
 * - **level** — every pillar is in the strong band. There is no bottleneck,
 *   so none is named. This is the same predicate `resolveNextMove` uses to
 *   stand down (`next-move.ts`), and a test pins the two together: a result
 *   that says "nothing is stalling you" must not also stamp a pillar name.
 * - **clear** — one pillar sits at least `CLEAR_GAP` points below every
 *   other. One name.
 * - **shared** — the bottom is crowded. Every pillar inside the window is
 *   named, at the same size.
 *
 * ## Deviation from the bundle, flagged rather than absorbed
 *
 * `Bottleneck.d.ts` says of its `pillars` prop: "clear reads [0]; shared
 * reads [0] and [1]" — two names, never more. Two is right for the case the
 * board draws, and wrong for the one the scoring engine actually produces
 * often: with three answer options a pillar score can only land on
 * {0,2,5,7,9,11,13,16,20}, nine values across five pillars, so ties at the
 * bottom are common and three-way ties are unremarkable. Capping at two
 * would pick the two that happen to come first in canonical AARRR order and
 * silently drop a third stage scoring exactly the same — an arbitrary choice
 * presented as a diagnosis, which is precisely what sharpness exists to
 * prevent.
 *
 * So `shared` returns the whole bottom group and the label is written with a
 * count (`{n}` in `UI_STRINGS.bottleneck`) rather than the word "Two". The
 * component renders what it is given.
 */
export type Sharpness = "clear" | "shared" | "level";

/**
 * How far below the next pillar the lowest has to sit before we call it out
 * alone. Four points on a /20 scale, per the bundle's prompt — and on the
 * achievable set above, adjacent values are never 4 apart except 16→20, so
 * this really does require a gap of more than one step.
 */
export const CLEAR_GAP = 4;

export interface BottleneckView<T extends Ranked = Ranked> {
  sharpness: Sharpness;
  /**
   * The stages to name, lowest first. Empty when `sharpness` is `"level"`;
   * exactly one when `"clear"`; two or more when `"shared"`.
   */
  pillars: T[];
}

/**
 * Pure, synchronous, no content lookup — it decides *what* to say, never how
 * to word it. The label copy lives in the dictionary, the verdict sentence
 * comes from the copy library, and both are resolved by the caller in the
 * reader's language (R-09).
 */
export function resolveBottleneck<T extends Ranked>(pillars: readonly T[]): BottleneckView<T> {
  const ranked = rankPillarsAscending(pillars);
  const lowest = ranked[0];
  if (!lowest) return { sharpness: "level", pillars: [] };

  // Weakest strong ⟹ all strong, since `ranked` is ascending. Expressed as
  // the weakest rather than as `every()` so it reads as the same test
  // `resolveNextMove` makes, which is what the cross-check test asserts.
  if (scoreBand(lowest.score) === "strong") return { sharpness: "level", pillars: [] };

  const group = ranked.filter((p) => p.score - lowest.score < CLEAR_GAP);
  return { sharpness: group.length === 1 ? "clear" : "shared", pillars: group };
}

/**
 * The stage a shared bottleneck credits when exactly one has to be picked —
 * the OG image names one stage, and `weakestPillar` has always been that
 * pick. Kept here so the tiebreak has one home rather than being re-derived
 * next to every caller.
 */
export function primaryBottleneck<T extends Ranked>(view: BottleneckView<T>): Pillar | null {
  return view.pillars[0]?.pillar ?? null;
}
