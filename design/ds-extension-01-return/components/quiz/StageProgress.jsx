import React from "react";

/** Five road-marking segments, one per AARRR pillar. Filled, current, pending. */
export function StageProgress({ current = 1, total = 5, size = "desktop", label, style, ...rest }) {
  const height = size === "desktop" ? 18 : 16;
  return (
    <div style={style} {...rest}>
      <div style={{ display: "flex", gap: size === "desktop" ? 8 : 6, marginBottom: 12 }}>
        {Array.from({ length: total }, (_, i) => {
          const n = i + 1;
          const done = n < current;
          const now = n === current;
          return (
            <div
              key={n}
              style={{
                flex: 1,
                height,
                borderRadius: "var(--radius-tag)",
                border: done ? "2px solid var(--ink-0)" : now ? "2px solid var(--paint-red)" : "var(--border-dashed)",
                background: done ? "var(--ink-0)" : now ? "var(--paint-red)" : "var(--surface-sunken)",
                animation: now ? "tdg-pulse var(--dur-pulse) var(--ease-out) both" : "none",
              }}
            />
          );
        })}
      </div>
      {label ? (
        <div style={{ font: size === "desktop" ? "var(--meta-md)" : "var(--meta-sm)", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)" }}>
          {label}
        </div>
      ) : null}
    </div>
  );
}
