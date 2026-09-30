NumberField — design system extension 04. A count or an amount.

A text input with `inputMode`, **never** `type="number"`: people type
numbers the way they write them, and `type="number"` reads "26 000" as empty
in most browsers (and changes the value when a trackpad scrolls over it).

## It looks like a number before anything is typed

- **Tabular figures, in Inter** (`font-variant-numeric: tabular-nums`) —
  not mono: mono is the system's caption voice, and a value is not a caption.
- **Sized to its magnitude**: `fit="content"` (the default) and `digits` —
  the digits expected, separators included (`9` fits "2,000,000"; `4` fits
  "100"). A narrow box says "a number goes here".
- **The figure sits against its unit**: set right (against a unit that
  follows, "26 000 €", "30 %"), set left after a sign that comes first
  ("€26,000").

## The unit — inside the box, placed by the caller

The unit is part of the box, never typed, never separable from its figure
when a line wraps (today's "%" beside a full-width field ran off a 390px
screen). The component does not decide where it goes; the caller does, by
locale and currency:

| | English | French |
|---|---|---|
| EUR | `prefix="€"` → €26,000 | `suffix="€"` → 26 000 € |
| GBP | `prefix="£"` | `suffix="£"` |
| USD | `prefix="$"` | `suffix="$"` |
| CHF | `prefix="CHF"` | `suffix="CHF"` |
| % | `suffix="%"` | `suffix=" %"` |

Pass `unitName` ("euros", "percent") so screen readers hear the unit; the
visible sign is hidden from them.

## Nothing typed is thrown away

- Digits are grouped **as they are typed** (`locale`: "2,000,000" /
  "2 000 000" with a no-break space), the caret staying between the same
  digits. `groupAsTyped` is exported for tests.
- What cannot be read stays on screen exactly as typed ("12o"), with the
  message under it.
- An empty box is `null` for the caller, **never 0**: "0 referred sign-ups"
  is a finding. Parsing stays in the engine's own code.

## One treatment for every "can't save this"

A parse error ("That isn't a readable number."), a whole-number rule ("Un
nombre entier : on compte des personnes.") and a range rule ("below the
minimum") are all `error`: the words tell them apart, the look does not. A
rule about **two** fields ("The minimum is above the maximum.") belongs to
the pair: put both in a `FieldRow` and give the row the `error`.

Show a parse error on blur, never on each keystroke.

## A count out of a count

Always a `FieldRow` with its joiner ("out of" / « sur »). Never two
NumberFields side by side in a flex row of your own: the labels wrap to
different heights and the boxes stop lining up.

## Props

```ts
interface NumberFieldProps {
  label; value: string; onChange: (text: string) => void;
  locale?: "en" | "fr"; group?: boolean;
  prefix?: string; suffix?: string; unitName?: string; digits?: number;
  inputMode?: "decimal" | "numeric";
  hint?; error?; missing?; optional?: string; placeholder?: string;
  disabled?: boolean; disabledReason?;
  size?: "sm" | "md"; fit?: "fill" | "content"; id?; name?; onBlur?;
}
```

## Examples

### An amount, English

```jsx
<NumberField label="Spend that month" locale="en" prefix="€" unitName="euros"
             digits={9} value={spend} onChange={setSpend} />
```

### The same, French

```jsx
<NumberField label="Dépense du mois" locale="fr" suffix="€" unitName="euros"
             digits={9} value={spend} onChange={setSpend} />
```

### A rate, with the parse error on blur

```jsx
<NumberField label="Your target" optional="optional" locale="en" suffix="%"
             unitName="percent" digits={4} inputMode="decimal"
             value={t} onChange={setT} onBlur={check}
             error={bad ? "That isn't a readable number." : undefined} />
```
