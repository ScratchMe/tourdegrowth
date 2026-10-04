import type { ReactNode } from "react";
import { PAYBACK_CHART_PX, paybackChartGeometry, paysBackLabels, shortLabelY, type PaybackStory, type Range } from "@/lib/viz/payback-chart";
import styles from "./PaybackChart.module.css";

export interface PaybackChartProps {
  /** Decided by the loss verdict, never re-read from the middles: the drawing and the slide's words agree. */
  story: PaybackStory;
  /** ARPA × margin (self-serve) or ACV ÷ 12 × margin (sales-assisted), a month; null: the « ? » box. */
  monthlyMargin: Range | null;
  /** The CAC; a range draws as a hatched band. */
  cac: Range;
  /** The counted lifetime, in months (capped at 36). */
  lifetime: Range | null;
  /** CAC ÷ monthly margin, in months. */
  payback: Range | null;
  /** The commonly cited payback reference, dotted (12 months), or null. */
  reference: number | null;
  /** Drawn at its real size on the slide's 1 920 canvas, so its type never scales. */
  width: number;
  height: number;
  labels: {
    /** « 0 », « 36 mois »: the axis's two ends. */
    start: ReactNode;
    end: ReactNode;
    /** « 12 mois · repère couramment cité », on the axis row: it situates, never judges. */
    reference: ReactNode;
    /** « ce que coûte un nouveau client ». */
    cost: ReactNode;
    /** No margin: « il manque la marge brute ». */
    unknown: ReactNode;
    /** « part vers 17 mois », or « compté jusqu'à 36 mois, le plafond ». */
    leaves: ReactNode;
    /** Loss: « rembourserait à 21 mois »; pays back: « remboursé : 11 mois ». */
    paysBack: ReactNode;
    /** Loss: « il manque ~400 € ». */
    short: ReactNode;
    /** Pays back: « ~22 mois de marge après ». */
    after: ReactNode;
    /** `size="sm"` only: the time story on the axis row, « part vers 17 mois ; rembourserait à 21 mois ». */
    time?: ReactNode;
  };
  /** The chart in words, for a screen reader: the SVG is decoration. */
  summary: ReactNode;
  /** Unique per page: the hatch patterns' ids. */
  id: string;
  /**
   * `sm`: the hybrid's two columns (A20.d T4.d) — no cost label (the tile above says it), the months in one line on the
   * axis row, the reference explained in the slide's note; the plot keeps only its marks and the money gap.
   */
  size?: "md" | "sm";
  className?: string;
  "data-testid"?: string;
}

/**
 * One customer, month by month — design system extension 09 (Q12). It
 * replaces the unit-economics slide's 0–36 month bar, on the same axis, with
 * the money on it:
 *
 * - the horizontal ink line is what one new customer cost (the CAC);
 * - the rising ink line is the margin it brings back, month after month,
 *   until it leaves (its counted lifetime, capped at 36 months);
 * - it pays back where the rising line reaches the cost line: a dot, and a
 *   bracket under the cost line measures the months of margin after;
 * - it leaves first (the loss): the line stops short; a bracket measures how
 *   short — the loss as money and as time in one picture — and a dashed
 *   thread (never reached) shows where it would have paid back;
 * - 12 months, « a commonly cited reference », is a dotted line labelled on
 *   the axis row: it situates, never judges (C1);
 * - no margin: the dashed, hatched « ? » box with what is missing; the cost
 *   line stays, it is known.
 *
 * Ink only, never red: a loss is arithmetic on the team's own numbers, not
 * the leak (C48). Labels carry a paper halo where they cross a line.
 */
/** A label hung right of a point this close to the plot's end would run off it: it ends at the point instead. */
const LABEL_ROOM = 320;
const nearEnd = (x: number, end: number) => x > end - LABEL_ROOM;
/** `size="sm"`: where the months' line starts, past the axis's « 0 ». */
const TIME_INDENT = 34;

