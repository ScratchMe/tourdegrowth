CashWarning — design system extension 09. Late money, said as advice.

Q5. "You make money, but late — maybe after your cash runs out." A
different message from the loss, so a different look:

| | Look | Says |
|---|---|---|
| The loss | ink tag, solid ("Loss") | you lose money on every customer |
| The warning | dashed red edge (the system's **advice**: the backup line, the trap) | the payback is longer than {limit} |
| The leak (diagnosis) | solid red edge / red wash | the stage a target names |

## Rules

- Its trigger is a slot (C49): "longer than **your runway (9 months)**" or
  "longer than **your payback target (12 months)**". With no trigger typed,
  no warning: the two facts (months after payback, cash tied up) stand
  alone. A published reference ("under 12 months for SMB SaaS") may situate
  a payback on a chart; it never triggers this (constraint 2).
- Never with the loss: a customer who leaves before paying back is the loss,
  not a late return (`paybackWarning()` returns null).
- `maybe`: the payback is a range that straddles the limit — "maybe longer
  than …", same look.
- One sentence, in the cash part of MoneyBlock (and on the unit-economics
  slide when it applies). No icon, no button.
