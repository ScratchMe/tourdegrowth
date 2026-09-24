import { clamp, fractionOf, overflowOf, type Domain, type Overflow } from "./scale";

/**
 * Geometry of `viz/BulletChart` and of the meter bar inside `viz/StatTile`:
 * both are "how far along a fixed track", expressed as a percentage of the
 * track's width.
 */

export interface BulletGeometry {
  /** Width of the value bar, 0–100 (% of the track). */
  valuePct: number;
  /** Left edge of the target marker, 0–100. */
  targetPct: number;
  /** A value outside the domain fills the track to the edge — this says which one, so it can be marked. */
  valueOverflow: Overflow;
  targetOverflow: Overflow;
}

const pct = (value: number, domain: Domain) => Math.round(clamp(fractionOf(value, domain), 0, 1) * 10000) / 100;

export function bulletGeometry(value: number, target: number, domain: Domain): BulletGeometry {
  return {
    valuePct: pct(value, domain),
    targetPct: pct(target, domain),
    valueOverflow: overflowOf(value, domain),
    targetOverflow: overflowOf(target, domain),
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
