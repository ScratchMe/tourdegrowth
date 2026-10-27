import type { CSSProperties, ReactNode } from "react";
import { Card } from "@/components/core/Card";
import { Tag } from "@/components/core/Tag";
import { DotGrid, DotLegend, type DotGridProps } from "@/components/viz/DotGrid";
import styles from "./SideFunnel.module.css";

export interface FunnelColumn {
  id: string;
  /** "100", "20", "6 à 9", "?" — the figure, as the peloton prints it. */
  n: ReactNode;
  /** « Première commande sous 30 jours » — set in the stage face, uppercase on a desktop. */
  label: ReactNode;
  /** The synced DotGrid's grid: known dots, or the hatched « ? » box of a stage nobody measures. */
  grid: DotGridProps["grid"];
  /** The column the side's diagnosis names (a team target): red dots + the alert Tag (« Sous la cible »). One per side. */
  holds?: { label: ReactNode };
  /** « 3 000 inscrits en mai 2026, ramenés à 100 », « Amplitude · mai 2026 ». */
  source?: ReactNode;
  /** The grid's accessible name (default: the figure and the label, when both are text). */
  ariaLabel?: string;
}

export interface FunnelRate {
  id: string;
  /** « Vendeurs payants qui résilient ». */
  label: ReactNode;
  /** « 3 % ». */
  value: ReactNode;
  /** « cible 2,5 % ». */
  note?: ReactNode;
  /** The rate the side's diagnosis names, when it is a rate: the diagnosis edge, not the red of the dots. */
  holds?: boolean;
}

export interface SideFunnelProps {
  /** « Pour 100 inscrits côté acheteurs » / « Pour 100 vendeurs inscrits ». Screen only (a slide's title is the verdict). */
  title: ReactNode;
  /** « ~2 000 visiteurs par mois pour 100 inscrits · GA4 · août 2026 ». */
  upstream?: ReactNode;
  /** The 100 sign-ups first, then each stage counted on the same 100 (two on demand; two on supply, one without the subscriptions). */
  columns: readonly FunnelColumn[];
  /** A second base of 100 that is not the same people: liquidity. Demand only. */
  base?: {
    /** « Liquidité · sur 100 recherches » + its « ? » (GlossaryTerm `liquidity`). */
    title: ReactNode;
    column: FunnelColumn;
    /** « Taux de service : 9 % des recherches aboutissent à une commande ». */
    line?: ReactNode;
  };
  /** Monthly rates, never columns: supply's two churns. */
  rates?: readonly FunnelRate[];
  /** « Chaque mois ». */
  ratesTitle?: ReactNode;
  /** One line on where this side shows when it earns nothing directly (supply without subscriptions → the fill rate). */
  aside?: ReactNode;
  /** The cohort line (« Tes 3 000 inscrits… sont ramenés à 100… »). */
  note?: ReactNode;
  /** DotGrid's legend: referred, measured (`filled`), range, unknown — one entry per mark the grids draw. */
  legend?: readonly { kind: "referred" | "filled" | "range" | "unknown"; label: string }[];
  /** "slide": the deck's 1 920 canvas, no card (the slide is the frame); the rates at the columns' right. */
  medium?: "screen" | "slide";
  /** The title's id (screen); the base's heading takes `<headingId>-base`. */
  headingId?: string;
  className?: string;
  "data-testid"?: string;
}

/** The grid's reading when none is given: the figure and the label, as far as both are text. */
function gridLabel(column: FunnelColumn): string {
  if (column.ariaLabel !== undefined) return column.ariaLabel;
  const text = (node: ReactNode) => (typeof node === "string" || typeof node === "number" ? String(node) : "");
  return [text(column.n), text(column.label)].filter(Boolean).join(" ");
}

