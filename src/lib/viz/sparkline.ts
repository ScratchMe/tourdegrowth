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

/** How close to an edge (in the 0–100 space) a label may sit before it flips to the other side. */
export const LABEL_EDGE = 18;

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
 */
export function endLabelPlacement(end: PlotPoint, previous: PlotPoint | null): LabelPlacement {
  const horizontal = end.x > 60 ? "left" : "right";
  if (end.y < LABEL_EDGE) return { horizontal, vertical: "below" };
  if (end.y > 100 - LABEL_EDGE) return { horizontal, vertical: "above" };
  const fromAbove = previous !== null && previous.y < end.y;
  return { horizontal, vertical: fromAbove ? "below" : "above" };
}

/** A reference line's label sits above the line, unless the line hugs the top of the frame. */
export function referencePlacement(y: number): "above" | "below" {
  return y < LABEL_EDGE ? "below" : "above";
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

export function sparklineGeometry(values: readonly (number | null)[], domain: Domain): SparklineGeometry {
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
    endLabel: end ? endLabelPlacement(end, previous) : { horizontal: "right", vertical: "above" },
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
export function referenceGeometry(value: number, domain: Domain): ReferenceGeometry | null {
  if (!Number.isFinite(value) || overflowOf(value, domain) !== null) return null;
  const y = valueY(value, domain);
  return { y, label: referencePlacement(y) };
}
