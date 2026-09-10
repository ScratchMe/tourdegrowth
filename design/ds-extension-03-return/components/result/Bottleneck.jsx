import React from "react";

/**
 * The one stage holding this product back, stamped inside the score card
 * under the numeral. Replaces the free-floating verdict line: the verdict
 * sentence now closes this block.
 *
 * sharpness: "clear"  → one pillar named
 *            "shared" → two pillars, stacked, same size
 *            "level"  → no pillar; label + verdict only
 */
export function Bottleneck({ sharpness = "clear", label, pillars = [], total = 20, verdict, size = "desktop", tone = "straight", style, ...rest }) {
  const desktop = size === "desktop";
  const roast = tone === "roast";
  const named = sharpness !== "level" ? pillars.slice(0, sharpness === "shared" ? 2 : 1) : [];
  return (
    <div
      style={{
        borderTop: "var(--border-rule)",
        paddingTop: desktop ? 18 : 14,
        marginTop: desktop ? 20 : 16,
        display: "flex",
        flexDirection: "column",
        gap: desktop ? 10 : 8,
        ...style,
      }}
      {...rest}
    >
      <div style={{ font: "var(--meta-2xs)", letterSpacing: "var(--meta-tracking)", textTransform: "uppercase", color: named.length ? "var(--text-alert)" : "var(--text-muted)" }}>
        {label}
      </div>
      {named.length ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {named.map((p) => (
            <div key={p.pillar} style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
              <span style={{ font: desktop ? "var(--display-title)" : "var(--display-section)", letterSpacing: "var(--display-letter-spacing)", textTransform: "uppercase", color: roast ? "var(--paint-red)" : "var(--text-body)" }}>
                {p.pillar}
              </span>
              <span style={{ font: "var(--meta-md)", fontVariantNumeric: "tabular-nums", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                <b style={{ fontWeight: 600, color: "var(--text-alert)" }}>{p.score}</b>/{total}
              </span>
            </div>
          ))}
        </div>
      ) : null}
      {verdict ? (
        <div style={{ font: desktop ? "var(--body-md)" : "var(--body-sm)", color: "var(--text-muted)", textWrap: "pretty" }}>{verdict}</div>
      ) : null}
    </div>
  );
}
