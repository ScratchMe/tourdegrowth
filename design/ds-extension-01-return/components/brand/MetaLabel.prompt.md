Use `MetaLabel` for any mono text that labels rather than speaks — "Overall Growth Score", "Question 3 of 10", "Priority move".

```jsx
<MetaLabel wide>Strengths</MetaLabel>
<MetaLabel size="xs" uppercase={false}>A quick estimate, not an audit.</MetaLabel>
```

Rule of thumb: label = uppercase with tracking; sentence = `uppercase={false}`. Never set mono below 11px, and never use mono for a question or a verdict — those are Inter.
