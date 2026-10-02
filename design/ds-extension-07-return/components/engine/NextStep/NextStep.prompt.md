NextStep — design system extension 07. "Since last time" and the one thing to do now.

It replaces today's three dashed bands — next month, resume ("7 of 17 numbers
found · last visit 12 days ago" + Continue / Follow up), backup — and the
"your browser refused to save" strip with **one card** under the verdict
(Q2, Q3). With the verdict above it, it is the board's first screen, at
1280 and at 390.

## Read in this order

1. **eyebrow** — "Last visit · 12 days ago";
2. **lead** — the reason for the primary, one sentence;
3. **primary** — the screen's only primary button;
4. **lines**, under a rule — what else waits, each with at most one quiet
   action.

Reason and action come before the rest so that at 390px the verdict and the
primary fit the first screen (measured: the primary ends at 788px in English,
812px in French, of 844).

## Which action is the primary (`nextStepFor`)

Deterministic, first match wins:

| # | When | Primary | Secondary / lines |
|---|---|---|---|
| 1 | The browser refused to save | "Save to a file (.json) →" | lead in advice tone |
| 2 | A past month is shown | "Back to {current month} →" | "Correct this month" |
| 3 | The month after the current one has ended | "Start {next month} →" | "Keep filling {current}"; numbers still to do as a pending line |
| 4 | A number "on your own, 5 min" is still to do | "Next number: {name} →" | — |
| 5 | Numbers to ask for, not yet asked | one: "Ask {role} for the {number} →" (its screen, "I'll ask for it" open); two or more on a first visit: "Copy your {n} requests →" (AskList) | "Type the next number first" |
| 6 | A number "on your own, ~1 h" is still to do | "Next number: {name} →" | — |
| 7 | Nothing left to type; requests out | "Prepare your slides →" | "{n} requests out since {date}" (pending) |
| 8 | Everything found | "Prepare your slides →" | "Your verdict above is the title of your first slide." |

Within a rank, funnel order (Acquisition → Revenue), then catalogue order.
That is Antoine's own sentence, made a rule: *send the requests today, fill
in the rest while waiting* — after the five-minute numbers, so that the
first number is typed within two screens of arriving.

Pending requests older than seven days add a line "Asked {role} for the
{number} {ago}: no answer typed yet." with "Follow up" (re-copies the
request, as today). The backup line ("Never saved to a file…" + "Save
(.json)", advice) shows only while the engine needs a backup.

## Rules

- **One primary per screen** (constraint 6). Line actions are quiet.
- Dashed edges only for "not yet" (pending) and, in red, for advice
  (constraints 5, 7). Never a red wash: nothing here is a diagnosis.
- Each line is a 44px row at least, so a line's action never overlaps the
  next line's (constraint 4).
- Card flat. The board's raised card stays the peloton.
