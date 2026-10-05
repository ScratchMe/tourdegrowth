SideShown — design system extension 10. The side selector of a marketplace's board.

Questions 1 and 2. The hybrid's "Engine shown" pattern (return 07, screenshot
04), for the two sides of a marketplace: **one side at a time, never both**
(C70). It opens the side's part of the board; everything above it is shared
(the engine bar, the total, the next step), everything under it down to the
numbers list is the shown side's (its verdict, diagnosis, money, "What if?",
funnel).

## Rules

- A solid ink rule above it (`--market-side-rule`): the shared part ends
  here. The board's other rules are dashed dividers; this one is the hard
  edge, so the reader sees where "the marketplace" stops and "a side"
  begins.
- The label (« Côté affiché »), then the system's `Segmented` (44px
  targets), then the side's heading in the section face
  (« La demande : les acheteurs »), then one muted line (« Deux côtés, deux
  lectures : chacun se lit contre ses propres cibles, jamais contre
  l'autre. »).
- `sides` is always demand, then supply. A fixed order is not a ranking:
  the selector never reorders, never badges an option with a figure, a
  colour or a leak. A figure next to each option would put the two sides
  face to face.
- It starts on demand (the brief's recommendation, kept: commissions exist
  in every marketplace, subscriptions only when the box is ticked).
- The heading carries the vocabulary (C65): « les acheteurs » / « les
  clients », « les vendeurs » / « les prestataires ». The Segmented's
  options stay « Demande » / « Offre » in both vocabularies.
- On a phone the label goes above the Segmented; the Segmented keeps its
  width (two options).
- Changing the side does not move the page: the selector stays where it
  is, the side's part redraws under it (the app keeps the scroll).

## Not

- No sticky selector: a sticky bar would add a fourth control to every
  screen of the board.
- No "both" option: there is no screen that shows the two sides together,
  but the total above.
