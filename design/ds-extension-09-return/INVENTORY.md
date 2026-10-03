# INVENTORY — where every figure of the money goes

*Extension 09. Every figure of brief 09's "What the model already computes",
per motion and in the hybrid, with its place on the board, in the "What if?"
card, in the opened panel and on each slide — or "not shown" and why. This
file is how Antoine checks that nothing is shown twice or lost.*

## The rule

**Once per surface.** A surface is what one person sees at once: the board
(with the card, which is part of it), the board with the panel opened, each
slide. A figure is printed in one place per surface; where it appears a
second time, the line below says why.

What counts as one place: one component instance. Inside it, a sentence and
the chart that draws it count once — the chart annotates the sentence, it
does not add a place (MoneyBlock's finding and its WorthBars; a slide's
tiles and its PaybackChart).

Three deliberate exceptions, each said where it happens:

1. **The typed inputs** (CAC, ARPA, gross margin, churn, expansion,
   contraction) stay in "Your numbers", as every typed number does: the
   list is where they are typed and edited. The money reads them; it does
   not list them again (only the CAC is printed as such, as "Costs").
2. **A curve's origin** is labelled ("€48,000 today"): a chart needs its
   starting point to be read. The MRR itself is MoneyBlock's.
3. **The warning** restates the payback it compares ("takes 11 months,
   longer than your runway (9 months)"): a comparison needs both terms.

Legend: **B** board (MoneyBlock unless said), **C** the card (LeverCard),
**P** the panel opened, **S1** unit-economics slide, **S2** "What if?" one
lever, **S3** "What if?" together, **S4** the hybrid's side-by-side slide.
Figures are the film's SaaS (brief 09's table): today → with the three
what-ifs.

---

## Self-serve

