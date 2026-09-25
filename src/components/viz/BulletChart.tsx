import { bulletGeometry } from "@/lib/viz/bullet";
import styles from "./BulletChart.module.css";

export interface BulletChartProps {
  value: number;
  /** The objective. Drawn as a 3px `--viz-highlight` tick; outside `domain`, or not a number, it is not drawn at all. */
  target: number;
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
   * Required: the chart's text equivalent, value AND target, in words
   * ("Résiliations 6,0 %, objectif 5,6 % : au-dessus"). Nothing drawn is read.
   */
  ariaLabel: string;
  /** `mini` 8px track, inside a StatTile. `md` 12px, on its own row. */
  size?: "mini" | "md";
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
 * decoration that looks like data.
 */
export function BulletChart({
  value,
  target,
  domain,
  ariaLabel,
  size = "mini",
  className,
  "data-testid": testId,
}: BulletChartProps) {
  const g = bulletGeometry(value, target, domain);

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={[styles.wrap, styles[size], className ?? ""].filter(Boolean).join(" ")}
      data-testid={testId}
    >
      <div className={styles.track} aria-hidden="true">
        {g.valueOverflow === "low" ? (
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
    </div>
  );
}
