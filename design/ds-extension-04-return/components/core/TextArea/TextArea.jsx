import React from "react";

/**
 * TextArea — reference for extension 04's changes to the extension 01 input
 * (see TextArea.delta.md). Same contract, plus what lets Field wrap it:
 * `aria-describedby` and `invalid` pass through, and `label` becomes
 * optional when a Field's <label for> already names it.
 */
export const TextArea = ({
  value,
  onChange,
  maxLength,
  label,
  id,
  invalid = false,
  placeholder,
  "aria-describedby": describedBy,
  rows,
}) => {
  const over = value.length > maxLength;
  const counterId = id ? `${id}-count` : undefined;
  return (
    <div className="TextArea_wrap">
      <textarea
        id={id}
        className={[
          "TextArea_field",
          over && "TextArea_fieldOverLimit",
          invalid && "TextArea_fieldInvalid",
        ]
          .filter(Boolean)
          .join(" ")}
        value={value}
        rows={rows}
        placeholder={placeholder}
        aria-label={label}
        aria-invalid={invalid || over || undefined}
        aria-describedby={[describedBy, counterId].filter(Boolean).join(" ") || undefined}
        onChange={(e) => onChange(e.target.value)}
      />
      <span
        id={counterId}
        className={over ? "TextArea_counter TextArea_counterOverLimit" : "TextArea_counter"}
      >
        {value.length}/{maxLength}
      </span>
    </div>
  );
};
