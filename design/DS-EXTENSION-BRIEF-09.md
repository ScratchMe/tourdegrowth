# Design system extension brief 09 — the engine's money

*Tour de Growth · from the codebase to Claude Design · 2026-10-03*

## The constraints, first

These come before everything else in this brief. A design that breaks one
of them cannot be ported, however good it looks.

1. **Never red for a projection** (design audit S-5). What the what-ifs
   add, a projected MRR, a projected ARR, a curve: ink, never red. Red is
   the leak: the stage a team target names ("Holds you back"). The film
   that started this brief paints the what-ifs red; it is wrong, and it
   will be redrawn after your return, not the other way round.
2. **No reference designates** (decision C1). A published reference (the
   glossary's "LTV:CAC around 3:1", "payback under 12 months for SMB SaaS")
   may situate a figure, printed as context, never trigger a verdict, a
   colour or a warning. Only a target the team typed names a stage. The
   loss finding below is arithmetic on the team's own numbers, not a
   reference, and it names no stage.
3. **A figure that cannot be computed prints "?", never 0**, and says what
   is missing ("missing: gross margin"). An empty bar reads as zero, and
   zero is a measurement: an unknown has its own shape (the hatched,
   dashed "?" box the peloton and the unit-economics slide already use).
4. **No margin, no LTV and no payback.** Never computed on revenue: the
   revenue version is the flattering one, and the glossary says so. So
   without the gross margin, there is no LTV:CAC, no loss finding, no cash
   figure either. Sales-assisted has its own margin; one motion's margin is
   never used for the other.
5. **French and English, from the same component.** French is often
   longer. Every key screen in both languages.
6. **AA contrast**, checked by our CI with no exception: text 4.5:1, every
   edge, ring, mark and curve 3:1 against what is next to it, translucent
   colours measured composed on their real ground.
7. **390px**, and from 320px with no horizontal scroll. A curve on a phone
   is the hard case: draw it.

And the constraints that held brief 07, unchanged: tokens only (a new value
is a new token); the system first (Button, Card, Callout, StatTile,
DataTable, Disclosure, Tag, MetaLabel, GlossaryTerm, BulletChart, DotGrid,
Segmented, and the fourteen engine components of return 07, `LeverCard`,
`NextStep`, `TotalBand`… — not synced into the system yet, the re-sync
waits for their copy review: read them in this project as return 07's own
source, `design/ds-extension-07-return/components/engine/`, and as ported
in the screenshots); 44px targets, none overlapping; **red means one
of three things** (solid red fill = the primary; red wash or solid red edge
= a diagnosis; dashed red = advice); **one loud thing per screen** (one
raised card, one primary); dashed means "not yet"; no icons (→ ← № ? and a
disclosure's +/−); local and deterministic (no account, no server, no AI,
nothing typed in a URL or counted); the data model changes only by a
decision with Antoine (say so in the README if a design needs a field).

**And one that is specific to this brief: do not undo what return 07
lightened.** The board went from 12 blocks and 75 controls to 8 blocks and
27 controls, with one next step and one primary. The full "What if?" panel
is folded behind one lever on purpose. Adding the money must not bring the
density back: measure it the way return 07 measured it (the table below).

---

## Why this brief

On 2026-10-03, four motion-design films were proposed for Tour de Growth
(`marketing/motion/`, decision C45 pending). One of them, "The engine"
(44 s), shows what a founder, a board or an investor asks about first:

- an MRR going up;
- then the truth: **each new customer costs €1,900 and brings €1,500 of
  margin**, "−€400 per new customer";
- the engine names the stage that holds it back;
- "What if?" moves three levers: the MRR in 12 months goes from €80,212 to
  €122,402, **the ARR from €963k to €1,469k**, the LTV:CAC from 0.79 to
  1.58, the payback from 21 to 16 months, and the compounding shows;
- three slides for the board.

Antoine thought the engine already showed this. It computes most of it, but
shows little of it: no ARR anywhere, no curve, no loss, no word about cash.
He added one more thing: **nothing warns about a long CAC payback, while it
is the cash that pays for it.** The glossary already says it ("the
comparison that decides whether a payback is survivable is with your
runway, not with a benchmark"), and the engine has no notion of cash.

We have built the model (below). We need you to design where the money
lives, before we port anything. The engine is still closed behind its flag;
there are no users to migrate.

## What the engine is, in one paragraph

A free tool, local to the browser, for a growth PM or a founder of a B2B
SaaS. They type their own funnel numbers by hand (17 for self-serve, 15
for sales-assisted, both in a hybrid), and the engine gives back a verdict,
the stage that holds it back (only against a team target), the funnel as
100 sign-ups (the "peloton"), "What if?" levers that move together, and a
deck of slides. Since return 07 (ported as A18), it is **one journey**: a
start card, a "Targets" screen, one screen per number, a requests screen,
and a board whose top holds the engine bar, the verdict and **one next
step**; below it the diagnosis, the peloton (the one raised card), "Your
numbers" as one list by stage, the "What if?" lever card (the full panel
folded behind it), and "The Tour and your numbers".

## What the model already computes (A20.a, ported, no screen yet)

Everything below is computed by the engine today, per motion, **today and
with the what-ifs**, in ranges (an estimate stays a range at every step).
The spec is `ENGINE.md` §20 (`docs/engine/argent.md`); here is what you
can place.

| Figure | Formula | Moves with | Unknown when |
|---|---|---|---|
| **MRR** | typed, or ARPA × customers | never (it is a fact) | no MRR, no ARPA |
| **ARR** | MRR × 12 | never | no MRR |
| **MRR in 12 months** | 12 months at this month's pace | every lever | no MRR, no new MRR, no churn |
| **ARR in 12 months** | MRR in 12 months × 12 | every lever | as above |
| **The MRR, month by month** | **13 points**, today first, the MRR in 12 months last: one loop for both | every lever | as above |
| **LTV** | monthly margin × the customer's counted lifetime (1 ÷ churn, capped at 36 months) | ARPA, churn | **no margin** |
| **CAC** | typed; with the what-ifs, the same spend for more payers | the funnel's levers | no CAC |
| **LTV:CAC** | LTV ÷ CAC | ARPA, churn, the funnel's levers | no margin, no CAC |
| **The loss finding** | **loss** when the whole LTV range is under the whole CAC range; **maybe** when they overlap; nothing when the LTV covers the CAC; nothing when an input is missing. Plus the gap, LTV − CAC, "per new customer" | as LTV:CAC | no margin, no CAC |
| **CAC payback** | CAC ÷ monthly margin, in months | ARPA, the funnel's levers (**not** churn) | no margin, no CAC |
| **Lifetime, and the months after payback** | lifetime − payback: positive = months of margin left once the CAC is paid back; negative = the customer leaves first | churn, ARPA, the funnel's levers | no margin, no CAC, no churn |
| **The month's acquisition spend** | new customers in the month × CAC | **never** (same spend) | no CAC, no new customers |
| **The cash it keeps tied up** | spend × payback ÷ 2: each month's spend comes back over the payback, linearly; at a steady pace, half of it is out at any time | ARPA, the funnel's levers (through the payback) | no payback, no spend |

Four things to know before drawing them:

- **A loss IS a payback longer than the lifetime.** The same three numbers,
  read as money (LTV under CAC) and as time (the customer leaves before
  paying back). The screen must never say them as two pieces of news: the
  loss is the finding, the months are its figure.
- **The cash figure is a floor** (churn and contraction, which stretch the
  return, are not counted), **unless expansion outpaces them** (an NRR
  above 100 %), and it assumes monthly billing (a year paid up front comes
  back sooner, which matters most in sales-assisted). These assumptions are
  printed with it, like every "What if?" assumption today.
- **When the customer leaves before paying back, the cash does not fully
  come back**: the loss speaks, and the cash figure must not read as an
  advance that will return.
- **Sales-assisted** has its own payback (ACV ÷ 12 × its own margin), its
  own lifetime (from renewal), its own curve: annual contracts come up for
  renewal evenly over the year, so its base moves in a straight line;
  monthly ones compound. **In the hybrid, the ARR, the curve and the cash
  add up** (a sum, never a comparison: "two engines, one total"); the LTV,
  the payback and the loss never do (each engine has its own).

**Not computed yet, on purpose: the long-payback warning.** What triggers
it is Antoine's decision (C49, below): a runway the team types (optional),
a payback target of the team, or the glossary's references (which may only
situate). Design it so that its trigger is a slot: "the payback is longer
than {what}".

