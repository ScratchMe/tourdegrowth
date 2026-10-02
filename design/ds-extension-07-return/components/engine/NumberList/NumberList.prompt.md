NumberList — design system extension 07. Every number, by stage, in one list.

Q16. The board's five stage tabs (status marks, "found: 2/3", "Holds you
back") and their panel of folded rows replaced stage rows at Antoine's
request on 2026-09-26. Brief 07 reopens it. The tabs hide four stages out of
five, and on a phone the strip scrolls inside its own box. A row then
unfolds its whole sheet in place: 1,667px for one number. **Proposal: one
list, every stage visible, every number one row; a row opens the number's
own screen.** That reverses the 2026-09-26 decision, so it is Antoine's to
take; the tabs' content is all here, nothing is lost either way.

## Anatomy

- **Title** "Your numbers" + EngineProgress (what remains, marks, legend).
- **A stage**: its name (stencil capitals, English on French screens), its
  marks and "2 of 3 found"; the stage a team target names gets **"Holds you
  back"** (Tag `alert`) and the **solid red edge** down the group: the
  system's diagnosis (constraint 5). No other red in the list.
- **A row** is one button, 48px at least, the whole row the target: name,
  value, status. A found number shows its value and **no tag** (the value is
  the status). Estimated and "can't find": neutral tag. Asked and to do:
  dashed tag (pending).
- **Computed from yours (5)**: closed Disclosure at the end; rows read only,
  with what each still needs ("Needs CAC, gross margin").

## Rules

- **Funnel order, always**: never sorted by value, status or effort. The
  next action is NextStep's job, not the list's.
- **The diagnosis edge follows the team target only** (C1). Without a
  target: no edge, no tag, on any stage.
- Hybrid: the list shows the engine chosen in the Segmented above it (one
  engine at a time); the link (opportunities from self-serve) sits in the
  closed group at the end of each.
- A row opens the number's screen and moves focus to its heading (a move
  between screens); "← Your numbers" brings the person back to the row.