export function PaybackChart({
  story,
  monthlyMargin,
  cac,
  lifetime,
  payback,
  reference,
  width,
  height,
  labels,
  summary,
  id,
  size = "md",
  className,
  "data-testid": testId,
}: PaybackChartProps) {
  const compact = size === "sm";
  const g = paybackChartGeometry({ story, monthlyMargin, cac, lifetime, payback, width, height, reference });
  const chars = (node: ReactNode) => (typeof node === "string" ? node.length : 0);
  const shortY = shortLabelY(g, { short: chars(labels.short), cost: chars(labels.cost) }, compact);
  const placed = paysBackLabels(g, { paysBack: chars(labels.paysBack), cost: chars(labels.cost), time: typeof labels.time === "string" ? labels.time.length : null, after: chars(labels.after) });
  const hatch = `${id}-hatch`;
  const plotClip = `${id}-plot`;
  return (
    <figure className={[styles.root, className].filter(Boolean).join(" ")} data-story={g.story} data-size={size} data-testid={testId}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={styles.svg} aria-hidden="true" focusable="false">
        <defs>
          <clipPath id={plotClip}>
            <rect x={0} y={PAYBACK_CHART_PX.top - 2} width={width} height={height} />
          </clipPath>
          <pattern id={hatch} patternUnits="userSpaceOnUse" width={6} height={6} patternTransform="rotate(45)">
            <rect width={2} height={6} className={styles.hatch} />
          </pattern>
        </defs>

        <line x1={g.axis.x1} x2={g.axis.x2} y1={g.axis.y} y2={g.axis.y} className={styles.axis} />
        <text x={g.ticks.x0} y={g.ticks.y} className={styles.tick} textAnchor="start">
          {labels.start}
        </text>
        {/* `sm`: the months' line takes the axis row; the 36-month cap is in the slide's footer. */}
        {!compact ? (
          <text x={g.ticks.x36} y={g.ticks.y} className={styles.tick} textAnchor="end">
            {labels.end}
          </text>
        ) : null}
        {g.ticks.reference !== null ? (
          <>
            {/* From the cost line down: above it, the cost's own label runs from the left. */}
            <line x1={g.ticks.reference} x2={g.ticks.reference} y1={g.cost.y + 6} y2={g.axis.y + 6} className={styles.reference} />
            {!compact ? (
              <text x={g.ticks.reference} y={g.ticks.y} className={styles.tick} textAnchor="middle" data-testid={testId ? `${testId}-reference` : undefined}>
                {labels.reference}
              </text>
            ) : null}
          </>
        ) : null}
        {compact && labels.time ? (
          // From the left, after the « 0 »: centred, a long line ran into the « 36 mois » at the axis's end.
          <text x={g.ticks.x0 + TIME_INDENT} y={g.ticks.y} className={`${styles.label} ${styles.strong}`} textAnchor="start" data-testid={testId ? `${testId}-time` : undefined}>
            {labels.time}
          </text>
        ) : null}

        {g.cost.band ? <rect x={g.axis.x1} width={g.axis.x2 - g.axis.x1} y={g.cost.band.y} height={g.cost.band.height} fill={`url(#${hatch})`} className={styles.band} /> : null}
        <line x1={g.axis.x1} x2={g.axis.x2} y1={g.cost.y} y2={g.cost.y} className={styles.cost} />
        {!compact ? (
          <text x={g.cost.labelX} y={g.cost.labelY} className={`${styles.label} ${styles.halo}`} textAnchor="start">
            {labels.cost}
          </text>
        ) : null}

        {g.unknown ? (
          <>
            <rect x={g.unknown.x} y={g.unknown.y} width={g.unknown.width} height={g.unknown.height} rx={6} fill={`url(#${hatch})`} className={styles.unknown} />
            <circle cx={g.unknown.cx} cy={g.unknown.cy} r={22} className={styles.unknownMark} />
            <text x={g.unknown.cx} y={g.unknown.cy + 8} className={styles.question} textAnchor="middle">
              ?
            </text>
            <text x={g.unknown.cx + 34} y={g.unknown.cy + 6} className={`${styles.label} ${styles.strong} ${styles.halo}`} textAnchor="start" data-testid={testId ? `${testId}-unknown` : undefined}>
              {labels.unknown}
            </text>
          </>
        ) : null}

        {g.margin ? <line x1={g.margin.x1} y1={g.margin.y1} x2={g.margin.x2} y2={g.margin.y2} className={styles.margin} clipPath={`url(#${plotClip})`} /> : null}
        {g.marginRange ? <line x1={g.marginRange.x1} y1={g.marginRange.y1} x2={g.marginRange.x2} y2={g.marginRange.y2} className={styles.marginRange} clipPath={`url(#${plotClip})`} /> : null}
        {g.leaves ? <circle cx={g.leaves.x} cy={g.leaves.y} r={6} className={styles.dot} /> : null}

        {g.story === "loss" && g.short && g.margin && g.wouldPayBack ? (
          <>
            {g.thread ? (
              <>
                <line x1={g.thread.x1} y1={g.thread.y1} x2={g.thread.x2} y2={g.thread.y2} className={styles.thread} />
                <line x1={g.thread.tickX} x2={g.thread.tickX} y1={g.thread.y2} y2={g.axis.y} className={styles.thread} />
              </>
            ) : null}
            {/* Above the cost line, where the loss leaves room (its label runs from the left end): right of the tick, or ending at it near the plot's end. */}
            {compact ? null : <text
              x={nearEnd(g.wouldPayBack.x, g.axis.x2) ? g.wouldPayBack.x - 10 : g.wouldPayBack.x + 10}
              y={g.cost.labelY}
              className={`${styles.note} ${styles.halo}`}
              textAnchor={nearEnd(g.wouldPayBack.x, g.axis.x2) ? "end" : "start"}
              data-testid={testId ? `${testId}-pays-back` : undefined}
            >
              {labels.paysBack}
            </text>}
            <path d={g.short.path} className={styles.bracket} />
            <text x={g.short.labelX} y={shortY ?? g.short.labelY} className={`${styles.label} ${styles.strong} ${styles.halo}`} textAnchor="end" data-testid={testId ? `${testId}-short` : undefined}>
              {labels.short}
            </text>
            {/* Under the line's end: right of it (crossing only the dashed tick), or ending at it near the plot's end. */}
            {compact ? null : <text
              x={nearEnd(g.margin.x2, g.axis.x2) ? g.margin.x2 - 8 : g.margin.x2 + 8}
              y={g.margin.y2 + 32}
              className={`${styles.note} ${styles.halo}`}
              textAnchor={nearEnd(g.margin.x2, g.axis.x2) ? "end" : "start"}
              data-testid={testId ? `${testId}-leaves` : undefined}
            >
              {labels.leaves}
            </text>}
          </>
        ) : null}

        {g.story === "pays-back" && g.margin ? (
          <>
            {g.crossing ? (
              <>
                <circle cx={g.crossing.x} cy={g.crossing.y} r={6} className={styles.dot} />
                {compact || !placed.crossing ? null : <text x={placed.crossing.x} y={placed.crossing.y} className={`${styles.note} ${styles.halo}`} textAnchor="end" data-testid={testId ? `${testId}-pays-back` : undefined}>
                  {labels.paysBack}
                </text>}
              </>
            ) : null}
            {g.after ? (
              <>
                <path d={g.after.path} className={styles.bracket} />
                {/* A short bracket (a late payback) ends its label at its right end; an early crossing's words ride it (`paysBackLabels`). */}
                {compact || !placed.after ? null : <text
                  x={placed.after.x}
                  y={placed.after.y}
                  className={`${styles.label} ${styles.strong} ${styles.halo}`}
                  textAnchor={placed.after.anchor}
                  data-testid={testId ? `${testId}-${placed.after.text === "time" ? "time" : "after"}` : undefined}
                >
                  {placed.after.text === "time" ? labels.time : labels.after}
                </text>}
              </>
            ) : null}
            {/* Above the line's end, which is above the cost line here: the crossing's label sits lower, left of it. */}
            {compact ? null : <text x={g.margin.x2} y={Math.max(g.margin.y2, PAYBACK_CHART_PX.top) - 16} className={`${styles.note} ${styles.halo}`} textAnchor="end">
              {labels.leaves}
            </text>}
          </>
        ) : null}
      </svg>
      <figcaption className="tdg-visually-hidden">{summary}</figcaption>
    </figure>
  );
}
