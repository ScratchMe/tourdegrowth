/**
 * Geometry of `engine/InstallPaybackChart` (consumer app, engine spec §21.6.6, A22 APP-9): one install, month by
 * month over 0–36 months — the margin it has brought back so far, against what it cost. `PaybackChart` draws a
 * customer who pays back along a straight line and leaves at the end of a counted lifetime; an install pays back along a
 * curve that slows (its users leave, so each month's margin is smaller than the one before) and has no date of leaving.
 * The second story has its own, simpler picture.
 *
 * In CSS pixels of the slide's 1 920 canvas, y growing downwards. Pure, so the rules are tested: the payback is where
 * the curve meets the cost line, and a loss is the gap, at month 36, between the curve's end and the cost line.
 */

/** [low, high]: a fact has low = high. */
export type InstallRange = readonly [number, number];

export interface InstallChartInput {
  /** installCumulative (app-model.ts): 37 points, months 0 to 36. */
  curve: { lo: readonly number[]; hi: readonly number[] };
  /** What one install costs (app.acq.cpi), a range when estimated. */
  cost: InstallRange;
  /** installPaybackInterval: null for a loss (or no margin). hi = 36 when the worst case is beyond the cap. */
  payback: InstallRange | null;
  story: "pays-back" | "loss";
  width: number;
  height: number;
}

export interface InstallChartGeometry {
  plot: { left: number; right: number; top: number; bottom: number };
  /** The months' ticks: 0, 12, 24, 36. */
  ticks: { month: 0 | 12 | 24 | 36; x: number }[];
  /** The cost: a line at its middle, and a band when it is a range. */
  cost: { y: number; band: { y: number; height: number } | null };
  /** The value of an install month by month: the middle line, and the lo-hi band when they differ. SVG path data. */
  mid: string;
  band: string | null;
  /** Pays back: a tick on the cost line at payback.lo, and a band to payback.hi when they differ. */
  payback: { x: number; xHi: number; y: number } | null;
  /** Loss: the gap at month 36, between the curve's end (its middle) and the cost line. */
  short: { x: number; y1: number; y2: number } | null;
}

/** Margins around the plot, on the slide's canvas: its labels are 18px and more (design audit S-8). */
export const INSTALL_CHART_PX = { left: 8, right: 16, top: 26, bottom: 44 } as const;

/** The months the chart draws: 0 to the engine's cap. */
export const INSTALL_CHART_MONTHS = 36;

const TICK_MONTHS = [0, 12, 24, 36] as const;

/** Path data, two decimals: 37 points of two coordinates stay small in the page. */
const num = (v: number) => String(Math.round(v * 100) / 100);

export function installChartGeometry({ curve, cost, payback, story, width, height }: InstallChartInput): InstallChartGeometry {
  const P = INSTALL_CHART_PX;
  const left = P.left;
  const right = width - P.right;
  const top = P.top;
  const bottom = height - P.bottom;
  const x = (m: number) => left + (m / INSTALL_CHART_MONTHS) * (right - left);
  // 1.15 × the higher of the cost and the curve's highest point: the cost line keeps room above it for its label.
  const yMax = 1.15 * Math.max(cost[1], ...curve.hi) || 1;
  const y = (v: number) => bottom - (v / yMax) * (bottom - top);
  const costY = y((cost[0] + cost[1]) / 2);

  const middle = curve.lo.map((lo, k) => (lo + curve.hi[k]!) / 2);
  const mid = middle.map((v, k) => `${k === 0 ? "M" : "L"} ${num(x(k))} ${num(y(v))}`).join(" ");
  const differs = curve.lo.some((lo, k) => lo !== curve.hi[k]);
  const edge = (values: readonly number[], months: number[]) => months.map((k) => `${num(x(k))} ${num(y(values[k]!))}`);
  const forward = Array.from({ length: INSTALL_CHART_MONTHS + 1 }, (_, k) => k);
  const band = differs
    ? `M ${[...edge(curve.lo, forward), ...edge(curve.hi, [...forward].reverse())].join(" L ")} Z`
    : null;

  return {
    plot: { left, right, top, bottom },
    ticks: TICK_MONTHS.map((month) => ({ month, x: x(month) })),
    cost: { y: costY, band: cost[1] > cost[0] ? { y: y(cost[1]), height: y(cost[0]) - y(cost[1]) } : null },
    mid,
    band,
    payback: story === "pays-back" && payback ? { x: x(payback[0]), xHi: x(payback[1]), y: costY } : null,
    short: story === "loss" ? { x: x(INSTALL_CHART_MONTHS), y1: y(middle[INSTALL_CHART_MONTHS]!), y2: costY } : null,
  };
}

/** The height a loss's label needs inside its bracket (an 18px label and its air); less, it goes above the cost line. */
export const INSTALL_SHORT_LABEL_ROOM = 28;

/** The loss's label (« pas remboursée en 36 mois, il manque ~0,70 € »): inside its bracket when it fits, else above the cost line. */
export function installLossLabelY(g: InstallChartGeometry): number | null {
  if (!g.short) return null;
  return g.short.y1 - g.short.y2 >= INSTALL_SHORT_LABEL_ROOM ? (g.short.y1 + g.short.y2) / 2 + 6 : g.short.y2 - 10;
}
