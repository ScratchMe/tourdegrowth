# Segmented — one prop from extension 04

Q15: every control gets its visible label from `Field`. `Segmented` names
itself with `aria-label`, which is right in a header (the tone toggle, the
language switch) and wrong in a form, where the name must be the visible
label. So `SegmentedField` goes, and Segmented takes one optional prop:

```ts
/** The id of a visible label that names the group (a Field's labelId). Replaces `label` as its accessible name. */
labelledBy?: string;
```

- With `labelledBy`, the group renders `aria-labelledby={labelledBy}` and no
  `aria-label`; `label` becomes optional.
- Without it, nothing changes (`label` stays required): ToneToggle and
  LocaleSwitcher are untouched.

In a form:

```jsx
<Field group label="Activation window" hint="Counted from the day they sign up.">
  {({ labelId }) => (
    <Segmented as="button" labelledBy={labelId} value={days} onChange={setDays} options={WINDOWS} />
  )}
</Field>
```

`size="md"` in a form at every density: its 44px height already matches a
`sm` field, and `sm` (the header scale, mono uppercase) would read as a
caption, not a control.
