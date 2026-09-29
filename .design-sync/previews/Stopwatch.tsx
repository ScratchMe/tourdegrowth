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

/** As the engine's intro sets it: 280px wide, beside the title, from 1100px. */
export const Intro = () => (
  <figure style={{ width: 280, margin: 0 }}>
    <Stopwatch />
    <figcaption style={{ font: "var(--meta-xs)", color: "var(--text-muted)", marginTop: 8 }}>
      Beside the engine&apos;s intro, 280px, from 1100px
    </figcaption>
  </figure>
);

/** Smaller, the same drawing: nothing in it depends on the size. */
export const Small = () => (
  <figure style={{ width: 120, margin: 0 }}>
    <Stopwatch />
    <figcaption style={{ font: "var(--meta-xs)", color: "var(--text-muted)", marginTop: 8 }}>120px</figcaption>
  </figure>
);
