import React from "react";

/** Straight up ↔ Roast me. Two states only; the shift is tone, never content. */
export function ToneToggle({ value = "straight", onChange, style, ...rest }) {
  const opts = [
    { id: "straight", label: "Straight up" },
    { id: "roast", label: "Roast me 🔥" },
  ];
  return (
    <div
      role="group"
      aria-label="Tone"
      style={{ display: "inline-flex", gap: 0, border: "var(--border-solid)", borderRadius: "var(--radius-button)", overflow: "hidden", ...style }}
      {...rest}
    >
      {opts.map((o, i) => {
        const on = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={on}
            onClick={() => onChange && onChange(o.id)}
            style={{
              font: "var(--label-button)",
              padding: "12px 18px",
              minHeight: "var(--hit-min)",
              border: "none",
              borderLeft: i ? "var(--border-solid)" : "none",
              background: on ? (o.id === "roast" ? "var(--paint-red)" : "var(--ink-0)") : "var(--surface-sunken)",
              color: on ? "var(--text-inverse)" : "var(--text-muted)",
              cursor: "pointer",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
