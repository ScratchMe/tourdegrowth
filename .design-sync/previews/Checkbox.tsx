import * as React from "react";
import { Checkbox, Field } from "tour-de-growth";

/*
 * Yes / no with its sentence: a drawn 20px square on a native checkbox, the
 * radio ring's family. No tick glyph, never the platform's box. One stands on
 * its own row; a list is a Field `group` of plain rows split by the dashed
 * rule — never cards. Strings from brief 04 (the engine, under review).
 */

const Live = (props: { initial: boolean } & Omit<React.ComponentProps<typeof Checkbox>, "checked" | "onChange">) => {
  const { initial, ...rest } = props;
  const [checked, setChecked] = React.useState(initial);
  return <Checkbox {...rest} checked={checked} onChange={setChecked} />;
};

/** Unchecked, with a hint under its sentence. */
export const Unchecked = () => <Live initial={false} label="Compare with that Tour" hint="Your Tour result sits next to the engine's numbers." />;

/** Checked: the square fills around a smaller one — never an inverse row. */
export const Checked = () => <Live initial label="Compare with that Tour" hint="Your Tour result sits next to the engine's numbers." />;

/** A list: a fieldset with its legend, rows split by the dashed rule. */
export const List = () => {
  const [picked, setPicked] = React.useState(new Set(["visitors", "paid"]));
  const items = [
    { id: "visitors", label: "Visitors" },
    { id: "activation", label: "Activation rate" },
    { id: "paid", label: "Paid conversion" },
    { id: "referred", label: "Referred sign-ups" },
  ];
  return (
    <Field group size="sm" label="What to measure first">
      {() => (
        <div>
          {items.map((item) => (
            <Checkbox
              key={item.id}
              label={item.label}
              checked={picked.has(item.id)}
              onChange={(on) =>
                setPicked((prev) => {
                  const next = new Set(prev);
                  if (on) next.add(item.id);
                  else next.delete(item.id);
                  return next;
                })
              }
            />
          ))}
        </div>
      )}
    </Field>
  );
};

/** A required confirmation, unticked on save: the mark's edge goes 3px red, the message belongs to its Field. */
export const Invalid = () => (
  <Field group size="sm" label="Type ERASE to confirm" error="Tick this to erase.">
    {({ describedBy }) => <Live initial={false} invalid describedBy={describedBy} label="I understand this erases every number on this device" />}
  </Field>
);

/** Disabled: dashed, with its reason under the sentence. */
export const Disabled = () => <Live initial={false} label="High definition" disabled disabledReason="Only for decks under 20 slides." />;
