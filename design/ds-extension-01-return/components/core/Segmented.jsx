import React from "react";

/**
 * Two-to-three option segmented control. One 2px ink border around the group,
 * a 2px ink divider between segments, the selected one filled ink.
 * `md` is the ToneToggle scale; `compact` is header scale (32px visual,
 * 44px hit through a transparent outer pad).
 */
export function Segmented({ options, value, onChange, size = "md", label, activeColor, as = "button", style, ...rest }) {
  const compact = size === "compact";
  return (
    <div
      role="group"
      aria-label={label}
      style={{ display: "inline-flex", padding: compact ? "6px 0" : 0, ...style }}
      {...rest}
    >
      <div
        style={{
          display: "inline-flex",
          border: "var(--border-solid)",
          borderRadius: compact ? "var(--radius-tag)" : "var(--radius-button)",
          overflow: "hidden",
        }}
      >
        {options.map((o, i) => {
          const on = value === o.id;
          const fill = on ? (typeof activeColor === "function" ? activeColor(o.id) : activeColor) || "var(--ink-0)" : "transparent";
          const common = {
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            font: compact ? "var(--meta-2xs)" : "var(--label-button)",
            letterSpacing: compact ? "var(--meta-tracking)" : 0,
            textTransform: compact ? "uppercase" : "none",
            padding: compact ? "0 10px" : "12px 18px",
            minHeight: compact ? "calc(var(--hit-compact) - 4px)" : "var(--hit-min)",
            minWidth: compact ? 40 : "auto",
            border: "none",
            borderLeft: i ? "var(--border-solid)" : "none",
            background: fill,
            color: on ? "var(--text-inverse)" : "var(--text-muted)",
            textDecoration: "none",
            whiteSpace: "nowrap",
            cursor: on ? "default" : "pointer",
          };
          return as === "a" ? (
            <a key={o.id} href={o.href} hrefLang={o.id} lang={o.id} aria-current={on ? "true" : undefined} style={common}>
              {o.label}
            </a>
          ) : (
            <button key={o.id} type="button" aria-pressed={on} onClick={() => !on && onChange && onChange(o.id)} style={common}>
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
