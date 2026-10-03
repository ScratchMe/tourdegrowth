import type { CSSProperties, ReactNode } from "react";
import styles from "./LeverSum.module.css";

export interface LeverSumRow {
  id: string;
  /** « Taux d'activation : 18 % → 24 % » · « Chacun seul, additionnés » · « Ensemble ». */
  label: ReactNode;
  /** « +18 000 € ». */
  value: ReactNode;
  /** The gain on the MRR in twelve months, in the engine's currency: the bar's length. Below 0, no bar. */
  amount: number;
}

export interface LeverSumProps {
  /** « Ce que chaque levier rapporte seul, sur le MRR dans 12 mois ». */
  title: ReactNode;
  /** One row per lever moved, in lever order (two or more). */
  rows: readonly LeverSumRow[];
  sum: LeverSumRow;
  together: LeverSumRow;
  /** « Ensemble, ils rapportent ~4 400 € de plus que chacun seul, additionnés : … C'est l'effet composé. » */
  extra?: ReactNode;
  /** « slide »: the deck's type sizes, and never stacked on a phone — a slide is a fixed canvas. */
  medium?: "screen" | "slide";
  className?: string;
  "data-testid"?: string;
}

const pct = (x: number, top: number) => `${Math.max(0, Math.min(100, (Math.max(0, x) / top) * 100))}%`;

/**
 * The compounding, readable — design system extension 09 (Q9): what each
 * lever brings on its own, the solo gains end to end, what they bring
 * together, as lengths on one scale, all ink. The bracket over the end of
 * « together » measures what the levers do to each other: never a colour.
 *
 * The rows are real text (a definition list); the bars are decoration. On a
 * phone each label goes on its own line, the bar and the figure under it.
 */
export function LeverSum({ title, rows, sum, together, extra, medium = "screen", className, "data-testid": testId }: LeverSumProps) {
  const top = Math.max(together.amount, sum.amount, ...rows.map((r) => r.amount), 0) || 1;
  // Where each solo bar starts on the « added up » row: the ones before it, end to end.
  const lefts = rows.map((_, i) => rows.slice(0, i).reduce((sum, r) => sum + Math.max(0, r.amount), 0));
  const bar = (left: number, width: number): CSSProperties => ({ left: pct(left, top), width: pct(width, top) });
  return (
    <figure className={[styles.root, medium === "slide" ? styles.slide : "", className].filter(Boolean).join(" ")} data-testid={testId}>
      <figcaption className={styles.title}>{title}</figcaption>
      <dl className={styles.list}>
        {rows.map((r) => (
          <div key={r.id} className={styles.row} data-row="lever" data-testid={testId ? `${testId}-lever-${r.id}` : undefined}>
            <dt className={styles.label}>{r.label}</dt>
            <dd className={styles.track} aria-hidden="true">
              <span className={styles.bar} style={bar(0, r.amount)} />
            </dd>
            <dd className={styles.value}>{r.value}</dd>
          </div>
        ))}
        <div className={`${styles.row} ${styles.rowSum}`} data-row="sum">
          <dt className={styles.label}>{sum.label}</dt>
          <dd className={styles.track} aria-hidden="true">
            {rows.map((r, i) => (
              <span key={r.id} className={`${styles.bar} ${styles.segment}`} style={bar(lefts[i]!, r.amount)} />
            ))}
          </dd>
          <dd className={styles.value}>{sum.value}</dd>
        </div>
        <div className={`${styles.row} ${styles.rowTogether}`} data-row="together">
          <dt className={styles.label}>{together.label}</dt>
          <dd className={styles.track} aria-hidden="true">
            <span className={styles.bar} style={bar(0, together.amount)} />
            {together.amount > sum.amount && sum.amount >= 0 ? (
              <span className={styles.bracket} style={bar(sum.amount, together.amount - sum.amount)} data-testid={testId ? `${testId}-bracket` : undefined} />
            ) : null}
          </dd>
          <dd className={styles.value}>{together.value}</dd>
        </div>
      </dl>
      {extra ? (
        <p className={styles.extra} data-testid={testId ? `${testId}-extra` : undefined}>
          {extra}
        </p>
      ) : null}
    </figure>
  );
}
