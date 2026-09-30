"use client";

import type { ReactNode } from "react";
import type { DayParts } from "@/lib/forms/date";
import { Field } from "./Field";
import { selectClasses } from "./field-parts";
import { Select, type SelectOption } from "./Select";
import styles from "./DateField.module.css";

interface DateFieldBase {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  missing?: ReactNode;
  optional?: string;
  disabled?: boolean;
  size?: "sm" | "md";
  id?: string;
}

/** A month from a list the caller builds (`monthsEndingAt`): value "YYYY-MM". */
export interface MonthFieldProps extends DateFieldBase {
  precision: "month";
  value: string;
  onChange: (value: string) => void;
  /** Labels already written in the page's language: "August 2026" / « août 2026 ». */
  months: readonly SelectOption[];
  placeholder?: string;
  fit?: "fill" | "content";
}

/** A day, as three native selects under one legend: each part is "" until chosen. */
export interface DayFieldProps extends DateFieldBase {
  precision: "day";
  value: DayParts;
  onChange: (value: DayParts) => void;
  /** The twelve month names in the page's language. */
  monthNames: readonly string[];
  years: readonly number[];
  /** The visible label of each part: { day: "Jour", month: "Mois", year: "Année" }. */
  partLabels: { day: string; month: string; year: string };
  /** The empty option of each part. */
  partPlaceholder?: string;
}

export type DateFieldProps = MonthFieldProps | DayFieldProps;

/**
 * A month, or a day, always in the page's language — design system
 * extension 04. Built on native selects, never `<input type="date">` (the
 * browser's language and a calendar glyph not ours) nor `type="month"` (a
 * bare text box in desktop Safari).
 *
 * `precision="month"` is one Select of the months the caller offers.
 * `precision="day"` is a fieldset whose legend is the label, holding three
 * selects — day, month, year — each with its own visible label. Nothing is
 * pre-filled with today; the caller validates a day the calendar lacks
 * (`isRealDay`) and the field shows the message. A part left empty takes the
 * status edge, the chosen ones do not — except when all three are chosen and
 * the field is invalid (the 31st of February): then the three together are
 * what is wrong, and all three take the red edge (A11.2, 2026-09-30).
 */
export function DateField(props: DateFieldProps) {
  if (props.precision === "month") {
    const { months, precision: _precision, ...rest } = props;
    return <Select {...rest} options={months} />;
  }
  return <DayField {...props} />;
}

function DayField({
  label,
  value,
  onChange,
  monthNames,
  years,
  partLabels,
  partPlaceholder = "–",
  hint,
  error,
  missing,
  optional,
  disabled = false,
  size = "md",
  id,
}: DayFieldProps) {
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1));
  const set = (part: keyof DayParts) => (next: string) => onChange({ ...value, [part]: next });
  const longestMonth = Math.max(...monthNames.map((m) => m.length));

  return (
    <Field group label={label} hint={hint} error={error} missing={missing} optional={optional} size={size} fit="content" id={id}>
      {({ id: groupId, status }) => {
        const allChosen = value.day !== "" && value.month !== "" && value.year !== "";
        const part = (key: keyof DayParts, options: readonly SelectOption[], chars: number) => {
          const empty = value[key] === "";
          const marked = empty || (status === "invalid" && allChosen);
          return (
            <div className={styles.part}>
              <label className={styles.partLabel} htmlFor={`${groupId}-${key}`}>
                {partLabels[key]}
              </label>
              <select
                id={`${groupId}-${key}`}
                className={selectClasses({ status: marked ? status : undefined, empty, size, fit: "content" })}
                // As wide as its longest value plus the platform's chevron.
                style={{ width: `calc(${chars}ch + 3.5em)` }}
                value={value[key]}
                disabled={disabled}
                aria-invalid={(status === "invalid" && marked) || undefined}
                onChange={(event) => set(key)(event.target.value)}
              >
                <option value="">{partPlaceholder}</option>
                {options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          );
        };
        return (
          <div className={styles.parts}>
            {part(
              "day",
              days.map((d) => ({ value: d, label: d })),
              2,
            )}
            {part(
              "month",
              monthNames.map((m, i) => ({ value: String(i + 1).padStart(2, "0"), label: m })),
              longestMonth,
            )}
            {part(
              "year",
              years.map((y) => ({ value: String(y), label: String(y) })),
              4,
            )}
          </div>
        );
      }}
    </Field>
  );
}