### The numbers on the screenshots

Every money screenshot uses **the film's SaaS**, so you see every state:
MRR €48,000, ARPA €120, gross margin 75 %, churn 6 %, contraction 1 %,
expansion 2 % a month, 820 sign-ups a month, 6 % who pay, activation 18 %,
CAC €1,900. Its team targets are the public example's (activation 20 %,
churn 2 %): **Retention holds it back**.

| | Today | Churn 4 %, expansion 3 %, activation 24 % |
|---|---|---|
| LTV | ~€1,500 | ~€2,300 |
| CAC | €1,900 | ~€1,400 (same spend) |
| LTV:CAC | 0.79 | 1.58 |
| Loss finding | **loss**, −€400 per new customer | none, +€825 |
| CAC payback | 21 months | 16 months |
| Lifetime / months after payback | ~17 / −4.4 (leaves first) | 25 / +9.2 |
| Spend a month / cash tied up | €93,480 / ~€987,000 (does not fully come back) | €93,480 / ~€740,000 |
| MRR in 12 months | ~€80,000 | ~€120,000 |
| ARR today / in 12 months | €576,000 / ~€960,000 | €576,000 / ~€1,500,000 |

The engine prints **every projected amount at two significant digits**,
with "~" (`~€80,000`, not `€80,212`), and a pair "today → with the
what-ifs" gains a digit only when the difference would otherwise vanish.
The film prints euros to the unit: that is the film's mistake, not a
precision to copy.

