Use `AnswerOption` for every answer, 2 to 6 per question, stacked in a 12px-gap column — never a radio list, never a grid.

```jsx
<AnswerOption size="mobile" onClick={pick}>Self-serve with in-app guidance</AnswerOption>
```

Hover and selected both lift to paper with the 4px shadow; focus is a 3px red ring, because the resting fill is already the sunken neutral. Minimum height 64px on both viewports. Never label an option with its score, a letter, or a number.
