import * as React from "react";
import { Segmented } from "tour-de-growth";

/*
 * The system's one segmented control. ToneToggle and LocaleSwitcher are both
 * this component with different skins — reach for those where they apply.
 *
 * Two forms, kept apart by a discriminated union rather than a loose `as`:
 * the link form has no `onChange`, and the type refuses one. Two options, at
 * most three: past that it is a list, not a control. `label` is the group's
 * accessible name and must name what the options choose between.
 */

/**
 * The button form at its `md` size — local state, no navigation. As the
 * growth engine's value editor sets it for a duration's unit (where the
 * page prints the same label, "Unit", above the control).
 */
export const Buttons = () => {
  const [unit, setUnit] = React.useState<"hours" | "days">("days");
  return (
    <Segmented
      as="button"
      label="Unit"
      value={unit}
      onChange={setUnit}
      options={[
        { id: "hours", label: "hours" },
        { id: "days", label: "days" },
      ]}
    />
  );
};

/**
 * `compact` is the header scale: a 32px track, and each segment's touch
 * target reaches 44px on the segment itself, into the 6px of room the group
 * keeps above and below — never strip that room to tighten a header. This is
 * ToneToggle as the landing's preview card sets it, with "Roast me" chosen:
 * `accent` makes the roast tone the one option whose selected fill is red.
 */
export const Compact = () => {
  const [tone, setTone] = React.useState<"straight" | "roast">("roast");
  return (
    <Segmented
      as="button"
      size="compact"
      label="Tone"
      value={tone}
      onChange={setTone}
      accent={(id) => id === "roast"}
      options={[
        { id: "straight", label: "Straight up" },
        { id: "roast", label: "Roast me 🔥" },
      ]}
    />
  );
};

/**
 * The link form — real anchors, because switching language must reload the
 * document so `<html lang>` follows (REVIEW.md R-13). This is LocaleSwitcher:
 * always `compact`, each link carrying `lang` (so `hreflang` too) for the
 * language it names.
 */
export const Links = () => (
  <Segmented
    as="a"
    size="compact"
    label="Language"
    value="en"
    options={[
      { id: "en", label: "EN", lang: "en", href: "/en/glossary/cac" },
      { id: "fr", label: "FR", lang: "fr", href: "/fr/glossary/cac" },
    ]}
  />
);

/** Three is the ceiling, and it already reads as a lot: the growth engine's activation window. */
export const Three = () => {
  const [days, setDays] = React.useState<"7" | "14" | "30">("7");
  return (
    <Segmented
      as="button"
      label="Activation window"
      value={days}
      onChange={setDays}
      options={[
        { id: "7", label: "7 days" },
        { id: "14", label: "14 days" },
        { id: "30", label: "30 days" },
      ]}
    />
  );
};
