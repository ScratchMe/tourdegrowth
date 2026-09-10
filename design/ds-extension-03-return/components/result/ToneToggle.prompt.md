Use `ToneToggle` where a reader chooses the voice of a result. Two places only:

1. The tone selector after question 15 — `size="md"` (unchanged).
2. **The landing preview card** (ext-03) — `size="compact"`, top-right of the card, in the slot the "Stage 5/5" label vacated at ext-01. Switching it swaps the sample verdict sentence and turns the bottleneck name red; the card border, the shadow and the chips stay as they are.

```jsx
<ToneToggle size="compact" value={tone} onChange={setTone} />
```

Why the landing gets a control and the result page does not: the result page shows exactly two CTAs and a third was refused; the landing card is a demo, and a demo you can poke is stronger than a line of copy saying a roast exists. The compact size keeps it visibly subordinate to "Start your Tour →" — mono, 32px, ink fill, no shadow.

Why only the verdict and the name switch: the full roast treatment (red border, red stamped pillar band) would put a red raised card next to the primary CTA and break constraint 1. The verdict sentence is where the roast voice lives; that is the honest demo.

Neutral is the default in both places (SPEC.md §6bis). The 🔥 stays on the label and nowhere else — the brand's one emoji, and this is its home.
