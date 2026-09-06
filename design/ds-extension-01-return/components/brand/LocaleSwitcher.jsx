import React from "react";
import { Segmented } from "../core/Segmented.jsx";

/** EN | FR as a compact Segmented of real links — a page load, so <html lang> is always right. */
export function LocaleSwitcher({ current = "en", hrefs, style, ...rest }) {
  const groupName = current === "fr" ? "Langue" : "Language";
  return (
    <Segmented
      as="a"
      size="compact"
      label={groupName}
      value={current}
      options={[
        { id: "en", label: "EN", href: hrefs?.en || "?lang=en" },
        { id: "fr", label: "FR", href: hrefs?.fr || "?lang=fr" },
      ]}
      style={style}
      {...rest}
    />
  );
}
