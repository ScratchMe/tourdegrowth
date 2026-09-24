"use client";

import { useMemo, useState } from "react";
import { cellText, nextSort, sortRows, type SortDirection, type TableRow } from "@/lib/viz/table";
import styles from "./DataTable.module.css";

export type { CellInput, TableCell, TableRow } from "@/lib/viz/table";

export interface DataTableColumn {
  /** Key into each row's `cells`. */
  key: string;
  /** Already-translated header. Rendered uppercase mono, like every data label in the system. */
  header: string;
  /** Right-aligned mono with tabular digits, so a column of figures lines up. */
  numeric?: boolean;
  /**
   * Offers a sort button in the header. Sorting reads each cell's raw `sort`
   * key, never its displayed text — "12 400" sorts before "9 800" as text.
   */
  sortable?: boolean;
}

export interface DataTableProps {
  /**
   * Required: a table without a caption is a grid of numbers nobody can name.
   * Under a chart, pass the chart's title sentence and set `captionHidden` —
   * the caption is then read by a screen reader and not printed twice.
   */
  caption: string;
  captionHidden?: boolean;
  columns: readonly DataTableColumn[];
  /** Each row carries a stable `id` (a month, an id): never the index, which moves when sorted. */
  rows: readonly TableRow[];
  /** The column whose cells name each row, rendered as `<th scope="row">`. Defaults to the first column. */
  rowHeader?: string;
  /** `sm` tightens the rows for a table tucked inside a chart's disclosure. */
  size?: "md" | "sm";
  className?: string;
  "data-testid"?: string;
}

/**
 * The ruled data table — DS v3 §5.7, and the text equivalent of every chart.
 *
 * Filets, not boxes: one solid rule under the header (a real edge), dashed
 * dividers between rows, no zebra, no cell borders. Figures are mono with
 * tabular digits so a column reads as a column.
 *
 * Sorting is opt-in per column and announced the standard way, with
 * `aria-sort` on the header cell; the button inside carries only the header
 * text. First click sorts ascending, the next one flips it. Rows without a
 * value stay at the end in both directions — flipping the sort reorders the
 * data, it does not bring the blanks to the top.
 *
 * A client component only because of the sort state. A table with no
 * sortable column renders the same markup and never re-renders.
 */
export function DataTable({
  caption,
  captionHidden = false,
  columns,
  rows,
  rowHeader,
  size = "md",
  className,
  ...rest
}: DataTableProps) {
  const [sort, setSort] = useState<{ key: string; direction: SortDirection } | null>(null);
  const sorted = useMemo(() => (sort ? sortRows(rows, sort.key, sort.direction) : rows), [rows, sort]);
  const headerKey = rowHeader ?? columns[0]?.key;

  return (
    <table className={[styles.table, styles[size], className ?? ""].filter(Boolean).join(" ")} {...rest}>
      <caption className={captionHidden ? "tdg-visually-hidden" : styles.caption}>{caption}</caption>
      <thead>
        <tr>
          {columns.map((col) => {
            const active = sort?.key === col.key;
            return (
              <th
                key={col.key}
                scope="col"
                className={col.numeric ? styles.numeric : undefined}
                aria-sort={col.sortable ? (active ? sort!.direction : "none") : undefined}
              >
                {col.sortable ? (
                  <button type="button" className={styles.sortButton} onClick={() => setSort(nextSort(sort, col.key))}>
                    {col.header}
                    {/* The state is announced by aria-sort; the glyph is for eyes only. */}
                    <span className={styles.sortMark} aria-hidden="true">
                      {active ? (sort!.direction === "ascending" ? "↑" : "↓") : "↕"}
                    </span>
                  </button>
                ) : (
                  col.header
                )}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {sorted.map((row) => (
          <tr key={row.id}>
            {columns.map((col) => {
              const text = cellText(row.cells[col.key]);
              const className = col.numeric ? styles.numeric : undefined;
              return col.key === headerKey ? (
                <th key={col.key} scope="row" className={className}>
                  {text}
                </th>
              ) : (
                <td key={col.key} className={className}>
                  {text}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
