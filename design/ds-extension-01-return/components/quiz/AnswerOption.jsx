import React from "react";

/** Full-width answer button. Left-aligned, 64px minimum, lifts on hover. */
export function AnswerOption({ selected = false, size = "desktop", children, style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      type="button"
      aria-pressed={selected}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        textAlign: "left",
        width: "100%",
        font: size === "desktop" ? "500 17px/1.4 var(--font-ui)" : "500 16px/1.4 var(--font-ui)",
        color: "var(--text-body)",
        padding: "var(--pad-option)",
        minHeight: "var(--hit-option)",
        borderRadius: "var(--radius-panel)",
        border: "var(--border-solid)",
        background: selected || hover ? "var(--surface-card)" : "var(--surface-sunken)",
        boxShadow: selected ? "var(--shadow-hover)" : hover ? "var(--shadow-hover)" : "none",
        cursor: "pointer",
        transition: "box-shadow var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out)",
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
