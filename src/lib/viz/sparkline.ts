import { clamp, fractionOf, overflowOf, type Domain, type Overflow } from "./scale";

/**
 * Geometry of `viz/Sparkline`, in a 0–100 × 0–100 space where y grows
 * DOWNWARDS (SVG and CSS `top:` agree on that, so one number serves both the
 * path and the absolutely positioned HTML labels around it).
 *
 * The caller provides `min`/`max` instead of letting the chart fit its data
 * (game plan §3.6, R16): a curve that rescales itself every quarter would make
 * a small change look like a cliff. The consequence is that a value can fall
 * outside the frame — it is then clamped to the edge and flagged, never drawn
 * off the chart, and the caller's `endLabel` still states the true number.
 */

export interface PlotPoint {
  /** Index in the input series — the month, for the game. */
  index: number;
  value: number;
  x: number;
  y: number;
  /** Set when `value` was outside `[min, max]` and `y` was pulled to the edge. */
  overflow: Overflow;
}

export interface LabelPlacement {
  /** Which side of the point the label sits on. */
  horizontal: "left" | "right";
  vertical: "above" | "below";
}

export interface SparklineGeometry {
  points: PlotPoint[];
  /** SVG path data. A `null` in the series breaks the line: an unknown month is a gap, not a zero. */
  path: string;
  /** The last known point — where the end marker and `endLabel` go. */
  end: PlotPoint | null;
  endLabel: LabelPlacement;
}

export type SparklineSize = "md" | "sm";

/**
 * What the labels around the plot take up, in CSS pixels, as
 * `Sparkline.module.css` and the tokens draw them. A test parses those files
 * and fails when they disagree with this table, because the placement rules
 * below are only as true as these numbers: the first version used one
 * percentage for both sizes, right for the 144px canvas of `md` and wrong by
 * half a label for the 48px canvas of `sm`, whose labels then spilled out of
 * the component (review R15).
 */
export const SPARKLINE_PX = {
  /** `--plot-h` of each size. */
  plot: { md: 160, sm: 64 },
  /** `.canvas` top and bottom inset (`--space-3`): room a label may use past the frame, still inside the plot. */
  inset: 8,
  /** `.endLabel.above` / `.below` margin (`--space-2`). */
  endGap: 6,
  /** One line of the end label: `--chart-value` (20px/1.1) on `md`, `--chart-label` (12px/1.4) on `sm`. */
  endLine: { md: 22, sm: 16.8 },
  /** One line of a reference label (`--chart-label`), and its offset off the line when it sits above. */
  referenceLine: 16.8,
  referenceGap: 2,
} as const;

/** The same measures in the 0–100 space of one size's canvas. */
export interface LabelMetrics {
  /** Clear space between the end marker and its label: a line that close to the marker runs under the gap, not the text. */
  gap: number;
  /** The band an end label takes on one side of its point, gap included. */
  band: number;
  /** How close to an edge the point may sit and still take its label on that side. */
  edge: number;
  /** How close to the top a reference line may sit and still take its label above. */
  referenceEdge: number;
}

export function labelMetrics(size: SparklineSize = "md"): LabelMetrics {
  const px = SPARKLINE_PX;
  const unit = 100 / (px.plot[size] - 2 * px.inset);
  const band = (px.endGap + px.endLine[size]) * unit;
  return {
    gap: round(px.endGap * unit),
    band: round(band),
    edge: round(band - px.inset * unit),
    referenceEdge: round((px.referenceLine + px.referenceGap - px.inset) * unit),
  };
}

const round = (n: number) => Math.round(n * 100) / 100;

/** x of the i-th of `count` evenly spaced slots. One slot sits in the middle. */
export function slotX(index: number, count: number): number {
  if (count <= 1) return 50;
  return round((index / (count - 1)) * 100);
}

/** y of `value` on a `[min, max]` axis, clamped to the frame. */
export function valueY(value: number, domain: Domain): number {
  return round((1 - clamp(fractionOf(value, domain), 0, 1)) * 100);
}

/**
 * Where a label goes next to the end point. Horizontally it stays inside the
 * frame (a point in the right third takes its label on the left). Vertically
 * it avoids the line that arrives at the point: if the previous point is
 * higher on screen, the line comes down from above, so the label goes below —
 * unless that would push it past an edge, which wins.
 *
 * Then the reference line, when there is one: the dashed line runs the full
 * width of the plot, so a label on its side of the point sat ON it — the
 * « fine » ending's trust ends flat at 19 with the viral threshold at 35, and
 * « 19 / 100 » was printed across the red dashes. The label takes the other
 * side if that side is clear of the line; otherwise it stays where it was.
 * The frame edges are never traded for it: a label cut off by the edge is
 * worse than a dash under one.
 */
