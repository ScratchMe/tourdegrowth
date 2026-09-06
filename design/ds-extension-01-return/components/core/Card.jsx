import React from "react";

/**
 * The paper card. "raised" carries the 7px hard shadow and is reserved for the
 * one thing a screen is about — the score, or the current question.
 */
export function Card({ elevation = "flat", tone = "paper", padding, children, style, ...rest }) {
  const shadows = { raised: "var(--shadow-card)", panel: "var(--shadow-panel)", flat: "var(--shadow-none)" };
  const tones = {
    paper: { background: "var(--surface-card)", border: "var(--border-solid)" },
    sunken: { background: "var(--surface-sunken)", border: "var(--border-solid)" },
    alert: { background: "var(--surface-alert)", border: "2px solid var(--border-alert)" },
    outlineAlert: { background: "var(--surface-card)", border: "2px dashed var(--border-alert)" },
  };
  return (
    <div
      style={{
        borderRadius: "var(--radius-card)",
        padding: padding || "var(--pad-card)",
        boxShadow: shadows[elevation] || shadows.flat,
        ...(tones[tone] || tones.paper),
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
