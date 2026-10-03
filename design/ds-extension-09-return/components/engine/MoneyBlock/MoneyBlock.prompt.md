MoneyBlock — design system extension 09. The money on the board.

Q1–Q6. One flat, ruled block of the board — not a card (the peloton stays the
one raised card), no button, no field. It adds no control to the board but
the "?" of the words it teaches, and it is never on the first screen: it
comes right after the diagnosis, before "What if?".

## Order

1. **MRR, then ARR** side by side, MRR first: it is the typed fact; the ARR
   is "the MRR × 12", said in its label. Both to the unit (facts).
   In the hybrid, `figures={null}`: TotalBand carries the MRRs and the sums.
2. **What one new customer is worth** — the finding first, in words; then
   WorthBars; then the finding's figure in time ("A customer stays ~17
   months; paying back its cost would take 21 months: it leaves before").
   A loss IS a payback longer than the lifetime: the months are said here,
   inside the finding, never as a second piece of news.
3. **Cash** — the month's acquisition spend and the cash it keeps tied up,
   one line on whether and when it comes back, the warning slot, and the
   printed assumptions.

## The finding's four states

| State | Tag | Finding | Bars | Months | Cash line |
|---|---|---|---|---|---|
| loss (the whole LTV range under the whole CAC range) | ink, solid: "Loss" | "you lose ~€400 on each one" | gap "~€400 short" | "it leaves before" | "And it does not all come back…" |
| maybe (they overlap) | ink, dashed: "Maybe a loss" | "it may not pay back what it costs" | "the two may cross" (hatched range) | "it may leave before" + where the range comes from | "Whether it all comes back depends on your churn…" |
| pays back | none | "~€1,000 more than it costs" | gap "~€1,000 more" | payback, lifetime, months after (+ its "?") | "Each month's spend comes back over 11 months…" |
| no margin | none | "We can't tell yet… the gross margin is missing" | the "?" box | none; the note: why nothing is computed on revenue | "No cash figure without the margin…" and the tied-up figure is the "?" box |

## Rules

- **Never red.** The loss is arithmetic on the team's own numbers: serious,
  so the ink tag (the system's strongest neutral), but it names no stage and
  is no diagnosis (red means the primary, a diagnosis, or advice).
- A reference never triggers anything here (constraint 2). LTV:CAC is not
  printed on the board (it would invite the 3:1 comparison); it is in the
  panel and on the slide, with the reference as context.
- No margin: no LTV, no payback, no loss, no cash — never on revenue
  (constraint 4). Sales-assisted uses its own margin.
- The warning slot takes CashWarning only when `paybackWarning()` says so;
  never with the loss.
- Projected or estimated amounts at two significant digits with "~"; facts
  (MRR, ARR, a typed CAC, the month's spend) to the unit; a range prints
  "€1,500–2,300" / "1 500 à 2 300 €".
