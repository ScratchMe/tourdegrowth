import React from "react";

/** Mono meta line: eyebrows, counters, captions. Uppercase unless it is a sentence. */
export function MetaLabel({ size = "sm", tone = "muted", uppercase = true, wide = false, children, style, ...rest }) {
  const fonts = { md: "var(--meta-md)", sm: "var(--meta-sm)", xs: "var(--meta-xs)" };
  const colors = { muted: "var(--text-muted)", ink: "var(--text-body)", alert: "var(--text-alert)" };
  return (
    <div
      style={{
        font: fonts[size] || fonts.sm,
        color: colors[tone] || colors.muted,
        textTransform: uppercase ? "uppercase" : "none",
        letterSpacing: uppercase ? (wide ? "var(--meta-tracking-wide)" : "var(--meta-tracking)") : "0",
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
