import type { CSSProperties } from "react";
import { axisTicks, referenceGeometry, slotX, sparklineGeometry } from "@/lib/viz/sparkline";
import styles from "./Sparkline.module.css";

export interface SparklineReference {
  /** Where the dashed line sits, on the same scale as `values`. Outside `[min, max]` it is not drawn at all. */
  value: number;
  /** Already formatted ("objectif 4 %"). Printed next to the line — the red dash never speaks alone. */
  label: string;
}

export interface SparklineProps {
  /** One series, one slot per entry. `null` is an unknown or not-yet-played period: a gap, never a zero. */
  values: readonly (number | null)[];
  /**
   * The scale, chosen by the caller and never fitted to the data: a curve that
   * rescaled itself every quarter would make a small change look like a cliff.
   * A value outside it is drawn on the edge (the end marker turns hollow) and
   * `endLabel` still states it.
   */
  min: number;
  max: number;
  /** Values to draw a gridline and a label at. Outside `[min, max]` they are dropped, not clamped. */
  ticks?: readonly number[];
  /** Formats a tick label. Use the same formatter as the rest of the screen. */
  formatTick?: (value: number) => string;
  /** A dashed `--viz-highlight` line — an objective, a threshold. */
  reference?: SparklineReference;
  /** One per entry of `values` (month initials): same slots, same order. */
  xLabels?: readonly string[];
  /**
   * The last known value, formatted by the caller — the SAME string the
   * matching tile or cell shows, so the chart and the number cannot disagree.
   */
  endLabel?: string;
  /**
   * Required: the chart's text equivalent, and it must state the trend, not
   * describe the picture ("Résiliations : de 6,0 % en janvier à 4,1 % en
   * décembre, sous l'objectif depuis octobre"). Everything drawn is
   * `aria-hidden`.
   */
  ariaLabel: string;
  /** `md` 160px tall, for a ChartFrame. `sm` 64px, inline next to a figure. */
  size?: "md" | "sm";
  /** Draws the line in once (800ms). Off under reduced motion, where the line is simply there. */
  animate?: boolean;
  className?: string;
  "data-testid"?: string;
}

const at = (x: number, y: number): CSSProperties => ({ left: `${x}%`, top: `${y}%` });

/**
 * A single series over time, drawn by hand — DS v3 §5.7, no chart library.
 *
 * Ink line 2px, one end marker, the last value written next to it, an
 * optional dashed red reference (an objective) with its label. Gridlines are
 * decorative; the reading is carried by the end label and `ariaLabel`, and by
 * the `DataTable` a `ChartFrame` puts under "see the data".
 *
 * Responsive by construction: the line is an SVG in a 0–100 `viewBox`
 * stretched to its box with a non-scaling stroke, and every label is HTML
 * positioned in percent — so text never scales with the width, which an SVG
 * `<text>` in a stretched `viewBox` would.
 *
 * One series only. Two series are two charts, or a different component: this
 * one has no legend and no color but ink. Under 4 points, prefer a
 * `StatTile` — a trend of three dots is a sentence, not a chart.
 */
export function Sparkline({
  values,
  min,
  max,
  ticks = [],
  formatTick = String,
  reference,
  xLabels,
  endLabel,
  ariaLabel,
  size = "md",
  animate = false,
  className,
  "data-testid": testId,
}: SparklineProps) {
  const domain = [min, max] as const;
  const geometry = sparklineGeometry(values, domain, reference?.value ?? null);
  const gridlines = axisTicks(ticks, domain);
  const ref = reference ? referenceGeometry(reference.value, domain) : null;
  const end = geometry.end;
  const hasTicks = gridlines.length > 0;

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={[styles.wrap, styles[size], hasTicks ? styles.withTicks : "", className ?? ""]
        .filter(Boolean)
        .join(" ")}
      data-testid={testId}
    >
      {hasTicks ? (
        <div className={styles.ticks} aria-hidden="true">
          {gridlines.map((t) => (
            <span key={t.value} className={styles.tick} style={{ top: `${t.y}%` }}>
              {formatTick(t.value)}
            </span>
          ))}
          {/*
           * The labels above are absolutely positioned, so they give the
           * column no width. These invisible copies, in flow, do: the column
           * is as wide as the widest label, whatever the formatter returns.
           */}
          {gridlines.map((t) => (
            <span key={t.value} className={styles.tickSizer}>
              {formatTick(t.value)}
            </span>
          ))}
        </div>
      ) : null}

      <div className={styles.plot} aria-hidden="true">
        <div className={styles.canvas}>
          {gridlines.map((t) => (
            <span key={t.value} className={styles.gridline} style={{ top: `${t.y}%` }} />
          ))}

          {ref && reference ? (
            <>
              <span className={styles.reference} style={{ top: `${ref.y}%` }} data-testid="sparkline-reference" />
              <span className={`${styles.referenceLabel} ${styles[ref.label]}`} style={{ top: `${ref.y}%` }}>
                {reference.label}
              </span>
            </>
          ) : null}

          <svg
            className={[styles.line, animate ? styles.draw : ""].filter(Boolean).join(" ")}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            focusable="false"
          >
            <path d={geometry.path} vectorEffect="non-scaling-stroke" />
          </svg>

          {end ? (
            <>
              <span
                className={[styles.endDot, end.overflow ? styles.overflow : "", animate ? styles.late : ""]
                  .filter(Boolean)
                  .join(" ")}
                style={at(end.x, end.y)}
                data-overflow={end.overflow ?? undefined}
              />
              {endLabel ? (
                <span
                  className={[
                    styles.endLabel,
                    styles[geometry.endLabel.horizontal],
                    styles[geometry.endLabel.vertical],
                    animate ? styles.late : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={at(end.x, end.y)}
                >
                  {endLabel}
                </span>
              ) : null}
            </>
          ) : null}
        </div>
      </div>

      {xLabels?.length ? (
        <div className={styles.xLabels} aria-hidden="true">
          {xLabels.map((label, i) => (
            <span key={i} className={styles.xLabel} style={{ left: `${slotX(i, values.length)}%` }}>
              {label}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
