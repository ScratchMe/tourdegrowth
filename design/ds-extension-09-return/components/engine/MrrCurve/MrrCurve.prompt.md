MrrCurve — design system extension 09. The MRR, month by month.

Q8. A line, not bars and not an area: thirteen points of one quantity over
time, and two of them to compare.

## Today against the what-ifs, without red

- "at today's pace": the axis ink, 2px;
- "with your what-ifs": the full ink, 3px;
- the room between them in the grid's wash: that room is what the what-ifs
  add. Neither line is dashed (dashed means "not yet"; both are equally
  projections). Constraint 1: a projection is never red.

## Ranges

An estimate upstream makes the curve a range: the band between its low and
its high path, hatched (the system's hatch for an estimate), edged by both
paths, thinner.

## Labels

- Only one figure on the curve: today's MRR, at its start ("€48,000 today").
  The MRR in 12 months is printed once, under it, by LeverCard; the curve
  does not repeat it.
- The two lines are named at their ends on a desktop; on a phone
  (`compact`) the names go under the plot as a legend with their line
  samples. Three months on the axis: today, +6, +12.

## A phone

Drawn at the column's real width (350px at 390, 280px at 320), 170px high,
so its type never scales and nothing scrolls sideways.

## Sales-assisted

Annual contracts renew evenly over the year: its curve is a straight line.
Same component; in the hybrid the summed curve is not drawn on the board
(TotalBand prints the summed MRR in 12 months).

The SVG is `aria-hidden`; `summary` says the curve in words.
