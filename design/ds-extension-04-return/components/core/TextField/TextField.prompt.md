TextField — design system extension 04. One line of text.

`TextArea`, one line tall: the same fill, edge, 16px value and soft limit,
with the field's smaller radius (`--radius-field`, 6px) so a field and a
button side by side no longer read as two buttons.

## Soft limit

`maxLength` never blocks typing (a hard `maxlength` silently cut a pasted
definition mid-word). The count appears at the end of the **label row** once
the text reaches 80% of the limit — a one-line field does not spend a whole
line on a number nobody reads until it matters. Past the limit the count turns
`--text-alert` and the edge turns 3px red; the save refuses and says why.
Pass `countLabel` so the count is spoken in words.

## Use it for

A company name, a channel's name, an activation event, the detail on a
missing number, the word typed to confirm erasing everything; the audit's
scope, units, roles. **Not** for a number (NumberField), a closed list
(Select — the audit's free-text currency becomes a Select), a date
(DateField), or more than one sentence (TextArea).

## Never

- Never `maxLength` as the HTML attribute. Never block a keystroke.
- Never a placeholder that repeats the label; a placeholder is an example
  ("Northwind"), and it disappears the moment they type.
- Never disabled without `disabledReason`.

## Props

```ts
interface TextFieldProps {
  label; value: string; onChange: (value: string) => void;
  hint?; error?; missing?; optional?: string;
  maxLength?: number; countLabel?: (count: number, max: number) => string;
  placeholder?: string; disabled?: boolean; disabledReason?;
  size?: "sm" | "md"; fit?: "fill" | "content";
  id?; name?; type?; inputMode?; autoComplete?; spellCheck?; onBlur?;
}
```

## Examples

### With its soft limit

```jsx
<TextField
  label="Your SaaS or company name" optional="optional"
  hint="It only appears on your slides, and stays on this device like everything else."
  value={name} onChange={setName} maxLength={60}
  countLabel={(n, m) => `${n} of ${m} characters`}
/>
```

### Invalid, then fixed

```jsx
<TextField label="Type ERASE to confirm" value={word} onChange={setWord}
           error={tried && word !== "ERASE" ? "That isn't the word asked for." : undefined} />
```

### Missing (the audit's row editor)

```jsx
<TextField label="Unité" value={unit} onChange={setUnit} size="sm"
           missing={!unit ? "À compléter — l'export signalera cette ligne comme incomplète." : undefined}
           hint="Jamais déduite du nom de la métrique. « euro », « pourcentage », « jours »." />
```
