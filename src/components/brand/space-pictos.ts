import type { Space } from "./SpaceBand";

/**
 * The road book's three pictograms as plain data — a flat stage, a stopwatch,
 * a mountain, in their 34 × 22 drawing — with nothing about how they are
 * painted.
 *
 * Three readers, one drawing: the band and everything that reuses its marks
 * (`SPACE_PICTO` in `SpaceBand.tsx`, in `currentColor`), and the share
 * images, which Satori draws with a literal colour: the result's « 1/3 ·
 * PLAINE » pill (`lib/og/result-frame.tsx`, which used to keep its own copy
 * of the Tour's) and the engine's « 2/3 · CONTRE-LA-MONTRE » (`engine-frame.tsx`).
 * Kept out of `SpaceBand.tsx` so an image route never imports its CSS module
 * or its analytics.
 */
export type PictoPart =
  /** An open line, stroked. */
  | { kind: "stroke"; d: string; width: number }
  /** A closed shape, filled. */
  | { kind: "fill"; d: string }
  /** A circle, stroked and never filled. */
  | { kind: "ring"; cx: number; cy: number; r: number; width: number };

export const PICTO_VIEWBOX = "0 0 34 22";

export const SPACE_PICTO_PARTS: Record<Space, readonly PictoPart[]> = {
  tour: [
    { kind: "stroke", d: "M1 20.5H33", width: 2.2 },
    { kind: "fill", d: "M1 19V15.2C5 14.2 8 15.6 12 14.8S20 13.9 24 14.6 30 14.2 33 14.4V19Z" },
    { kind: "stroke", d: "M28.6 14V4.2", width: 1.8 },
    { kind: "fill", d: "M28.6 4.4H33V8.6H28.6Z" },
  ],
  engine: [
    { kind: "ring", cx: 17, cy: 12.6, r: 7.6, width: 2.2 },
    { kind: "stroke", d: "M17 12.6V7.8M14.2 2.2H19.8M17 2.2V5", width: 2.2 },
    { kind: "stroke", d: "M23.2 6.4L25 4.6", width: 2.2 },
    { kind: "stroke", d: "M1 9.5H7M3 13H7.5M1 16.5H7", width: 1.8 },
  ],
  game: [
    { kind: "stroke", d: "M1 20.5H33", width: 2.2 },
    { kind: "fill", d: "M1 19.4L10.4 9.2L14 12.6L20.6 3.2L33 19.4Z" },
  ],
};
