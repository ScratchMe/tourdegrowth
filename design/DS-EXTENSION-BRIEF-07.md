# Design system extension brief 07 — the growth engine, simpler

*Tour de Growth · from the codebase to Claude Design · 2026-10-02*

## Why this brief

Antoine, on 2026-10-02, about the growth engine (`/aarrr-funnel-template`),
translated from French:

> I still have serious doubts about the way we present the engine for
> entering the information. It is clearly better since the step-by-step
> module. But when you come back a second time, it is still extremely dense.
> And even with the step-by-step, it is extremely dense. I want Claude Design
> to work on the engine alone, with one ambition: make it a feature that is
> simpler to understand and to use — **without removing the expertise and
> knowledge it brings.**

Every brief so far asked for one component. This one asks for a **feature**:
its journey, the order in which it asks for things, what each screen shows by
default and what it keeps one tap away. The visual system stays (tokens,
type, the race-bulletin look); what we want rethought is the information
architecture of the engine and the screens that carry it. We port what comes
back; we are not changing the engine ourselves in the meantime.

The engine is not public yet (closed behind a flag; Antoine tests it). There
are no users to migrate: **the screens are open, the data is not** (below).

## What the engine is, in one paragraph

A free tool, local to the browser, for a growth PM or a founder of a B2B SaaS.
They type their own funnel numbers by hand — **17 for self-serve** (PLG),
**15 for sales-assisted** (SLG), **one link** between the two when they sell
both ways — and the engine gives back: a one-sentence verdict, the stage that
holds the engine back (named **only against a target the team set**; a
published reference situates, never designates), a drawing of the funnel as
100 sign-ups (the "peloton"), "what if" levers that move together, and a deck
of slides for a leadership meeting. Each number comes with its definition,
formula, where to find it tool by tool, its trap, its published reference and
how long it takes to get. It is meant to come back to **every month**: a new
month starts from the last one's targets and definitions. Nothing typed ever
leaves the browser.

## The screenshots

In `design/ds-extension-07/`, from a real production build (2026-10-02,
`next build` then `next start`, engine open, the browser clock on 24 September
2026). The data is the engine's public example: a fictional self-serve SaaS
(§6.0 of its spec), the same the page's "See a filled-in example" button
shows. **"Returning"** is that example with four numbers taken back to "to
do", last touched twelve days earlier. All 2×, except the two `-1x`
full-page files; element captures are taken with the site's sticky header
released, so nothing is drawn across them.

Each key screen is in **French at 1280px** and **English at 390px**: both
languages, both widths.

| File | What it shows |
|---|---|
| `01-first-visit-arrival-{fr-desktop,en-mobile}` | What a person sees on arrival. **On return, the arrival is pixel-identical** (checked by checksum): the page does not know you came back until you scroll to the tool |
| `02-setup-{…}` | "Before you start", the setup card, as it opens |
| `03-steps-targets-{…}` | Step-by-step, step 1: the six team targets, asked before any number |
| `04-steps-base-{…}` | The base: two sign-up counts shared by seven numbers, typed once |
| `05-steps-number-untouched-{…}` | The first number's screen, nothing answered yet |
| `06-steps-number-have-open-{…}` | The same after "I have it", with "Where to find it" open: the full sheet |
| `07-steps-whatif-{…}` | Step 3, "What if?": eight levers, seven growth figures, the month's funnel |
| `08-steps-done-{…}` | The end of the step-by-step |
| `09-return-board-full-{…}` | **The board a returning person gets**, whole |
| `10-return-stage-sheet-{…}` | The board's stage tabs with one number (activation rate) opened |
| `11-return-to-go-and-get-fr-desktop` | "To go and get", unfolded: what to ask whom, what to do yourself |
| `12-return-hybrid-board-full-fr-desktop` | The board when both motions are ticked: "two engines, one total" |
| `13-return-next-month-en-desktop` | The top of the board when a new month can start: month selector, next-month band, resume band |
| `14-page-full-first-visit-fr-desktop-1x` | The whole page, first visit |
| `15-page-full-return-fr-desktop-1x` | The whole page, returning |
| `16-deck-first-slide-fr-desktop` | What it all leads to: the first slide (out of scope, for context) |

`CATALOGUE.md`, in the same folder, is the text of every number as the page
prints it (both languages): the expertise this brief asks to keep, to read
rather than rewrite.

## The density, measured

In the production build, 2026-10-02 (CSS pixels; viewports 1280 × 900 and
390 × 844).

