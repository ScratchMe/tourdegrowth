# INVENTORY — where every piece of the engine's expertise went

*Design system extension 07 · the growth engine, simpler · 2026-10-02.*

This file is how Antoine checks that nothing the engine knows was lost. Every
block of today's journey (brief 07, "The journey today — the inventory") and
every kind of line a number carries (CATALOGUE.md, and the sheet's own lines
the catalogue does not print) is listed with **its new place**, or
**"removed" and why**. Nothing disappears silently.

How to read the "Default" column: **shown** = on screen without a tap;
**one tap** = behind one Disclosure or button, on the same screen; **moved**
= on another screen, named.

---

## 1. The lines of a number

Every number's lines, today and in the proposal. The catalogue's text is kept
**word for word**; only where it sits changes.

| Line | Today | Proposed | Default | Component |
|---|---|---|---|---|
| Name | sheet title | sheet title (stencil capitals) | shown | NumberSheet |
| "(The stage's number)" | catalogue marker | first row of its stage in the list; with logo churn, the numbers that can carry a target | shown | NumberList |
| Definition (one-liner) | under the effort tag | the lede, under the name | shown | NumberSheet |
| Definition page ("Definition →") | link after the effort tag | same, a quiet link after the effort tag | shown | NumberSheet |
| Formula | its own sunken block, after the one-liner | one mono line, "Formula" + the formula | shown | NumberSheet |
| Which cohort or period, and why | a sentence block before the status question | **the denominator's hint**, with the `?` for "cohort"; Settings → The month, its hint | shown | AnswerSwitch (value) |
| Where to find it — tool → path | folded, after the editor | folded, **its summary names the tools**; the person's own tools first, tagged | one tap | WhereToFind |
| The trap | inside "Where to find it", folded, after the value | **open, just above the value** | shown | TrapNote |
| The hybrid trap | inside "Where to find it" when both motions are ticked | the same TrapNote, second part, "When you sell both ways" | shown (hybrid) | TrapNote |
| "Also in GA4: …" | inside "Where to find it", red links | inside "Where to find it", ink links, each a 44px row | one tap | WhereToFind |
| Reference (published range) | "Reference" strip from 0, the range dashed | the bracket under the chart's track, + "Reference 2–5%" in the legend | shown | HowItCompares, BulletChart (delta `band`) |
| Caveat ("for context, never to name a stage: …") | under the strip | under the chart, word for word | shown | HowItCompares |
| "No reference worth publishing: …" | under the strip | under the chart (no band), word for word | shown | HowItCompares |
| Effort ("On your own, 5 min") | dashed tag | **neutral** tag (an effort is not pending); also the start card's counts, and NextStep's order | shown | NumberSheet, EngineStart, NextStep |
| Team target | a box per number, in step 1, before any number | **the box in "How it compares", once the value is typed**; all of them in Settings → Targets | shown (6 + 5 numbers) | HowItCompares |
| "Below the target" | on the board's diagnosis and stage tab | Tag alert on the number, the list's edge, the diagnosis (only from a team target, C1) | shown | HowItCompares, NumberList |
| What was declared in the Tour | a block on the sheet, when linked | one line under the formula, when linked | shown | NumberSheet |
| "Where are you with this number?" — the four answers | first, a 2 × 2 choice | the value boxes **are** the question; "No figure to hand?" offers the three others | shown | AnswerSwitch |
| I have it → value: numerator over denominator | under "I have it" | the boxes, first | shown | AnswerSwitch |
| Shared count prefilled + "same number as for …: changing it here changes it everywhere" | the first box's hint (wraps in a 160px column) | **a full-width line under the row of boxes**, same words | shown | AnswerSwitch |
| "I only have the rate" | under the boxes | under the boxes | shown | AnswerSwitch |
| The source tool ("Where does it come from?") | always, under the value | once a value is typed | shown | AnswerSwitch (source) |
| "The denominator comes from another tool" | under the source | under the source | shown | AnswerSwitch (source) |
| I can estimate it → low / high + basis | under the choice | "I can estimate it" → its editor replaces the boxes | one tap | AnswerSwitch (editor) |
| I'll ask for it → role + the request to copy, stamped | under the choice | "I'll ask for it" → role, the request, "Copy the request", the copied stamp; or all requests at once (AskList) | one tap | AnswerSwitch, AskList |
| I can't find it → triage of why + repair | under the choice | "I can't find it" → the triage (Choices) + "To repair" (advice note) | one tap | AnswerSwitch, TrapNote |
| "Your definition" + its hint (definition note: "For example «active = …». It appears in the slides' annex and in the requests you copy.") | open text area, always | in "Your definition and a note", closed; **opened by the trap** when it says "Write it in your definition" | one tap | Disclosure (delta), TrapNote |
| "Note to self" + "never on a slide" | open text area, always | in the same Disclosure, its hint kept | one tap | Disclosure |
| Status (to do, found, approximate, in progress, missing) | chips, tabs' marks, row tags | one mark per number (EngineProgress), a row tag (NumberList); words: Found, Estimated, Asked, Can't find, To do | shown | EngineProgress, NumberList |
| "Number 1 of 17 · Acquisition" / "Item n of 17" | screen eyebrow | "Acquisition · 1 of 3" + "17 to go" | shown | NumberSheet, EngineProgress |
| Save and continue → | primary | primary (a submit: Enter saves) | shown | NumberSheet |
| ← Back · Skip, I'll come back to it | quiet | "← Your numbers" (the board, at the row) · "Skip for now" | shown | NumberSheet |
| "Skip to sales-assisted →" (hybrid) | quiet | **removed**: the list shows one engine at a time and NextStep's order moves between them; any number is one tap from the list | — | — |

