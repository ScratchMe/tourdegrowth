/**
 * Sorting for `core/DataTable`. Cells are displayed as the caller formatted
 * them ("5,6 %", "12 400"), which is exactly why they cannot be sorted as
 * displayed: "12 400" < "9 800" as text. A cell therefore carries an optional
 * raw `sort` key next to its text.
 */

export type SortDirection = "ascending" | "descending";

export type SortKey = number | string | null;

export interface TableCell {
  text: string;
  /** Raw value to sort by. Falls back to `text`. `null` means "no value" and always sorts last. */
  sort?: SortKey;
}

export type CellInput = string | TableCell;

export interface TableRow {
  /** Stable React key — a month, an id; never the row index, which moves when sorted. */
  id: string;
  cells: Readonly<Record<string, CellInput>>;
}

export function cellText(cell: CellInput | undefined): string {
  if (cell === undefined) return "";
  return typeof cell === "string" ? cell : cell.text;
}

export function cellSortKey(cell: CellInput | undefined): SortKey {
  if (cell === undefined) return null;
  if (typeof cell === "string") return cell;
  return cell.sort === undefined ? cell.text : cell.sort;
}

function compareKeys(a: SortKey, b: SortKey): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
}

/**
 * The rows ordered by column `key`. Stable, so equal keys keep the caller's
 * order; and "no value" rows go to the END in both directions — flipping the
 * sort should reorder the data, not bring the blanks to the top.
 */
export function sortRows<R extends TableRow>(rows: readonly R[], key: string, direction: SortDirection): R[] {
  const sign = direction === "ascending" ? 1 : -1;
  return rows
    .map((row, position) => ({ row, position, sortKey: cellSortKey(row.cells[key]) }))
    .sort((a, b) => {
      if (a.sortKey === null || b.sortKey === null) {
        if (a.sortKey === b.sortKey) return a.position - b.position;
        return a.sortKey === null ? 1 : -1;
      }
      return sign * compareKeys(a.sortKey, b.sortKey) || a.position - b.position;
    })
    .map(({ row }) => row);
}

/** The next state of a header click: unsorted → ascending → descending → ascending… */
export function nextSort(
  current: { key: string; direction: SortDirection } | null,
  key: string,
): { key: string; direction: SortDirection } {
  if (current?.key !== key) return { key, direction: "ascending" };
  return { key, direction: current.direction === "ascending" ? "descending" : "ascending" };
}
