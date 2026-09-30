Field — design system extension 04. The label, the hint and the message around a control.

Every control in a form gets its **visible** label from a Field (an
accessible name alone is not enough in a form — the audit learned it three
times). `TextField`, `NumberField`, `Select`, `DateField` and `Choices` render
their own Field; you reach for Field directly only to wrap something else:
`TextArea`, `Segmented`, a list of `Checkbox`es (`group`).

## How it reads

- **Label**: a sentence in sentence case, Inter 600 (`--field-label`), full
  ink. Not the mono uppercase meta-label: a form of captions reads as shouting.
  The meta-label stays for section captions ("FORMULA", "BENCHMARK"), never
  for a field.
- **Optional**: pass the localized word (`optional="optional"` /
  `"facultatif"`); it follows the label in muted ink. Required fields carry no
  mark. Never write "(optional)" into the label text.
- **Order under the control**: the message first (it is why the person is
  back here), then the hint. `aria-describedby` reads them in that order.
- **Hint**: Inter 13.5px, `--text-muted`. It says what to type or where the
  value goes, in one or two lines.
- **Two kinds of message, never colour alone**:
  - `error` — *invalid*: this cannot be saved as it is. The edge turns 3px
    red, the message is 600 weight behind a 3px red rule, in `--text-alert`.
  - `missing` — *still to fill in, saves anyway* (the audit's "flagged as
    incomplete"). The edge turns dashed — the system's "not yet" — and the
    message sits behind a dashed rule, in body ink. Not red: nothing is wrong
    yet, and red means a diagnosis.
  If both are passed, `error` wins.
- **Group**: `group` makes it a `<fieldset>` whose `<legend>` is the label. At
  `size="md"` the legend is the question itself (`--field-legend`, the card
  title); at `sm` it is a label like any other.

## Density — one axis, `size`

`md` (default): a one-question screen, 48px controls, 8px label gap, 26px
between fields (`--form-gap-md`). `sm`: a sheet of many fields (the engine's
metric sheet), 44px controls, 6px gap, 20px between fields. Both keep every
target at 44px. Never mix sizes inside one form.

## Never

- Never a placeholder as the label, never a floating label.
- Never an icon in or beside a field. Never a red label: only the message and
  the edge turn.
- Never show an error while the person is still typing a value: show a parse
  error on blur, a missing field on save.
- Never style your own `<label>` around a control — wrap it in Field.

## Props

```ts
interface FieldProps {
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;       // invalid — blocks the save
  missing?: React.ReactNode;     // still to fill in — saves, flagged
  optional?: string;             // the localized word; presence marks it
  counter?: { count: number; max: number; over?: boolean; label?: string };
  size?: "sm" | "md";
  fit?: "fill" | "content";
  group?: boolean;               // fieldset + legend
  id?: string;
  children: React.ReactNode | ((p: { id; labelId; describedBy; status; invalid }) => React.ReactNode);
}
```

## Examples

### Around a TextArea

```jsx
<Field label="Your definition" optional="optional"
       hint="It appears in the slides' appendix and in the requests you copy.">
  {({ id, describedBy, invalid }) => (
    <TextArea id={id} aria-describedby={describedBy} invalid={invalid}
              value={v} onChange={setV} maxLength={200} />
  )}
</Field>
```

### Around a Segmented (its visible label)

```jsx
<Field group label="Activation window">
  {({ labelId }) => (
    <Segmented as="button" labelledBy={labelId} value={days} onChange={setDays}
               options={[{ id: "7", label: "7 days" }, { id: "14", label: "14 days" }, { id: "30", label: "30 days" }]} />
  )}
</Field>
```

### A list of checkboxes

```jsx
<Field group size="sm" label="What to measure first">
  {() => missing.map((m) => (
    <Checkbox key={m.id} label={m.label} checked={picked.has(m.id)} onChange={() => toggle(m.id)} />
  ))}
</Field>
```
