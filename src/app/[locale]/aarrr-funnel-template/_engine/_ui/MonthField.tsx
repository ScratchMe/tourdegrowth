import type { YearMonth } from "@/lib/engine/types";
import { Select } from "./Select";

/**
 * A month, as a list of the last `count` months ending at `latest`.
 *
 * A list rather than `<input type="month">`: Safari on the desktop renders
 * that as a free text box, and the engine's two months only ever make sense
 * in the recent past — a cohort from next year, or from five years ago, is a
 * typo the list makes impossible rather than a value to validate.
 */
export function MonthField({
  id,
  value,
  latest,
  count = 18,
  format,
  onChange,
  describedBy,
}: {
  id: string;
  value: YearMonth;
  /** The most recent month offered (a flow month is closed, a cohort mature). */
  latest: YearMonth;
  count?: number;
  /** "juillet 2026" / "July 2026" — the caller owns the locale. */
  format: (m: YearMonth) => string;
  onChange: (m: YearMonth) => void;
  describedBy?: string;
}) {
  const months: YearMonth[] = [];
  let [y, m] = latest.split("-").map(Number) as [number, number];
  for (let i = 0; i < count; i += 1) {
    months.push(`${y}-${String(m).padStart(2, "0")}`);
    m -= 1;
    if (m === 0) {
      m = 12;
      y -= 1;
    }
  }
  // A stored month older than the window (an imported file) stays selectable
  // rather than silently snapping to another one.
  if (!months.includes(value)) months.push(value);
  return (
    <Select
      id={id}
      value={value}
      options={months.map((month) => ({ id: month, label: format(month) }))}
      onChange={(next) => next && onChange(next)}
      describedBy={describedBy}
    />
  );
}