| | 1280px | 390px |
|---|---|---|
| Where the tool starts on the page — first visit **and** return | 1,267px down | 1,849px down |
| The setup card, before the first number | 1,431px tall, **36 controls** | 1,840px tall |
| The board on return | 2,463px tall, **12 blocks, 75 visible controls** | 3,597px tall |
| One number opened on the board | 1,667px tall, 15 controls | 2,142px tall |
| The whole page, first visit / return | 3,999px / 5,031px | 5,081px / 6,837px |
| Screens in the step-by-step | **21** self-serve alone (targets, base, 17 numbers, what if, end); **38** in the hybrid (targets, two bases, 17 + 15 + 1 numbers, what if, end) | same |

"Controls" counts what is visible and focusable: buttons, links, inputs,
selects, text areas, disclosure summaries.

## The journey today — the inventory

This is what exists. Everything in it has a reason (most of it a decision of
Antoine's, dated in the spec); the question is where and when each thing
shows, not whether the engine knows it.

### The page around the tool

One URL, prerendered, the same HTML for everyone. Top to bottom: the eyebrow
and the H1 ("Your growth engine" / « Ton moteur de growth »), the positioning
and the promise; the **privacy callout** ("Nothing you enter leaves this
page"); the call to action ("Enter your numbers →", an anchor to the tool);
"How long it takes" (two counts by effort, then four cases); **the tool**; "The
engine's numbers" (the whole catalogue, folded); the FAQ (six questions,
folded); a callout to take the Tour; the footer. The page is also the engine's
search landing (the query "AARRR funnel template"): the H1, the promise, the
catalogue and the FAQ are what a search engine reads.

### First visit: the setup ("Before you start")

Company type (B2B SaaS; "Consumer app" and "Marketplace" shown dashed,
"later"); how you sell: two boxes, self-serve and sales-assisted, at least one,
each unfolding its own windows (self-serve: activation 7/14/30 days, payment
30/60/90 days; sales-assisted: qualification and go-live windows); the month
of flows and the cohort followed (self-serve), with a sentence on why; the
sales-assisted periods line; currency; the company name (optional, slides
only); the team's tools (folded, optional); linking a Tour taken on this
device (when there is one). Then: **"Start step by step →"** (primary), "See
it all at once" (secondary), "See a filled-in example, funnel and slides →",
"Import a file".

### The step-by-step

A header with four big steps — *Your targets · Your numbers · What if · Your
slides* — and "See the full board" on the right.

1. **Your current targets**: one box per number that can name a stage (six
   for self-serve, five more for sales-assisted), each with the number's
   one-line definition. The intro says why: only a target says, figures in
   hand, which stage holds you back.
2. **Your base**: the counts several numbers share (self-serve: the cohort's
   sign-ups and the month's; sales-assisted: opportunities created, deals won,
   customers), typed once and written into every number that carries them.
3. **One number per screen** ("Number 1 of 17 · Acquisition"; "Item n of 17"
   for the three answers that are words, not figures). The screen **is the
   board's own sheet**, minus the target box. In order:
   - an effort tag ("On your own, 5 min"), "Definition →" (the glossary page);
   - the one-liner; the formula (in a sunken block);
   - which cohort or period to take, and why (on cohort numbers);
   - **"Where are you with this number?"**, four choices, none pre-selected:
     *I have it · I can estimate it · I'll ask for it · I can't find it*;
   - what the choice opens: the value (numerator over denominator, with the
     shared count prefilled and "same number as for … : changing it here
     changes it everywhere"; "I only have the rate"; the source tool; "the
     denominator comes from another tool"; "Your definition", optional) — or
     a low/high range and its basis — or a role and a request to copy — or a
     triage of why it can't be found and how to repair it;
   - **"Where to find it"** (folded): each tool and the path in it, **the
     trap**, the hybrid trap when both motions are ticked, and "Also in GA4:
     …" links to the other numbers the same tool gives;
   - **the reference**: a strip from 0, the published range and its caveat
     ("for context, never to name a stage"), the team's target and where the
     value sits against it;
   - what the person declared about it in the Tour, when linked;
   - "Note to self" ("never on a slide");
   - "Save and continue →"; then "← Back", "Skip, I'll come back to it", and
     in the hybrid "Skip to sales-assisted →".
4. **What if?** (`07`): eight levers (sign-up, referral, activation, paid
   conversion, churn, contraction, expansion, new customers' ARPA), each a
   slider with today's value; seven growth figures that move with them (MRR
   in 12 months, new MRR, NRR, GRR, CAC, LTV, payback); the month's funnel
   from visitors to new paying customers; "What the calculation assumes",
   folded. A lever not typed has no slider, and the panel says so.
5. **The end**: "Prepare your slides →", "Save (.json)", "See the full board".

### Return: the board

What a person gets every time they come back, top to bottom (`09`):

1. the engine line ("Engine: unnamed engine, created September 24, 2026", with
   a `+` that opens the engine switcher: several engines per device);
2. the eyebrow ("Your growth engine · Self-serve · July 2026 cohort · August
   2026 flows"), with "Back to step by step" and "Settings";
3. **the verdict**, in stencil capitals, its last clause in red: it is the
   first slide's title, from the same function;
4. coverage, four chips: "7 of 17 numbers found · 2 approximate · 5 in
   progress · 3 missing";
5. the month: a selector once there are two months, and "Remind me to start
   September 2026" (a calendar file) — or, once the month has ended, a dashed
   band "Start September 2026" (`13`);
6. **the resume band**, dashed: "7 of 17 numbers found · last visit 12 days
   ago", with "Continue" (opens the cheapest number still to do) or "Follow
   up: Data" (re-copies a pending request);
7. **the diagnosis**: "One stage holds the engine back · Activation", the
   value against the target, why a stage could be hiding, a note on the top
   of the funnel;
8. **the peloton**, the screen's one raised card: 100 sign-ups as dots, then
   activated, active at day 30, paying, each with its source and month;
9. **the five stage tabs** (status marks, "found: 2/3", "Holds you back" on
   the named one) and one panel under them: the stage's numbers as rows (name,
   value, status tag, `+`), all folded; a row unfolds into its sheet, in place
   (`10`). On a phone the tab strip scrolls inside its own box;
10. "What if?", folded (the panel of `07`);
11. "What you declared in the Tour × what you find here" (or the invitation to
    take the Tour);
12. "To go and get (5)", folded (`11`): requests grouped by role, with "Copy
    the request", and "Do it yourself" grouped by effort or by the team's
    tools; "Enter as a table", folded (a CSV template, a pasted table
    previewed then written); then the actions — **"Prepare your slides →"**
    (primary), "Save (.json)", "Import a file", "Erase everything" — and the
    **backup band**: "Your engine only exists in this browser. Safari may
    erase a site's data after seven days of Safari use without a visit to
    that site: save it to a file." with "Never saved".

**The hybrid** (`12`) adds, under the eyebrow: the total band ("Two engines,
one total", its own title and both MRRs), then the two motions side by side —
coverage, diagnosis, a compact peloton and the sales-assisted "relays" with
the pipeline coverage box — a small-sample caveat, "Motion shown: stages and
what-ifs" (a segmented control), then the tabs, "What if?", and the total
MRR in 12 months.

### The slides

The deck screen (export, settings of the slides, the request you make in it)
and its slides (`16`) are **out of scope**: they were redesigned in
September and their copy is in review. Keep the door to them; you may change
where that door is.

## What we think makes it dense

Our reading, there to be challenged:

1. **Every explanation is on screen at the moment of typing.** One value
   comes with about ten blocks: definition, formula, cohort, status, editor,
   where, trap, also-in, reference, target, Tour, note. The step-by-step
   reuses the board's sheet as it is: "one number per screen" still shows the
   whole sheet of that number (`06`: 2,059px at 1280).
2. **A returning person is treated as a newcomer.** The same 1,267px of
   introduction before the tool (1,849px on a phone). Then, on the board, the
   engine line, the eyebrow, the verdict, the chips, and up to three dashed
   bands (next month, resume, backup) before the diagnosis.
3. **Everything is a peer.** Twelve blocks and 75 controls at the same level.
   "What if?", "To go and get", "Enter as a table", the catalogue, the FAQ and
   "Where to find it" share one look — a dashed rule and a `+` — for very
   different weights.
4. **Decisions are asked before they are needed.** Thirty-six controls in the
   setup (windows, months, currency, tools) and six targets before the first
   number, when the person has not yet looked at the numbers the targets
   compare.
5. **Many new words at once.** Cohort and flows, windows, base, target and
   reference, status, coverage, peloton, relays, mirror, motions: each one
   needed, all introduced on the first screens.
6. **Long and flat.** Twenty-one screens (thirty-eight in the hybrid), one
   number each, in a fixed order; the header promises four steps while the
   real counter is "Number 4 of 17".
7. **Several ways in that look alike**: step by step, "See it all at once",
   "Enter as a table", the example, import; and on the board, "Back to step by
   step" next to "Settings".

## What must stay — the expertise

1. **Every number keeps its knowledge**: definition (and its glossary page),
   formula, which cohort or period to take, where to find it in each tool,
   **the trap**, the reference with its caveat, the effort. All of it must be
   **reachable from the number, at the moment of entering it** — on demand is
   fine, gone is not. `CATALOGUE.md` is the inventory.
2. **The four answers**, and what each one records: a value (with its source
   and an optional definition), a range, a request copied to a role (the copy
   *is* the request, stamped with its date, followed up later), a triage of
   why it can't be found. Nothing pre-selected: a number nobody looked at is
   "to do".
3. **The diagnosis rule**: only a **team target** names the stage that holds
   you back (Antoine's decision C1, 2026-09-29); a published reference is
   context and never designates. Without targets, the numbers still show and
   no stage is named. Targets are asked for the six
   self-serve numbers and five sales-assisted numbers that can name a stage;
   where in the journey is yours.
4. **Shared counts typed once** (the base), and the hint that changing one
   changes it everywhere.
5. **The verdict is the first slide's title** (one function for both). The
   peloton, the "what if" levers moving together with their assumptions
   printed, and the deck.
6. **Local only**: no account, nothing leaves the browser. The **privacy
   promise comes before the call to action and never folds** (the condition
   under which anyone types an employer's numbers into a web page). Saving to
   a file and importing one stay, and so does the backup warning (Safari's
   seven days), which shows only while the engine needs a backup: where it
   sits is yours.
7. **The month**: start the next month, read a past month (read only, with
   "Correct this month"), compare two months.
8. **The hybrid is "two engines, one total", never face to face**: fixed
   order, never ranked by value, a sum and never a comparison (C4).
9. **Several engines on one device**, switched and deleted one by one.
10. **The Tour link**: declared in the Tour × measured here.
11. **The page's searchable content** — H1, promise, catalogue, FAQ — stays in
    the server HTML. It may move below the tool or fold; a closed `<details>`
    is still read by search engines.

**Open to change**: the order of the journey, what the setup asks first and
what moves to Settings, the step-by-step's granularity and its relation to
the board, what the board shows by default, which bands exist, what folds,
the page around the tool for a returning person, the names of screens. **All
the engine's copy is still "to be reviewed"**: rewording is welcome (see
`COPY.md` below).

## What we expect

An engine that is **simple for the PM who opens it once a month and expert
for the one who reads every trap**:

- **first visit**: from arrival to the first number typed, the fewest
  decisions; the rest defaulted and changeable later;
- **one number**: one question at a time, the knowledge one tap away and
  attached to what it explains;
- **return**: the first screen says where you are and what to do next — the
  verdict and **one** next action (continue, follow up a request, start the
  month, prepare the slides) — with the rest reachable but quiet;
- the same engine at 390px as at 1280px.

Tell us the targets your design hits, measured the way the table above is
(where the tool starts, controls on the first screen on return, screens to
the first number typed, height of a number's screen). We will check them in
the port.

---

## Questions

**The page and the two visits**

1. **Where does a returning person land?** The page is the search landing
   and the tool at one URL. Its HTML is prerendered and identical for
   everyone; whether this device holds an engine is known only in the
   browser, on the render after load. What should the page look like once an
   engine is known (the introduction folded, moved below, reduced to a line)?
   Whatever you propose must not jump under the reader's eyes: say what the
   page shows in the first instant.
2. **The first screen on return.** Of the board's twelve blocks, which make
   the first screen, at 1280 and at 390? What is the one primary action, and
   how does it change with the state (numbers left to do, a request
   pending, a month to start, everything found)?
3. **The bands.** Next month, resume, backup, and "your browser refused to
   save" are four separate strips today. One "since last time" place, or
   something else?

**The setup**

4. **What must come before the first number?** Every setup control has a
   default (self-serve ticked, windows of 7 and 30 days, the last closed
   month, EUR, no name, no tools). Which
   stay in the first screen, which move to Settings? Note: changing a window
   later sends the number it defines back to "to do", and Settings says so
   before saving.
5. **The ways in.** Step by step, see it all at once, the example, import,
   and later the table: what is the hierarchy, and which belong on this card
   at all?

**One number**

6. **The sheet.** One value, about ten blocks. What shows by default, what on
   demand, in what order? Should the status question come first, and should
   each explanation sit next to the field it explains (the cohort sentence by
   the denominator, the trap by the value)?
7. **The four answers.** Keep the 2 × 2 choice, or ask differently (the value
   box first, with "I don't have it" as the way to the other three)? "I'll
   ask for it" copies a ready message to a role; "I can't find it" opens a
   triage of cause and repair.
8. **Where to find it, the trap, "also in".** This is the heart of the
   expertise. How does it stay one tap away without making the screen tall?
   Is the trap something to show *before* typing (it changes what one types)?
9. **Reference and target.** The strip, the range with its caveat, the target
   box and "below the target": one object or three?
10. **Two text areas** on every number ("Your definition", "Note to self"):
    keep both visible, fold, or merge?

**The step-by-step**

11. **Granularity.** One number per screen (21 or 38 screens), one stage per
    screen (5 or 10), or sorted by what the person has at hand? Every number
    carries an effort tag (on your own 5 min / on your own ~1 h / ask
    someone), and "To go and get" already says "send the requests today, fill
    in the rest while waiting". Could the journey start with what to ask for?
12. **Targets before numbers.** Keep a targets step at the start, or ask each
    target on its number's screen, once the person has the value in front of
    them?
13. **Progress.** Four big steps in the header, "Number 4 of 17" in the
    screen. How is progress told honestly? (Our rule, from the laws of UX:
    show what remains, never say "done" while screens remain.)
14. **Steps and board: two things or one?** Today the board is the expert
    view and the step-by-step the guided one, with "See the full board" and
    "Back to step by step" between them. Could the board *be* the progress,
    with "next number" as its primary action?

**The board**

15. **Composition.** Which blocks are the board, and which belong elsewhere
    (Settings, a files menu, a "more" place): the engine switcher, the
    eyebrow, "Enter as a table", import, erase, the backup warning?
16. **Stages and numbers.** Five tabs with status marks and one panel of
    folded rows (they replaced stage rows with a drawer, at Antoine's request,
    on 2026-09-26). Keep, or one list of numbers by stage?
17. **What if.** Folded on the board, a full screen in the step-by-step:
    eight sliders, seven figures, a funnel. A simpler way in (one lever
    first, the one on the stage that holds you back)?
18. **The hybrid board**, the densest screen: total band, two columns, a
    selector. What does it look like once the self-serve board is simpler?

**Words**

19. **Vocabulary.** Which words must be taught (cohort, flows, window, base,
    target versus reference, peloton, coverage, relays, mirror, motions), and
    where? `glossary/GlossaryTerm` (the `?` and its popover) exists for that.
    Propose a renaming wherever a name costs more than it gives; we take
    them to Antoine.
20. **Anything else** you see on the screenshots that this brief did not ask.

## The states we need

In the paper world (the engine never appears at night), at **390px and
1280px**, the key screens **in both languages** (the others in one, saying
which):

- **the journey**: one diagram, first visit → setup → first number → … →
  slides, and the return, with the number of screens and decisions on each
  path, today and with your design;
- **first visit**: the arrival, the setup, the first number reached;
- **one number**: untouched; "I have it" filled (with the shared-count
  hint); "I can estimate it"; "I'll ask for it" (the request copied); "I
  can't find it" (the triage); the knowledge open (where, trap, reference);
  a value that cannot be saved (its message);
- **the targets**, wherever they go;
- **progress**: at the start, in the middle, on the last number, the end;
- **what if**: untouched, and one lever moved;
- **return, self-serve**: numbers left and a request pending (our "returning"
  data); everything found; a new month to start; a past month read only;
- **return, hybrid**;
- **Settings**;
- **one sheet beside today's** (`06`), at the same width, so the difference
  can be seen, not argued.

## Both languages

The engine speaks to the reader as "tu" in French, "you" in English. Stage
names stay in English on French screens (Acquisition, Activation, Retention,
Referral, Revenue: it keeps the acronym). French is often longer, some labels
much longer: "Enregistrer et continuer →" / "Save and continue →",
« Où en es-tu avec ce chiffre ? » / "Where are you with this number?",
« Je ne le trouve pas » / "I can't find it", « À aller chercher (5) » / "To go
and get (5)", « Tout voir d'un coup » / "See it all at once". French
typography: a thin no-break space before `:`, `;`, `?`, `!` and inside « »;
figures grouped by a no-break space (`1 400`).

---

## Constraints that are not up for discussion

1. **Tokens only.** Any new value is a new token in `tokens/*.css`, never a hex
   inline; components read semantic names. The typography tokens are `font`
   shorthands.
2. **The system first.** The engine's own components (the board, the sheet,
   the peloton, the stage tabs, the what-if panel…) live in the app, outside
   the synced system: the screenshots are their reference. Build with what
   the project holds — `Button`, `Card`, `Callout`, `Choices`, `Checkbox`,
   `NumberField`, `Field`, `FieldRow`, `Select`, `TextArea`, `TextField`,
   `DateField`, `Segmented`, `Disclosure`, `Tag`, `DataTable`, `FormSummary`,
   `MetaLabel`, `GlossaryTerm`, `StatTile`, `DotGrid`, `BulletChart`,
   `StageProfile` — and give anything new its contract.
3. **AA contrast, checked by our CI with no exception left**: text 4.5:1,
   every edge, ring and mark 3:1 against what is next to it, translucent
   colours measured composed on their real ground.
4. **44px targets** for everything that can be tapped, none overlapping its
   neighbour's.
5. **Red means one of three things**: solid red fill = the primary action;
   red wash or solid red edge = a diagnosis; dashed red = advice.
6. **One loud thing per screen**: one raised card (the peloton, on the board
   today), one primary action.
7. **One signature effect per element** (hard shadow *or* dashed border);
   dashed means "not yet" or pending.
8. **No icons, no images.** The glyphs are `→`, `←`, `№`, `?`, `+`/`−` of a
   disclosure, and the peloton's dots.
9. **Bilingual from the same component** — never two layouts for two
   languages.
10. **Local and deterministic.** No account, no server, no e-mail, no AI:
    every explanation is fixed copy, every figure a fixed calculation.
    Nothing typed is ever put in a URL or counted (the analytics are a closed
    list of events that carry no number and no word typed).
11. **The privacy promise before the call to action, never folded.**
12. **The searchable content in the server HTML** (H1, promise, catalogue,
    FAQ), wherever it sits.
13. **From 320px**, with no horizontal scroll (320 is measured; 360 to 430
    are held).
14. **The keyboard**: Enter in a box saves the sheet; focus moves only when a
    person moves between screens, never on first paint.
15. **The data stays.** The engine on the device and its `.json` file keep
    what they hold: every number's status, value or range, source, definition,
    request and note; the targets; the shared counts; the months; the
    what-ifs; the setup. A design may show a field later, or elsewhere; if it
    needs a field that does not exist, or no longer needs one, say so in the
    README: that is a change to the model, which we decide with Antoine.

## What we need back

Under `design/ds-extension-07-return/`, the same shape as returns 04 and 05,
so the port is mechanical:

- a `README.md`: what is in the bundle; an answer to each numbered question;
  the journey before and after, with the measures of the table above; the
  constraints one by one; the contrast measured;
- **`INVENTORY.md`, where every piece of the expertise went**: each block of
  today's inventory (above, and every line of a number in `CATALOGUE.md`:
  definition, formula, cohort, where, trap, hybrid trap, also in, reference,
  caveat, effort, target, Tour, note, definition note) and each board and
  setup block, with its new place — or "removed" and why. Nothing disappears
  silently: **this file is how Antoine checks the expertise is still there**;
- the screens: `board/index.html` and
  `board/board.html?screen=&lang=&w=` (`en`/`fr`, `390`/`1280`) with every
  state above. **Openable from its own source in the folder**, inline styles
  fine: twice already the rendered PNGs and a built `board.js` could not be
  copied back to the repo, so we replay the board from its source;
- for each new or changed piece: `components/engine/<Name>/` as React +
  `.d.ts` + `.prompt.md` + CSS (the `.prompt.md` usage rules are what we rely
  on most); a `*.delta.md` for any synced component that changes, or a line
  saying none does; new tokens in `tokens/*.css`;
- **`COPY.md`**: every new or changed string, French and English side by
  side, with the screen it sits on. It goes to Antoine's review before
  anything ships.

Write nothing outside that folder.

## Handoff back

Write the return under `design/ds-extension-07-return/` in this project; we
copy it into the repo, file by file, at the same paths. The port into the
engine, the tests, the measures and the screenshots against the real build
are on our side.
