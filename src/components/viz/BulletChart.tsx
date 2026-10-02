import { bandGeometry, bulletGeometry } from "@/lib/viz/bullet";
import styles from "./BulletChart.module.css";

export interface BulletChartProps {
  /**
   * The figure, drawn as the ink bar. `null` when there is none yet — a
   * number's screen before the value is typed, with its target and its
   * published range already known (design system extension 07): no bar.
   */
  value: number | null;
  /** The objective. Drawn as a 3px `--viz-highlight` tick; outside `domain`, `null` or not a number, it is not drawn at all. */
  target: number | null;
  /**
   * The track's scale, from the caller. A value past its top fills the track
   * to the edge and the bar's end turns into a point, saying "further than
   * this" instead of pretending the value sits on the edge. A value below its
   * bottom draws no bar at all — an empty track would read as "exactly the
   * minimum" — but an outlined chevron against the start, pointing out of the
   * track: "lower than this". Shape, not colour, carries both.
   */
  domain: readonly [number, number];
  /**
   * The published range `[low, high]`, drawn as a bracket UNDER the track —
   * never on it, so the bar never hides it and it never reads as a second
   * value (design system extension 07). It situates; it never designates
   * (C1): no red, no tag, ever. A team's target is the tick, never a band.
   * Say the range in `ariaLabel` too (« référence 2–5 % »).
   */
  band?: readonly [number, number];
  /**
   * Required: the chart's text equivalent, value AND target, in words
   * ("Résiliations 6,0 %, objectif 5,6 % : au-dessus"). Nothing drawn is read.
   */
  ariaLabel: string;
  /** `sm` 8px track, inside a StatTile. `md` 12px, on its own row. */
  size?: "sm" | "md";
  className?: string;
  "data-testid"?: string;
}

/**
 * A value against its target on one fixed track — DS v3 §5.7.
 *
 * The bar is ink, the target is the red tick: the doctrine's "ink + one
 * highlight", where the highlight is the thing being aimed at. No legend and
 * no numbers inside it: it sits under a figure that already states the value,
 * and the tile's `sub` states the target. That is also why it never carries
 * meaning on its own — the text around it does, the bar repeats it.
 *
 * Qualitative bands (the classic bullet background) are not drawn: the game's
 * mini tile has no room for their labels, and bands without labels are
 * decoration that looks like data. The one range it draws is `band`, a
 * published reference, under the track and in the axis's ink.
 */
export function BulletChart({
  value,
  target,
  domain,
  band,
  ariaLabel,
  size = "sm",
  className,
  "data-testid": testId,
}: BulletChartProps) {
  const g = bulletGeometry(value, target, domain);
  const b = bandGeometry(band, domain);

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={[styles.wrap, styles[size], className ?? ""].filter(Boolean).join(" ")}
      data-testid={testId}
    >
      <div className={styles.track} aria-hidden="true">
        {!g.valueKnown ? null : g.valueOverflow === "low" ? (
          <span className={styles.below} data-overflow="low" />
        ) : (
          <span
            className={[styles.value, g.valueOverflow === "high" ? styles.overflow : ""].filter(Boolean).join(" ")}
            style={{ width: `${g.valuePct}%` }}
            data-overflow={g.valueOverflow ?? undefined}
          />
        )}
        {g.targetPct !== null ? <span className={styles.target} style={{ left: `${g.targetPct}%` }} /> : null}
      </div>
      {b ? (
        <div className={styles.bandRow} aria-hidden="true">
          <span className={styles.band} style={{ left: `${b.leftPct}%`, width: `${b.widthPct}%` }} data-band="" />
        </div>
      ) : null}
    </div>
  );
}
