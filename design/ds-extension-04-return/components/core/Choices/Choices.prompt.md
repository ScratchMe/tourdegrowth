Choices — design system extension 04. Pick one of a handful, as cards.

A **real radio group**: a `<fieldset>` whose visible `<legend>` is the
question, native radios underneath (arrow keys move between options, Tab
leaves the group, nothing moves on until the form is saved). Each option is a
card row, the whole row the target.

## The one selection language, the one radio mark

- Selected is the inverse fill (`--state-selected-*`): ink on paper, amber at
  night — the questionnaire's language, so the engine feels like the Tour it
  grew from.
- The mark is `AnswerOption`'s: a 20px ring in the text's colour, filled
  around a dot once chosen — drawn on the native `<input type="radio">`
  (`appearance: none`). The platform's radio is never shown.
- Hover lifts the hard shadow (and lightens the edge at night), never the
  fill; off on touch screens.
- Focus rings the whole row.

## Not AnswerOption generalised

`AnswerOption` is a button with `aria-pressed`: one tap answers and the quiz
moves on. `Choices` is a form control: a choice, then a save. Same look, two
behaviours, two components. Never use AnswerOption in a form; never make
Choices advance on change.

## Disabled with a reason

A "coming soon" option is **dashed** — the system's "not yet" — in muted ink
that passes contrast, with its reason under the label: `disabledLead`
("Coming soon", set in 600) and `disabledNote`. Never fade it with opacity:
the old build put the reason, the one thing to read there, at 1.91:1.

## Layout

`columns={2}` for short, parallel options (the 2×2 status question): two
columns once the group has 560px, one below. `size="md"`: 64px rows, the
legend is the question. `size="sm"`: 44px rows, for a sheet.

## Never

- Never pre-select an option for the person (`value` is `null` by default).
- Never more than six options — that is a Select.
- Never an option labelled with a score, a letter or a number.
- Never on/off (that is a Checkbox).

## Examples

```jsx
<Choices
  legend="Where are you with this number?"
  columns={2}
  value={status} onChange={setStatus}
  options={[
    { value: "have", label: "I have it" },
    { value: "estimate", label: "I can estimate it" },
    { value: "ask", label: "I'll ask for it" },
    { value: "none", label: "I can't find it" },
  ]}
/>

<Choices legend="Your model" size="sm" value={model} onChange={setModel}
  options={[
    { value: "saas", label: "SaaS or web product, self-serve (trial or freemium)" },
    { value: "b2b", label: "B2B with a sales team", disabled: true,
      disabledLead: "Coming soon", disabledNote: "their funnel has a different shape." },
  ]} />
```
