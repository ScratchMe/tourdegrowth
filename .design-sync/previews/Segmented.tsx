import * as React from "react";
import { Segmented } from "tour-de-growth";

/*
 * The system's one segmented control. ToneToggle and LocaleSwitcher are both
 * this component with different skins — reach for those where they apply.
 *
 * Two forms, kept apart by a discriminated union rather than a loose `as`:
 * the link form has no `onChange`, and the type refuses one. Two options, at
 * most three: past that it is a list, not a control.
 */

/** The button form — local state, no navigation. This is ToneToggle's shape. */
export const Buttons = () => {
  const [tone, setTone] = React.useState<"neutral" | "roast">("neutral");
  return (
    <Segmented
      as="button"
      label="Tone"
      value={tone}
      onChange={setTone}
      accent={(id) => id === "roast"}
      options={[
        { id: "neutral", label: "Straight up" },
        { id: "roast", label: "Roast me 🔥" },
      ]}
    />
  );
};

/**
 * The link form — real anchors, because switching language must reload the
 * document so `<html lang>` follows (REVIEW.md R-13). This is LocaleSwitcher's
 * shape.
 */
export const Links = () => (
  <Segmented
    as="a"
    label="Language"
    value="en"
    options={[
      { id: "en", label: "EN", href: "/en/glossary/cac" },
      { id: "fr", label: "FR", href: "/fr/glossary/cac" },
    ]}
  />
);

/** `compact` is the header scale: a 32px track inside a 44px touch target. */
export const Compact = () => {
  const [tone, setTone] = React.useState<"neutral" | "roast">("neutral");
  return (
    <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
      <Segmented
        as="button"
        size="compact"
        label="Tone"
        value={tone}
        onChange={setTone}
        accent={(id) => id === "roast"}
        options={[
          { id: "neutral", label: "Straight up" },
          { id: "roast", label: "Roast me 🔥" },
        ]}
      />
      <Segmented
        as="a"
        size="compact"
        label="Language"
        value="fr"
        options={[
          { id: "en", label: "EN", href: "/en" },
          { id: "fr", label: "FR", href: "/fr" },
        ]}
      />
    </div>
  );
};

/** Three is the ceiling, and it already reads as a lot. */
export const Three = () => {
  const [v, setV] = React.useState("all");
  return (
    <Segmented
      as="button"
      label="Score band"
      value={v}
      onChange={setV}
      options={[
        { id: "all", label: "All" },
        { id: "quick", label: "Quick" },
        { id: "deep", label: "Deep dive" },
      ]}
    />
  );
};
