import React from "react";

/** The stencil score numeral, stamped in with a spray-texture overlay. */
export function ScoreDisplay({ score, total = 100, label, verdict, size = "desktop", animate = true, style, ...rest }) {
  const desktop = size === "desktop";
  return (
    <div style={style} {...rest}>
      {label ? (
        <div style={{ font: "var(--meta-2xs)", letterSpacing: "var(--meta-tracking)", textTransform: "uppercase", color: "var(--text-muted)" }}>
          {label}
        </div>
      ) : null}
      <div
        style={{
          font: desktop ? "var(--display-score-xl)" : "var(--display-score-lg)",
          color: "var(--text-body)",
          position: "relative",
          display: "inline-block",
          marginTop: desktop ? 10 : 6,
          animation: animate ? "tdg-stamp var(--dur-stamp) var(--ease-out) both" : "none",
        }}
      >
        {score}
        <span style={{ fontSize: desktop ? 38 : 30, color: "var(--text-muted)", verticalAlign: "super", marginLeft: desktop ? 8 : 6 }}>
          /{total}
        </span>
        <span
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, background: "var(--texture-spray)", mixBlendMode: "multiply", pointerEvents: "none" }}
        />
      </div>
      {verdict ? (
        <div style={{ font: desktop ? "var(--body-md)" : "var(--body-sm)", color: "var(--text-muted)", marginTop: desktop ? 12 : 10, textWrap: "pretty" }}>
          {verdict}
        </div>
      ) : null}
    </div>
  );
}