/**
 * One side of a marketplace as a funnel — design system extension 10 (Q3,
 * Q4). The peloton's grammar (100 dots, a column per stage counted on the
 * same 100, the referred as rings, the upstream line) kept whole, for one
 * side at a time — never both sides on one axis (C70). It is not a `Peloton`
 * with fewer columns: a side needs a second base, monthly rates and an aside.
 *
 * - `columns`: the 100 sign-ups, then each stage counted on those same 100.
 *   A column `holds` when the side's diagnosis names it (a team target): its
 *   dots red (DotGrid `highlighted`) and the alert Tag — the side's one red,
 *   one column at most. A range is DotGrid's hatch; an unmeasured stage its
 *   « ? » box;
 * - `base`: a second base of 100 that is not the same people — liquidity,
 *   counted on 100 searches (or requests). It sits after a rule, under its own
 *   heading, so it never reads as a fourth stage of the sign-ups. Demand only;
 *   supply points to it in `aside`;
 * - `rates` (under `ratesTitle`): what happens every month and is not a
 *   column — supply's two churns. A line of figures, never dots: a monthly
 *   rate counted on 100 sign-ups would lie. A rate the diagnosis names takes
 *   the diagnosis edge (`holds`), never the dots' red;
 * - `aside`: where this side shows when it earns nothing directly.
 *
 * Nothing is computed here: the counts arrive already brought back to 100,
 * and every word through its props. `medium="slide"` draws it on the deck's
 * 1 920 canvas, without the card, the rates at the columns' right. On a phone
 * each column is a row, the grid at the left and its words at the right.
 */
export function SideFunnel({
  title,
  upstream,
  columns,
  base,
  rates,
  ratesTitle,
  aside,
  note,
  legend,
  medium = "screen",
  headingId = "side-funnel",
  className,
  "data-testid": testId,
}: SideFunnelProps) {
  const slide = medium === "slide";

  // `kicker`: the base's heading, set inside the column's head so that its grid starts on the same line as the others'.
  const column = (c: FunnelColumn, kicker?: ReactNode) => (
    <figure key={c.id} className={styles.col} data-holds={c.holds ? "true" : undefined}>
      <div className={styles.text}>
        {kicker ?? null}
        <p className={styles.n}>{c.n}</p>
        <p className={styles.label}>
          {c.label}
          {c.holds ? (
            <>
              {" "}
              <Tag tone="alert" className={styles.tag}>
                {c.holds.label}
              </Tag>
            </>
          ) : null}
        </p>
      </div>
      <DotGrid grid={c.grid} label={gridLabel(c)} highlighted={Boolean(c.holds)} medium={medium} className={styles.grid} />
      {c.source ? <figcaption className={styles.source}>{c.source}</figcaption> : null}
    </figure>
  );

  const body = (
    <>
      {upstream ? (
        <p className={styles.upstream}>
          <span className={styles.arrow} aria-hidden="true">
            →
          </span>{" "}
          {upstream}
        </p>
      ) : null}
      <div className={[styles.cols, base ? styles.withBase : ""].filter(Boolean).join(" ")}>
        <div className={styles.same} style={{ "--side-funnel-cols": columns.length } as CSSProperties}>
          {columns.map((c) => column(c))}
        </div>
        {base ? (
          <section className={styles.base} aria-labelledby={`${headingId}-base`}>
            {column(
              base.column,
              <h3 id={`${headingId}-base`} className={styles.baseTitle}>
                {base.title}
              </h3>,
            )}
            {base.line ? <p className={styles.baseLine}>{base.line}</p> : null}
          </section>
        ) : null}
      </div>
      {rates && rates.length > 0 ? (
        <div className={styles.rates}>
          {ratesTitle ? <p className={styles.ratesTitle}>{ratesTitle}</p> : null}
          <dl className={styles.rateList}>
            {rates.map((r) => (
              <div key={r.id} className={[styles.rate, r.holds ? styles.rateHolds : ""].filter(Boolean).join(" ")} data-holds={r.holds ? "true" : undefined}>
                <dt className={styles.rateLabel}>{r.label}</dt>
                <dd className={styles.rateValue}>{r.value}</dd>
                {r.note ? <dd className={styles.rateNote}>{r.note}</dd> : null}
              </div>
            ))}
          </dl>
        </div>
      ) : null}
      {aside ? <p className={styles.aside}>{aside}</p> : null}
      {note || legend ? (
        <div className={styles.foot}>
          {note ? <p className={styles.note}>{note}</p> : null}
          {legend ? <DotLegend items={legend.map((l) => ({ mark: l.kind, label: l.label }))} medium={medium} /> : null}
        </div>
      ) : null}
    </>
  );

  if (slide) {
    return (
      <section className={[styles.slide, className ?? ""].filter(Boolean).join(" ")} aria-label={typeof title === "string" ? title : undefined} data-testid={testId}>
        {body}
      </section>
    );
  }
  return (
    <Card elevation="raised" tone="paper" className={className} data-testid={testId}>
      <section className={styles.inner} aria-labelledby={headingId}>
        <h2 id={headingId} className={styles.title}>
          {title}
        </h2>
        {body}
      </section>
    </Card>
  );
}
