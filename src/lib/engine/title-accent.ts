import type { SlideTitleKey } from "./types";

/**
 * Which slide titles keep their red accent (C53, Antoine, 2026-10-03, after
 * the return of brief 09): « Les deux rouges restent. Le verdict dit ce qu'on
 * ne voit pas, le diagnostic dit ce qui freine parmi ce qu'on voit » (BAT
 * nº9, card d-verdict-red). Red on a slide means what it means on the board.
 *
 * - the verdict: what we can't see — the funnel's gap, its tail break, a
 *   funnel we can't follow at all, two engines we can't add up yet;
 * - the diagnosis: what holds the engine back — the stage named, the stages
 *   that trail together, the stage below its target with nothing to compare,
 *   or that nothing does.
 *
 * Every other accent — a figure, a projected gain, a multiple, a loss, a
 * count — is ink: the title's own weight, no colour. A projection is never
 * red (S-5), nor is a loss (C48): arithmetic on the team's own numbers, not
 * the leak.
 */
const RED: ReadonlySet<SlideTitleKey> = new Set<SlideTitleKey>([
  // The verdict: what we can't see.
  "pelotonGap",
  "pelotonGapOne",
  "pelotonTailBreak",
  "pelotonTailBreakOne",
  "pelotonEmpty",
  "slgPelotonGap",
  "slgPelotonGapOne",
  "slgPelotonTailBreak",
  "slgPelotonTailBreakOne",
  "slgPelotonEmpty",
  "totalUnknown",
  "totalUnknownBoth",
  // The diagnosis: what holds back, among what we see.
  "leakClearUnpriced",
  "leakShared",
  "leakNotEnoughBelow",
  "leakLevel",
]);

export type TitleAccent = "red" | "ink";

export function titleAccent(key: SlideTitleKey): TitleAccent {
  return RED.has(key) ? "red" : "ink";
}
