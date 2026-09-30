import React from "react";
import { Field, boxStatusClass } from "../Field/Field.jsx";

const isGroup = (item) => Array.isArray(item.options);

const renderOption = (o) => (
  <option key={o.value} value={o.value} disabled={o.disabled}>
    {o.label}
  </option>
);

/**
 * Select — a closed list past three values (Segmented covers two or three).
 * Always the native <select>: keyboard, type-to-find, screen readers and the
 * phone's own picker work without a line of ours.
 *
 * `placeholder` adds an empty first option ("Choose…") that stays choosable:
 * "not chosen yet" is a legal value, and a source nobody picked is not the
 * first tool in the list. The value is then "".
 */
export const Select = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  hint,
  error,
  missing,
  optional,
  disabled = false,
  disabledReason,
  size = "md",
  fit = "fill",
  id,
  name,
  onBlur,
}) => (
  <Field
    label={label}
    hint={disabled && disabledReason ? disabledReason : hint}
    error={error}
    missing={missing}
    optional={optional}
    size={size}
    fit={fit}
    id={id}
  >
    {({ id: controlId, describedBy, status }) => (
      <select
        id={controlId}
        name={name}
        className={[
          "Select_control",
          boxStatusClass(status, false),
          value === "" && "Select_empty",
        ]
          .filter(Boolean)
          .join(" ")}
        value={value}
        disabled={disabled}
        aria-invalid={status === "invalid" || undefined}
        aria-describedby={describedBy}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      >
        {placeholder != null ? <option value="">{placeholder}</option> : null}
        {options.map((item) =>
          isGroup(item) ? (
            <optgroup key={item.label} label={item.label}>
              {item.options.map(renderOption)}
            </optgroup>
          ) : (
            renderOption(item)
          ),
        )}
      </select>
    )}
  </Field>
);
