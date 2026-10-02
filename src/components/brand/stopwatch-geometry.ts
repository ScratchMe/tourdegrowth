/**
 * The engine's stopwatch as plain data — every shape of `brand/Stopwatch`,
 * in its 300 × 310 drawing, with nothing about how it is painted.
 *
 * Two readers, one drawing: the component (`Stopwatch.tsx`), which paints
 * these shapes with the classes of `Stopwatch.module.css`, and the engine's
 * share image (`lib/og/engine-frame.tsx`), which Satori draws with literal
 * colours because it reads no CSS. Kept out of the component so the image
 * route never imports a CSS module, and so the image cannot draw a stopwatch
 * the page does not (design brief 06: « the engine's emblem on its page and
 * in its band »).
 *
 * The stroke widths live in the CSS; `STOPWATCH_STROKES` repeats them for the
 * image, and `stopwatch-geometry.test.ts` holds the two equal.
 */

/** The face, in the 300 × 310 drawing: its centre and its radius. */
export const STOPWATCH_CX = 150;
export const STOPWATCH_CY = 172;
export const STOPWATCH_R = 116;

/** Where the hand stands, in turns: 42 seconds in, a run under way. */
const SWEEP = 0.7;
const HAND = STOPWATCH_R - 32;

const CX = STOPWATCH_CX;
const CY = STOPWATCH_CY;
const R = STOPWATCH_R;

const round = (n: number) => Math.round(n * 10) / 10;
/** A point on the face, `turn` of the way round from the top, `r` from the centre. */
const at = (turn: number, r: number) =>
  `${round(CX + Math.sin(turn * 2 * Math.PI) * r)} ${round(CY - Math.cos(turn * 2 * Math.PI) * r)}`;

/** Sixty ticks, every fifth one longer: two paths, since the two widths differ. */
const ticks = (major: boolean) =>
  Array.from({ length: 60 }, (_, k) => k)
    .filter((k) => (k % 5 === 0) === major)
    .map((k) => `M${at(k / 60, major ? R - 34 : R - 25)}L${at(k / 60, R - 18)}`)
    .join("");

export const STOPWATCH = {
  viewBox: "0 0 300 310",
  /** The hard shadow under the case: the face, offset. */
  shadow: { cx: CX + 7, cy: CY + 7, r: R },
  /** The crown button on top, and the stem under it. */
  crown: { x: CX - 17, y: 18, width: 34, height: 18, rx: 5 },
  stem: { x: CX - 6, y: 34, width: 12, height: 16 },
  /** The lap button: drawn at twelve o'clock, then turned to two. */
  lap: { x: CX - 8, y: CY - R - 18, width: 16, height: 14, rx: 4, transform: `rotate(40 ${CX} ${CY})` },
  face: { cx: CX, cy: CY, r: R },
  /** The ultramarine ring, just inside the face's ink line. */
  bezel: { cx: CX, cy: CY, r: R - 8 },
  /** The time run so far, a wedge from twelve o'clock to the hand. */
  wedge: `M${CX} ${CY}L${CX} ${CY - HAND}A${HAND} ${HAND} 0 1 1 ${at(SWEEP, HAND)}Z`,
  minor: ticks(false),
  major: ticks(true),
  hand: `M${CX} ${CY}L${at(SWEEP, HAND)}`,
  hub: { cx: CX, cy: CY, r: 8 },
} as const;

/** The widths `Stopwatch.module.css` strokes each part with. */
export const STOPWATCH_STROKES = {
  button: 2.5,
  face: 3,
  bezel: 8,
  minor: 1.4,
  major: 3.5,
  hand: 5,
} as const;

/** `--space-engine-accent` at this share fills the wedge (`color-mix` in the CSS). */
export const STOPWATCH_WEDGE_SHARE = 0.14;