## 2. Every number of CATALOGUE.md

All 41 entries (17 + 5 computed self-serve, 15 + 3 computed sales-assisted,
the link), generated from CATALOGUE.md: each of its lines and where it now
sits. Counts: 33 one-liners, 41 formulas, 33 "Where to find it" with 82
paths, 35 traps, 32 references (10 with a published range, 22 "No reference
worth publishing"), 33 efforts. None is dropped.

| Number | Section · stage | Definition | Formula | Where to find it | Trap | Reference | Effort | Target | Screen |
|---|---|---|---|---|---|---|---|---|---|
| Sign-up rate | Self-serve · Acquisition | lede | formula line | WhereToFind · 3 tools | TrapNote (open) | band 2–5% + caveat → HowItCompares | Tag · On your own, 5 min | box in HowItCompares + Settings | number screen |
| Top channel share | Self-serve · Acquisition | lede | formula line | WhereToFind · 3 tools | TrapNote (open) | caveat only (“No reference worth publishing…”) → HowItCompares, text | Tag · On your own, ~1 h | — | number screen |
| CAC | Self-serve · Acquisition | lede | formula line | WhereToFind · 3 tools | TrapNote (open) | caveat only (“No reference worth publishing…”) → HowItCompares, text | Tag · Ask someone | — | number screen |
| Activation rate | Self-serve · Activation | lede | formula line | WhereToFind · 3 tools | TrapNote (open) | band 20–40% + caveat → HowItCompares | Tag · On your own, ~1 h | box in HowItCompares + Settings | number screen |
| Activation event | Self-serve · Activation | lede | formula line | WhereToFind · 1 tool | TrapNote (open) | — *(none in the catalogue)* | Tag · On your own, 5 min | — | number screen |
| Median time to value | Self-serve · Activation | lede | formula line | WhereToFind · 2 tools | TrapNote (open) | caveat only (“No reference worth publishing…”) → HowItCompares, text | Tag · On your own, ~1 h | — | number screen |
| Day-30 retention | Self-serve · Retention | lede | formula line | WhereToFind · 3 tools | TrapNote (open) | caveat only (“No reference worth publishing…”) → HowItCompares, text | Tag · On your own, ~1 h | box in HowItCompares + Settings | number screen |
| Monthly logo churn | Self-serve · Retention | lede | formula line | WhereToFind · 3 tools | TrapNote (open) | band 1–2% + caveat → HowItCompares | Tag · On your own, 5 min | box in HowItCompares + Settings | number screen |
| Main churn cause | Self-serve · Retention | lede | formula line | WhereToFind · 2 tools | TrapNote (open) | — *(none in the catalogue)* | Tag · Ask someone | — | number screen |
| Referred sign-up share | Self-serve · Referral | lede | formula line | WhereToFind · 2 tools | TrapNote (open) | caveat only (“No reference worth publishing…”) → HowItCompares, text | Tag · On your own, ~1 h | box in HowItCompares + Settings | number screen |
| Referral mechanism | Self-serve · Referral | lede | formula line | WhereToFind · 1 tool | TrapNote (open) | — *(none in the catalogue)* | Tag · On your own, 5 min | — | number screen |
| Viral coefficient (K) | Self-serve · Referral | lede | formula line | WhereToFind · 2 tools | TrapNote (open) | band 0.15–0.5 + caveat → HowItCompares | Tag · Ask someone | — | number screen |
| Paid conversion | Self-serve · Revenue | lede | formula line | WhereToFind · 3 tools | TrapNote (open) | caveat only (“No reference worth publishing…”) → HowItCompares, text | Tag · Ask someone | box in HowItCompares + Settings | number screen |
| Monthly ARPA | Self-serve · Revenue | lede | formula line | WhereToFind · 3 tools | TrapNote (open) | caveat only (“No reference worth publishing…”) → HowItCompares, text | Tag · On your own, 5 min | — | number screen |
| Gross margin | Self-serve · Revenue | lede | formula line | WhereToFind · 1 tool | TrapNote (open) | band 70–85% + caveat → HowItCompares | Tag · Ask someone | — | number screen |
| Monthly expansion | Self-serve · Revenue | lede | formula line | WhereToFind · 3 tools | TrapNote (open) | caveat only (“No reference worth publishing…”) → HowItCompares, text | Tag · On your own, ~1 h | — | number screen |
| Monthly contraction | Self-serve · Revenue | lede | formula line | WhereToFind · 3 tools | TrapNote (open) | caveat only (“No reference worth publishing…”) → HowItCompares, text | Tag · On your own, ~1 h | — | number screen |
| LTV | Self-serve · Computed | — *(none in the catalogue)* | formula line | — | TrapNote (open) | — *(none in the catalogue)* | — (computed) | — | read-only sheet (Computed from yours) |
| CAC payback | Self-serve · Computed | — *(none in the catalogue)* | formula line | — | — | band 12–24 months + caveat → HowItCompares | — (computed) | — | read-only sheet (Computed from yours) |
| LTV:CAC | Self-serve · Computed | — *(none in the catalogue)* | formula line | — | — | band 3 + caveat → HowItCompares | — (computed) | — | read-only sheet (Computed from yours) |
| Monthly GRR | Self-serve · Computed | — *(none in the catalogue)* | formula line | — | — | — *(none in the catalogue)* | — (computed) | — | read-only sheet (Computed from yours) |
| Monthly NRR | Self-serve · Computed | — *(none in the catalogue)* | formula line | — | — | — *(none in the catalogue)* | — (computed) | — | read-only sheet (Computed from yours) |
| Lead-to-opportunity rate | Sales-assisted · Acquisition | lede | formula line | WhereToFind · 3 tools | TrapNote (open) | caveat only (“No reference worth publishing…”) → HowItCompares, text | Tag · On your own, ~1 h | box in HowItCompares + Settings | number screen |
| Sales-assisted CAC | Sales-assisted · Acquisition | lede | formula line | WhereToFind · 3 tools | TrapNote (open) | caveat only (“No reference worth publishing…”) → HowItCompares, text | Tag · Ask someone | — | number screen |
| Median sales cycle | Sales-assisted · Acquisition | lede | formula line | WhereToFind · 3 tools | TrapNote (open) | caveat only (“No reference worth publishing…”) → HowItCompares, text | Tag · On your own, ~1 h | — | number screen |
| Go-live rate | Sales-assisted · Activation | lede | formula line | WhereToFind · 3 tools | TrapNote (open) | caveat only (“No reference worth publishing…”) → HowItCompares, text | Tag · Ask someone | box in HowItCompares + Settings | number screen |
| What "live" means | Sales-assisted · Activation | lede | formula line | WhereToFind · 1 tool | TrapNote (open) | — *(none in the catalogue)* | Tag · On your own, 5 min | — | number screen |
| Time to go-live | Sales-assisted · Activation | lede | formula line | WhereToFind · 3 tools | TrapNote (open) | caveat only (“No reference worth publishing…”) → HowItCompares, text | Tag · On your own, ~1 h | — | number screen |
| Contract renewal rate | Sales-assisted · Retention | lede | formula line | WhereToFind · 3 tools | TrapNote (open) | caveat only (“No reference worth publishing…”) → HowItCompares, text | Tag · On your own, ~1 h | box in HowItCompares + Settings | number screen |
| 12-month NRR | Sales-assisted · Retention | lede | formula line | WhereToFind · 3 tools | TrapNote (open) | band 110–130% + caveat → HowItCompares | Tag · Ask someone | — | number screen |
| Main reason for non-renewal | Sales-assisted · Retention | lede | formula line | WhereToFind · 2 tools | TrapNote (open) | — *(none in the catalogue)* | Tag · Ask someone | — | number screen |
| Referred opportunities | Sales-assisted · Referral | lede | formula line | WhereToFind · 3 tools | TrapNote (open) | caveat only (“No reference worth publishing…”) → HowItCompares, text | Tag · On your own, ~1 h | box in HowItCompares + Settings | number screen |
| Reference customers | Sales-assisted · Referral | lede | formula line | WhereToFind · 2 tools | TrapNote (open) | caveat only (“No reference worth publishing…”) → HowItCompares, text | Tag · Ask someone | — | number screen |
| Win rate | Sales-assisted · Revenue | lede | formula line | WhereToFind · 3 tools | TrapNote (open) | caveat only (“No reference worth publishing…”) → HowItCompares, text | Tag · On your own, 5 min | box in HowItCompares + Settings | number screen |
| New-contract ACV | Sales-assisted · Revenue | lede | formula line | WhereToFind · 3 tools | TrapNote (open) | caveat only (“No reference worth publishing…”) → HowItCompares, text | Tag · On your own, 5 min | — | number screen |
| Sales-assisted ARPA | Sales-assisted · Revenue | lede | formula line | WhereToFind · 2 tools | TrapNote (open) | caveat only (“No reference worth publishing…”) → HowItCompares, text | Tag · On your own, 5 min | — | number screen |
| Sales-assisted gross margin | Sales-assisted · Revenue | lede | formula line | WhereToFind · 1 tool | TrapNote (open) | caveat only (“No reference worth publishing…”) → HowItCompares, text | Tag · Ask someone | — | number screen |
| Sales-assisted LTV | Sales-assisted · Computed | — *(none in the catalogue)* | formula line | — | TrapNote (open) | — *(none in the catalogue)* | — (computed) | — | read-only sheet (Computed from yours) |
| Sales-assisted CAC payback | Sales-assisted · Computed | — *(none in the catalogue)* | formula line | — | — | band 12–24 months + caveat → HowItCompares | — (computed) | — | read-only sheet (Computed from yours) |
| Sales-assisted LTV:CAC | Sales-assisted · Computed | — *(none in the catalogue)* | formula line | — | — | band 3 + caveat → HowItCompares | — (computed) | — | read-only sheet (Computed from yours) |
| Opportunities from self-serve | The link · Link | lede | formula line | WhereToFind · 3 tools | TrapNote (open) | caveat only (“No reference worth publishing…”) → HowItCompares, text | Tag · On your own, ~1 h | — | number screen, hybrid list's closed group |

"lede", "formula line", "TrapNote (open)": on the number's screen, shown.
"WhereToFind": one tap, its summary names the tools. Computed numbers have
no answer to give: their sheet is read only (formula, trap, reference) and
the list says what each still needs ("Needs CAC, gross margin").

## 3. The page around the tool

| Block today | Proposed | Default |
|---|---|---|
| Eyebrow and H1 ("Your growth engine") | kept; for a returning reader the H1 at section size | shown, in the server HTML |
| Positioning (lede and paragraph) | first visit: kept. Returning: hidden by CSS before the first paint (still in the HTML) | first visit |
| Privacy callout ("Nothing you enter leaves this page") | first visit: the raised card, before the call to action. Returning: the promise in **one line**, before the tool. **Never folded** | shown |
| Call to action "Enter your numbers →" | first visit: kept, an anchor to the tool, now **secondary** (the start card holds the page's one primary). Returning: hidden — NextStep holds the primary | first visit |
| "How long it takes" (two counts, four cases) | **moved under the tool**, with the catalogue and the FAQ; the start card says the counts in one line | one tap |
| The tool | starts at 735px (1280) / 956px (390) on a first visit; 287 / 288px on return (today 1,267 / 1,849 both) | — |
| "The engine's numbers" (catalogue, folded) | unchanged, under the tool, in the server HTML | one tap |
| FAQ (six questions, folded) | unchanged | one tap |
| Callout to take the Tour | unchanged | shown |
| Footer | unchanged | shown |
| Stopwatch (aside) | first visit only (desktop) | first visit |

## 4. The setup ("Before you start")

| Block today | Proposed | Why |
|---|---|---|
| Company type (B2B SaaS; Consumer app, Marketplace "later", dashed) | the start card's sentence ("for a B2B SaaS"); Settings → Company type, the two "later" kept dashed | one value possible today: not a decision |
| How you sell: two boxes (self-serve, sales-assisted), at least one | **the one question**: Self-serve · Sales-assisted · Both (radio). Self-serve by default | it decides which numbers exist |
| Self-serve windows: activation 7/14/30, payment 30/60/90 | Settings → The month, with the warning: changing a window sends the number it defines back to "to do" | defaults right for most; changed when a number asks |
| Sales-assisted windows: qualification, go-live | Settings → The month (sales-assisted part) | same |
| The month of flows, the cohort followed, the sentence on why | the start card's sentence; Settings → The month (its hint keeps the why); each cohort number's denominator hint | said where it is needed |
| Sales-assisted periods line | Settings → The month | same |
| Currency | the start card's sentence; Settings → Currency | default EUR |
| Company name (slides only) | Settings → Company name, on the slides | used by the deck only |
| The team's tools (folded) | Settings → Your tools; they come first in "Where to find it" | optional |
| Linking a Tour taken on this device | Settings → Link the Tour; the board's "The Tour and your numbers" | optional |
| "Start step by step →" (primary) | "Start with your first number →" (primary) | — |
| "See it all at once" (secondary) | **removed**: the board is all at once; "← Your numbers" leads to it from any number | a fifth way in that looked like the first |
| "See a filled-in example, funnel and slides →" | "See a filled-in example" (quiet) | — |
| "Import a file" | "Import a file (.json)" (quiet) | — |

## 5. The step-by-step

| Block today | Proposed | Why |
|---|---|---|
| Header: four steps (targets · numbers · what if · slides) + "See the full board" | **removed** as a header: a number's screen says "Acquisition · 1 of 3" and "17 to go"; the board is the progress | it promised four steps while the counter said "Number 4 of 17" |
| 1. Your current targets (6 + 5 boxes, each with its one-liner, and why) | each box on its number's screen, in "How it compares", once the value is typed; all in Settings → Targets, with the same one-liners; the why is the box's hint | the target means something once the value is in front of you |
| 2. Your base (shared counts, typed once) | each count typed in the first number that carries it, prefilled in the others with "same number as for … : changing it here changes it everywhere"; all in Settings → Shared counts, with "Used by …" | no screen for numbers without their context |
| 3. One number per screen, the whole sheet | one number per screen, **the new sheet** (section 1), in NextStep's order: quick ones, requests, the hour-long ones | — |
| The requests ("To go and get", on the board) | **a step of the journey**: AskList, after the quick numbers | "send the requests today, fill in the rest while waiting" |
| 4. What if? (8 levers, 7 figures, the funnel, the assumptions) | the board's LeverCard (one lever); "All 8 levers and what the calculation assumes →" opens today's panel, unchanged | — |
| 5. The end: Prepare your slides →, Save (.json), See the full board | the board, with NextStep "Prepare your slides →"; Save in the menu (and NextStep's line while never saved) | the end is the engine itself |

## 6. The board on return

| # | Block today | Proposed | Default |
|---|---|---|---|
| 1 | Engine line + `+` (switcher; several engines) | EngineBar's line; "Switch or add an engine", "Rename", "Erase this engine" in the menu | line shown, menu one tap |
| 2 | Eyebrow (motion · cohort · flows) + "Back to step by step" + "Settings" | EngineBar's line (engine · motion · month); Settings beside it; "Back to step by step" **removed** (one number screen, one board) | shown |
| 3 | The verdict (stencil capitals, last clause red) | unchanged, at `--engine-verdict` (40px / 25px) | shown |
| 4 | Coverage chips (found · approximate · in progress · missing) | EngineProgress under "Your numbers": "4 to go" first, then the counts and the marks | shown |
| 5 | The month: selector, "Remind me", or the "Start September" band | menu → Month (selector, compare, remind); the month to start is **NextStep's primary** when the month has ended | one tap / shown when due |
| 6 | The resume band (found · last visit · Continue / Follow up) | **NextStep**: last visit, the reason, the one primary; pending requests as lines with "Follow up" | shown |
| 7 | The diagnosis (stage, value vs target, why it could be hiding, top of the funnel) | unchanged, under NextStep | shown |
| 8 | The peloton (the raised card) | unchanged, titled "Your 100 sign-ups"; still the screen's one raised card | shown |
| 9 | Five stage tabs + one panel of folded rows; a row unfolds its sheet in place | **one list by stage** (NumberList), every number a row; a row opens the number's screen | shown |
| 10 | What if? (folded panel) | LeverCard, one lever; the full panel one tap away | shown |
| 11 | The Tour × here (or the invitation) | "The Tour and your numbers", closed Disclosure (or the invitation inside) | one tap |
| 12a | "To go and get (5)" (requests by role; "Do it yourself" by effort or tool) | requests: NextStep's primary when due, and AskList; "Do it yourself" **removed**: it is the list, in NextStep's order | shown when due |
| 12b | "Enter as a table" (CSV template, pasted table previewed) | menu → File → "Enter as a table" (unchanged behind it) | one tap |
| 12c | Prepare your slides → (primary) · Save (.json) · Import a file · Erase everything | slides: NextStep's primary once nothing is left to type, otherwise a quiet "Prepare your slides with what you have →" at the board's end; Save · Import · Erase this engine: menu → File | shown / one tap |
| 12d | Backup band (Safari's seven days) + "Never saved" | "Never saved" tag (EngineBar) + NextStep line with "Save (.json)" + the full sentence closing the File menu — only while needed | shown while needed |
| — | "Your browser refused to save" strip | NextStep: the lead in advice tone, primary "Save to a file (.json) →" | shown when it happens |
| — | Past month: read only, "Correct this month" | EngineBar "· read only"; NextStep: "Back to {month} →", "Correct this month" | shown |
| — | Compare two months | menu → Month → "Compare two months" (today's view, unchanged) | one tap |

## 7. The hybrid board

| Block today | Proposed |
|---|---|
| Total band ("Two engines, one total", its title, both MRRs) | TotalBand, once, at the top: the two MRRs in fixed order and the total set off by a rule; the link as its last line |
| Two motions side by side: coverage, diagnosis, compact peloton, relays + pipeline coverage box | **one engine at a time** under a Segmented "Engine shown: Self-serve · Sales-assisted" (fixed order): its verdict, diagnosis, peloton or relays (the relays and the pipeline coverage box unchanged), list, lever |
| Small-sample caveat | under the Segmented when sales-assisted is shown (unchanged text) |
| "Motion shown: stages and what-ifs" (Segmented) | the same control, now for the whole board below it: "Engine shown" |
| Tabs, What if?, total MRR in 12 months | the chosen engine's list and lever; the total MRR in 12 months stays in the full what-if panel |
| The link (opportunities from self-serve) | TotalBand's last line, and a row in each engine's closed "Computed" group |

## 8. Removed, and why

| Removed | Why | What carries it now |
|---|---|---|
| "See it all at once" | the board is the whole view | "← Your numbers", the board |
| "Back to step by step" / "See the full board" | one number screen and one board: nothing to switch between | NumberSheet ↔ NumberList |
| The four-step header | it promised four steps while the counter said 17 | "Acquisition · 1 of 3" · "17 to go" |
| The targets step | targets asked before the values they compare | the box on each number; Settings → Targets |
| The base step | counts asked without their numbers | the first number carrying each; Settings → Shared counts |
| Coverage chips | the same count twice (chips + resume band) | EngineProgress |
| The resume, next-month and backup bands | three strips before the diagnosis | NextStep (and EngineBar's tag) |
| The dashed effort tag | dashed means pending; an effort is not | the neutral tag |
| The dashed reference range | dashed means pending; a published range is not | the bracket under the track |
| "Do it yourself" (in "To go and get") | it duplicated the list | NumberList, in NextStep's order |
| "Skip to sales-assisted →" | the list holds both engines, one at a time | Segmented + NumberList |
| Red links ("Definition →", "Also in …") | a fourth red on screens where red means advice or a diagnosis | quiet buttons, ink links |
| The duplicated tool label ("Mixpanel · Mixpanel or Amplitude") | printed twice | one name per tool |

Nothing in the data goes: see README, constraint 15.
