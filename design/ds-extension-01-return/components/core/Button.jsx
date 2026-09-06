import React from "react";

/**
 * Three variants. Primary is the only filled red element on a screen —
 * one per view, no exceptions.
 */
export function Button({ variant = "primary", size = "md", fullWidth = false, disabled = false, children, style, ...rest }) {
  const pads = { md: "var(--pad-button)", lg: "var(--pad-button-mobile)" };
  const fonts = { md: "var(--label-button)", lg: "var(--label-button-lg)" };
  const skins = {
    primary: { background: "var(--action-primary-bg)", color: "var(--action-primary-text)", border: "2px solid var(--paint-red)" },
    secondary: { background: "transparent", color: "var(--action-secondary-text)", border: "var(--border-solid)" },
    quiet: { background: "transparent", color: "var(--text-muted)", border: "none", textDecoration: "underline", textUnderlineOffset: 3, padding: "8px 0" },
  };
  const skin = skins[variant] || skins.primary;
  return (
    <button
      disabled={disabled}
      style={{
        font: fonts[size] || fonts.md,
        padding: variant === "quiet" ? skin.padding : pads[size] || pads.md,
        borderRadius: variant === "quiet" ? 0 : "var(--radius-button)",
        minHeight: variant === "quiet" ? "auto" : "var(--hit-min)",
        width: fullWidth ? "100%" : "auto",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        transition: "box-shadow var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out)",
        ...skin,
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
