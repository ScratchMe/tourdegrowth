EngineProgress — design system extension 07. Progress, told by what remains.

Today the header promises four big steps (Your targets · Your numbers · What
if · Your slides) while the real counter is "Number 4 of 17", and the board
says "7 of 17 numbers found" in a chip and again in the resume band. Q13 asks
for progress told honestly: **show what remains, never say "done" while a
screen remains.**

## The sentence

`remaining` first, always: "17 to go", "6 to go", "Last one to go", "None to
go". "To go" counts numbers with **no answer** ("to do"). A number estimated,
asked, or that can't be found has an answer: it is in the counts, not in
"to go". `counts` follows, quieter: "7 found · 2 estimated · 1 asked · 3
can't find".

## The marks

One per number, funnel order, a gap between stages — the board's map in one
line. Five kinds, no colour carries the meaning (ink and `--viz-axis` on
paper, 5.8:1 at least):

| Status | Mark | Why |
|---|---|---|
| found | filled ink dot | the peloton's measured dot |
| estimated | hatched dot, thin ring | the peloton's "estimated range" hatch |
| asked | dashed ring | pending: dashed is "not yet" |
| can't find | ring struck through | the struck cell, "not measured" |
| to do | thin ring | empty |

## Where it is used

- **The board**, size `md`, under "Your numbers": sentence, marks, legend.
  Each stage heading in NumberList repeats its own marks.
- **A number's screen**, size `sm`, in the header, right: the sentence only
  ("6 to go"). The position ("Activation · 2 of 3") is the header's left.

Never a percentage bar: 17 numbers of very different effort do not make a
percentage.
