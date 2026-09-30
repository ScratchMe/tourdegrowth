FormSummary — design system extension 04. What stands between the person and "Save".

Replaces the audit's paragraph of red body text above the group. It sits
**just above the save button**, and says:

- a title that counts ("3 things before this saves");
- one sentence on what happens if they save anyway (the audit saves an
  incomplete row and flags it in the export);
- one line per field, each **a link to that field** (it moves focus into it),
  followed by the field's own message when there is one.

Invalid lines block the save; missing lines do not. With only missing lines
the frame is dashed — "not yet" — and not red.

Every field in the list also shows its own message under itself: the
summary is the index, not the only place the reason is written.

When a save is refused, move focus to the summary (it takes a ref and
`tabIndex={-1}`) so the reason is read, then let the links do the rest.

## Never

- Never a red paragraph in body type (it was the loudest thing on the screen).
- Never above the fields, far from the button that was pressed.
- Never raised, never a Callout, never a second primary action.

```jsx
<FormSummary ref={summaryRef}
  title="3 choses avant d'enregistrer"
  lead="La première bloque l'enregistrement. Les deux autres non : la ligne s'enregistre et l'export la signale."
  items={[
    { targetId: "count-signups", label: "Inscrits en juillet 2026", message: "Ce n'est pas un nombre lisible.", kind: "invalid" },
    { targetId: "unit", label: "Unité", kind: "missing" },
  ]} />
<Button variant="primary">Enregistrer ce chiffre</Button>
```
