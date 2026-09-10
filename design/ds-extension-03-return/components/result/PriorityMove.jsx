import React from "react";

/**
 * The single next action. Dashed red on paper: advice, not diagnosis.
 * Ext-03: carried by the free result for everyone. `pillar`/`score` name the
 * stage the action belongs to; `upgrade` is the owner-only Deep dive offer,
 * rendered under a dashed rule inside the same card.
 */
export function PriorityMove({ label = "Next move", pillar, score, total = 20, upgrade, children, style, ...rest }) {
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
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", font: "var(--meta-2xs)", letterSpacing: "var(--meta-tracking)", textTransform: "uppercase", color: "var(--text-alert)", marginBottom: 10 }}>
        <span>{label}</span>
        {pillar ? (
          <span style={{ color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
            {pillar} · {score}/{total}
          </span>
        ) : null}
      </div>
      <div style={{ font: "600 15px/1.5 var(--font-ui)", color: "var(--text-body)", textWrap: "pretty" }}>{children}</div>
      {upgrade ? (
        <div style={{ borderTop: "var(--border-rule)", marginTop: 16, paddingTop: 14, display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
          {upgrade}
        </div>
      ) : null}
    </div>
  );
}
