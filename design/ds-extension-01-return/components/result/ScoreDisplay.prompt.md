Use `ScoreDisplay` once per result screen, inside a `Card elevation="raised"`.

```jsx
<Card elevation="raised">
  <ScoreDisplay score={74} label="Overall Growth Score" verdict="Solid engine, one flat tyre." />
</Card>
```

The spray texture belongs to display numerals at 100px and up — never to body text or small numbers. Set `animate={false}` for the OG card. The Deep dive does not change the score: the same run shows the same number before and after.
