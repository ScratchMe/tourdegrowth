import type { ReactNode } from "react";
import styles from "./WhatIfFigures.module.css";

export interface WhatIfRow {
  id: string;
  /** « Nouveau MRR par mois », « CAC payback », « Trésorerie immobilisée »… */
  label: ReactNode;
  /** « ? » when it can't be computed — never 0. */
  today: ReactNode;
  /** Moved only. « ? » when it can't be computed. */
  whatif?: ReactNode;
  /** Moved only: signed, no colour (« +12 400 € · mieux », « −5 mois · mieux », « stable »). */
  change?: ReactNode;
  /** With a « ? », what is missing (« il manque la marge brute »), under the row's name. */
  missing?: ReactNode;
}

export interface WhatIfFiguresProps {
  groups: readonly { id: string; title: ReactNode; rows: readonly WhatIfRow[] }[];
  columns: { figure: ReactNode; today: ReactNode; whatif: ReactNode; change: ReactNode };
  /** false: one value column, today's figures. */
  moved: boolean;
  /** Narrow, the « today » column folds into the what-if cell as a second line: « aujourd'hui ~80 000 € ». */
  todayLine: (value: ReactNode) => ReactNode;
  className?: string;
  "data-testid"?: string;
}

/**
 * The full « Et si ? » panel's figures — design system extension 09 (Q9),
 * replacing its seven tiles: three short tables by meaning, with today, with
 * the what-ifs and the change.
 *
 * 1. Growth — new MRR a month, NRR, GRR (sales-assisted: its quarter's new
 *    customers). The MRR and the ARR in twelve months are the card's, which
 *    stays right above the panel: once per surface.
 * 2. One new customer — CAC, LTV, LTV:CAC, per new customer, CAC payback,
 *    months after payback.
 * 3. Cash — the month's acquisition spend (it never moves: the same spend),
 *    the cash it keeps tied up.
 *
 * Tables, not tiles: a table is the medium of a « today | what-if | change »
 * comparison, read across. The change carries its sign (U+2212) and its
 * sense in words, in bold ink, never a colour: a projection the reader set
 * up is nobody's verdict (Antoine, 2026-09-28). A « ? » is never a 0, and its
 * row says what is missing.
 *
 * The system's ruled table (`DataTable`, `sm`), drawn here because a cell
 * holds more than text: the narrow layout folds « today » into the what-if
 * cell as a second line (a container query: the panel sits at two widths),
 * so three columns hold at 320px without a horizontal scroll.
 */
export function WhatIfFigures({ groups, columns, moved, todayLine, className, "data-testid": testId }: WhatIfFiguresProps) {
  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")} data-moved={moved ? "true" : "false"} data-testid={testId}>
      {groups.map((g) => (
        <table key={g.id} className={styles.table} data-testid={testId ? `${testId}-${g.id}` : undefined}>
          <caption className={styles.caption}>{g.title}</caption>
          <thead>
            <tr>
              <th scope="col">{columns.figure}</th>
              <th scope="col" className={`${styles.numeric} ${moved ? styles.todayColumn : ""}`}>
                {columns.today}
              </th>
              {moved ? (
                <>
                  <th scope="col" className={styles.numeric}>
                    {columns.whatif}
                  </th>
                  <th scope="col" className={styles.numeric}>
                    {columns.change}
                  </th>
                </>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {g.rows.map((r) => (
              <tr key={r.id} data-testid={testId ? `${testId}-row-${r.id}` : undefined}>
                <th scope="row">
                  {r.label}
                  {r.missing ? <span className={styles.missing}>{r.missing}</span> : null}
                </th>
                <td className={`${styles.numeric} ${moved ? styles.todayColumn : ""}`}>{r.today}</td>
                {moved ? (
                  <>
                    <td className={styles.numeric}>
                      {r.whatif}
                      <span className={styles.todayLine}>{todayLine(r.today)}</span>
                    </td>
                    <td className={`${styles.numeric} ${styles.change}`}>{r.change}</td>
                  </>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      ))}
    </div>
  );
}
