# Brief 09 — the engine's money · return

*Tour de Growth · Claude Design → the codebase · 2026-10-03 · answers
DS-EXTENSION-BRIEF-09*

The engine already computes the money; this return gives it a place,
without bringing back the density return 07 removed. In six moves:

1. **The money gets one flat block on the board** (`MoneyBlock`), right
   after the diagnosis: the MRR and its ARR, **what one new customer is
   worth** (the cost against the margin it brings back, as two ink bars),
   and **the cash it ties up**. The first screen does not change: three
   controls, one next step, one primary. The block adds one control to the
   board — the "?" that teaches "cash tied up".
2. **The loss reads as serious without the leak's red**: an ink tag
   ("Loss"), solid because today's numbers say it; its "maybe" is the same
   tag, dashed ("not yet"). A loss is said once, as money; the months are
   its figure ("it leaves before it pays back"), never a second piece of
   news.
3. **"What if?" moves up and carries the curve**: the lever card comes
   right under the money, before the peloton, with the MRR month by month
   (today's pace in the axis ink, the what-ifs in full ink, the room
   between them in the grid's wash — never red) and the **ARR in 12
   months** beside the MRR in 12 months. The full panel stays folded behind
   it (C51); opened, its seven tiles become three short tables, and the
   compounding becomes lengths you can compare.
4. **The cash warning is advice, not an alarm**: one sentence on the
   system's dashed red edge, "Paying back a customer takes 11 months,
   longer than your runway (9 months)", whose trigger is a slot (C49). With
   no trigger typed, no warning: the two facts stand alone. Never with the
   loss.
5. **The slides carry the money for a board or an investor**: the
   unit-economics slide gets a chart where the payback and the lifetime
   meet; when the loss is certain it **titles that slide, which moves to
   № 2** (C48); the "What if?" slides get their curve; every title figure
   is ink.
6. **The promise names the money and its readers**: "…see where your engine
   loses people **and what each new customer earns you**, and leave with
   slides for **your leadership meeting, your board or your investors**"
   (C52). The privacy promise stays before the call to action, never folded.

No synced component changes: **there is no `*.delta.md` in this return.**
Nine engine components are new, two of return 07's change (`LeverCard`,
`TotalBand`), one token file is new. The data model changes only if C49
picks a runway or a team payback target (one optional number, see
"Decisions").

---

## What is in the bundle

