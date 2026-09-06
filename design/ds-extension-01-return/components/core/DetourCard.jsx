import React from "react";

/**
 * The "wrong turn" card: mono eyebrow, stencil title, one body line.
 * `wrongTurn` (404) is ink on paper. `fault` (something broke — 06c) is
 * red-edged with a red shadow, the only coloured shadow in the system.
 */
export function DetourCard({ tone = "wrongTurn", eyebrow, title, children, padding, style, ...rest }) {
  const fault = tone === "fault";
  return (
    <div
      role={fault ? "alert" : undefined}
      style={{
        background: "var(--surface-card)",
        border: fault ? "2px solid var(--border-alert)" : "var(--border-solid)",
        borderRadius: "var(--radius-card)",
        boxShadow: fault ? "7px 7px 0 var(--paint-red)" : "var(--shadow-card)",
        padding: padding || "var(--pad-card)",
        maxWidth: 560,
        ...style,
      }}
      {...rest}
    >
      {eyebrow && (
        <div
          style={{
            font: "var(--meta-2xs)",
            letterSpacing: "var(--meta-tracking)",
            textTransform: "uppercase",
            color: fault ? "var(--text-alert)" : "var(--text-muted)",
            marginBottom: "var(--space-5)",
          }}
        >
          {eyebrow}
        </div>
      )}
      <h1 style={{ font: "var(--display-title)", letterSpacing: "0.01em", color: "var(--text-body)", margin: "0 0 var(--space-5)", textWrap: "balance" }}>
        {title}
      </h1>
      <div style={{ font: "var(--body-md)", color: "var(--text-muted)", textWrap: "pretty" }}>{children}</div>
    </div>
  );
}
