Select — design system extension 04. A closed list past three values.

Always the **native** `<select>`: keyboard, type-to-find, screen readers and
the phone's own picker work without a line of ours, and on a phone the OS
list is better than anything we would draw. Two or three values are a
`Segmented`; a handful to read and compare are `Choices`.

## Drawn as a field

Same edge, fill, radius, 16px value and height as a TextField, and its value
starts on the same vertical line as a text field's (`--select-inset` takes
back the platform's own indent — measured, see the extension README). Stack a
Select under a TextField and the two values line up.

## The chevron

The one glyph on it is the platform's, and we keep it: it belongs to the OS
list that opens, like the list itself, and the system has no glyph of its own
that points down (constraint 6 names 🔥 → ← №). It inherits the field's
colour, so it follows the night. If a down-pointing glyph ever joins the
list, `appearance: none` and a `::after` in the box is a one-rule change; do
not draw one before that decision.

## "Not chosen yet" is a value

`placeholder` adds an empty first option ("Choose…" / « Choisir… ») that stays
choosable, so the person can go back to it: a source nobody picked is not the
first tool in the list. Without `placeholder` the caller must pass a value
that is a real choice — never let the browser pre-select the first option.

## Groups

Pass `{ label, options }` for an `<optgroup>`: "The tools this usually comes
from" first, "Everything else" after.

## Fit

`fit="content"` for a short closed value (a currency: EUR, USD, GBP, CHF).
Full width otherwise; the list's longest option decides nothing.

## Never

- Never a custom dropdown, listbox or combobox.
- Never a free-text field for a closed list (the audit's currency).
- Never a Select of two or three values.

## Props

```ts
interface SelectProps {
  label; value: string; onChange: (value: string) => void;
  options: Array<{ value; label; disabled? } | { label; options }>;
  placeholder?: string;
  hint?; error?; missing?; optional?: string;
  disabled?: boolean; disabledReason?;
  size?: "sm" | "md"; fit?: "fill" | "content"; id?; name?; onBlur?;
}
```

## Examples

### The source of a number

```jsx
<Select label="Where does it come from?" value={source} onChange={setSource}
  placeholder="Choose…"
  options={[
    { label: "The tools this usually comes from", options: [{ value: "amplitude", label: "Amplitude" }, { value: "mixpanel", label: "Mixpanel" }] },
    { label: "Everything else", options: [{ value: "stripe", label: "Stripe" }, { value: "sheet", label: "A spreadsheet" }] },
  ]} />
```

### A currency

```jsx
<Select label="Currency" fit="content" value={cur} onChange={setCur}
  options={["EUR", "USD", "GBP", "CHF"].map((c) => ({ value: c, label: c }))} />
```
