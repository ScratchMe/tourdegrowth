import * as React from "react";
import { Select } from "tour-de-growth";

/*
 * A closed list past three values, always the NATIVE <select>: keyboard,
 * type-to-find, screen readers and the phone's own picker come for free. The
 * platform's chevron is the one glyph the system does not draw. `placeholder`
 * keeps « not chosen yet » a value the person can go back to. Strings from
 * brief 04 (the engine's metric sheet, under review).
 */

const SOURCES = [
  {
    label: "The tools this usually comes from",
    options: [
      { value: "amplitude", label: "Amplitude" },
      { value: "mixpanel", label: "Mixpanel" },
      { value: "posthog", label: "PostHog" },
    ],
  },
  {
    label: "Everything else",
    options: [
      { value: "ga", label: "Google Analytics" },
      { value: "stripe", label: "Stripe" },
      { value: "sheet", label: "A spreadsheet" },
      { value: "other", label: "Somewhere else" },
    ],
  },
];
const CURRENCIES = ["EUR", "USD", "GBP", "CHF"].map((c) => ({ value: c, label: c }));

const Live = (props: { initial: string } & Omit<React.ComponentProps<typeof Select>, "value" | "onChange">) => {
  const { initial, ...rest } = props;
  const [value, setValue] = React.useState(initial);
  return (
    <div style={{ maxWidth: 480 }}>
      <Select {...rest} value={value} onChange={setValue} />
    </div>
  );
};

/** Not chosen yet: « Choose… » reads as a placeholder, and stays a choice. */
export const NotChosen = () => <Live initial="" label="Where does it come from?" placeholder="Choose…" options={SOURCES} />;

/** Chosen, from grouped options: the usual tools first, the rest under their heading. */
export const Chosen = () => <Live initial="amplitude" label="Where does it come from?" placeholder="Choose…" options={SOURCES} />;

/** A short closed value sits at the width of what it holds (`fit="content"`). */
export const Currency = () => <Live initial="EUR" label="Currency" fit="content" options={CURRENCIES} />;

/** Missing, in French: dashed, never red. */
export const Missing = () => (
  <Live
    initial=""
    label={"D'où vient ce chiffre ?"}
    placeholder="Choisir…"
    options={SOURCES}
    missing={"À compléter : l'export signalera cette ligne comme incomplète."}
  />
);

/** Disabled, with its reason. */
export const Disabled = () => (
  <Live initial="EUR" label="Currency" fit="content" options={CURRENCIES} disabled disabledReason="Set once for the whole engine, in Settings." />
);
