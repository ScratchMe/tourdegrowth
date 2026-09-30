import * as React from "react";
import { NumberField } from "tour-de-growth";

/*
 * A count or an amount, typed the way people write numbers: a text input with
 * `inputMode`, never `type="number"`, grouped AS it is typed (type into these),
 * figures set right in tabular Inter, in a box as wide as the magnitude. The
 * unit sits inside the box where the caller's locale puts it. `value` is a
 * number, or `null` for an empty box — never 0. What cannot be read stays on
 * screen as typed, and the message comes when the person leaves the box.
 * Strings from brief 04 (the engine's metric sheet, under review).
 */

const Live = (props: { initial: number | null } & Omit<React.ComponentProps<typeof NumberField>, "value" | "onChange">) => {
  const { initial, ...rest } = props;
  const [value, setValue] = React.useState<number | null>(initial);
  return <NumberField {...rest} value={value} onChange={setValue} />;
};

/** An amount in English: the sign comes first, the figure starts against it. */
export const AmountEnglish = () => (
  <Live initial={26000} label="Spend that month" locale="en" prefix="€" unitName="euros" digits={9} parseError="That isn't a readable number." />
);

/** The same in French: the figure is set right, against a unit that follows (a no-break space groups it). */
export const AmountFrench = () => (
  <Live initial={26000} label="Dépense du mois" locale="fr" suffix="€" unitName="euros" digits={9} parseError="Ce n'est pas un nombre lisible." />
);

/** A rate, optional, with « % » after a no-break space in French. */
export const Percent = () => (
  <Live
    initial={30}
    label="Ta cible"
    optional="facultatif"
    locale="fr"
    suffix={" %"}
    unitName="pour cent"
    digits={4}
    parseError="Ce n'est pas un nombre lisible."
  />
);

/** Empty: `null`, not 0. A narrow box already says « a number goes here ». */
export const Empty = () => (
  <Live initial={null} label="Signed up in July 2026" locale="en" integer digits={9} parseError="That isn't a readable number." />
);

/** Millions, grouped: « 2,000,000 », never a row of zeros. */
export const Millions = () => (
  <Live initial={2000000} label="Signed up in July 2026" locale="en" integer digits={11} parseError="That isn't a readable number." />
);

/** Invalid, from a rule the caller checks. A parse error looks the same; the words tell them apart. */
export const Invalid = () => (
  <Live
    initial={140}
    label="Your target"
    locale="en"
    suffix="%"
    unitName="percent"
    digits={4}
    parseError="That isn't a readable number."
    error="A rate is 100% at most."
  />
);

/** Missing: still to fill in, saves anyway — dashed, in body ink. */
export const Missing = () => (
  <Live
    initial={null}
    label="Inscrits en juillet 2026"
    locale="fr"
    integer
    digits={9}
    parseError="Ce n'est pas un nombre lisible."
    missing={"À compléter : l'export signalera cette ligne comme incomplète."}
  />
);

/** Disabled, with its reason in place of the hint. */
export const Disabled = () => (
  <Live
    initial={26000}
    label="Spend that month"
    locale="en"
    prefix="€"
    digits={9}
    parseError="That isn't a readable number."
    disabled
    disabledReason="Only for decks under 20 slides."
  />
);