The public example ("See a filled-in example") has **no gross margin**: its
LTV, payback, LTV:CAC, loss and cash all print "?" (`10-…`). Whether to
give it one is C50.

---

## The screenshots

In `design/ds-extension-09/`, from a real production build (2026-10-03,
`next build` then `next start`, engine open, the browser clock on
24 September 2026), taken by `scripts/engine-density.capture.ts`
(tests "brief 09"). 2×. Element captures are taken with the sticky header
released, so nothing is drawn across them. Each key screen is in **French
at 1280px** and **English at 390px**.

| File | What it shows |
|---|---|
| `01-board-full-{fr-desktop,en-mobile}` | The board on the film's SaaS. The money's only trace is the lever card's "MRR in 12 months", 3,237px down the page at 1280 |
| `02-lever-{…}` | The "What if?" lever card, untouched: the lever of the stage a target names (churn), MRR in 12 months and new payers a month |
| `03-whatif-panel-{…}` | The full panel, opened, untouched: eight sliders, seven tiles (MRR in 12 months, new MRR, NRR, GRR, CAC, LTV, payback), the month's funnel, the assumptions |
| `04-lever-moved-{…}` | The card with the film's three levers moved |
| `05-whatif-three-levers-{…}` | The full panel with the three levers: tiles with "today", the funnel's ringed dots, what each lever brings alone, the compounding sentence |
| `06-slide-unit-economics-{…}` | The unit-economics slide: CAC, payback, LTV, LTV:CAC, GRR, NRR, and the payback on a 0-36 month bar with the 12-month tick ("a commonly cited reference") |
| `07-slide-whatif-one-lever-{…}` | A what-if slide, one lever: two tables, today / with this what-if / change |
| `08-slide-scenario-{…}` | The "together" slide: the levers and what each brings, the growth figures, the compounding |
| `09-page-arrival-{…}` | The page on a first visit: the promise ("slides ready for your leadership meeting", « pour ton CODIR ») |
| `10-slide-unit-economics-no-margin-fr-desktop` | The public example: no margin, the "?" states |
| `11-hybrid-board-full-fr-desktop` | The hybrid, both engines with a margin: `TotalBand` (self-serve MRR, sales-assisted MRR, the total) opens the board |
| `12-slide-unit-both-fr-desktop` | The hybrid's slide with both engines side by side |

## The density, measured

CSS pixels, viewports 1280 × 900 and 390 × 844, the way return 07 measured
(a control is visible and focusable, not inside a closed `<details>`).

**The board today, returning** (the public example, four numbers to do;
return 07's own measure, on today's build):

| | FR 1280 | EN 1280 | FR 390 | EN 390 |
|---|---|---|---|---|
| Where the tool starts | 356px | 356px | 298px | 298px |
| Controls on the first screen | 3 | 4 | 3 | 3 |
| The board | 3,480px, 27 controls | 3,463px, 27 | 4,165px, 27 | 4,132px, 27 |

**On the film's SaaS** (`01` to `05`):

| | FR 1280 | EN 1280 | FR 390 | EN 390 |
|---|---|---|---|---|
| The board | 3,438px, 26 controls | 3,372px, 26 | 4,077px, 26 | 4,102px, 26 |
| Controls on the first screen | 3 | 3 | 3 | 3 |
| Where the lever card starts | 3,237px | 3,195px | 3,760px | 3,785px |
| The lever card | 262px, 2 controls | 262px, 2 | 320px, 2 | 320px, 2 |
| The full panel, opened | 1,774px, 9 controls | 1,774px, 9 | 2,485px, 9 | 2,450px, 9 |
| The board with the panel open | 5,231px, 35 controls | 5,165px, 35 | 6,582px, 35 | 6,572px, 35 |

