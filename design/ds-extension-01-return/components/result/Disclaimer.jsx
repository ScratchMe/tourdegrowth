import React from "react";

/** The honesty line. Present on every screen that shows a score. */
export function Disclaimer({ align = "left", children, style, ...rest }) {
  return (
    <div
      style={{
        font: "var(--meta-xs)",
        color: "var(--text-muted)",
        textAlign: align,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
