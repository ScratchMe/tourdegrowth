import React from "react";

/**
 * Definition card. Anchored under the trigger on desktop; docked to the bottom
 * of the viewport on mobile, where an anchored popover always overflows.
 */
export function DefinitionPopover({ term, definition, placement = "anchored", onClose, style, ...rest }) {
  const docked = placement === "docked";
  return (
    <div
      role="dialog"
      aria-label={term}
      style={{
        background: "var(--surface-card)",
        border: "var(--border-solid)",
        borderRadius: "var(--radius-panel)",
        boxShadow: "var(--shadow-panel)",
        padding: docked ? "16px" : "14px 16px",
        maxWidth: docked ? "none" : 280,
        width: docked ? "100%" : "auto",
        ...style,
      }}
      {...rest}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ font: "var(--body-sm)", fontWeight: 600, color: "var(--text-body)" }}>{term}</div>
        {docked && onClose ? (
          <button
            type="button"
            aria-label="Fermer"
            onClick={onClose}
            style={{ font: "var(--meta-md)", color: "var(--text-muted)", background: "none", border: "none", padding: "2px 0", cursor: "pointer" }}
          >
            ✕
          </button>
        ) : null}
      </div>
      <div style={{ font: "var(--body-sm)", color: "var(--text-muted)", marginTop: 8, textWrap: "pretty" }}>{definition}</div>
    </div>
  );
}