What it says: the money a board asks about first is the last thing on the
board, 3,200px down, behind a card that shows one lever. Opening the full
panel adds 1,800px (2,500px on a phone).

---

## What we ask

### 1. The money on the board

Today the board opens on the funnel's verdict and the next step. We want
the money on it — **MRR, ARR, MRR in 12 months at the current pace, and
"what one customer is worth"** (the CAC against the LTV, and the loss
finding when there is one) — **without undoing what A18 lightened**: one
next step, one primary, one raised card, a first screen with three
controls.

- Where does it go: a band under the verdict, a block before the diagnosis,
  inside the verdict area, at the end?
- How does "what one customer is worth" read: two bars (the film's), a
  sentence, a figure pair?
- How does the **loss finding** read as serious **without** the leak's red
  and without naming a stage? It is not a projection (it is today's
  numbers), but it is not "the stage that holds you back" either. Its
  "maybe" state (overlapping ranges) needs a form too.
- The hybrid already opens on `TotalBand` (the two MRRs and their sum):
  how do ARR and the MRR in 12 months join it, and where does each engine's
  "one customer is worth" go?
- The "?" states: the public example has no margin; most first visits will
  have no margin for a while. The block must look right with only MRR and
  ARR known.

### 2. The cash warning

The payback, **what it keeps tied up** (the spend of a month × payback ÷ 2,
a floor), and **the warning when the payback is long**.

- **A warning, not an alarm.** It is a different message from the loss:
  the loss says "you lose money on every customer"; the warning says "you
  make money, but late — maybe after your cash runs out". It must look
  different from the loss, and **never take the leak's red**.
- Its trigger is a slot (C49): design the warning so it reads with "longer
  than your runway ({n} months)", and say how the optional runway would be
  typed if Antoine picks it (Settings? the payback's own sheet? next to the
  figure?).
- The two facts it reads are always there without any reference: the
  months of margin left after payback (or "leaves before paying back", the
  loss), and the cash tied up. Where do they live: the board, "What if?",
  the unit-economics slide, all three?
- The printed assumptions (linear repayment, a floor, monthly billing):
  where they sit, and how dense.

### 3. "What if?" at the top

The film's best moment: move a lever, watch the ARR move. Today the card
shows one lever and two figures; the panel shows tables and tiles.

- **The curve of the MRR, month by month**, today against with the
  what-ifs: 13 points, the last one is the MRR in 12 months. Ranges (an
  estimate) need a form. The difference must be ink, not red (constraint
  1): how do "today" and "with the what-ifs" differ without red?
- The **ARR**, the **LTV:CAC**, the **payback** and the **cash** moving
  with the sliders, next to the MRR in 12 months.
- **The compounding**, readable: what each lever brings alone, together,
  and the difference (today a table and one sentence, `05`).
- **Where the panel lives**, and whether the card or the panel carries the
  curve (C51 asks Antoine whether "What if?" should open by default; our
  recommendation is to keep the panel folded and let the card carry the
  curve and the ARR — tell us if your design says otherwise, and why).
- Sales-assisted has the same panel on its levers, and the hybrid a total
  line (the MRR in 12 months of both): where do the hybrid's ARR and summed
  curve go?

### 4. The slides, for a board or an investor

- **The "What if?" slides with their curve** (`07`, `08`): one lever, and
  together. Today two or three tables; the slide is 16:9, exported as PNG
  and PDF, read without its speaker.
- **The payback and the cash on the unit-economics slide** (`06`): the
  months after payback (or the loss), the cash tied up, the warning if
  any, legible to someone who reads the slide alone. The slide's 0-36 month
  bar already places the payback: it may become the place where the
  lifetime and the payback meet.
- **The loss finding on a slide**: C48 asks Antoine whether it may title a
  slide, and which. Our recommendation: it titles the unit-economics slide,
  which moves right after the funnel when the loss is certain; the first
  slide stays the funnel. Draw that case.
- The slides' title figures take the accent colour today (`06`, `08`): is
  that compatible with constraint 1 on a "What if?" title that states a
  projected gain?

### 5. The promise of the page

Today: « des slides prêtes pour ton CODIR » / "slides ready for your
leadership meeting" (`09`). The film says "Founders: where to invest.
Investors: whether to invest." C52 asks Antoine whether board and investors
enter the promise (our recommendation: yes, once the money is on the
slides). Propose the promise and the page's first screen with it, in both
languages, keeping the privacy promise before the call to action, never
folded.

---

## Questions

Answer each, numbered, in the README.

**The board**
1. Where does the money block sit on the board, and how many controls does
   the first screen gain (it has 3 today)?
2. MRR and ARR: side by side, one under the other, ARR as a "that is an ARR
   of" line? Which one leads?
3. "What one customer is worth": the shape, the loss, the "maybe", the
   "?" with no margin.
4. The hybrid: what joins `TotalBand`, and where each engine's unit
   economics go.

**The cash**
5. The warning's look, distinct from the loss and from the leak.
6. Where the months after payback and the cash tied up live, and where
   their assumptions are printed.
7. If Antoine picks the team's runway (C49): where is it typed, and how is
   its absence shown (no warning, the two facts alone)?

**"What if?"**
8. The curve: its form (bars, line, area), ranges, today against with the
   what-ifs, without red, at 390px.
9. Which figures move with the sliders where (card, panel), and how the
   compounding reads.
10. Where the panel lives, folded or open, and what the card carries.

**The slides**
11. The "What if?" slides with the curve, one lever and together.
12. The unit-economics slide with the payback, the lifetime, the cash, the
    loss as its title, in self-serve and side by side in the hybrid.

**Words**
13. The promise, both languages.
14. The new terms the money needs (ARR is in the glossary; "runway",
    "cash tied up", "months after payback" are not): where each is taught,
    with the engine's "?" definitions (the five words return 07 asked to
    teach, ported as `EngineTerm`: one definition open at a time).