| Path | What |
|---|---|
| `README.md` | This file: the bundle, the fourteen answers, the density before and after, the constraints one by one, the contrast measured, the decisions |
| `INVENTORY.md` | **Where every figure goes**: each figure of "What the model already computes", per motion and in the hybrid, with its place on the board, in the card, in the panel, on each slide — or "not shown" and why. The rule: once per surface |
| `COPY.md` | Every new or changed string, French and English side by side, with its screen (92 to review), the three new definitions, and the kept strings. Generated from `board/copy.js` |
| `tokens/money.css` | The new tokens: measures (curve, bars, slide), type (figures, slide), and colours by meaning over the existing layers (no new primitive colour) |
| `components/engine/MoneyBlock/` | **New.** The money on the board: MRR and ARR, what one new customer is worth, the cash |
| `components/engine/WorthBars/` | **New.** The cost against the margin: two ink bars, a guide, a bracket; ranges hatched; the "?" box |
| `components/engine/CashWarning/` | **New.** The long-payback warning: one sentence on the advice edge, its trigger a slot |
| `components/engine/MrrCurve/` | **New.** The MRR month by month, today's pace against the what-ifs; ranges hatched; phone legend |
| `components/engine/WhatIfFigures/` | **New.** The panel's figures: three DataTables (Growth, One new customer, Cash), today, with your what-ifs, change |
| `components/engine/LeverSum/` | **New.** The compounding: each lever alone, added up, together, the bracket |
| `components/engine/PaybackChart/` | **New.** One customer over 0–36 months: margin against cost, where payback and lifetime meet |
| `components/engine/SlideUnitEconomics/` | **New.** The unit-economics slide's body: six tiles, the chart, the notes; the hybrid side by side |
| `components/engine/SlideWhatIf/` | **New.** The "What if?" slides' body: the curve, the figures, the compounding |
| `components/engine/LeverCard/` | **Changed** (return 07's): the curve, the ARR in 12 months, the one-customer line, the hybrid's total line |
| `components/engine/TotalBand/` | **Changed** (return 07's): the totals that add up (ARR, MRR in 12 months, cash tied up) |
| | Each component: `<Name>.js` (plain React, no JSX — the board runs this very file), `<Name>.css`, `<Name>.d.ts`, `<Name>.prompt.md` |
| `board/index.html` | Every state, with a link per language and width |
| `board/board.html?screen=&lang=&w=` | One state: `lang` `en`/`fr`, `w` `390`/`1280`. **Runs from source**: no build, no PNG, nothing fetched from outside the project |
| `board/money.js`, `engines.js`, `fmt.js` | A replica of ENGINE.md §20 (A20.a) on the screens' engines, and the house's number formats, so every figure drawn comes from one calculation. `node board/money-check.mjs` prints brief 09's table from it — it matches to the euro |
| `board/board.js`, `screens.js`, `copy.js`, `glossary.js`, `fixture.js`, `app.js`, `board.css` | The board's own source. `app.js` holds stand-ins for what the brief does not redesign (site header, verdict, diagnosis, peloton, the panel's sliders, the slide frame) |
| `board/r07/` | Return 07's components and tokens **as ported (A18)**, unchanged, that the board draws around the money (EngineBar, NextStep, NumberList, EngineProgress, EngineLanding, and LeverCard/TotalBand as they are today, for the "before" measures) |
| `board/sys/`, `board/system-snapshot.css`, `board/react-lite.js` | The synced system as the components import it (`"tour-de-growth"`), its CSS, and the board's stand-in for React. Board only. `sys/DataTable.js` is the one stand-in added for this brief |
| `board/measure.cjs`, `board/measures.js` | The measuring script (Playwright) and its output: density before/after, 44px targets, overlaps, 320px, on every state |
| `board/contrast.mjs` | The contrast table below, computed from the system's primitives |
| `board/make-copy.mjs` | Writes `COPY.md` from `copy.js` |

**To open the board**: serve the project root over http (`python3 -m
http.server`), open `design/ds-extension-09-return/board/index.html`.

---

## The answers

### The board

**1. Where does the money block sit, and how many controls does the first
screen gain?**

After the diagnosis, before "What if?":

    Engine bar · Verdict · Next step          ← the first screen, unchanged
    Diagnosis ("One stage holds the engine back")
    The money (MoneyBlock)                    ← new, flat, ruled
    What if? (LeverCard, moved up, with the curve)
    The peloton (the one raised card)
    Your numbers · The Tour and your numbers

**The first screen gains nothing**: 3 controls (Settings, the menu, the
primary) at FR 1280, EN 390 and FR 390, as today. We tried the three other
places the brief names:

- *a band under the verdict*: it pushes the next step's primary below the
  fold at 390 (its bottom is at 788px of 844 today: any band taller than
  56px does it) — it breaks "the first screen says where you are and what
  to do next";
- *inside the verdict area*: the verdict is the first slide's title and
  names the funnel; adding money to it mixes two findings, and the loss
  would compete with the leak's red;
- *at the end*: that is today's problem (3,200px down).

After the diagnosis, the money is the board's second story — the funnel
says where it leaks, the money what it costs — and it is reached by the
first scroll on a desktop (it starts ~1,200px down on our redraw, against
3,000 for today's only trace of it). The lever card follows it, so moving a
lever and watching the ARR move happens right under the money.

**2. MRR and ARR: which leads?**

Side by side, **MRR first**, both at the engine's large figure: the MRR is
the fact the team typed; the ARR is derived, and its label says how ("ARR,
the MRR × 12"), so nobody reads it as a separate measure. Not "that is an
ARR of" in a sentence: a sentence buries the one number an investor reads
first. In the hybrid, TotalBand carries the MRRs and the summed ARR; each
engine's block starts at "What one new customer is worth".

**3. "What one customer is worth": the shape, the loss, the maybe, the "?".**

- **The shape** — the film's two bars, kept because they read in one glance
  (`WorthBars`): "Costs €1,900", "Brings back ~€1,500", both ink, one scale;
  a dashed guide carries the cost's end across both rows; a bracket measures
  the gap and names it ("~€400 short"). Above them the finding in one
  sentence, under them its figure in time.
- **The loss** — an **ink tag**, solid: "Loss" / « Perte ». The system's
  strongest neutral: serious, and still not one of red's three meanings (it
  is no primary, no diagnosis — it names no stage —, no advice). The
  sentence says it plainly: "Each new customer costs €1,900 and brings back
  ~€1,500 of margin: you lose ~€400 on each one." Then the months, as the
  finding's figure: "A customer stays ~17 months; paying back its cost
  would take 21 months: it leaves before." One finding, money then time.
- **The maybe** — the same tag, **dashed** ("not yet"): "Maybe a loss" /
  « Perte possible »; the LTV bar hatched to its high end; no bracket, "the
  two may cross"; and where the range comes from: "The range comes from
  your monthly logo churn, estimated at 4–6%: pin it down and the engine
  will tell."
- **The "?"** — no margin: MRR and ARR print; "We can't tell yet what a new
  customer brings back: the gross margin is missing."; "Costs €500" as a
  bar and, for "Brings back", the dashed, hatched "?" box with "missing:
  gross margin" — never an empty bar. One line says why nothing is computed
  on revenue. The cash part prints the spend (a fact) and the "?" box for
  cash tied up. The block looks finished with only MRR and ARR known
  (`board-nomargin`).
- **Healthy** — no tag (nothing to name), "~€1,000 more than it costs", the
  bracket on the other side, and "It pays back its cost in 11 months and
  stays ~33 months: ~22 months of margin after payback ?".

**4. The hybrid: what joins TotalBand, and where each engine's unit
economics go.**

TotalBand gets one line under its sum, **only what adds up**: ARR total,
MRR in 12 months at today's pace, cash tied up total. The LTV, the payback
and the loss never add: each engine's MoneyBlock carries its own, under
"Engine shown" (self-serve's loss, sales-assisted's 19-month payback). The
per-engine ARR is not printed (it is the engine's MRR × 12). The summed
curve is not drawn: one line for two engines would hide which one moves;
its end point is TotalBand's MRR in 12 months, and a what-if moves it in the
card's total line ("Both engines in 12 months: ~€320,000 of MRR with this
what-if (today ~€310,000)"). On a phone the band lays its terms two by two,
so it grows by one row only.

### The cash

**5. The warning's look.**

The system's **advice**: a dashed red edge, the look of the backup line and
the trap — a warning, not an alarm. Three things now read apart at a
glance:

| | Look | Message |
|---|---|---|
| The leak (diagnosis) | solid red edge / red wash, the stage in red | the stage a target names |
| The loss | ink tag ("Loss"), solid | you lose money on every new customer |
| The warning | dashed red edge, one sentence in ink | you make money, but late — maybe after your cash runs out |

One sentence, its trigger a slot: "Paying back a customer takes 11 months,
longer than **your runway (9 months)**: you make money, but maybe after your
cash runs out." The "maybe" (a payback range straddling the limit): "Paying
back a customer takes 9–13 months: maybe longer than your runway (12
months)." Never when the loss speaks (`cash-loss`): a customer who leaves
first is the loss, not a late return.

**6. Where the months after payback and the cash tied up live, and their
assumptions.**

All three places, once each (INVENTORY):

- **the board** — the cash part of MoneyBlock: "Spent on acquisition this
  month €93,480" (a fact), "Tied up at this pace ~€990,000 ?", one line
  ("And it does not all come back: customers leave before they pay back." /
  "It all comes back, as customers pay back."), the warning slot, then the
  assumptions printed small, always visible: "A floor: each month's spend
  comes back evenly over the payback, so half of it is out at any time;
  churn and contraction slow the return and are not counted. Monthly
  billing." The months after payback are in the "worth" part (they are the
  finding's time);
- **"What if?"** — the panel's tables ("Months after payback": "leaves
  first" → "~9 months"; "Cash tied up" ~€990,000 → ~€740,000, "Spent on
  acquisition a month" stable), the assumption in the panel's folded
  "What the calculation assumes";
- **the unit-economics slide** — a tile each, and one line beside the
  chart.

Sales-assisted prints its own assumption: "Monthly billing assumed: a year
paid up front comes back sooner."

**7. The runway, if C49 picks it.**

Typed in **Settings, in a new "Cash" group right after "Targets"**: one
optional NumberField, "Runway, in months", hint "Optional. Only used to
warn you when paying back a customer takes longer." with the "?" of
"runway" (`settings-runway`). Not on the payback's own screen (there is
none: the payback is computed) and not next to the figure (a field on the
board adds a control and invites typing a number that changes monthly in
front of a meeting). **Its absence is silence**: no warning, no empty
state, the two facts alone (`cash-none`); typed but longer than the payback,
still silence (`cash-runway-ok`). If C49 picks a team payback target
instead, the same field sits in "Targets" and the slot reads "longer than
your payback target (12 months)" — the string is in COPY. A published
reference is never a trigger.

### "What if?"

**8. The curve.**

A **line** — thirteen points of one quantity over time and two of them to
compare; bars would make 26 marks, an area would hide the lower line.

- **Today against the what-ifs, without red**: today's pace in the axis ink
  at 2px; the what-ifs in full ink at 3px; the room between them in the
  grid's wash — that room is what the what-ifs add. Neither dashed (dashed
  means "not yet"; both are projections). Each line named at its end.
- **Ranges**: the band between the low and the high path, hatched (the
  system's hatch for an estimate), edged by both paths (`whatif-maybe`).
- **One figure on the curve**: today's MRR at its origin. The MRR in 12
  months is printed once, under it, with the ARR in 12 months.
- **At 390**: drawn at the column's real width (350px; 280 at 320), 170px
  high, its type never scaled; the line names go under the plot as a legend
  with their line samples; three months on the axis. No horizontal scroll
  down to 320 (checked on every state).
- Sales-assisted: a straight line (annual contracts renew evenly), said
  under it.

**9. Which figures move where, and how the compounding reads.**

- **The card**: the curve, **MRR in 12 months and ARR in 12 months** (was:
  MRR in 12 months and new payers), each with "today …" once moved; and one
  line on one new customer when the what-ifs change the finding: churn
  6 → 4 % alone, "One new customer: no longer a loss. It brings back
  ~€2,300 for €1,900: ~€350 more."; expansion alone, "still a loss of ~€400.
  Monthly expansion changes neither what a customer brings back nor what it
  costs."
- **The panel** (opened): three tables replace the seven tiles — Growth
  (new MRR a month, NRR, GRR), One new customer (CAC, LTV, **LTV:CAC**, per
  new customer, **CAC payback**, **months after payback**), Cash (spend,
  **cash tied up**) — with today, with your what-ifs and the change. The MRR
  and ARR in 12 months are not repeated: the card stays open above the
  panel with them and the curve. On a phone the "today" column folds into
  the what-if cell as a second line.
- **The compounding** (`LeverSum`): each lever's gain as a bar, the solo
  gains end to end ("Each alone, added up ~€38,000"), "Together +€42,000",
  a bracket over the difference, and the sentence: "Together they bring
  ~€4,400 more than each alone, added up: each lever works on what the
  others add. That's compounding." Today's "one after the other" wording
  was dropped: applying levers one after the other already compounds.

**10. Where the panel lives, and what the card carries.**

We agree with your recommendation (C51): **the panel stays folded**, in
place under the card, behind "See all 8 levers and what the calculation
assumes →". The card carries the curve and the ARR — the film's moment —
and moves up under the money. Opening the panel by default would put eight
sliders and three tables (≈1,800px at 1280, ≈2,500 at 390 today) between the
money and the peloton on every visit; one lever with the curve already
shows the mechanism, and the panel is one tap away.

### The slides

**11. The "What if?" slides with the curve.**

- **One lever** (`slide-whatif-one`): title unchanged in words, now ink —
  "If logo churn fell to 4% (6% today), MRR in 12 months would gain
  ~€13,000." Left: the curve, today's pace against "with this what-if";
  under it, for a lever that leaves the funnel as it is, "This lever leaves
  the month's funnel as it is." instead of a table of "stable" (a funnel
  lever keeps today's funnel table). Right: one table, today | with this
  what-if | change: MRR and ARR in 12 months, NRR, CAC, LTV, LTV:CAC, CAC
  payback, cash tied up.
- **Together** (`slide-together`): "With the 3 what-ifs together, MRR in 12
  months would gain ~€42,000." Left: the curve, then LeverSum. Right: the
  table, then the compounding in one sentence.
- **The title colour**: today's titles paint their figures in the accent
  red. That breaks constraint 1 on a "What if?" title (a projected gain).
  **All title figures become ink**, on every slide: red on a slide means
  what it means on the board — the diagnosis (the verdict's leak, the
  stage). A gain, a loss, a multiple are not diagnoses.

**12. The unit-economics slide.**

- **Body** (`SlideUnitEconomics`): six tiles in one row — CAC, LTV, LTV:CAC
  ("an often-cited reference: about 3:1"), CAC payback, months after
  payback ("−4 months · leaves ~4 months before paying back"), cash tied up
  ("does not all come back" / "a floor · monthly billing") — then
  **PaybackChart**, where today's 0–36 month bar becomes the place where
  the payback and the lifetime meet: the cost line, the margin line rising
  until the customer leaves, the dot where it pays back (or the bracket of
  how short, and a dashed thread to where it would have paid back), the
  12-month reference dotted and labelled on the axis. Beside it: GRR and
  NRR in one line with their approximation (they were two tiles), the
  warning when it applies, and the cash assumption.
- **The loss as its title** (C48, our recommendation followed): "Each new
  customer costs us €1,900 and brings back ~€1,500: we lose ~€400 on each
  one." — and the slide **moves to № 2, right after the funnel** when the
  loss is certain; the first slide stays the funnel (`deck-order`). With no
  loss, today's title and place ("A customer pays back its acquisition cost
  in 11 months and brings back 3.00 times what it costs."); with no margin,
  today's title, five "?" tiles and the chart's "?" box.
- **The hybrid, side by side** (`slide-unit-both`): "Self-serve: we lose
  ~€400 on each new customer. Sales-assisted: paid back in 19 months." Two
  columns, each its five tiles and a compact chart (its months after
  payback said on the chart's axis row), never summed; one shared note
  under both.

### Words

**13. The promise.**

| | English | Français |
|---|---|---|
| Today | …see where your engine loses people and leave with slides ready for your leadership meeting. | …vois où ton moteur perd du monde et repars avec des slides prêtes pour ton CODIR. |
| **Proposed** | Seventeen numbers in self-serve, fifteen sales-assisted: go and get them, see where your engine loses people **and what each new customer earns you**, and leave with slides for **your leadership meeting, your board or your investors**. Your numbers are compared only with yourself and your own target: published references are there to situate, never to name a stage. | Dix-sept chiffres en libre-service, quinze en assisté : va les chercher, vois où ton moteur perd du monde **et ce que te rapporte chaque nouveau client**, et repars avec des slides pour **ton CODIR, ton board ou tes investisseurs**. Tes chiffres ne sont comparés qu'à toi-même et à ta propre cible : les repères publiés sont là pour situer, jamais pour désigner une étape. |

"Board" stays « board » in French (the word founders use; « conseil
d'administration » is the legal body, not the meeting). The privacy promise
is unchanged and stays before the call to action, never folded (`arrival`).
The film's line, "Founders: where to invest. Investors: whether to invest."
/ « Fondateurs : où investir. Investisseurs : s'il faut investir. », is a
good tagline for the film and the slides' cover; we kept it off the page,
where it would promise investors a verdict the engine does not give.

**14. The new terms, and where each is taught.**

With the engine's "?" (EngineTerm, as ported: one definition open at a
time), where each word is first needed:

| Term | Where its "?" sits | Definition (EN) |
|---|---|---|
| **Cash tied up** | the board, the cash part: "Tied up at this pace ?" (`cash-term` shows it open) | What your acquisition keeps out of the bank at any time. Each month you spend to win new customers; each of them pays that back over the payback. At a steady pace, half a payback's worth of spend is out. A floor: churn and contraction slow the return. |
| **Months after payback** | the board, when the customer pays back: "…of margin after payback ?" | How long a customer keeps paying once its acquisition cost is paid back: its lifetime minus the payback. Below zero, it leaves before paying back: that is the loss, said in months. |
| **Runway** | Settings, the runway field's hint | How many months your cash lasts at today's spending. Optional: the engine only compares it with the payback, to warn you. It stays on this device. |

ARR is already in the glossary: its label teaches it ("ARR, the MRR × 12")
and it gets no new "?". French in COPY.md.

---

## The states

`board/index.html` lists them all; every one in EN and FR, at 1280 and 390.
Key screens (FR 1280 and EN 390 in the brief) are marked.

| Group | Screens |
|---|---|
| The board | `board-loss` (the film's SaaS), `board-healthy` (the public example with a 75 % margin, C50), `board-nomargin`, `board-maybe` (churn estimated at 4–6 %) |
| The cash warning | `cash-none` (absent, no runway), `cash-runway` (present: payback 11 months, runway 9), `cash-maybe` (payback 9–13, runway 12), `cash-runway-ok` (runway 18: silent), `cash-loss` (runway 9, the loss speaks: no warning), `cash-term` ("cash tied up" taught), `settings-runway`, `settings-runway-typed` |
| What if? | `whatif-untouched`, `whatif-churn` (6 → 4 % alone: out of the loss), `whatif-expansion` (2 → 3 % alone: still a loss; panel open), `whatif-three` (the film's three levers, panel open), `whatif-panel` (open, untouched), `whatif-maybe` (the curve as a range), `board-panel` |
| The hybrid | `hybrid-ss`, `hybrid-sa`, `hybrid-whatif` |
| The slides | `slide-unit-loss` (№ 2, the loss as title), `slide-unit-healthy`, `slide-unit-warning`, `slide-unit-nomargin`, `slide-whatif-one`, `slide-together`, `slide-unit-both`, `deck-order` |
| The page | `arrival` (the first screen with the new promise) |
| For the measures | `board-before`, `board-panel-before`, `whatif-before-three`, `hybrid-before`: today's board (A18) redrawn on the same engines |

The engines (`board/engines.js`): the film's SaaS exactly as brief 09
gives it; the healthy engine is the public example with a 75 % margin
(CAC €500, GRR 96 %, NRR 100 % as on `10`; its ARPA €60, MRR €24,000 and
churn 3 % are ours, consistent with them — its LTV:CAC comes out at 3.0, the
glossary's reference, which is exactly the case where a reference must
situate and never designate); the sales-assisted engine has the hybrid's
MRR (€180,000, `11`), and an ACV of €24,000, 80 % margin, 85 % renewal,
3 deals a month and a CAC of €30,000 of ours.

---

## The density, measured

Measured the way return 07 measured (CSS pixels, 1280 × 900 and 390 × 844,
a control is visible and focusable, not inside a closed `<details>`), by
`board/measure.cjs` on the board's own screens. **Before** is today's board
(A18) redrawn on the film's SaaS from return 07's components as ported and
today's LeverCard (`board-before`); **after** is the same board with the
money (`board-loss`). The redraw is close to the real build (today's lever
card measures 262px on both), not identical (its stand-ins are a little
shorter), so the last column applies our **difference** to the brief's real
numbers.

**The board on the film's SaaS** (EN 1280 / FR 1280 / EN 390 / FR 390):

| | Before (redraw) | After | Difference | Real today (brief) | Expected after |
|---|---|---|---|---|---|
| The board | 3,096 / 3,151 / 3,668 / 3,644px | 3,924 / 3,973 / 4,583 / 4,578px | +828 / +822 / +915 / +934 | 3,372 / 3,438 / 4,102 / 4,077 | ~4,200 / ~4,260 / ~5,020 / ~5,010 |
| Controls on the board | 25 | 26 (healthy: 27) | **+1**: the "?" of "cash tied up" (+1 more when the customer pays back: "months after payback") | 26 | 27 (28) |
| Controls on the first screen | 4 / 3 / 3 / 3 | 4 / 3 / 3 / 3 | **0** | 3 / 3 / 3 / 3 | 3 / 3 / 3 / 3 |
| Where the tool starts | 287 / 287 / 288 / 288 | the same | 0 | 356 / 356 / 298 / 298 | unchanged |
| One next step, one primary, one raised card | yes | yes (primaries 1, raised 1) | — | — | — |
| Where the money starts | 3,043 (the card's MRR in 12 months, its only trace) | **1,208 / 1,250 / 1,306 / 1,283** (MoneyBlock) | −1,835 / −1,848 / −2,265 / −2,280 | 3,195 / 3,237 / 3,785 / 3,760 | ~1,360 / ~1,390 / ~1,520 / ~1,480 |
| The money block | — | 578 / 573 / 693 / 711px, 1 control | | | |
| Where the lever card starts | 3,043 / 3,098 / 3,571 / 3,563 | 1,818 / 1,855 / 2,026 / 2,020 | −1,225 / −1,243 / −1,545 / −1,543 | 3,195 / 3,237 / 3,785 / 3,760 | ~1,970 / ~1,990 / ~2,240 / ~2,220 |
| The lever card | 262 / 262 / 312 / 297px, 2 controls | 480 / 480 / 509 / 494px, 2 controls | +218 / +218 / +197 / +197 (the curve) | 262 / 262 / 320 / 320 | ~480 / ~480 / ~517 / ~517 |
| The full panel, opened | 1,206 / 1,206 / 2,020 / 2,020px, 9 controls | 1,206 / 1,206 / 1,960 / 1,960px, 9 controls | 0 / 0 / −60 / −60 | 1,774 / 1,774 / 2,450 / 2,485 | ~1,774 / ~1,774 / ~2,390 / ~2,425, 9 |
| The board with the panel open | 4,333 / 4,388 / 5,714 / 5,690px, 34 controls | 5,161 / 5,211 / 6,570 / 6,564px, 35 | +828 / +823 / +856 / +874 | 5,165 / 5,231 / 6,572 / 6,582 | ~5,990 / ~6,050 / ~7,430 / ~7,460, 36 |

(The redraw counts 4 controls on the EN 1280 first screen where the build
counts 3: its next-step card is a little shorter, so the backup line's
"Save (.json)" reaches the fold. It is the same before and after.)

What it says: the board grows by about 830px on a desktop (910 on a phone)
and one control — the money block (≈580px) and the curve (≈220px) — and the
first screen does not change. In exchange the money starts about 1,800px
higher (≈2,250 on a phone): what a board asks about first is now a third of
the way down, not the last thing. The panel stays folded, keeps its 9
controls, and gets a little shorter on a phone (tables instead of tiles).
Other states: healthy 3,924px (EN 1280), no margin 3,854, maybe 3,995.

**The hybrid** (`hybrid-before` → `hybrid-ss`): the board grows by 825 /
820 / 986 / 1,021px and one control (27); TotalBand's totals take one row on
a desktop (two short rows on a phone). The primary stays in the first
screen at 1280 (its bottom at 842px, was 773); "Engine shown" now falls
just under the fold (first screen 5 → 3 controls: Settings, the menu, the
primary). At 390 the primary was already under the fold (957 → 1,091 /
1,109px; first screen 2 → 2).

**Every state** passes, at 1280, 390 and 320, in both languages: no
horizontal scroll, every target 44px or more, none overlapping (`node
board/measure.cjs`: "screens with issues: 0 of 210").

---

## The constraints, one by one

1. **Never red for a projection.** The curve's two lines are ink (axis ink
   and full ink), the gain between them the grid's wash; the MRR and ARR in
   12 months, the panel's changes, the compounding bars and bracket, the
   "What if?" slides' titles: ink. Today's slides paint title figures red;
   this return makes every slide title figure ink (Q11).
2. **No reference designates.** The 3:1 multiple is a tile note on the
   slide ("an often-cited reference: about 3:1"), never on the board, never
   a colour; the 12-month payback is a dotted, labelled line on the chart's
   axis; neither triggers the warning — its trigger is the team's runway or
   payback target only (`paybackWarning()`). The loss is the team's own
   arithmetic and names no stage. The healthy engine's LTV:CAC is exactly
   3.0: drawn with the note, no verdict.
3. **"?" never 0, and what is missing.** WorthBars' "?" box, MoneyBlock's
   "?" fact box, PaybackChart's "?" box, the slide's dashed "?" tiles, the
   panel's "?" cells — each with "missing: gross margin".
4. **No margin, no LTV, payback, LTV:CAC, loss, cash.** `board-nomargin`,
   `slide-unit-nomargin`: none computed, none on revenue; the block says
   why. Sales-assisted uses its own margin (`salesAssisted()`).
5. **French and English from the same component.** Every state in both;
   French longer in places (the hybrid slide's note was shortened to fit
   both in two lines). French typography by `frTypo`; « rétrogradation »
   for contraction, as the engine says it; « on » / « nous » on slides.
6. **AA contrast.** The table below: text 4.5:1 and more, every mark, edge
   and curve 3:1 and more against what is next to it, the wash composed on
   its ground. Chart labels carry a paper halo where they cross a line.
7. **390px, and 320 with no horizontal scroll; the curve on a phone.**
   Checked on every state (210 renders). The curve is drawn at the column's
   width with a legend under it; the panel's tables fold "today" into the
   what-if cell; TotalBand lays its terms two by two; slides are drawn at
   960 × 540 and scaled to the column, as the deck shows them.

And the constraints that held brief 07:

- **Tokens only**: every new value is a token in `tokens/money.css`
  (measures, type, colours by meaning over the existing layers). The board's
  own stand-ins keep the production header's fixed heights, as in return 07.
- **The system first**: DataTable (the panel, the slides), Tag (the loss,
  its maybe), MetaLabel, GlossaryTerm/EngineTerm, Card, Button,
  NumberField, Segmented, Disclosure, DotGrid; return 07's LeverCard and
  TotalBand extended rather than replaced. StatTile is not used: the
  panel's seven tiles become tables (Q9).
- **44px targets, none overlapping**: checked on every state.
- **Red means three things**: the primary (one per screen), the diagnosis
  (the verdict's leak, the stage, "Holds you back"), advice (the backup
  line, the trap, **the cash warning**). The loss is ink.
- **One loud thing per screen**: the money is flat; the peloton stays the
  one raised card; one primary.
- **Dashed means "not yet"**: the maybe tag, the "?" boxes, the never-
  reached thread on the chart. The curves are solid (projections, not
  pending).
- **No icons**: the "?" of the terms, "→" in actions, "№" on the deck.
- **Local and deterministic**: every figure from the engine's own
  calculation (replicated in `board/money.js`); the runway stays on the
  device.
- **Data model**: unchanged, unless C49 picks a typed limit (below).
- **Do not undo what return 07 lightened**: the first screen, the next
  step, the primary and the raised card are untouched; the board gains one
  control; the panel stays folded (measured above).

## The contrast, measured

From the system's primitives (`node board/contrast.mjs`), WCAG 2.x, the
translucent wash composed on the page:

| Kind | Pair | Foreground | Ground | Ratio | Needs |
|---|---|---|---|---|---|
| Text | money figures, finding, months, cash line (--text-body) | --ink-0 | --paper-1 | 12.97:1 | 4.5:1 ✓ |
| Text | labels, assumptions, curve ticks, chart notes (--text-muted) | --ink-1 | --paper-1 | 5.81:1 | 4.5:1 ✓ |
| Text | slide tiles and table cells (--text-body on --surface-card) | --ink-0 | --paper-0 | 16.06:1 | 4.5:1 ✓ |
| Text | slide tile labels, table headers (--text-muted on card) | --ink-1 | --paper-0 | 7.20:1 | 4.5:1 ✓ |
| Text | the loss tag (--text-on-inverse on --surface-inverse) | --paper-0 | --ink-0 | 16.06:1 | 4.5:1 ✓ |
| Text | the warning's sentence, beside its dashed red edge | --ink-0 | --paper-1 | 12.97:1 | 4.5:1 ✓ |
| Mark | curve, today's pace (--money-line-today) on the page | --ink-1 | --paper-1 | 5.81:1 | 3:1 ✓ |
| Mark | curve, today's pace, on the gain wash | --ink-1 | ink-0 at 14 % on paper-1 | 4.41:1 | 3:1 ✓ |
| Mark | curve, with the what-ifs (--money-line-whatif), on the gain wash | --ink-0 | ink-0 at 14 % on paper-1 | 9.84:1 | 3:1 ✓ |
| Mark | WorthBars, LeverSum bars, PaybackChart lines (ink) | --ink-0 | --paper-1 | 12.97:1 | 3:1 ✓ |
| Mark | cost guide, brackets, reference dotted line (--viz-axis) | --ink-1 | --paper-1 | 5.81:1 | 3:1 ✓ |
| Mark | range hatch and its edge (--viz-unknown) | --ink-1 | --paper-1 | 5.81:1 | 3:1 ✓ |
| Mark | dashed "?" box edge (--border-soft) | --ink-1 | --paper-1 | 5.81:1 | 3:1 ✓ |
| Mark | "?" disc ring on card (--border-hard) | --ink-0 | --paper-0 | 16.06:1 | 3:1 ✓ |
| Mark | the loss tag against the page | --ink-0 | --paper-1 | 12.97:1 | 3:1 ✓ |
| Mark | the maybe tag's dashed outline | --ink-0 | --paper-1 | 12.97:1 | 3:1 ✓ |
| Mark | the warning's dashed red edge (--border-alert) | --paint-red | --paper-1 | 3.57:1 | 3:1 ✓ |
| Mark | slide tiles' edge on the slide | --ink-0 | --paper-1 | 12.97:1 | 3:1 ✓ |

The gain wash itself is a fill, not a mark (1.32:1 against the page): its
edges are the two lines, which carry the 3:1. The two lines are told apart
by weight (2px against 3px) and by their names, not by colour alone.

---

## Decisions for Antoine

- **C48 — the loss titles a slide.** Our design follows the
  recommendation: it titles the unit-economics slide, which moves to № 2,
  right after the funnel, only when the loss is certain (`deck-order`); a
  "maybe" keeps today's title and place.
- **C49 — the warning's trigger.** Designed as a slot. Our recommendation:
  **the team's runway, typed in Settings › Cash** (one optional number of
  months, kept on the device), because the glossary already says the
  survivable payback is the one shorter than the runway. Alternative: a
  team payback target in Settings › Targets (same slot, same look).
  Never a reference. Either is **one new optional field** in the engine's
  settings (`runwayMonths` or `paybackTargetMonths`, a number or null):
  the only data-model change this return needs, and only if C49 says so.
- **C50 — a margin for the public example.** We drew the healthy board on
  the example with 75 % (inside your 70–80 %). With a margin the example
  shows the money at its best (no loss, LTV:CAC 3.0 with the reference as
  context, the "?" taught); without one, it shows the "?" states — which
  most first visits will see anyway. We would give it the margin.
- **C51 — "What if?" open by default.** No, as you recommend: the card
  carries the curve and the ARR and moves up; the panel stays folded (Q10).
- **C52 — board and investors in the promise.** Yes, as proposed in Q13:
  "your leadership meeting, your board or your investors" / « ton CODIR,
  ton board ou tes investisseurs », with "what each new customer earns
  you".
- **The slides' title colour**: every title figure becomes ink (Q11) — a
  change to the deck's frame, not only to the money slides.

## Notes for the port

- The money model on the board (`board/money.js`) replicates ENGINE.md §20
  to check the screens; the app keeps its own. One assumption to confirm
  on the port: with the what-ifs, the CAC is "the same spend for more
  payers" (as the brief says), and the payers follow activation in
  proportion (the panel's own assumption); with these, the film's numbers
  come out exactly as brief 09's table.
- Number formats (`board/fmt.js`): projected or estimated amounts at two
  significant digits with "~"; a pair today → with the what-ifs gains a
  digit only when two digits would print the same figure; facts to the
  unit; French "~80 000 €", English "~€80,000"; ranges "€1,500–2,300" /
  « 1 500 à 2 300 € »; months rounded; changes signed with U+2212, percent
  changes in points.
- The charts' inner geometry (plot paddings, dot radius, hatch period, the
  room for the curve's keys) lives in their SVG code, mirroring the tokens
  where one exists (`--money-curve-keys`, `--money-curve-dot`); every
  colour, stroke and type size comes from a token through CSS.
- `LeverCard` and `TotalBand` replace return 07's files (same class names,
  rules added). TotalBand is drawn unboxed, as A18 ported it.
- The board's GlossaryTerm stand-in places its popover across the column on
  a phone; the app's EngineTerm finds its own room.