| Figure | B — board | C — card | P — panel opened | S1 — unit economics | S2 / S3 — "What if?" | Not shown, and why |
|---|---|---|---|---|---|---|
| **MRR** (fact, €48,000) | MoneyBlock, first figure | the curve's origin label only ("€48,000 today", exception 2) | — | — | the curve's origin label (S2, S3) | P, S1: it never moves and the unit slide is about one customer |
| **ARR** (MRR × 12, €576,000) | MoneyBlock, beside the MRR, "ARR, the MRR × 12" | — | — | — | — | C, P, slides: today's ARR never moves; the slides speak the ARR in 12 months |
| **MRR in 12 months** (~€80,000 → ~€120,000) | in the card (the board's place for it) | figure 1; "today ~€80,000" under it once moved | — (the card stays open right above the panel) | — | S2, S3: table row 1 (today, with, change); the title says the gain | S1: a slide about one customer |
| **ARR in 12 months** (~€960,000 → ~€1,500,000) | in the card | figure 2 (replaces "new paying customers a month") | — (the card, right above) | — | S2, S3: table row 2 | S1 |
| **The curve** (13 points) | in the card | MrrCurve: today's pace; with the what-ifs once moved; a range hatched | — (the card's curve shows every what-if of the panel) | — | S2, S3: MrrCurve, slide size | S1. On a phone: drawn at the column's width, keys under it |
| **LTV** (~€1,500 → ~€2,300) | finding sentence + "Brings back" bar (one place) | the one-customer line, only when the what-ifs change the finding ("It brings back ~€2,300 for ~€1,400") | "One new customer" table | tile | S2, S3: table row | Your numbers' computed group: moved out (it was there with LTV:CAC and payback) |
| **CAC** (€1,900 → ~€1,400, same spend) | finding sentence + "Costs" bar; also "Your numbers" › Acquisition (exception 1) | the one-customer line, as above | "One new customer" table | tile | S2, S3: table row | — |
| **LTV:CAC** (0.79 → 1.58) | not on the board | — | "One new customer" table | tile, with "an often-cited reference: about 3:1" (context, never a verdict) | S2, S3: table row | B: the board says what the multiple means instead (costs, brings back, the gap): a bare ratio would invite the 3:1 reference to judge it (constraint 2) |
| **The loss finding and its gap** (loss, ~€400 → none, +€830) | the ink tag "Loss" / dashed "Maybe a loss"; the sentence; the bracket | the one-customer line: "no longer a loss…" / "still a loss of ~€400…" | "Per new customer" row ("~€400 short" → "~€830 more") | the slide's **title** (C48) and the chart's bracket | — | S2, S3: their title is the MRR gain; the LTV and CAC rows carry it. No finding when an input is missing (no tag, no sentence of loss) |
| **CAC payback** (21 → 16 months) | the months line ("paying back its cost would take 21 months") | — | "One new customer" table | tile (and the chart's "would pay back at 21 months", same place) | S2, S3: table row | The healthy cash line no longer repeats it ("It all comes back, as customers pay back") |
| **Lifetime** (~17 → 25 months) | the months line ("A customer stays ~17 months") | — | — | the chart: "leaves at ~17 months" | — | P: the months after payback carry it (lifetime − payback); its cap (36) is in the LTV assumption |
| **Months after payback** (−4.4 → +9.2) | loss: "it leaves before" (the finding's time, never a second piece of news); pays back: "~22 months of margin after payback ?" | — | "Months after payback": "leaves first" → "~9 months" | tile: "−4 months · leaves ~4 months before paying back" / "~22 months" (the chart's bracket is the same place) | — | S2, S3 |
| **The month's acquisition spend** (€93,480, never moves) | cash part, fact 1 | — | "Cash" table: same in both columns, change "stable" | — | — | Slides: the cash tile carries the result; the formula is printed in its assumption |
| **Cash tied up** (~€990,000 → ~€740,000) | cash part, fact 2, with "?" (taught) and its line ("And it does not all come back…") | — | "Cash" table | tile ("does not all come back" / "a floor · monthly billing") | S2, S3: table row | — |
| **Its assumptions** (a floor, linear return, monthly billing) | under the cash part, small, always printed | — | "What the calculation assumes" (folded, as today): the cash line adds "the same spend with the what-ifs" | one line beside the chart | footer, as today | — |
| **The warning** (C49) | cash part, when `paybackWarning()` says so (runway typed, payback longer, no loss) | — | — | beside the chart, when it applies | — | P, C: it is about today; while sliders move, the payback row shows what changes. Never with the loss |
| GRR, NRR (approximate) | "Your numbers" › "Computed from yours (2)", folded | — | "Growth" table | one line with their approximation (they were two tiles) | S2: NRR row (S3: room) | — |
| New MRR a month | — | — | "Growth" table | — | — | B: the curve shows the pace |
| New paying customers a month | — | moved out of the card (ARR in 12 months takes its place) | the month's funnel (kept) | — | — | — |

**No margin** (the public example, C50 open): MRR and ARR print; the
finding says the margin is missing; WorthBars draws "Costs €500" and the
dashed "?" box for "Brings back"; no tag, no months; the cash part prints
the spend and the "?" box for cash tied up ("missing: gross margin"); no
assumption (nothing computed). Panel: "?" in LTV, LTV:CAC, per new
customer, payback, months after, cash. S1: today's title; five "?" tiles,
"missing: gross margin". Never computed on revenue (constraint 4).

**Maybe** (churn estimated at 4–6 %): the dashed tag "Maybe a loss"; LTV
"€1,500–2,300"; the bars hatched to their high end, no bracket, "the two
may cross"; the lifetime "17–25 months"; the cash line "Whether it all
comes back depends on your churn"; the curve a hatched band; MRR in 12
months "€80,000–94,000".

## Sales-assisted (alone, or the hybrid's second engine)

The same places as self-serve, with its own numbers:

- **CAC payback** = CAC ÷ (ACV ÷ 12 × its own margin) — 19 months; one
  motion's margin is never used for the other.
- **Lifetime** from renewal (12 ÷ (1 − renewal), capped at 36): the months
  line adds "the count stops at 36".
- **The curve** is a straight line (annual contracts renew evenly over the
  year); the card says so under it.
- **Cash** assumption: "Monthly billing assumed: a year paid up front comes
  back sooner".
- Its lever in the card is renewal (the stage its target names).

## The hybrid

| Figure | TotalBand (top of the board) | Each engine (under "Engine shown") | S4 — side by side | Not shown, and why |
|---|---|---|---|---|
| MRR per engine and total | the two MRRs and their sum (as ported) | — (MoneyBlock without figures) | — | — |
| **ARR** | **both engines** (a fact: €2,736,000) | — | — | per engine: it is the engine's MRR × 12, and the board's question is the total |
| **MRR in 12 months** | **both engines, at today's pace** (~€310,000) | each card: its own MRR and ARR in 12 months; once moved, one line "Both engines in 12 months: ~€320,000 … (today ~€310,000)" | — | — |
| **The curve** | — | each card, its own curve | — | **the summed curve is not drawn**: one line for two engines would hide which one moves; its end point is TotalBand's MRR in 12 months, and a what-if moves it in the card's total line |
| LTV, CAC, LTV:CAC, loss, payback, lifetime, months after, spend, warning | **never** (they do not add) | each engine's MoneyBlock and panel | each engine's tiles and chart (months after: the chart) | — |
| **Cash tied up** | **both engines** (~€1,800,000) | each engine's MoneyBlock (~€990,000 and ~€840,000) | each engine's tile | the parts and their sum, by design: a sum, never a comparison |
| Assumptions | — | each engine's | one shared note under both | — |

## Not shown anywhere, on purpose

- **A comparison between the two engines** (C4): no "self-serve pays back
  faster", no ratio of one to the other.
- **A reference as a trigger**: the 12-month payback and the 3:1 multiple
  are printed as context (the slide's dotted line and tile note), never as
  a colour, a tag or the warning's trigger.
- **Anything computed on revenue** when the margin is missing.
