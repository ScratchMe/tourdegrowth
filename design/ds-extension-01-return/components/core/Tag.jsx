import React from "react";

/** Small mono uppercase tag: "Pillar 1", "№ 15 questions — 3 min", section numbers. */
export function Tag({ tone = "neutral", children, style, ...rest }) {
  const tones = {
    neutral: { background: "var(--surface-sunken)", color: "var(--text-muted)", border: "none" },
    outline: { background: "var(--surface-card)", color: "var(--text-muted)", border: "var(--border-dashed)" },
    ink: { background: "var(--ink-0)", color: "var(--text-inverse)", border: "2px solid var(--ink-0)" },
    red: { background: "var(--paint-red)", color: "var(--text-inverse)", border: "2px solid var(--paint-red)" },
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        font: "var(--meta-2xs)",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        borderRadius: "var(--radius-tag)",
        padding: "var(--pad-tag)",
        ...(tones[tone] || tones.neutral),
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
