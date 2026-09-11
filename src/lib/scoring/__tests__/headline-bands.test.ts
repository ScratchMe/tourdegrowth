import { describe, expect, it } from "vitest";
import { boardBand, LEVEL_HEADLINE, SUMMARY_HEADLINES } from "@/content/copy-library";
import { tc } from "@/lib/i18n/translatable";
import { resolveBottleneck } from "../bottleneck";
import { PILLARS } from "../pillars";
import { buildQuickVerdict } from "../verdict";

/**
 * The verdict headline, across the WHOLE reachable score space.
 *
 * The defect this exists to prevent was never visible on one board: the old
 * library was indexed by the weakest stage alone and asserted "bon moteur
 * global" on every board it was served to, which is true on 560 of 59 049.
 * Nothing short of walking the space finds that — a hand-picked fixture
 * shows a line that reads perfectly.
 *
 * With three answer options worth 20/7/0 and per-pillar rounding, a pillar
 * score can only land on these nine values (see `score.test.ts`).
 */
const ACHIEVABLE = [0, 2, 5, 7, 9, 11, 13, 16, 20] as const;

function walk(visit: (scores: number[]) => void) {
  const acc: number[] = [];
  const rec = () => {
    if (acc.length === PILLARS.length) return visit([...acc]);
    for (const s of ACHIEVABLE) {
      acc.push(s);
      rec();
      acc.pop();
    }
  };
  rec();
}

const board = (scores: number[]) => PILLARS.map((pillar, i) => ({ pillar, score: scores[i]! }));
const weakest = (b: ReturnType<typeof board>) => b.reduce((lo, p) => (p.score < lo.score ? p : lo)).pillar;

describe("the verdict headline over every reachable board", () => {
  it("always resolves to a real line, and never leaves a band unreachable", () => {
    const bands = { solid: 0, mixed: 0, floor: 0, level: 0 };
    let boards = 0;

    walk((scores) => {
      boards++;
      const b = board(scores);
      const w = weakest(b);
      const level = resolveBottleneck(b).sharpness === "level";
      const label = scores.join(",");

      const headline = buildQuickVerdict("neutral", "fr", b, w).headline;
      expect(headline.trim().length, label).toBeGreaterThan(0);

      if (level) {
        bands.level++;
        expect(headline, label).toBe(tc(LEVEL_HEADLINE.neutral, "fr"));
        return;
      }
      const band = boardBand(b, w);
      bands[band]++;
      expect(headline, label).toBe(tc(SUMMARY_HEADLINES[w][band].neutral, "fr"));
    });

    expect(boards).toBe(ACHIEVABLE.length ** PILLARS.length);
    // Characterisation, with the real numbers: if `scoreBand`, `CLEAR_GAP` or
    // the band rule ever moves, these say so instead of failing silently.
    expect(bands).toEqual({ solid: 560, mixed: 41650, floor: 16807, level: 32 });
  });

  /* The claim each band exists to keep true. `solid` is the only band whose
     line may say the rest of the engine holds, so it must only ever be served
     when it does — and `floor` must never be served while something else is
     strong. Asserted on the served headline rather than on `boardBand`, so it
     covers the wiring in `verdict.ts` and not just the predicate. */
  it("only says the engine holds when the engine actually holds", () => {
    walk((scores) => {
      const b = board(scores);
      const w = weakest(b);
      if (resolveBottleneck(b).sharpness === "level") return;
      const label = scores.join(",");
      const others = b.filter((p) => p.pillar !== w);
      const strong = others.filter((p) => p.score >= 16).length;
      const headline = buildQuickVerdict("neutral", "fr", b, w).headline;

      if (headline === tc(SUMMARY_HEADLINES[w].solid.neutral, "fr")) {
        expect(strong, `${label}: solid line with a non-strong stage`).toBe(others.length);
      }
      if (headline === tc(SUMMARY_HEADLINES[w].floor.neutral, "fr")) {
        expect(strong, `${label}: floor line while something is strong`).toBe(0);
      }
    });
  });

  /* The contradiction that started this: a card that names no stage must not
     also be handed a line that names one. */
  it("never pairs the level line with a named stage, in either direction", () => {
    walk((scores) => {
      const b = board(scores);
      const w = weakest(b);
      const view = resolveBottleneck(b);
      const headline = buildQuickVerdict("neutral", "fr", b, w).headline;
      const isLevel = headline === tc(LEVEL_HEADLINE.neutral, "fr");
      expect(isLevel, scores.join(",")).toBe(view.sharpness === "level");
      if (isLevel) expect(view.pillars, scores.join(",")).toEqual([]);
    });
  });
});
