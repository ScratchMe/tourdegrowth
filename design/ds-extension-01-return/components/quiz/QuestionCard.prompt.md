Use `QuestionCard` for the current question, in both the Quick tour and the Deep dive — the two runs are visually identical by design, so never restyle it for deep mode.

```jsx
<QuestionCard size="mobile">
  Have you defined a specific "aha" moment <DefinitionTrigger term="aha moment" /> for new users?
</QuestionCard>
```

It renders an `<h2>`; one per screen. It owns the raised shadow, so nothing else on a question screen may use `elevation="raised"`.
