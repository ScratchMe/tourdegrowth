import type { ReactNode } from "react";
import { INSTALL_CHART_PX, installLossLabelY, type InstallChartGeometry } from "@/lib/viz/install-payback-chart";
import styles from "./InstallPaybackChart.module.css";

export interface InstallPaybackChartProps {
  /** `installChartGeometry`, drawn at its real size on the slide's 1 920 canvas so its type never scales; the story was decided by the model, never re-read here from the curve. */
  geometry: InstallChartGeometry;
  labels: {
    /** « 0 », « 36 mois »: the axis's two ends. */
    start: ReactNode;
    end: ReactNode;
    /** « ce que coûte une installation ». */
    cost: ReactNode;
    /** Pays back: « remboursée : 13 mois ». */
    paysBack: ReactNode;
    /** Loss: « pas remboursée en 36 mois, il manque ~0,70 € ». */
    loss: ReactNode;
  };
  /** The chart in words, for a screen reader: the SVG is decoration. */
  summary: ReactNode;
  /** Unique per page: the hatch pattern's id. */
  id: string;
  /** `sm`: no cost label (the tile above says it). */
  size?: "md" | "sm";
  className?: string;
  "data-testid"?: string;
}

/** A label hung right of a tick this close to the plot's end would run off it: it goes above the cost line, ending at the tick. */
const LABEL_ROOM = 320;

/**
 * One install, month by month — the consumer app's picture on the unit-economics slide (engine spec §21.6.6). Where
 * `PaybackChart` draws a customer who pays back along a line and leaves, an install pays back along a curve that slows
 * (its users leave) and has no date of leaving:
 *
 * - the horizontal ink line is what one install cost (the cost per install); a range draws as a hatched band;
 * - the curve is the margin it has brought back so far, month after month, over 36 months; a range is a lighter band
 *   around it;
 * - it pays back where the curve meets the cost line: a tick on the line, labelled under it;
 * - it doesn't pay back in 36 months (a loss): a bracket at the curve's end measures the gap to the cost line, and its
 *   label says how short.
 *
 * Ink only, never red: a loss is arithmetic on the team's own numbers, not the leak (C48). Labels carry a halo of their
 * ground where they cross a line: the page's, unless the parent sets `--chart-halo` to its own.
 */
export function InstallPaybackChart({ geometry: g, labels, summary, id, size = "md", className, "data-testid": testId }: InstallPaybackChartProps) {
  const compact = size === "sm";
  const width = g.plot.right + INSTALL_CHART_PX.right;
  const height = g.plot.bottom + INSTALL_CHART_PX.bottom;
  const hatch = `${id}-hatch`;
  const { left, right, bottom } = g.plot;
  const lossY = installLossLabelY(g);
  const lateTick = g.payback !== null && g.payback.x > right - LABEL_ROOM;
  return (
    <figure className={[styles.root, className].filter(Boolean).join(" ")} data-story={g.short ? "loss" : "pays-back"} data-size={size} data-testid={testId}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={styles.svg} aria-hidden="true" focusable="false">
        <defs>
          <pattern id={hatch} patternUnits="userSpaceOnUse" width={6} height={6} patternTransform="rotate(45)">
            <rect width={2} height={6} className={styles.hatch} />
          </pattern>
        </defs>

        <line x1={left} x2={right} y1={bottom} y2={bottom} className={styles.axis} />
        {g.ticks.map((tick) => (
          <line key={tick.month} x1={tick.x} x2={tick.x} y1={bottom} y2={bottom + 6} className={styles.axis} />
        ))}
        <text x={g.ticks[0]!.x} y={bottom + INSTALL_CHART_PX.bottom - 14} className={styles.tick} textAnchor="start">
          {labels.start}
        </text>
        <text x={g.ticks[3]!.x} y={bottom + INSTALL_CHART_PX.bottom - 14} className={styles.tick} textAnchor="end">
          {labels.end}
        </text>

        {g.cost.band ? <rect x={left} width={right - left} y={g.cost.band.y} height={g.cost.band.height} fill={`url(#${hatch})`} className={styles.band} /> : null}
        <line x1={left} x2={right} y1={g.cost.y} y2={g.cost.y} className={styles.cost} />
        {compact ? null : (
          <text x={left} y={g.cost.y - 12} className={`${styles.label} ${styles.halo}`} textAnchor="start">
            {labels.cost}
          </text>
        )}

        {g.band ? <path d={g.band} fill={`url(#${hatch})`} className={styles.curveBand} /> : null}
        <path d={g.mid} className={styles.curve} />

        {g.payback ? (
          <>
            {g.payback.xHi > g.payback.x ? <line x1={g.payback.x} x2={g.payback.xHi} y1={g.payback.y} y2={g.payback.y} className={styles.paybackRange} /> : null}
            <line x1={g.payback.x} x2={g.payback.x} y1={g.payback.y - 9} y2={g.payback.y + 9} className={styles.paybackTick} />
            {compact ? null : (
              <text
                x={lateTick ? g.payback.x - 10 : g.payback.x + 10}
                y={lateTick ? g.payback.y - 12 : g.payback.y + 26}
                className={`${styles.note} ${styles.halo}`}
                textAnchor={lateTick ? "end" : "start"}
                data-testid={testId ? `${testId}-pays-back` : undefined}
              >
                {labels.paysBack}
              </text>
            )}
          </>
        ) : null}

        {g.short && lossY !== null ? (
          <>
            <path d={`M ${g.short.x - 4} ${g.short.y2} H ${g.short.x - 12} V ${g.short.y1} H ${g.short.x - 4}`} className={styles.bracket} />
            <text x={g.short.x - 20} y={lossY} className={`${styles.label} ${styles.strong} ${styles.halo}`} textAnchor="end" data-testid={testId ? `${testId}-loss` : undefined}>
              {labels.loss}
            </text>
          </>
        ) : null}
      </svg>
      <figcaption className="tdg-visually-hidden">{summary}</figcaption>
    </figure>
  );
}
