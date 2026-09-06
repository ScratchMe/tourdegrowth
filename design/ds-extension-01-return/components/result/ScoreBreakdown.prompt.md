Use `ScoreBreakdown` on the result page, **owner only**, after the two CTAs and the Disclaimer. It is the product's promise that a score can be re-explained in ten seconds, made visible. Never render it for a reader who opened a shared link — the answers live on the owner's device.

```jsx
<ScoreBreakdown
  pillars={pillars}
  strings={{
    summary: t.result.breakdown.summary,
    intro: t.result.breakdown.intro,
    note: t.result.breakdown.note,
    pts: (n) => `${n} pts`,
    maths: (raw, score) => `${raw}/60 → ${score}/20`,
  }}
/>
```

Two levels, no more. Level one is the closed `Disclosure` line "How this score is calculated". Opening it shows the intro and the **five pillar heads with their maths** (`54/60 → 18/20`) — that is the ten-second explanation, visible at once on both breakpoints. Level two is a per-pillar `sm` Disclosure holding the three question / answer / points rows. Both levels are closed by default; do not open a pillar on the reader's behalf.

Points are mono `--meta-sm`, right-aligned, tabular. `0 pts` is `--text-alert`: solid red is diagnosis, and the zeros are the diagnosis. 7 and 20 stay muted. Do not turn points into `PillarChip`s — a chip means "a pillar score out of 20", and fifteen of them is noise.

The closing note is `--text-faint` (AA on stone; the old `.45` alpha was not). The result screen must be visually unchanged while the breakdown is closed: no card, no shadow, no red on the summary row. It adds no CTA — the result page shows exactly two.
