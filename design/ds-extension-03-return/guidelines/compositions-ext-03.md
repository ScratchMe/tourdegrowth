# Extension 03 — compositions

Arrangements of existing components. Nothing here is a component; port as page layout.

## Result page (both audiences)

Desktop, two columns inside `--width-desktop` (440 / 480, 40px gap):

```
left                                  right
──────────────────────────────────    ──────────────────────────────────
Tag "Sample result — not your data"   PriorityMove  (free action; owner: + upgrade)
Card raised                           MetaLabel "Strengths" + 2 InsightCard
  ScoreDisplay (no verdict)           MetaLabel "Where you're losing time" + 2 InsightCard
  Bottleneck                            — bottleneck pillar first, then the other
PillarChip ×5 (rows)                  pitch line
ShareCard                             Button primary "Take your own Tour →"
                                      Disclaimer
                                      [owner] ScoreBreakdown
```

Mobile, one column: Tag · Card(ScoreDisplay + Bottleneck) · PriorityMove · PillarChip ×5 (wrap) · Strengths · Losing time · pitch · primary · ShareCard · Disclaimer · [owner] ScoreBreakdown.

Changes from the shipped page: the verdict line leaves `ScoreDisplay` and closes `Bottleneck`; the locked "Priority move" card is retired — `PriorityMove` now holds the free action for everyone and moves to the top of the right column; "Share this result" leaves the CTA row and lives in `ShareCard`; the weakness cards are ordered bottleneck first.

## Landing

Left column unchanged: Tag · H1 · lede · primary + secondary.

Right column (desktop) / below the CTAs (mobile):

```
Problem statement — --body-lg, --text-body, max 34em, two sentences
Card raised  (the preview)
  header row: MetaLabel "Overall growth score — sample B2B SaaS" · ToneToggle compact
  ScoreDisplay size="mobile" (no verdict)
  Bottleneck size="mobile" sharpness="clear" tone={tone}
  PillarChip ×5 size="mobile" (wrap)
  PriorityMove (sample action, no upgrade)
```

The problem statement sits above the card on both widths: claim, then proof. Neither the H1 nor the CTA pair moves.

Toggle behaviour: `straight` ↔ `roast` swaps the sample verdict and paints the bottleneck name red. The card frame, shadow, chips and action do not change. Default `straight`.
