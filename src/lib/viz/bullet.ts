import { clamp, fractionOf, overflowOf, type Domain, type Overflow } from "./scale";

/**
 * Geometry of `viz/BulletChart` and of the meter bar inside `viz/StatTile`:
 * both are "how far along a fixed track", expressed as a percentage of the
 * track's width.
 */

export interface BulletGeometry {
  /** Width of the value bar, 0–100 (% of the track). */
  valuePct: number;
  /**
   * Centre of the target marker, 0–100 — or `null` when there is no marker to
   * draw: a target outside the domain, or one that is not a number. The rule
   * lives here and not in the component so it cannot be forgotten by the next
   * one: a `left: NaN%` is rejected by CSS and falls back to the track's
   * start, which would draw a red objective of 0 that nobody set.
   */
  targetPct: number | null;
  /**
   * A value outside the domain is clamped to the edge — this says which one,
   * so it can be marked. `null` for a value inside the domain AND for one that
   * is not a number: an absent reading is an empty track, never a claim that
   * it went past an edge.
   */
  valueOverflow: Overflow;
  targetOverflow: Overflow;
}

const pct = (value: number, domain: Domain) => Math.round(clamp(fractionOf(value, domain), 0, 1) * 10000) / 100;

/**
 * Not a number, or ±Infinity: both come from a missing field or a division by
 * zero upstream, never from a measurement, so neither is drawn as one — the
 * same rule as `meterPct`. The chart's aria-label, written by the caller from
 * the same data, is where "no reading" gets said in words.
 */
export function bulletGeometry(value: number, target: number, domain: Domain): BulletGeometry {
  const valueKnown = Number.isFinite(value);
  const targetKnown = Number.isFinite(target);
  const targetOverflow = targetKnown ? overflowOf(target, domain) : null;
  return {
    valuePct: valueKnown ? pct(value, domain) : 0,
    targetPct: targetKnown && targetOverflow === null ? pct(target, domain) : null,
    valueOverflow: valueKnown ? overflowOf(value, domain) : null,
    targetOverflow,
  };
}

/**
 * A 0–100 meter reading as a width. Anything that is not a finite number is
 * an empty track rather than NaN% — a broken width in CSS silently falls back
 * to "auto", which would draw a FULL bar.
 */
export function meterPct(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return pct(value, [0, 100]);
}
