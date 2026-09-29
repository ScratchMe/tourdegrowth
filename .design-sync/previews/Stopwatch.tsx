import { Stopwatch } from "tour-de-growth";

/*
 * The engine's stopwatch — design I + B, retained by Antoine on 2026-09-28.
 * The engine is the race's time trial, and this is its emblem drawn large:
 * the band's 34 × 22 pictogram at full size, ink lines, a card face, the
 * engine's ultramarine on the bezel, the buttons and the time already run.
 *
 * An illustration: aria-hidden, no word on it, never a control. It fills the
 * width it is given; the engine's intro gives it 280px beside the title on a
 * wide screen and drops it under 1100px. On paper only.
 */

/** As the engine's intro sets it: 280px wide. */
export const Intro = () => (
  <div style={{ width: 280 }}>
    <Stopwatch />
  </div>
);

/** Smaller, the same drawing: nothing in it depends on the size. */
export const Small = () => (
  <div style={{ width: 120 }}>
    <Stopwatch />
  </div>
);
