import React from "react";

/**
 * The 16px dashed "?" that opens a glossary definition.
 * Always a real <button>: it is keyboard-reachable and screen-reader labelled.
 */
export function DefinitionTrigger({ term, open = false, tone = "muted", style, ...rest }) {
  const colors = { muted: "var(--text-muted)", ink: "var(--text-body)", alert: "var(--text-alert)" };
  const color = open ? "var(--text-body)" : colors[tone] || colors.muted;
  return (
    <button
      type="button"
      aria-label={`Définition : ${term}`}
      aria-expanded={open}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 16,
        height: 16,
        padding: 0,
        marginLeft: 4,
        verticalAlign: "middle",
        borderRadius: "var(--radius-round)",
        border: `2px dashed ${color}`,
        background: "none",
        color,
        font: "var(--meta-2xs)",
        lineHeight: 1,
        cursor: "pointer",
        ...style,
      }}
      {...rest}
    >
      ?
    </button>
  );
}
