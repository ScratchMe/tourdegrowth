import React from "react";

/**
 * Text on stone under the dashed rule — the ticket's bottom edge.
 * Two nav links and the credit line, nothing else. No card, no tag, no shadow.
 */
export function SiteFooter({ width = "wide", links, credit, style, ...rest }) {
  const max = width === "reading" ? "var(--width-reading)" : "var(--width-desktop)";
  const linkStyle = {
    font: "var(--label-nav)",
    color: "var(--text-muted)",
    textDecoration: "underline",
    textDecorationThickness: 2,
    textDecorationColor: "var(--border-divider)",
    textUnderlineOffset: 6,
    display: "inline-flex",
    alignItems: "center",
    minHeight: "var(--hit-min)",
  };
  return (
    <footer
      style={{ borderTop: "var(--border-rule)", marginTop: "var(--space-15)", ...style }}
      {...rest}
    >
      <div style={{ maxWidth: max, margin: "0 auto", padding: "var(--pad-footer)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        <nav aria-label="Site" style={{ display: "flex", flexWrap: "wrap", gap: "0 var(--space-8)" }}>
          {links.map((l) => (
            <a key={l.href} href={l.href} style={linkStyle}>{l.label}</a>
          ))}
        </nav>
        <p style={{ font: "var(--meta-xs)", color: "var(--text-muted)", margin: 0, textWrap: "pretty" }}>
          {credit}
        </p>
      </div>
    </footer>
  );
}