## The states we need

In the paper world, at **1280px in French and 390px in English** (the others
in one language, saying which):

- **the board**, self-serve: the film's SaaS (loss certain); a healthy
  engine (no loss, the public example with a margin of 70-80 %); no margin
  (the "?" states); a "maybe" loss;
- **the cash warning**: absent (no trigger), present, "maybe"; with and
  without the runway typed, if your design types it;
- **"What if?"**: untouched; the film's three levers moved; one lever that
  lifts the customer out of the loss on its own (churn 6 → 4 % does: an LTV
  of ~€2,300 against a CAC of €1,900), and one that does not (expansion
  alone moves neither the LTV nor the CAC);
- **the hybrid**: `TotalBand` with the money; each engine shown;
- **the slides**: unit economics (loss; healthy; no margin), "What if?" one
  lever, "together", the hybrid's side-by-side;
- **the page's first screen** with the new promise.

## Both languages

"Tu" in French, "you" in English. Stage names stay in English on French
screens. French typography: a thin no-break space before `:`, `;`, `?`,
`!` and inside « »; figures grouped by a no-break space (`48 000 €`); the
euro after the figure in French (`~80 000 €`), before it in English
(`~€80,000`). The slides say « on » / « nous » (they are presented to a
meeting), never « tu ».

## What we need back

Under `design/ds-extension-09-return/`, the shape of return 07, so the port
is mechanical:

- a `README.md`: what is in the bundle; an answer to each numbered
  question; the measures of the tables above, before and after; the
  constraints one by one; the contrast measured;
- **`INVENTORY.md`, where every figure goes**: each figure of "What the
  model already computes" (MRR, ARR, MRR in 12 months, ARR in 12 months,
  the curve, LTV, CAC, LTV:CAC, the loss and its gap, the payback, the
  lifetime and the months after, the spend, the cash tied up, its
  assumptions, the warning), per motion and in the hybrid, with its place
  on the board, in the card, in the panel, on each slide — or "not shown"
  and why. **This file is how Antoine checks nothing is shown twice or
  lost**;
- the screens: `board/index.html` and `board/board.html?screen=&lang=&w=`
  (`en`/`fr`, `390`/`1280`) with every state above, **openable from its
  own source in the folder** (we replay the board from its source, never
  from rendered PNGs);
- for each new or changed piece: `components/engine/<Name>/` as React +
  `.d.ts` + `.prompt.md` + CSS; a `*.delta.md` for any synced component
  that changes, or a line saying none does; new tokens in `tokens/*.css`;
- **`COPY.md`**: every new or changed string, French and English side by
  side, with the screen it sits on. It goes to Antoine's review (the bon à
  tirer) before anything ships.

Write nothing outside that folder.

## Handoff back

Write the return under `design/ds-extension-09-return/` in this project; we
copy it into the repo, file by file, at the same paths. Antoine decides
C46 to C52 on it; the port into the engine (a PR per step, the engine still
closed), the tests, the measures against the real build and the film
redrawn on the ported engine are on our side.
