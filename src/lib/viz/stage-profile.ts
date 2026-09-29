/**
 * The Tour's profile — design I + B, retained by Antoine on 2026-09-28.
 *
 * The five AARRR stages drawn as the climbs of a road book's stage profile:
 * one hill per stage, its height the points that stage is MISSING out of its
 * total. A stage at 20/20 is flat road; the stage that stalls is the highest
 * climb, and the one the page names is marked « HC » (hors catégorie, the
 * Tour's hardest climb). It shows the shape of the five scores at a glance;
 * the chips under it keep the exact numbers — they are this chart's table.
 *
 * Pure and deterministic, no randomness: the same five scores always draw the
 * same path, on the server and in the browser (no hydration mismatch), on the
 * page and in the share image (one geometry, two renderers). The design's
 * mockup wobbled the ridge with a seeded noise; the product keeps I's clean
 * line and draws smooth hills.
 */

export interface ProfileStage {
  score: number;
  /** A stage the page names as holding the product back — drawn in red and flagged. */
  hot: boolean;
}

export interface ProfileBox {
  width: number;
  height: number;
  /** Where the highest possible climb peaks (y, from the top). */
  top: number;
  /** The road's baseline (y). */
  base: number;
  /** Height of flat road above the baseline, so a stage at full marks still reads as road. */
  floor?: number;
}

export interface ProfileColumn {
  /** The stage's slice of the width. */
  x0: number;
  x1: number;
  /** The summit. */
  peakX: number;
  peakY: number;
  /** Points missing out of the total — the height, and the label over the summit. */
  missing: number;
  hot: boolean;
  /** The ridge over this stage alone, valley to valley — what a hot stage redraws in red. */
  ridge: string;
  /** That ridge closed down to the baseline — what a hot stage fills. */
  area: string;
}

export interface Profile {
  /** The whole ridge, left edge to right edge. */
  ridge: string;
  /** The ridge closed down to the baseline. */
  area: string;
  columns: ProfileColumn[];
}

/** Two decimals: enough for an SVG, and a stable string for a snapshot. */
const r = (n: number) => Math.round(n * 100) / 100;

/**
 * The profile of `stages` in `box`. Scores are clamped to `[0, total]`, so a
 * bad input bends a hill, never the frame.
 */
export function stageProfile(stages: readonly ProfileStage[], total: number, box: ProfileBox): Profile {
  const n = stages.length;
  const { width: W, top, base } = box;
  const floor = box.floor ?? 3;
  const cw = n > 0 ? W / n : W;
  const rise = Math.max(0, base - top - floor);

  const missing = stages.map((s) => Math.min(total, Math.max(0, total - s.score)));
  const heights = missing.map((m) => floor + (total > 0 ? m / total : 0) * rise);

  // A valley between two hills sits a little above the road, in proportion
  // to the lower of the two, so a pair of high climbs reads as one massif.
  const valley = (i: number) => {
    if (i <= 0 || i >= n) return floor;
    return floor + 0.12 * Math.min(heights[i - 1]! - floor, heights[i]! - floor);
  };
  const y = (h: number) => base - h;

  const columns: ProfileColumn[] = stages.map((stage, i) => {
    const x0 = i * cw;
    const x1 = (i + 1) * cw;
    const cx = x0 + cw / 2;
    const yp = y(heights[i]!);
    const y0 = y(valley(i));
    const y1 = y(valley(i + 1));
    // Valley → summit → valley, two cubic curves with horizontal tangents at
    // the summit and at each valley: a hill, not a spike.
    const up = `C${r(x0 + cw * 0.28)} ${r(y0)} ${r(cx - cw * 0.2)} ${r(yp)} ${r(cx)} ${r(yp)}`;
    const down = `C${r(cx + cw * 0.2)} ${r(yp)} ${r(x1 - cw * 0.28)} ${r(y1)} ${r(x1)} ${r(y1)}`;
    const ridge = `M${r(x0)} ${r(y0)} ${up} ${down}`;
    return {
      x0: r(x0),
      x1: r(x1),
      peakX: r(cx),
      peakY: r(yp),
      missing: missing[i]!,
      hot: stage.hot,
      ridge,
      area: `${ridge} L${r(x1)} ${r(base)} L${r(x0)} ${r(base)} Z`,
    };
  });

  const ridge = columns.length
    ? `M0 ${r(y(valley(0)))} ` + columns.map((c) => c.ridge.replace(/^M[^C]*/, "")).join(" ")
    : `M0 ${r(base)} L${r(W)} ${r(base)}`;
  const area = `${ridge} L${r(W)} ${r(base)} L0 ${r(base)} Z`;

  return { ridge, area, columns };
}
