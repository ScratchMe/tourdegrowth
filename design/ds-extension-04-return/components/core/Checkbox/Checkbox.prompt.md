Checkbox — design system extension 04. Yes / no, with its sentence.

A drawn 20px square on a native `<input type="checkbox">`: a 2px edge in the
text's colour that fills around a smaller square once ticked — the radio
mark's family, square where the radio is round. No tick glyph (the system has
none), no platform checkbox. The whole row is the target, 44px tall; the
sentence is the visible label.

## One, or a list

- **One** checkbox is its own row: `<Checkbox label="Compare with that Tour" … />`.
- **A list** ("What to measure first", the slides to include) is a `Field
  group` — a fieldset with its legend — holding plain rows split by the
  dashed rule. **Never cards**: cards are for choosing one of a few; a list of
  independent yeses as cards is five loud boxes, and the inverse fill would
  say "chosen" about each of them.

## States

Checked is the filled mark — never an inverse row. Hover greys the inside of
an unticked mark (pointer only). Focus rings the mark. Invalid (a required
confirmation) thickens the mark's edge to 3px red; the message belongs to the
Field around it. Disabled is dashed with `disabledReason` under the sentence.

## Never

- Never a hand-written `<input type="checkbox">` (eight of the nine today).
- Never a checkbox for a choice between options (Choices), or for one of two
  or three states (Segmented).
- Never a Checkbox without its sentence.

## Examples

```jsx
<Checkbox label="Compare with that Tour" hint="Your Tour result sits next to the engine's numbers."
          checked={compare} onChange={setCompare} />

<Field group label="Montrer dans le livrable" size="sm">
  {() => <Checkbox label="Montrer le score du Tour dans le livrable" checked={s} onChange={setS} />}
</Field>
```
