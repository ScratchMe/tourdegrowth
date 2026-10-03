WhatIfFigures — design system extension 09. The panel's figures, as tables.

Q9. Replaces the full panel's seven StatTiles (MRR in 12 months, new MRR,
NRR, GRR, CAC, LTV, payback) and adds what the money needs, in three
DataTables (the system's, `sm`), by meaning:

1. **Growth** — new MRR a month, NRR, GRR. The MRR and ARR in 12 months
   are not repeated here: LeverCard, which stays open right above the panel,
   carries them with their curve (INVENTORY: once per surface);
2. **One new customer** — CAC (with the what-ifs: the same spend for more
   payers), LTV, LTV:CAC, per new customer ("~€400 short" / "~€830 more"),
   CAC payback, months after payback ("leaves first" when negative);
3. **Cash** — spent on acquisition a month (it never moves: same spend),
   cash tied up.

## Columns

Figure | Today | With your what-ifs | Change. Untouched: Figure | Today only
(the panel shows today's figures, as today). The change is signed (U+2212),
bold ink, no colour: a projection the reader set up is nobody's verdict.
Percent changes in points ("+3 pt"), months in months, "stable" when equal.

## Why tables

Twelve tiles would be six rows of cards (~540px on a desktop). A table
reads today against the what-if across one row, and holds the comparison
in about 420px.

## A phone

Under 760px the "Today" column folds into the what-if cell as a second line
("today ~€80,000"): three columns hold at 320px without a horizontal scroll.

## Unknowns

"?" in every cell a missing input stops (no margin: LTV, LTV:CAC, per new
customer, payback, months after, cash) — never 0.
