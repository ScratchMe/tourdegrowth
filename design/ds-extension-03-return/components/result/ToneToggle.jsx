import React from "react";
import { Segmented } from "../core/Segmented.jsx";

/**
 * Straight up ↔ Roast me. Two states only; the shift is tone, never content.
 * Ext-03: rebased on Segmented; `size="compact"` (mono, 32px + 6px pad) for
 * the landing preview card, where it demonstrates the roast without a third CTA.
 */
export function ToneToggle({ value = "straight", onChange, size = "md", labels, style, ...rest }) {
  const l = labels || { straight: "Straight up", roast: "Roast me 🔥" };
  return (
    <Segmented
      size={size}
      label="Tone"
      value={value}
      onChange={onChange}
      options={[{ id: "straight", label: l.straight }, { id: "roast", label: l.roast }]}
      activeColor={(id) => (id === "roast" ? "var(--paint-red)" : undefined)}
      style={style}
      {...rest}
    />
  );
}
