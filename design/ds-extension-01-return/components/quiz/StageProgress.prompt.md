Use `StageProgress` above the question card. Five segments, always — the count is the framework, not a variable.

```jsx
<StageProgress current={2} label="Deep dive · Question 3 of 10" />
```

Done segments are solid ink, the current one is red and pulses once as it fills, pending ones are dashed on sunken fill. Put the precise position in `label`, not in the segments; the Deep dive reuses the same five segments across its 10 questions.
