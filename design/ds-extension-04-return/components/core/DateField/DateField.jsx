import React from "react";
import { Field, boxStatusClass } from "../Field/Field.jsx";
import { Select } from "../Select/Select.jsx";

/**
 * DateField — a month, or a day, always in the page's language (Q10).
 *
 * `precision="month"`: one Select of the months the caller offers (the
 * engine's last eighteen), labels already written ("August 2026" /
 * « août 2026 »). The value is "YYYY-MM".
 *
 * `precision="day"`: a group of three native selects — day, month, year —
 * each with its own visible label, under the field's legend. Replaces the
 * native date input, whose calendar glyph is not ours and whose format is the
 * browser's ("09/29/2026" in a French tool). The value is
 * { day, month, year } as strings, "" for a part not chosen yet.
 */
export const DateField = (props) =>
  props.precision === "month" ? <MonthField {...props} /> : <DayField {...props} />;

const MonthField = ({ months, ...rest }) => (
  <Select {...rest} options={months} />
);

const DayField = ({
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
}) => {
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1));
  const set = (part) => (e) => onChange({ ...value, [part]: e.target.value });
  return (
    <Field
      group
      label={label}
      hint={hint}
      error={error}
      missing={missing}
      optional={optional}
      size={size}
      fit="content"
      id={id}
    >
      {({ id: groupId, status }) => {
        const part = (key, options, chars) => (
          <div className="DateField_part">
            <label className="DateField_partLabel" htmlFor={`${groupId}-${key}`}>
              {partLabels[key]}
            </label>
            <select
              id={`${groupId}-${key}`}
              className={[
                "Select_control",
                boxStatusClass(value[key] === "" ? status : undefined, false),
                value[key] === "" && "Select_empty",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{ width: `calc(${chars}ch + 3.5em)` }}
              value={value[key]}
              disabled={disabled}
              aria-invalid={(status === "invalid" && value[key] === "") || undefined}
              onChange={set(key)}
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
        return (
          <div className="DateField_parts">
            {part("day", days.map((d) => ({ value: d, label: d })), 2)}
            {part(
              "month",
              monthNames.map((m, i) => ({ value: String(i + 1).padStart(2, "0"), label: m })),
              Math.max(...monthNames.map((m) => m.length)),
            )}
            {part("year", years.map((y) => ({ value: String(y), label: String(y) })), 4)}
          </div>
        );
      }}
    </Field>
  );
};
