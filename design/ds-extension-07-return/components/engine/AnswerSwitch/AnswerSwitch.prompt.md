AnswerSwitch — design system extension 07. The value is the question; the three other answers sit one tap under it.

Q7. Today "Where are you with this number?" comes first, a 2 × 2 choice,
and the value boxes open under "I have it". Most numbers, most months, are
"I have it" (7 of 17 in the brief's returning example; nearly all of them
from the second month on). So **the boxes are the question**, and "No
figure to hand?" offers the three others under them.

## The four answers are kept, with what each records

| Answer | How it is given | What it records (unchanged) |
|---|---|---|
| I have it | type in the boxes (or "I only have the rate") | the value, its source, the optional definition |
| I can estimate it | "I can estimate it" → low / high + basis | the range and its basis |
| I'll ask for it | "I'll ask for it" → role + the request, "Copy the request" | the request, stamped with its date; followed up later |
| I can't find it | "I can't find it" → why (triage) + how to repair | the triage |

**Nothing is pre-selected**: empty boxes and no alternative is "to do", as
today. The answer is recorded when the sheet is saved.

## Rules

- The three are **toggle buttons** (`aria-pressed`), a group named by the
  legend; each is a 44px row. Pressed: ink, no underline, a solid rule
  under it.
- Choosing one swaps the boxes for its editor; "← I have the figure after
  all" brings the boxes back. What was typed stays until the save.
- `source` appears once a value is typed (it describes the value).
- The shared-count sentence ("Same number as for …: changing it here changes
  it everywhere") is a full-width line **under the row of boxes**, not the
  first box's hint: in the box's hint it wraps into a 160px column today.
- An invalid value: the FieldRow's `error`, the save refused, the message
  says what to check (not only "invalid"). Focus stays where it is.
