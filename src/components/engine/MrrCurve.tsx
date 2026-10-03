"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { mrrCurveGeometry, type CurveLine, type CurvePoint } from "@/lib/viz/mrr-curve";
import styles from "./MrrCurve.module.css";

export type { CurvePoint } from "@/lib/viz/mrr-curve";

export interface MrrCurveProps {
  /** 13 points [low, high] at today's pace, today first; a range (an estimate upstream) draws as a hatched band. */
  today: readonly CurvePoint[];
  /** 13 points with the what-ifs, or null: untouched, today's pace alone. */
  whatif?: readonly CurvePoint[] | null;
  /**
   * A fixed width, in px — a slide, drawn at 1 920 and scaled whole. Without
   * it the curve measures its column and draws at that real width, so its
   * type never scales; under `compactBelow` it lays its keys under the plot.
   */
  width?: number;
  height?: number;
  /** The measured width under which the keys go under the plot, as a legend (a phone). */
  compactBelow?: number;
  /** « au rythme d'aujourd'hui » · « avec tes « Et si » ». */
  keys: { today: ReactNode; whatif?: ReactNode };
  /** Today's MRR, the only figure on the curve: « 48 000 € aujourd'hui ». */
  start: ReactNode;
  /** Three months under the axis: today, in six months, in twelve. */
  xLabels?: readonly [ReactNode, ReactNode, ReactNode];
  /** The curve in words, for a screen reader: the SVG is decoration. */
  summary: ReactNode;
  /** Unique per page: the hatch pattern's id. */
  id: string;
  className?: string;
  "data-testid"?: string;
}

/** The column's width before it is measured: the board's, on a desktop. */
const DEFAULT_WIDTH = 720;

/**
 * The MRR month by month — design system extension 09 (Q8). A line, not
 * bars: thirteen points of one quantity and two of them to compare. Both
 * lines are ink, never red — a projection is not a diagnosis (S-5):
 *
 * - « at today's pace »: the axis ink, 2px; « with your what-ifs »: the full
 *   ink, 3px, and the room between them in the grid's wash — what the
 *   what-ifs add. Neither dashed: dashed means « not yet », both are
 *   projections;
 * - a range (an estimate upstream): the band between its low and high
 *   paths, hatched as the system hatches an estimate, edged by both;
 * - each line named at its end, or in a legend under the plot on a phone;
 * - one figure on the curve, today's MRR at its origin. The MRR in twelve
 *   months is printed once, under it, by the card — real text.
 *
 * The SVG is `aria-hidden`; `summary` says the curve in words.
 */
export function MrrCurve({
  today,
  whatif = null,
  width: fixed,
  height = 200,
  compactBelow = 520,
  keys,
  start,
  xLabels,
  summary,
  id,
  className,
  "data-testid": testId,
}: MrrCurveProps) {
  const box = useRef<HTMLElement>(null);
  const [measured, setMeasured] = useState<number | null>(null);
  useLayoutEffect(() => {
    const el = box.current;
    if (fixed !== undefined || !el) return;
    const apply = () => setMeasured(Math.floor(el.clientWidth));
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(el);
    return () => observer.disconnect();
  }, [fixed]);
  const width = fixed ?? (measured && measured > 0 ? measured : DEFAULT_WIDTH);
  const compact = fixed === undefined && width < compactBelow;
  const g = mrrCurveGeometry({ today, whatif, width, height, compact });
  const hatch = `${id}-hatch`;

  const drawLine = (line: CurveLine, kind: "today" | "whatif") => (
    <g className={kind === "whatif" ? styles.whatif : styles.today} data-range={line.range ? "true" : undefined}>
      {line.range ? (
        <>
          <polygon points={line.band!} className={styles.band} fill={`url(#${hatch})`} />
          <polyline points={line.path} className={`${styles.line} ${styles.edge}`} />
          <polyline points={line.low!} className={`${styles.line} ${styles.edge}`} />
        </>
      ) : (
        <>
          <polyline points={line.path} className={styles.line} />
          <circle cx={line.end.x} cy={line.end.y} r={4} className={styles.dot} />
        </>
      )}
    </g>
  );

  return (
    <figure
      ref={box}
      className={[styles.root, compact ? styles.compact : "", className].filter(Boolean).join(" ")}
      data-compact={compact ? "true" : undefined}
      data-testid={testId}
    >
      <svg className={styles.svg} width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" focusable="false">
        <defs>
          <pattern id={hatch} patternUnits="userSpaceOnUse" width={6} height={6} patternTransform="rotate(45)">
            <rect width={2} height={6} className={styles.hatch} />
          </pattern>
        </defs>
        {/* Today's level, as a faint rule: the curve reads as a gain from it. */}
        <line x1={g.level.x1} x2={g.level.x2} y1={g.level.y} y2={g.level.y} className={styles.level} />
        {g.gain ? <polygon points={g.gain} className={styles.gain} /> : null}
        {drawLine(g.today, "today")}
        {g.whatif ? drawLine(g.whatif, "whatif") : null}
        <circle cx={g.start.x} cy={g.start.y} r={4} className={styles.start} />
        <text x={g.start.x + 8} y={g.start.labelY} className={`${styles.tick} ${styles.startLabel} ${styles.halo}`} textAnchor="start">
          {start}
        </text>
        {xLabels ? (
          <>
            <text x={g.ticks[0]} y={g.tickY} className={styles.tick} textAnchor="start">
              {xLabels[0]}
            </text>
            <text x={g.ticks[1]} y={g.tickY} className={styles.tick} textAnchor="middle">
              {xLabels[1]}
            </text>
            <text x={g.ticks[2]} y={g.tickY} className={styles.tick} textAnchor="end">
              {xLabels[2]}
            </text>
          </>
        ) : null}
        {g.keys && g.whatif && g.keys.whatif !== null ? (
          <text x={g.keys.x} y={g.keys.whatif} className={`${styles.key} ${styles.keyWhatif}`}>
            {keys.whatif}
          </text>
        ) : null}
        {g.keys ? (
          <text x={g.keys.x} y={g.keys.today} className={`${styles.key} ${styles.keyToday}`}>
            {keys.today}
          </text>
        ) : null}
      </svg>
      {compact ? (
        <ul className={styles.legend} aria-hidden="true">
          {g.whatif ? <li className={`${styles.legendItem} ${styles.legendWhatif}`}>{keys.whatif}</li> : null}
          <li className={styles.legendItem}>{keys.today}</li>
        </ul>
      ) : null}
      <figcaption className="tdg-visually-hidden">{summary}</figcaption>
    </figure>
  );
}
