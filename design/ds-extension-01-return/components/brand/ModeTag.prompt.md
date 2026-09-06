Use `ModeTag` in the header of any deep-dive screen so the user can tell the two runs apart at a glance.

```jsx
<ModeTag mode="deep" />
<ModeTag mode="quick">Quick · 15 questions</ModeTag>
```

`mode="deep"` is the one solid-ink chip in the whole system — that scarcity is what makes it read as a mode, so do not use it for ordinary labels. Quick mode usually needs no tag at all; it is the default state.
