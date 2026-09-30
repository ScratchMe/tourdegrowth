DateField — design system extension 04. A month, or a day, in the page's language.

One primitive for both, built on native selects — never `<input type="date">`
or `type="month"`:

- the native date input speaks the **browser's** language, not the page's
  (the audit's French tool showed "09/29/2026");
- it draws a calendar glyph we did not choose;
- Safari on desktop draws `type="month"` as a bare text box.

## `precision="month"`

One `Select` of the months the caller offers, labels already written in the
page's language ("August 2026" / « août 2026 »). The engine offers the last
eighteen, newest first. Value `"YYYY-MM"`.

## `precision="day"`

A fieldset: the field's label is the legend, and three native selects — day,
month, year — each with its own **visible** label ("Day" / « Jour »), in
day–month–year order in both languages. Each part starts empty ("–"); the
value is `{ day, month, year }`, `""` for a part not chosen. A part left
empty on save is `missing` (or `error`): only the empty parts take the edge.

The caller validates "31 February"; the field shows the message.

## Never

- Never pre-fill today's date: nothing is pre-selected for the person.
- Never a free-text date.

## Examples

```jsx
<DateField precision="month" label="Month for flows" value={m} onChange={setM}
  months={lastMonths(18, "en")}
  hint="Visitors, sign-ups, spend, churn and ARPA for that month. Default: the last full month." />

<DateField precision="day" label="Début de la mission" value={d} onChange={setD}
  monthNames={MOIS} years={[2025, 2026, 2027]}
  partLabels={{ day: "Jour", month: "Mois", year: "Année" }} />
```
