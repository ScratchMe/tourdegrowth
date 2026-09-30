import * as React from "react";
import { Field, Segmented, TextArea } from "tour-de-growth";

/*
 * Field gives every control in a form its VISIBLE label, its hint and its
 * message. TextField, NumberField, Select, DateField and Choices render their
 * own; Field is reached for directly only to wrap something else, with a
 * render prop that hands the control its id and what describes it. The
 * strings are the growth engine's, from brief 04 (its copy is under review:
 * they are here for their length).
 */

/** Around a TextArea: a sentence-case label, the « optional » word, a hint under it. */
export const AroundTextArea = () => {
  const [value, setValue] = React.useState("Active = at least one project edited.");
  return (
    <div style={{ maxWidth: 560 }}>
      <Field label="Your definition" optional="optional" hint="It appears in the slides' appendix and in the requests you copy.">
        {({ id, describedBy, invalid }) => (
          <TextArea id={id} aria-describedby={describedBy} invalid={invalid} value={value} onChange={setValue} maxLength={200} rows={3} />
        )}
      </Field>
    </div>
  );
};

/** A Segmented named by its Field (`labelledBy`): the group's name is the words on screen. */
export const AroundSegmented = () => {
  const [days, setDays] = React.useState<"7" | "14" | "30">("7");
  return (
    <Field group label="Activation window" hint="Counted from the day they sign up.">
      {({ labelId }) => (
        <Segmented
          as="button"
          labelledBy={labelId}
          value={days}
          onChange={setDays}
          options={[
            { id: "7", label: "7 days" },
            { id: "14", label: "14 days" },
            { id: "30", label: "30 days" },
          ]}
        />
      )}
    </Field>
  );
};

/**
 * The two messages side by side. Invalid (cannot be saved as it is): a red
 * rule and 600 weight. Missing (still to fill in, saves anyway): a dashed rule
 * in body ink — « not yet », never red. The message is read before the hint.
 */
export const Messages = () => {
  const [a, setA] = React.useState("Active = at least one project edited, in the first week, by someone else than the person who created it.");
  const [b, setB] = React.useState("");
  return (
    <div style={{ display: "grid", gap: 26, maxWidth: 560 }}>
      <Field label="Your definition" error="Keep it under 120 characters: it prints on a slide." hint="One sentence.">
        {({ id, describedBy, invalid }) => (
          <TextArea id={id} aria-describedby={describedBy} invalid={invalid} value={a} onChange={setA} maxLength={120} rows={3} />
        )}
      </Field>
      <Field label="Ta définition" missing={"À compléter : l'export signalera cette ligne comme incomplète."}>
        {({ id, describedBy, invalid }) => (
          <TextArea id={id} aria-describedby={describedBy} invalid={invalid} value={b} onChange={setB} maxLength={200} rows={3} />
        )}
      </Field>
    </div>
  );
};
