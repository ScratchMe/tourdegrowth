import type { ReactNode } from "react";
import styles from "./SlideStreams.module.css";

export interface SlideStreamsColumn {
  key: string;
  /** « Ce mois-ci », « Nouveau chaque mois », « Dans 12 mois au rythme actuel », « Dans 12 mois, avec nos « Et si » » (when any moved). */
  label: ReactNode;
}

export interface SlideStream {
  id: "demand" | "supply";
  label: ReactNode;
  /** Where the stream is read on its own: « les acheteurs, slides 2 à 5 ». */
  side?: ReactNode;
  /** One cell per column, by the column's key. */
  values: Record<string, ReactNode>;
}

export interface SlideStreamsProps {
  /** For a screen reader: « Deux flux, un total ». */
  caption?: ReactNode;
  columns: readonly SlideStreamsColumn[];
  /** Always the commissions, then the sellers' subscriptions — the order of the sum, never of their size. */
  streams: readonly [SlideStream & { id: "demand" }, SlideStream & { id: "supply" }];
  /** « Total par mois », under the solid rule. */
  total: { label: ReactNode; values: Record<string, ReactNode> };
  /** « Une somme, jamais une comparaison : chaque flux se lit sur les slides de son côté, contre ses propres cibles. » */
  note?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

/**
 * The marketplace's total slide, as a ledger — design system extension 10 (Q10). The one slide about both sides, and it is a sum
 * (C70): "two streams, one total", not the hybrid's two cards facing each other with an arrow between. Read down: the commissions,
 * the sellers' subscriptions, then the total under a solid rule, once per column (this month, new a month, in 12 months; with the
 * what-ifs when any moved).
 *
 * - `streams` is always the commissions, then the subscriptions: the order of the sum, never of their size. No bar, no share, no
 *   percentage of the total, no chart: any of them would rank the two;
 * - every figure is set in the same face and size; the total's row alone is heavier and ruled, as a sum is;
 * - no « + » and no « = »: they are a disclosure's glyphs, as in `TotalBand`; the rule says "sum", as a ledger does;
 * - under each stream's name, where it is read on its own (`side`); `note` says it once more: a sum, never a comparison.
 *
 * A table, so a screen reader hears each figure with its row and its column. It writes no word of its own, and drawn on the
 * deck's 1 920 canvas with the slide type tokens: the screen scales the whole slide.
 */
export function SlideStreams({ caption, columns, streams, total, note, className, "data-testid": testId }: SlideStreamsProps) {
  return (
    <figure className={[styles.root, className ?? ""].filter(Boolean).join(" ")} data-testid={testId}>
      <table className={styles.table}>
        {caption ? <caption className="tdg-visually-hidden">{caption}</caption> : null}
        <thead>
          <tr>
            <td className={styles.corner} />
            {columns.map((c) => (
              <th key={c.key} scope="col" className={styles.col}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {streams.map((s) => (
            <tr key={s.id} className={styles.stream} data-stream={s.id}>
              <th scope="row" className={styles.name}>
                <span className={styles.label}>
                  {s.label}
                  {s.side ? <span className={styles.side}>{s.side}</span> : null}
                </span>
              </th>
              {columns.map((c) => (
                <td key={c.key} className={styles.value}>
                  {s.values[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className={styles.total} data-stream="total">
            <th scope="row" className={styles.name}>
              <span className={styles.label}>{total.label}</span>
            </th>
            {columns.map((c) => (
              <td key={c.key} className={styles.value}>
                {total.values[c.key]}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
      {note ? <figcaption className={styles.note}>{note}</figcaption> : null}
    </figure>
  );
}
