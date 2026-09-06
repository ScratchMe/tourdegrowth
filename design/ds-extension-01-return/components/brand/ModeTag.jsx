import React from "react";

/** Mono uppercase tag. "quick" is a dashed outline, "deep" is a solid ink block. */
export function ModeTag({ mode = "quick", children, style, ...rest }) {
  const deep = mode === "deep";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        font: "var(--meta-2xs)",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        borderRadius: "var(--radius-tag)",
        padding: "6px 10px",
        background: deep ? "var(--ink-0)" : "transparent",
        color: deep ? "var(--text-inverse)" : "var(--text-muted)",
        border: deep ? "2px solid var(--ink-0)" : "var(--border-dashed)",
        ...style,
      }}
      {...rest}
    >
      {children || (deep ? "Deep dive" : "Quick")}
    </span>
  );
}
