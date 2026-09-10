Use `Bottleneck` once, inside the raised score card, directly under `ScoreDisplay`. It replaces the verdict line that used to sit under the numeral: the verdict sentence moves into this block as its last line. Nothing else on the page moves — pillar chips stay below the card, unchanged.

```jsx
<Card elevation="raised">
  <ScoreDisplay score={74} label="Overall Growth Score" />
  <Bottleneck
    sharpness="clear"
    label="One stage holding you back"
    pillars={[{ pillar: "Retention", score: 8 }, { pillar: "Activation", score: 12 }]}
    verdict="Solid engine, one flat tyre: retention." />
</Card>
```

Reading order it produces: numeral → dashed rule → sharpness label (mono, red) → pillar name in the stencil face with its score → verdict sentence. The name is set in `--display-title` (36px) on desktop and `--display-section` (30px) on mobile — the same face as the numeral, one size down, so the two read as one stamp.

**Sharpness is the honesty mechanism.** Pass `"clear"` only when the lowest pillar is at least 4 points behind the next; `"shared"` when the two lowest are within that gap (both names render, stacked, same size — never one big and one small); `"level"` when every pillar is in the strong band (no name, label in `--text-muted`, verdict only). The label string differs per state and comes from the copy library; keep each under 32 characters uppercase.

Never add a gauge, a bar, a confidence badge or an emoji. The score must stay re-explainable in ten seconds: a name and a number out of 20 is the whole claim. `tone="roast"` paints the name red and does nothing else — the roast voice lives in the verdict text.

Landing preview card: the same component with `size="mobile"`, sharpness `"clear"`, and the sample verdict. The preview promises what the result delivers.
