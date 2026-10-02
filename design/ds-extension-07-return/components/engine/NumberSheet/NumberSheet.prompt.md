NumberSheet — design system extension 07. One number, one question, its knowledge attached to what it explains.

Q6. Today one value comes with about ten blocks, in this order: effort and
"Definition →", one-liner, formula (a sunken block), the cohort sentence,
"Where are you with this number?" (four choices), the editor, "Where to find
it" (folded, with the trap inside it), the reference strip, the Tour, "Your
definition" and "Note to self" (both open), the actions. The step-by-step
reuses that sheet whole: 2,059px at 1280 with "Where to find it" open.

## The order, fixed by the component

| # | Block | Default | Why there |
|---|---|---|---|
| 1 | position · progress ("Acquisition · 1 of 3" · "17 to go") | shown | where you are, what remains |
| 2 | name · effort (neutral Tag) · "Definition →" | shown | — |
| 3 | one-liner; formula on one mono line | shown | what the number is, in two lines |
| 4 | Tour line (when linked) | shown | one line, quiet |
| 5 | **the trap** (TrapNote) | **open** | it changes what one types (Q8) |
| 6 | where to find it (WhereToFind) | closed; the summary names the tools | one tap, and you know whether it is worth it |
| 7 | **the value** (AnswerSwitch) | the boxes | the question itself (Q7) |
| 8 | how it compares (HowItCompares) | shown | reference, target and verdict as one object (Q9) |
| 9 | your definition and a note | closed | optional; the trap opens it when it asks for it (Q10) |
| 10 | actions | — | one primary |

Each explanation sits **next to what it explains**: the cohort sentence is
the denominator's hint; the shared-count sentence sits under the boxes it
concerns; the trap stands just above the value; the target box sits in the
chart that draws it.

## Measured on the board (CSS px)

| State | 1280 | 390 |
|---|---|---|
| Untouched | 1,113 | 1,422 |
| "I have it", filled | 1,349 | 1,680 |
| Filled, "Where to find it" open (06's state) | 1,689 (06: 2,059) | 2,206 |

## Rules

- **One primary**: "Save and continue →", a `submit`: Enter in any box saves
  (constraint 14). On the last number: "Save and see your engine →".
- "← Your numbers" (quiet) is always there: back to the board, at the row.
  "Skip for now" (quiet) leaves the number "to do".
- Focus moves to the heading when the person **moves** to this screen
  (Save and continue, a row, NextStep); never on first paint.
- No pre-selected answer: a number nobody looked at is "to do" (unchanged).
- Computed numbers use `readOnly`: definition, formula, trap, reference;
  no answer, no words.
- A sheet is one Card, flat: the screen has no raised card.
