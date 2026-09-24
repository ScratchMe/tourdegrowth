import type { ReactNode } from "react";
import { Button } from "@/components/core/Button";
import { DataTable, type DataTableColumn, type TableRow } from "@/components/core/DataTable";
import { Disclosure } from "@/components/core/Disclosure";
import styles from "./ChartFrame.module.css";

export interface ChartLegendItem {
  /** Already translated. Rendered in text ink, never in the series color. */
  label: string;
  /** How the mark is drawn in the swatch: `line` ink, `reference` dashed red, `bar` ink block, `highlight` red block. */
  mark: "line" | "reference" | "bar" | "highlight";
}

export interface ChartFrameData {
  /** The disclosure's summary — "See the data" / "Voir les données". */
  label: string;
  columns: readonly DataTableColumn[];
  rows: readonly TableRow[];
  rowHeader?: string;
}

/**
 * What the frame holds instead of a chart when there is nothing to draw.
 * `empty` is "no data yet": one sentence that says what, why it is empty and
 * how to start. `error` is "we failed to load it": the message and, when
 * something can be retried, a retry.
 */
export type ChartState =
  | { kind: "ready" }
  | { kind: "empty"; message: string }
  | {
      kind: "error";
      message: string;
      /** A function prop: only from a client tree (the game island), never from a Server Component. */
      retry?: { label: string; onRetry: () => void };
    };

export interface ChartFrameProps {
  /** Prefix for the frame's ids (`<id>-title`). Unique on the page. */
  id: string;
  /**
   * A sentence that states the insight — "Churn fell under target in
   * October", not "Monthly churn". It names the figure for screen readers.
   */
  title: string;
  /** `h3` by default: a chart sits inside a section that has its own heading. */
  titleLevel?: 2 | 3 | 4;
  subtitle?: string;
  /** "% of subscribers", "€ per month" — printed once, so ticks can stay bare numbers. */
  unit?: string;
  /** Source, date, granularity. Under the chart, quiet. */
  source?: string;
  /** Only for two marks or more (a series and its reference). A single series is named by the title. */
  legend?: readonly ChartLegendItem[];
  /** The chart's data as a table, behind "see the data". Every chart should have one. */
  data?: ChartFrameData;
  state?: ChartState;
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

/**
 * The frame around a chart — DS v3 §5.7.
 *
 * Title sentence, subtitle and unit above; the chart; then the legend, the
 * source note, and a `Disclosure` that opens the same data as a `DataTable`.
 * The table is the chart's text equivalent, which is why it lives in the
 * frame and not in each chart: no chart ships without its numbers.
 *
 * A `<figure>` labelled by its title. Not a card — no border, no shadow —
 * so a frame sits inside whatever surface the screen gives it (paper, or a
 * night panel) and reads in both worlds from the semantic tokens alone.
 *
 * `state` replaces the chart, never the frame: the title stays, so an empty
 * or failed chart still says what it would have shown. The data disclosure
 * is only offered when the chart is `ready`.
 */
export function ChartFrame({
  id,
  title,
  titleLevel = 3,
  subtitle,
  unit,
  source,
  legend,
  data,
  state = { kind: "ready" },
  children,
  className,
  "data-testid": testId,
}: ChartFrameProps) {
  const Title = `h${titleLevel}` as const;
  const titleId = `${id}-title`;

  return (
    <figure
      className={[styles.frame, className ?? ""].filter(Boolean).join(" ")}
      aria-labelledby={titleId}
      data-testid={testId}
      data-state={state.kind}
    >
      <div className={styles.head}>
        <Title id={titleId} className={styles.title}>
          {title}
        </Title>
        {subtitle || unit ? (
          <p className={styles.subtitle}>
            {subtitle}
            {subtitle && unit ? " · " : null}
            {unit ? <span className={styles.unit}>{unit}</span> : null}
          </p>
        ) : null}
      </div>

      {state.kind === "ready" ? <div className={styles.chart}>{children}</div> : null}

      {state.kind === "empty" ? <p className={styles.empty}>{state.message}</p> : null}

      {state.kind === "error" ? (
        <div className={styles.error} role="alert">
          <p className={styles.errorMessage}>{state.message}</p>
          {state.retry ? (
            <Button variant="secondary" compact onClick={state.retry.onRetry}>
              {state.retry.label}
            </Button>
          ) : null}
        </div>
      ) : null}

      {state.kind === "ready" && legend?.length ? (
        <ul className={styles.legend}>
          {legend.map((item) => (
            <li key={item.label} className={styles.legendItem}>
              <span className={`${styles.swatch} ${styles[item.mark]}`} aria-hidden="true" />
              {item.label}
            </li>
          ))}
        </ul>
      ) : null}

      {source ? <figcaption className={styles.source}>{source}</figcaption> : null}

      {state.kind === "ready" && data ? (
        <Disclosure summary={data.label} size="sm" className={styles.data} data-testid={`${id}-data`}>
          <DataTable
            caption={title}
            captionHidden
            columns={data.columns}
            rows={data.rows}
            rowHeader={data.rowHeader}
            size="sm"
          />
        </Disclosure>
      ) : null}
    </figure>
  );
}
