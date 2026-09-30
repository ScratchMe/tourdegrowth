FieldRow — design system extension 04. Two fields that are one statement.

"26 000 out of 120 000", "from 20 to 40 %". The engine's commonest shape.

- From a **480px container** the two sit side by side, joined by their word,
  and their boxes share one line however their labels wrap (CSS subgrid):
  « Activés sous 7 jours » and « Inscrits en juillet 2026 » wrap to different
  heights, the boxes still line up.
- Below 480px they **stack**, the joiner on its own line between them, so a
  French label or a long message never squeezes into half a phone (the old
  build wrapped an error to four short lines).
- Each field keeps its own message; a message about **the pair** ("The
  minimum is above the maximum.") is the row's `error`, under the whole row.

Container width, not viewport: the same row lays out on its own in a sheet,
a card or a column.

## Never

- More than two fields in a row.
- A flex row of your own for two fields.

```jsx
<FieldRow joiner="out of">
  <NumberField label="Activated within 7 days" locale="en" digits={9} size="sm" value={a} onChange={setA} />
  <NumberField label="Signed up in July 2026" locale="en" digits={9} size="sm" value={b} onChange={setB} />
</FieldRow>

<FieldRow joiner="à" error={min > max ? "Le minimum dépasse le maximum." : undefined}>
  <NumberField label="Bas de la fourchette" locale="fr" suffix={" %"} digits={4} value={lo} onChange={setLo} />
  <NumberField label="Haut de la fourchette" locale="fr" suffix={" %"} digits={4} value={hi} onChange={setHi} />
</FieldRow>
```
