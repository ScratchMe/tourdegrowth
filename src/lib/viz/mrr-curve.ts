/**
 * Geometry of `engine/MrrCurve` (design system extension 09, Q8): the MRR
 * month by month, thirteen points — today first, the MRR in twelve months
 * last — at today's pace and with the what-ifs.
 *
 * Unlike `Sparkline`, the curve is drawn at its real width (the column's,
 * measured): its two lines are named at their ends in SVG text, which a
 * stretched `viewBox` would scale. So this works in CSS pixels, y growing
 * downwards, and the component hands it the width it measured.
 *
 * The scale is fitted to the data, which `Sparkline` refuses: there it would
 * make a quarter's small change look like a cliff; here the two lines share
 * one scale and the reading is the room between them, which a fixed frame
 * would crush. The MRR's figures are printed as text under the curve, never
 * read off it.
 */

/** One month: [low, high]. A point (a fact upstream) has low = high. */
export type CurvePoint = readonly [number, number];

export interface MrrCurveInput {
  today: readonly CurvePoint[];
  /** null: untouched — today's pace alone. */
  whatif: readonly CurvePoint[] | null;
  width: number;
  height: number;
  /** A phone: the keys go under the plot, so the plot takes the whole width. */
  compact: boolean;
}

export interface CurveLine {
  /** A range: the band between the low and the high path, and both paths as edges. */
  range: boolean;
  /** The middle path (a fact), or the high edge (a range). */
  path: string;
  /** The low edge, for a range. */
  low: string | null;
  /** The band's polygon, for a range. */
  band: string | null;
  /** The dot at the line's end, for a fact. */
  end: { x: number; y: number };
}

export interface MrrCurveGeometry {
  today: CurveLine;
  whatif: CurveLine | null;
  /** The room between the two lines — what the what-ifs add. */
  gain: string | null;
  /** Today's level, a faint rule across the plot. */
  level: { x1: number; x2: number; y: number };
  /** Today's MRR, the curve's only figure: under the start when the MRR grows, over it when it shrinks. */
  start: { x: number; y: number; labelY: number };
  /** The three months under the axis: today, in six months, in twelve. */
  ticks: [number, number, number];
  tickY: number;
  /** Where each line's name sits at its end (desktop only), pushed apart when they would touch. */
  keys: { x: number; today: number; whatif: number | null } | null;
}

/** What the plot leaves on its right for the lines' names (desktop), and its other margins. */
export const MRR_CURVE_PX = {
  keyRoom: 168,
  left: 2,
  right: 10,
  top: 26,
  bottom: 26,
  /** Two names closer than this are pushed apart. */
  keyGap: 20,
  /** A name's baseline sits this far under its line's end. */
  keyBaseline: 4,
  keyOffset: 12,
  /** Today's figure: off the start point, under it (rising) or over it (falling). */
  startDx: 8,
  startBelow: 18,
  startAbove: -10,
  tickBaseline: 6,
} as const;

const mid = (p: CurvePoint) => (p[0] + p[1]) / 2;
const isRange = (pts: readonly CurvePoint[]) => pts.some((p) => Math.abs(p[1] - p[0]) > 1e-6);
const xy = (x: number, y: number) => `${x.toFixed(1)},${y.toFixed(1)}`;

export function mrrCurveGeometry({ today, whatif, width, height, compact }: MrrCurveInput): MrrCurveGeometry {
  if (today.length !== 13 || (whatif && whatif.length !== 13)) throw new Error("mrrCurveGeometry: 13 points, today first");
  const P = MRR_CURVE_PX;
  const L = P.left;
  const R = width - (compact ? 0 : P.keyRoom) - P.right;
  const T = P.top;
  const B = height - P.bottom;
  const all = [...today, ...(whatif ?? [])];
  let lo = Math.min(...all.map((p) => p[0]));
  let hi = Math.max(...all.map((p) => p[1]));
  if (hi - lo < 1) hi = lo + 1;
  // Room under the lowest point for today's figure, which sits under the start when
  // the MRR grows (over it when it shrinks).
  const rising = mid(today[12]!) >= mid(today[0]!);
  const span = hi - lo;
  lo -= span * (rising ? 0.2 : 0.08);
  hi += (hi - lo) * (rising ? 0.06 : 0.2);
  const x = (i: number) => L + (i * (R - L)) / 12;
  const y = (v: number) => B - ((v - lo) / (hi - lo)) * (B - T);
  const path = (pts: readonly CurvePoint[], k: (p: CurvePoint) => number) => pts.map((p, i) => xy(x(i), y(k(p)))).join(" ");

  const line = (pts: readonly CurvePoint[]): CurveLine => {
    const end = { x: x(12), y: y(mid(pts[12]!)) };
    if (!isRange(pts)) return { range: false, path: path(pts, mid), low: null, band: null, end };
    const top = pts.map((p, i) => xy(x(i), y(p[1])));
    const bottom = pts.map((p, i) => xy(x(i), y(p[0]))).reverse();
    return { range: true, path: path(pts, (p) => p[1]), low: path(pts, (p) => p[0]), band: [...top, ...bottom].join(" "), end };
  };

  // The room between the two lines: the what-ifs' low path, back along today's high one.
  const gain = whatif ? [...whatif.map((p, i) => xy(x(i), y(p[0]))), ...today.map((p, i) => xy(x(i), y(p[1]))).reverse()].join(" ") : null;

  let keys: MrrCurveGeometry["keys"] = null;
  if (!compact) {
    let yT = y(mid(today[12]!));
    let yW = whatif ? y(mid(whatif[12]!)) : null;
    if (yW !== null && Math.abs(yW - yT) < P.keyGap) {
      const m = (yW + yT) / 2;
      const up = yW <= yT;
      yW = m + (up ? -1 : 1) * (P.keyGap / 2);
      yT = m + (up ? 1 : -1) * (P.keyGap / 2);
    }
    keys = { x: R + P.keyOffset, today: yT + P.keyBaseline, whatif: yW === null ? null : yW + P.keyBaseline };
  }

  const y0 = y(mid(today[0]!));
  return {
    today: line(today),
    whatif: whatif ? line(whatif) : null,
    gain,
    level: { x1: L, x2: R, y: y0 },
    start: { x: x(0), y: y0, labelY: y0 + (rising ? P.startBelow : P.startAbove) },
    ticks: [x(0), x(6), x(12)],
    tickY: height - P.tickBaseline,
    keys,
  };
}
