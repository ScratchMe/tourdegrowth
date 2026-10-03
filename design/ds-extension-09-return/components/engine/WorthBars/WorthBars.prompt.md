WorthBars — design system extension 09. Cost against margin, in one unit.

Q3. The film's two bars, kept because they read in one glance: what one new
customer **costs** (the CAC) and what it **brings back** in margin over its
counted life (the LTV), both ink, on one scale.

## Rules

- A dashed guide carries the end of the cost across both rows: the eye sees
  at once whether the margin reaches it. Dashed because it is a reading
  guide, not a mark.
- The gap is measured by a bracket under the "brings back" bar, from its end
  to the cost's end, and named in words under it: "~€400 short" / "~€1,000
  more". Never a colour.
- A range (an estimate upstream): the bar is solid to its low end and
  hatched to its high end — the system's hatch for an estimate. When the
  ranges overlap, no bracket: "the two may cross".
- Unknown (no gross margin): the dashed, hatched "?" box across the track,
  the value "?", and "missing: gross margin" under it. Never an empty bar:
  an empty bar reads as zero (constraint 3).
- Text is real text (label, value, gap); the bars are `aria-hidden`.
- `size="slide"`: the same, a little thicker.
