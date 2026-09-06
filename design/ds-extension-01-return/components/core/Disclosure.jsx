import React, { useState } from "react";

/**
 * Summary row + typographic marker + content. Native <details>, so it works
 * without JS and the browser owns the open state unless you control it.
 * The marker is a sunken mono chip: `+` closed, `−` open. No icons, ever.
 */
export function Disclosure({ summary, open, defaultOpen = false, onToggle, size = "md", rule = true, children, style, ...rest }) {
  const [inner, setInner] = useState(defaultOpen);
  const isOpen = open ?? inner;
  const fonts = { md: "var(--meta-sm)", sm: "var(--meta-xs)" };
  return (
    <details
      open={isOpen}
      onToggle={(e) => { setInner(e.currentTarget.open); onToggle && onToggle(e.currentTarget.open); }}
      style={{ borderTop: rule ? "var(--border-rule)" : "none", ...style }}
      {...rest}
    >
      <summary
        style={{
          listStyle: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-5)",
          minHeight: "var(--hit-min)",
          padding: "var(--space-3) 0",
          font: fonts[size] || fonts.md,
          letterSpacing: "var(--meta-tracking)",
          textTransform: "uppercase",
          color: isOpen ? "var(--text-body)" : "var(--text-muted)",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <span>{summary}</span>
        <span
          aria-hidden="true"
          style={{
            flex: "none",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            font: "var(--meta-md)",
            fontWeight: 600,
            background: "var(--surface-sunken)",
            color: "var(--text-body)",
            borderRadius: "var(--radius-tag)",
          }}
        >
          {isOpen ? "−" : "+"}
        </span>
      </summary>
      <div style={{ paddingBottom: "var(--space-8)" }}>{children}</div>
    </details>
  );
}
