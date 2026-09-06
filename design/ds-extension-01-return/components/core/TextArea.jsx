import React, { useId } from "react";

/**
 * The system's only text input: a flat paper card you type into.
 * Counter is honest — it reports the count and turns red only past `maxLength`,
 * together with a solid red outline on the field. Typing is never blocked.
 */
export function TextArea({ value, onChange, placeholder, maxLength, counterLabel, id, label, describedBy, style, fieldStyle, ...rest }) {
  const autoId = useId();
  const fieldId = id || autoId;
  const counterId = `${fieldId}-count`;
  const len = (value || "").length;
  const over = typeof maxLength === "number" && len > maxLength;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", ...style }}>
      <textarea
        id={fieldId}
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        aria-invalid={over || undefined}
        aria-describedby={[describedBy, maxLength ? counterId : null].filter(Boolean).join(" ") || undefined}
        rows={4}
        style={{
          display: "block",
          width: "100%",
          minHeight: "var(--field-min-height)",
          padding: "var(--pad-field)",
          font: "var(--body-md)",
          color: "var(--text-body)",
          background: "var(--field-bg)",
          border: over ? "2px solid var(--field-border-alert)" : "var(--border-solid)",
          borderRadius: "var(--radius-panel)",
          resize: "none",
          outline: "none",
          ...fieldStyle,
        }}
        {...rest}
      />
      {typeof maxLength === "number" && (
        <div
          id={counterId}
          aria-live="polite"
          style={{
            alignSelf: "flex-end",
            font: "var(--meta-xs)",
            fontVariantNumeric: "tabular-nums",
            color: over ? "var(--text-alert)" : "var(--text-muted)",
          }}
        >
          {counterLabel ? counterLabel(len, maxLength) : `${len}/${maxLength}`}
        </div>
      )}
    </div>
  );
}
