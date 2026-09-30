import React from "react";
import { Field, boxStatusClass, shouldShowCount } from "../Field/Field.jsx";

/**
 * TextField — one line of text. TextArea's family, one line tall.
 *
 * `maxLength` is a soft limit, as in TextArea: typing is never blocked, the
 * count turns red with the edge past it, and the save refuses and says why.
 * On one line the count sits at the end of the label row, and only from 80%
 * of the limit (Q5).
 */
export const TextField = ({
  label,
  value,
  onChange,
  hint,
  error,
  missing,
  optional,
  maxLength,
  countLabel,
  placeholder,
  disabled = false,
  disabledReason,
  size = "md",
  fit = "fill",
  id,
  name,
  type = "text",
  inputMode,
  autoComplete,
  spellCheck,
  onBlur,
}) => {
  const count = value.length;
  const over = maxLength != null && count > maxLength;
  const counter = shouldShowCount(count, maxLength)
    ? { count, max: maxLength, over, label: countLabel?.(count, maxLength) }
    : undefined;

  return (
    <Field
      label={label}
      hint={disabled && disabledReason ? disabledReason : hint}
      error={error}
      missing={missing}
      optional={optional}
      counter={counter}
      size={size}
      fit={fit}
      id={id}
    >
      {({ id: controlId, describedBy, status }) => (
        <div className={`Field_box ${boxStatusClass(over ? "invalid" : status, disabled)}`}>
          <input
            id={controlId}
            name={name}
            type={type}
            className="Field_control"
            value={value}
            placeholder={placeholder}
            disabled={disabled}
            inputMode={inputMode}
            autoComplete={autoComplete}
            spellCheck={spellCheck}
            aria-invalid={status === "invalid" || over || undefined}
            aria-describedby={describedBy}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
          />
        </div>
      )}
    </Field>
  );
};
