import React from "react";

/** One pillar's score as a dashed mono chip. Red only when the pillar is the weak one. */
export function PillarChip({ pillar, score, total = 20, weak = false, size = "desktop", children, style, ...rest }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        font: size === "desktop" ? "var(--meta-md)" : "var(--meta-sm)",
        padding: size === "desktop" ? "var(--pad-chip)" : "var(--pad-chip-sm)",
        borderRadius: "var(--radius-tag)",
        border: weak ? "2px dashed var(--paint-red)" : "var(--border-dashed)",
        background: weak ? "var(--surface-alert)" : "var(--surface-sunken)",
        color: weak ? "var(--text-alert)" : "var(--text-muted)",
        ...style,
      }}
      {...rest}
    >
      <b style={{ fontWeight: 600, color: weak ? "var(--text-alert)" : "var(--text-body)" }}>{score}</b>
      /{total}&nbsp;&nbsp;{pillar}
      {children}
    </span>
  );
}
