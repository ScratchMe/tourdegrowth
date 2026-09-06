import React from "react";

/** The single next action. Dashed red on paper: advice, not diagnosis. */
export function PriorityMove({ label = "Priority move", children, style, ...rest }) {
  return (
    <div
      style={{
        background: "var(--surface-card)",
        border: "2px dashed var(--border-alert)",
        borderRadius: "var(--radius-card)",
        padding: "20px 22px",
        ...style,
      }}
      {...rest}
    >
      <div style={{ font: "var(--meta-2xs)", letterSpacing: "var(--meta-tracking)", textTransform: "uppercase", color: "var(--text-alert)", marginBottom: 10 }}>
        {label}
      </div>
      <div style={{ font: "600 15px/1.5 var(--font-ui)", color: "var(--text-body)", textWrap: "pretty" }}>{children}</div>
    </div>
  );
}
