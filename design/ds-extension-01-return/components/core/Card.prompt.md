Use `Card` for every panel. The `raised` elevation is a budget, not a style: one per screen, on the element the screen exists for.

```jsx
<Card elevation="raised" padding="20px">…score…</Card>
<Card tone="alert">Retention — 8/20</Card>
<Card tone="outlineAlert">Priority move…</Card>
```

`tone="alert"` (solid red wash) marks a diagnosed weakness; `tone="outlineAlert"` (dashed red on paper) marks advice. Shadows are always `--ink-0`, never blurred, never coloured.
