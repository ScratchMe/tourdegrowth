import { ChartFrame } from "@/components/viz/ChartFrame";
import { Sparkline } from "@/components/viz/Sparkline";
import type { CurveView, DecemberView } from "@/lib/game/view";
import type { DecemberFigures } from "./RevealCells";
import styles from "./EndingCharts.module.css";

/** One curve's words, resolved and filled by the island. */
export interface EndingChartCopy {
  /** `december.churnChart.title` — the frame's heading. */
  title: string;
  /** `december.*Chart.caption`: what the dashed line is. It must say the model's threshold, not a rounder one (plan R6). */
  caption: string;
  /** The chart's text equivalent (Sparkline `ariaLabel`). */
  ariaLabel: string;
  /** The dashed line's label, filled (« objectif 4,0 % », « fil viral »). */
  reference: string;
  /** One label per tick of the view's scale (`view.*.scale.ticks`), same order, same formatter as the rest of the screen. */
  ticks: readonly string[];
}

/** A month of the year, both figures formatted — the table behind « Voir les données ». */
export interface EndingChartRow {
  /** Stable key: the month number, 1-12. */
  id: string;
  month: string;
  churn: string;
  trust: string;
}

export interface EndingChartsProps {
  view: Pick<DecemberView, "churn" | "trust">;
  /**
   * The SAME object RevealCells prints. Its `churn` and `trust` become the
   * end-of-curve labels verbatim: the only way the curve can end on the cell's
   * number is to be handed the cell's string (plan R5, X34).
   */
  figures: Pick<DecemberFigures, "churn" | "trust">;
  churn: EndingChartCopy;
  trust: EndingChartCopy;
  /** Twelve initials, January first (`monthInitials`). The curve has one more slot, January 1st, left unlabelled. */
  monthInitials: readonly string[];
  data: {
    /** `december.dataToggle`. */
    toggle: string;
    /** `december.table.*` headers. */
    month: string;
    churn: string;
    trust: string;
    rows: readonly EndingChartRow[];
  };
  /** Draws the lines in once, on the way into December. Off under reduced motion either way. */
  animate?: boolean;
}

/**
 * The year as a slot per month-end, January 1st first. A year cut short by
 * a firing keeps its twelve slots and leaves the months it never lived
 * empty (`null`, a gap, never a zero): the axis says « a year », and the
 * line stopping in June says the rest.
 */
function slots(curve: CurveView, months: number): (number | null)[] {
  const out: (number | null)[] = Array.from({ length: months + 1 }, () => null);
  curve.months.forEach((m, i) => {
    if (m >= 0 && m <= months) out[m] = curve.values[i] ?? null;
  });
  return out;
}

function tickFormatter(scaleTicks: readonly number[], labels: readonly string[]) {
  const byValue = new Map(scaleTicks.map((t, i) => [t, labels[i] ?? String(t)]));
  return (value: number) => byValue.get(value) ?? String(value);
}

/**
 * December's two curves — GAME-BRIEF §5.11 point 3, plan §2.6.
 *
 * Churn and trust, one series each, never a double axis: side by side on a
 * desktop, stacked on a phone, each in a `ChartFrame` with its table behind
 * « Voir les données ». The curves are the DS `Sparkline`, not a game copy
 * of it (plan §3.6); what this component adds is only the year's shape — a
 * slot per month — and the rule that each curve ends on its cell's string.
 */
export function EndingCharts({ view, figures, churn, trust, monthInitials, data, animate = false }: EndingChartsProps) {
  const months = monthInitials.length;
  const xLabels = ["", ...monthInitials];
  const table = (key: "churn" | "trust") => ({
    label: data.toggle,
    columns: [
      { key: "month", header: data.month },
      { key, header: data[key], numeric: true },
    ],
    rows: data.rows.map((row) => ({ id: row.id, cells: { month: row.month, [key]: row[key] } })),
    rowHeader: "month",
  });

  return (
    <div className={styles.charts}>
      <ChartFrame
        id="game-chart-churn"
        title={churn.title}
        subtitle={churn.caption}
        data={table("churn")}
        data-testid="game-chart-churn"
      >
        <Sparkline
          values={slots(view.churn, months)}
          min={view.churn.scale.min}
          max={view.churn.scale.max}
          ticks={view.churn.scale.ticks}
          formatTick={tickFormatter(view.churn.scale.ticks, churn.ticks)}
          reference={{ value: view.churn.reference, label: churn.reference }}
          xLabels={xLabels}
          endLabel={figures.churn}
          ariaLabel={churn.ariaLabel}
          animate={animate}
        />
      </ChartFrame>
      <ChartFrame
        id="game-chart-trust"
        title={trust.title}
        subtitle={trust.caption}
        data={table("trust")}
        data-testid="game-chart-trust"
      >
        <Sparkline
          values={slots(view.trust, months)}
          min={view.trust.scale.min}
          max={view.trust.scale.max}
          ticks={view.trust.scale.ticks}
          formatTick={tickFormatter(view.trust.scale.ticks, trust.ticks)}
          reference={{ value: view.trust.reference, label: trust.reference }}
          xLabels={xLabels}
          endLabel={figures.trust}
          ariaLabel={trust.ariaLabel}
          animate={animate}
        />
      </ChartFrame>
    </div>
  );
}
