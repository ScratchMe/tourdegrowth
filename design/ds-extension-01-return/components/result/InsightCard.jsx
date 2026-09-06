import React from "react";

/** A per-pillar strength or weakness paragraph, from the deep dive. */
export function InsightCard({ pillar, score, total = 20, kind = "strength", children, style, ...rest }) {
  const weak = kind === "weakness";
  return (
    <div
      style={{
        background: weak ? "var(--surface-alert)" : "var(--surface-card)",
        border: weak ? "2px solid var(--border-alert)" : "var(--border-solid)",
        borderRadius: "var(--radius-panel)",
        padding: "18px 20px",
        ...style,
      }}
      {...rest}
    >
      <div style={{ font: "var(--meta-xs)", color: weak ? "var(--text-alert)" : "var(--text-muted)", marginBottom: 8 }}>
        {pillar} — {score}/{total}
      </div>
      <div style={{ font: "var(--body-md)", color: "var(--text-body)", textWrap: "pretty" }}>{children}</div>
    </div>
  );
}
