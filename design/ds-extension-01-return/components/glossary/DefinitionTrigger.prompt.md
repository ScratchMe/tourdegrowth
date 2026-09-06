Use `DefinitionTrigger` immediately after a jargon term — first occurrence per screen only, never on every repeat.

```jsx
Retention <DefinitionTrigger term="Retention" tone="alert" open={openId === "retention"} />
```

It is 16px, below the 44px target, and that is deliberate: it is an optional aid sitting inside a text line, so it never carries a required action. Pair it with `DefinitionPopover`. Inside a red pillar chip pass `tone="alert"` so it reads as part of the chip.
