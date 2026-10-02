import { clamp, fractionOf, overflowOf, type Domain, type Overflow } from "./scale";

/**
 * Geometry of `viz/BulletChart` and of the meter bar inside `viz/StatTile`:
 * both are "how far along a fixed track", expressed as a percentage of the
 * track's width.
 */

export interface BulletGeometry {
  /**
   * Whether there is a value bar to draw at all. False for no figure yet
   * (`null`, design system extension 07: a number's screen before the value
   * is typed) and for one that is not a number: no bar, never a sliver.
   */
  valueKnown: boolean;
  /** Width of the value bar, 0–100 (% of the track); 0 when there is no value. */
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
export function bulletGeometry(value: number | null, target: number | null, domain: Domain): BulletGeometry {
  const valueKnown = isNumber(value);
  const targetOverflow = isNumber(target) ? overflowOf(target, domain) : null;
  return {
    valueKnown,
    valuePct: valueKnown ? pct(value, domain) : 0,
    targetPct: isNumber(target) && targetOverflow === null ? pct(target, domain) : null,
    valueOverflow: valueKnown ? overflowOf(value, domain) : null,
    targetOverflow,
  };
}

const isNumber = (n: number | null): n is number => n !== null && Number.isFinite(n);

/** Where the published range sits under the track: its left edge and its width, both 0–100 (% of the track). */
export interface BandGeometry {
  leftPct: number;
  widthPct: number;
}

/**
 * The bracket of BulletChart's `band` (design system extension 07): a
 * published range, clamped to the domain as the bar and the tick are. `null`
 * when there is nothing to draw: a bound that is not a number, or a range
 * that lies wholly outside the domain — clamped, it would collapse into a
 * bracket on the edge that no published range says.
 */
export function bandGeometry(band: readonly [number, number] | undefined, domain: Domain): BandGeometry | null {
  if (!band || !band.every(Number.isFinite)) return null;
  const lo = Math.min(band[0], band[1]);
  const hi = Math.max(band[0], band[1]);
  if (hi < Math.min(domain[0], domain[1]) || lo > Math.max(domain[0], domain[1])) return null;
  // A descending domain puts `lo` on the right: the bracket runs between the two edges, whichever way.
  const [a, b] = [pct(lo, domain), pct(hi, domain)];
  const left = Math.min(a, b);
  return { leftPct: left, widthPct: Math.round((Math.max(a, b) - left) * 100) / 100 };
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