export function endLabelPlacement(
  end: PlotPoint,
  previous: PlotPoint | null,
  referenceY: number | null = null,
  metrics: LabelMetrics = labelMetrics(),
): LabelPlacement {
  const horizontal = end.x > 60 ? "left" : "right";
  if (end.y < metrics.edge) return { horizontal, vertical: "below" };
  if (end.y > 100 - metrics.edge) return { horizontal, vertical: "above" };
  const fromAbove = previous !== null && previous.y < end.y;
  const preferred: LabelPlacement["vertical"] = fromAbove ? "below" : "above";
  if (referenceY === null || !lineCrossesLabel(end.y, preferred, referenceY, metrics)) {
    return { horizontal, vertical: preferred };
  }
  const other: LabelPlacement["vertical"] = preferred === "above" ? "below" : "above";
  return { horizontal, vertical: lineCrossesLabel(end.y, other, referenceY, metrics) ? preferred : other };
}

/** Whether a horizontal line at `lineY` runs through the band a label takes on `side` of a point at `y`. */
function lineCrossesLabel(y: number, side: LabelPlacement["vertical"], lineY: number, m: LabelMetrics): boolean {
  return side === "above" ? lineY > y - m.band && lineY < y - m.gap : lineY > y + m.gap && lineY < y + m.band;
}

/** A reference line's label sits above the line, unless the line is too close to the top for it. */
export function referencePlacement(y: number, metrics: LabelMetrics = labelMetrics()): "above" | "below" {
  return y < metrics.referenceEdge ? "below" : "above";
}

/** Path data for runs of known points; each run starts with `M`. A lone point becomes a zero-length stroke, which a round cap draws as a dot. */
export function linePath(runs: readonly (readonly PlotPoint[])[]): string {
  return runs
    .filter((run) => run.length > 0)
    .map((run) => {
      const [first, ...rest] = run;
      const tail = rest.length ? rest : [first!];
      return `M${first!.x} ${first!.y}` + tail.map((p) => ` L${p.x} ${p.y}`).join("");
    })
    .join(" ");
}

/**
 * `reference` is the value of the chart's dashed line, if it draws one: the
 * end label steps out of its way (`endLabelPlacement`). A reference outside
 * the frame is not drawn, so it constrains nothing.
 */
export function sparklineGeometry(
  values: readonly (number | null)[],
  domain: Domain,
  reference: number | null = null,
  size: SparklineSize = "md",
): SparklineGeometry {
  const metrics = labelMetrics(size);
  const points: PlotPoint[] = [];
  const runs: PlotPoint[][] = [];
  let run: PlotPoint[] = [];

  values.forEach((value, index) => {
    if (value === null || !Number.isFinite(value)) {
      if (run.length) runs.push(run);
      run = [];
      return;
    }
    const point: PlotPoint = {
      index,
      value,
      x: slotX(index, values.length),
      y: valueY(value, domain),
      overflow: overflowOf(value, domain),
    };
    points.push(point);
    run.push(point);
  });
  if (run.length) runs.push(run);

  const end = points.at(-1) ?? null;
  const previous = points.length > 1 ? points.at(-2)! : null;

  return {
    points,
    path: linePath(runs),
    end,
    endLabel: end
      ? endLabelPlacement(
          end,
          previous,
          reference === null ? null : (referenceGeometry(reference, domain, size)?.y ?? null),
          metrics,
        )
      : { horizontal: "right", vertical: "above" },
  };
}

export interface AxisTick {
  value: number;
  y: number;
}

/**
 * The caller's ticks placed on the axis. A tick outside `[min, max]` is
 * dropped rather than clamped: a gridline at the edge labelled with a value
 * the edge does not have would be a wrong axis, silently.
 */
export function axisTicks(ticks: readonly number[], domain: Domain): AxisTick[] {
  return ticks
    .filter((t) => Number.isFinite(t) && overflowOf(t, domain) === null)
    .map((value) => ({ value, y: valueY(value, domain) }));
}

export interface ReferenceGeometry {
  y: number;
  label: "above" | "below";
}

/**
 * A reference line (an objective, a threshold) at `value`, or `null` when the
 * value is outside the frame. Unlike a data point, a reference is not clamped
 * to the edge: a dashed line along the top labelled "target 4 %" on a chart
 * that stops at 3 % would place the target where it is not. The caller that
 * wants it visible widens `[min, max]` — that is a choice about the scale, and
 * it belongs to the caller (R16).
 */
export function referenceGeometry(
  value: number,
  domain: Domain,
  size: SparklineSize = "md",
): ReferenceGeometry | null {
  if (!Number.isFinite(value) || overflowOf(value, domain) !== null) return null;
  const y = valueY(value, domain);
  return { y, label: referencePlacement(y, labelMetrics(size)) };
}
