import styles from "./DotGrid.module.css";

/**
 * One dot of a grid. Every mark is ink or a hatch, told apart by its SHAPE,
 * never by a second colour (DS v3 §5.5, WCAG 1.4.1); the one red is the
 * bottleneck's, given to a whole grid by `highlighted`.
 *
 * - `filled` — counted: solid ink (red in the highlighted grid).
 * - `range` — counted, not certain: the part of an estimate between its low
 *   and high bound, hatched in an outline. « 6 à 9 » is six solid dots and
 *   three hatched ones, never « 7.5 ».
 * - `empty` — not in the count: an outline.
 * - `referred` / `referredRange` — a sign-up someone brought: an ink ring
 *   around a paper core (on the hatch when estimated).
 * - `gained` / `gainedRange` — what a what-if adds: a ring with an ink centre.
 * - `lost` — what today had and the what-if loses: a ring struck through,
 *   never a gap that reads as nobody.
 */
export type DotMark = "filled" | "range" | "empty" | "referred" | "referredRange" | "gained" | "gainedRange" | "lost";

export interface DotGridProps {
  /**
   * `known`: the dots, row by row from the top left, ten to a row — 100 are
   * a square, more grow it row by row (a what-if past today's reach).
   * `unknown`: nobody measures it — the whole grid is one hatched panel with
   * a « ? » on a paper disc, a shape of its own, so it can never read as zero
   * (100 empty dots would say « nobody »).
   */
  grid: { kind: "known" | "unknown"; dots: readonly DotMark[] };
  /** Required: the grid's reading in one sentence (« 18 of the 100 sign-ups reach first value, measured, Amplitude »). The dots are aria-hidden. */
  label: string;
  /** The bottleneck's grid: its counted dots take the one red. Say it in words too — a stamp, a label. */
  highlighted?: boolean;
  /**
   * What the grid is drawn for — not a scale, so not `size` (the variant
   * names, S-16). `screen`: fills its column up to 200px, a 118px mini-grid
   * under 760px. `slide`: 200px on a 1920px slide, with the slide's heavier
   * stroke.
   */
  medium?: "screen" | "slide";
  className?: string;
  "data-testid"?: string;
}

/**
 * The funnel as counts — engine spec §8.1, D5: every grid is the same 100
 * sign-ups, so a column is a count and never a length, and there is no scale
 * to defend. The one grid the peloton, the what-if panel and the slides draw
 * (design audit S-10, 2026-09-29): each drew its own, at 210, 190 and 200px,
 * with its own strokes.
 *
 * Its strokes read the border tokens: an outline at --border-width-fine
 * (--border-width on a slide, the hairline on a phone), a ring at twice the
 * edge. Every dot carries `data-dot`, so a test counts marks, not pixels.
 */
export function DotGrid({ grid, label, highlighted = false, medium = "screen", className, "data-testid": testId }: DotGridProps) {
  const unknown = grid.kind === "unknown";
  const classes = [styles.grid, styles[medium], unknown ? styles.unknown : "", highlighted && !unknown ? styles.highlighted : "", className ?? ""].filter(Boolean).join(" ");
  return (
    <div role="img" aria-label={label} className={classes} data-testid={testId} data-state={unknown ? "unknown" : "known"}>
      {unknown ? (
        <span className={styles.question} aria-hidden="true">
          ?
        </span>
      ) : (
        grid.dots.map((dot, i) => <span key={i} className={`${styles.dot} ${styles[dot]}`} data-dot={dot} aria-hidden="true" />)
      )}
    </div>
  );
}

export interface DotLegendProps {
  /** One entry per mark the grids beside it DRAW — a legend entry for a shape nobody sees is one more thing to read. `unknown` is the hatched panel. */
  items: readonly { mark: DotMark | "unknown"; label: string }[];
  /** When a text equivalent already says it all (a visually hidden table), the legend is for the eye only. */
  "aria-hidden"?: boolean;
  /** What the grids it names are drawn for: `slide` draws 20px swatches in the slide's meta type. */
  medium?: "screen" | "slide";
  className?: string;
  "data-testid"?: string;
}

/** The legend under a set of grids: each swatch drawn by the same rules as the dot it names, stroke included. */
export function DotLegend({ items, "aria-hidden": ariaHidden, medium = "screen", className, "data-testid": testId }: DotLegendProps) {
  return (
    <ul
      className={[styles.legend, medium === "slide" ? styles.legendSlide : "", className ?? ""].filter(Boolean).join(" ")}
      aria-hidden={ariaHidden || undefined}
      data-testid={testId}
    >
      {items.map((item) => (
        <li key={item.mark}>
          <span className={`${styles.swatch} ${item.mark === "unknown" ? styles.unknownSwatch : styles[item.mark]}`} aria-hidden="true" />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
