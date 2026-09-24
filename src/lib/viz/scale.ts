/**
 * Scales and ticks for the hand-built charts (DS v3 §5.7: no chart library).
 *
 * Every chart in `components/viz` draws in a normalised 0–100 space and lets
 * CSS stretch it to its box, so these functions only ever map a data value to
 * a fraction of an axis. Keeping them here, pure, is what lets the geometry
 * be tested without a browser — the components add nothing but markup.
 */

export type Domain = readonly [number, number];

/** `value` pulled back inside `[lo, hi]`. Tolerates the bounds given in either order. */
export function clamp(value: number, lo: number, hi: number): number {
  const min = Math.min(lo, hi);
  const max = Math.max(lo, hi);
  return Math.min(max, Math.max(min, value));
}

/**
 * Where `value` falls along `domain`, as 0–1, NOT clamped: a caller that needs
 * to know a value left the frame (to say so) reads the raw fraction first.
 *
 * A degenerate domain (min = max — a flat series, or one point) maps
 * everything to the middle rather than dividing by zero: a flat line drawn at
 * mid-height reads as "stable", which is what it is.
 */
export function fractionOf(value: number, domain: Domain): number {
  const [d0, d1] = domain;
  if (d1 === d0) return 0.5;
  return (value - d0) / (d1 - d0);
}

/** A linear map from `domain` onto `range`, clamped to the range so a mark never leaves its frame. */
export function linearScale(domain: Domain, range: Domain): (value: number) => number {
  const [r0, r1] = range;
  return (value) => {
    const f = clamp(fractionOf(value, domain), 0, 1);
    return r0 + f * (r1 - r0);
  };
}

/** Which side of the domain a value escaped from, if any. */
export type Overflow = "low" | "high" | null;

export function overflowOf(value: number, domain: Domain): Overflow {
  const min = Math.min(domain[0], domain[1]);
  const max = Math.max(domain[0], domain[1]);
  if (value < min) return "low";
  if (value > max) return "high";
  return null;
}

/**
 * "Nice" tick values inside `[min, max]`: a step of 1, 2, 2.5 or 5 × 10ⁿ, so
 * an axis reads 0 · 2 · 4 · 6 rather than 0 · 1.73 · 3.46. Only values that
 * land inside the domain are returned — a tick label outside the frame would
 * describe a place the line can never be.
 *
 * `target` is a number of intervals, and a ceiling rather than a promise: the
 * step is the first nice one at least `range / target`, so there are never
 * more intervals than asked for, sometimes fewer.
 * Floating-point noise is rounded away so a caller's formatter never sees
 * 0.30000000000000004.
 */
export function niceTicks(min: number, max: number, target = 4): number[] {
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  if (!Number.isFinite(lo) || !Number.isFinite(hi) || target < 1) return [];
  if (hi === lo) return [lo];

  const rough = (hi - lo) / target;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= rough) ?? 10 * magnitude;

  const decimals = Math.max(0, -Math.floor(Math.log10(step)) + 1);
  const round = (v: number) => Number(v.toFixed(decimals));

  const ticks: number[] = [];
  // A small epsilon so a bound that IS a multiple of the step (0, 10) is kept
  // despite the representation error of the multiplication that reaches it.
  const eps = step * 1e-9;
  for (let v = Math.ceil((lo - eps) / step) * step; v <= hi + eps; v += step) ticks.push(round(v));
  return ticks;
}
