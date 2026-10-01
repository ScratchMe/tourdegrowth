/*
 * The Deep dive's wait, told by the clock (CHANTIERS.md A15.6, approved by
 * Antoine on 2026-10-01). The bar used to follow three messages on a fixed
 * 2.6 s timer: full at 5.2 s for a wait measured between 9 and 70 s
 * (GEMINI.md §2), and three steps no real step followed.
 *
 * Nothing on the server reports progress — one request, one answer — so the
 * bar follows the time spent against the time it usually takes, on a curve
 * that slows as it goes and never reaches the end: only the answer ends the
 * wait. A fast generation simply arrives early.
 */

/** "About a minute": what the screen already promises (R2-09). */
export const TYPICAL_WAIT_MS = 60_000;

/** At the typical wait the bar stands at this share — near the end, never at it. */
const SHARE_AT_TYPICAL = 0.85;

/** The share of the bar to fill after `elapsedMs`: 0 at the start, ~0.27 at 10 s, 0.85 at a minute, ~0.98 at two. */
export function waitProgress(elapsedMs: number, typicalMs = TYPICAL_WAIT_MS): number {
  if (!(elapsedMs > 0)) return 0;
  const tau = typicalMs / -Math.log(1 - SHARE_AT_TYPICAL);
  return 1 - Math.exp(-elapsedMs / tau);
}

/** "0:07", "1:05": the time spent, in whole seconds. */
export function formatElapsed(elapsedMs: number): string {
  const seconds = Math.max(0, Math.floor(elapsedMs / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
