Use `PillarChip` five times per result, in AARRR order — a column on desktop, a two-up grid on mobile.

```jsx
<PillarChip pillar="Retention" score={8} weak>
  <DefinitionTrigger term="Retention" tone="alert" />
</PillarChip>
```

Mark exactly one pillar `weak`: the point of the screen is a single thing to fix. Zero-pad two-digit scores on desktop ("08") where the column alignment shows; do not pad in the mobile grid.
