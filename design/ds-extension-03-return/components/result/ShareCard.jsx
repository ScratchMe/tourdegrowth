import React from "react";

/**
 * The result's own share image, shown on the page it belongs to, with the
 * Share action and a Save link. Sunken paper frame: this is a picture of the
 * result, not the result.
 */
export function ShareCard({ src, alt, caption, shareLabel = "Share this result", saveLabel = "Save image", onShare, saveHref, size = "desktop", style, ...rest }) {
  const desktop = size === "desktop";
  return (
    <div
      style={{
        background: "var(--surface-sunken)",
        border: "var(--border-solid)",
        borderRadius: "var(--radius-card)",
        padding: desktop ? 14 : 12,
        display: "flex",
        flexDirection: "column",
        gap: desktop ? 14 : 12,
        ...style,
      }}
      {...rest}
    >
      {caption ? (
        <div style={{ font: "var(--meta-2xs)", letterSpacing: "var(--meta-tracking)", textTransform: "uppercase", color: "var(--text-muted)" }}>{caption}</div>
      ) : null}
      <img
        src={src}
        alt={alt}
        width={1200}
        height={630}
        style={{ display: "block", width: "100%", height: "auto", aspectRatio: "var(--ratio-share)", border: "var(--border-solid)", borderRadius: "var(--radius-button)", background: "var(--surface-card)" }}
      />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={onShare}
          style={{ font: desktop ? "var(--label-button)" : "var(--label-button-lg)", padding: desktop ? "var(--pad-button)" : "var(--pad-button-mobile)", flex: desktop ? "none" : "1 1 auto", borderRadius: "var(--radius-button)", border: "var(--border-solid)", background: "transparent", color: "var(--action-secondary-text)", cursor: "pointer" }}
        >
          {shareLabel}
        </button>
        <a href={saveHref} download style={{ font: "var(--label-nav)", color: "var(--text-muted)", textDecoration: "underline", textDecorationThickness: 2, textUnderlineOffset: 6, display: "inline-flex", alignItems: "center", minHeight: "var(--hit-min)", padding: "0 4px" }}>
          {saveLabel}
        </a>
      </div>
    </div>
  );
}
