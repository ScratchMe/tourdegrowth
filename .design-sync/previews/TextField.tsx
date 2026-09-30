import * as React from "react";
import { TextField } from "tour-de-growth";

/*
 * One line of text: TextArea's family, one line tall, with the field's 6px
 * radius so a field and a button side by side no longer read as two buttons.
 * `maxLength` is a SOFT limit: typing is never blocked, the count shows in the
 * label row from 80% of it and turns red past it. Strings from brief 04 (the
 * engine's setup, under review).
 */

const LABEL = "Your SaaS or company name";
const HINT = "It only appears on your slides, and stays on this device like everything else.";
const count = (n: number, m: number) => `${n} of ${m} characters`;

const Live = (props: { initial: string } & Partial<React.ComponentProps<typeof TextField>>) => {
  const { initial, ...rest } = props;
  const [value, setValue] = React.useState(initial);
  return (
    <div style={{ maxWidth: 480 }}>
      <TextField label={LABEL} optional="optional" hint={HINT} maxLength={60} countLabel={count} {...rest} value={value} onChange={setValue} />
    </div>
  );
};

/** Empty: the placeholder is an example, never the label again. No count yet. */
export const Empty = () => <Live initial="" placeholder="Northwind" />;

/** Filled, well under the limit: still no count — it costs no line until it matters. */
export const Filled = () => <Live initial="Northwind Analytics" />;

/** Close to the limit (52 of 60): the count appears at the end of the label row. */
export const NearTheLimit = () => <Live initial={"Northwind Analytics — the scheduling tool for independent physios".slice(0, 52)} />;

/** Past the soft limit: the count turns red with a 3px edge, and typing still works. */
export const OverTheLimit = () => <Live initial="Northwind Analytics — the scheduling tool for independent physios" />;

/** Invalid, from a rule the caller checks: the confirmation word before erasing everything. */
export const Invalid = () => <Live initial="ERAES" label="Type ERASE to confirm" optional={undefined} hint={undefined} maxLength={undefined} error="That isn't the word asked for." />;

/** Disabled: dashed and sunken, in ink that passes, with its reason in place of the hint. */
export const Disabled = () => <Live initial="Northwind Analytics" disabled disabledReason="Only for decks under 20 slides." />;
