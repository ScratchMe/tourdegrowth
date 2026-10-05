# Extension 10 — the marketplace · return

*Tour de Growth · design system extension 10 · answer to
[`../DS-EXTENSION-BRIEF-10.md`](../DS-EXTENSION-BRIEF-10.md) · drawn on the
live system synced 2026-10-04 · for Antoine and units MKT-7, MKT-8.*

A marketplace has two sides. This return draws them **one at a time, under
a selector, joined only by a sum**: the board shows the total (two streams,
one total), the next step, then « Côté affiché » — and under it one side,
demand or supply, read in self-serve's order: its verdict, its diagnosis,
its money, its "What if?", its funnel. The list of numbers follows, both
sides by stage. The deck does the same: the total first (a ledger, never two
cards facing), then the buyers' four slides, then the sellers' four.

Everything is drawn in French and English, in the "products" and the
"services" words, at 1280, 390 and 320 px, from the components' own files;
every figure comes from one replica of the model, checked against the
brief's table.

---

## What is in the bundle

```
README.md                  this file: the answers, the constraints, the measures
INVENTORY.md               where every figure goes (board, card, panel, slides) — or why not
COPY.md                    every new, changed or given string: EN and FR, products and services
tokens/marketplace.css     the new tokens (measures only: no new colour)
components/engine/
  SideShown/               new — the side selector and the side's heading
  SideFunnel/              new — one side's funnel; liquidity on its own base; the churns as rates
  SideNote/                new — a side's absent part (by design, or not yet)
  SlideStreams/            new — the total slide, as a ledger
  MrrCurve/                delta — the jump at month 1 (MrrCurve.delta.md + .delta.css)
  NumberList/              delta — a row's side, a lead line (NumberList.delta.md + .delta.css)
board/
  index.html               every state, every language, width and vocabulary
  board.html               ?screen=<id>&lang=en|fr&w=390|1280[&vocab=services]
  board.js, screens.js     the states, drawn from the components above
  market.js                the marketplace's money, a board replica of §22.5
  market-check.mjs         node board/market-check.mjs — 37 checks against the brief's table, all pass
  fixture.js               the example of §22.10 (+ no subscriptions, no margin)
  copy.js, glossary.js     every string (COPY.md is generated from it: make-copy.mjs)
  fmt.js                   the house's figures (two significant digits and ~, € placement…)
  app.js                   stand-ins for what the brief does not redesign (page, verdict,
                           diagnosis, slide frame and the reused slide bodies)
  sys/, sys/engine/        stand-ins of the synced system: the live markup and class names,
                           drawn by the live CSS (system-snapshot.css = _ds_bundle.css)
  measure.cjs, measures.js the density, 44px targets, overlaps, scroll at 320 (372 renders)
  contrast.mjs             the contrast of every pair the new parts draw
```

Each new component is plain React (no JSX, so the board runs the very file)
with its `.d.ts`, its `.prompt.md` and its CSS. **Synced components that
change: two**, each with a `*.delta.md` and a `*.delta.css` (rules added,
none changed): **MrrCurve** (`step`, `note`) and **NumberList** (`row.side`,
`lead`). **Unchanged** and used as they are, by props only: TotalBand,
MoneyBlock, WorthBars, CashWarning, LeverCard, LeverSum, WhatIfFigures,
PaybackChart (with `reference: null`), NextStep, EngineBar, EngineProgress,
and the core Card, Tag, MetaLabel, Segmented, DotGrid, Disclosure, Button,
GlossaryTerm. The synced system has no `Peloton`: SideFunnel is new,
built from DotGrid as the peloton is.

**To open it**: serve the project over http (ES modules do not load from
`file://`), e.g. `python3 -m http.server` from the project root, then
`design/ds-extension-10-return/board/index.html`. Add `&vocab=services` to
any screen for the services words.

---

## The constraints, first — one by one

1. **Never supply against demand (C70).** One side at a time, under
   `SideShown`; nothing under the selector belongs to the other side. The
   two meet only in sums: TotalBand above the selector (the two streams, the
   total, and what adds up: annualised, new a month, in 12 months) and slide
   № 1 (`SlideStreams`, a ledger read down: no bar, no share, no
   percentage, no "+" or "="). No chart has both sides on one axis — the
   summed curve is not drawn (question 8). The selector's options carry no
   figure and no colour; the list's side tags carry no colour; the deck
   never puts a demand slide and a supply slide next to each other but at
   the seam between the two blocks, and never faces them.
2. **Never red for a projection or a loss.** Curves, gains, what-ifs, "?"
   boxes, the jump's ring, the side notes, "not enough targets": ink. Red
   is the leak only, one per side: the diagnosis (eyebrow, stage), the
   leak's column in the funnel (red dots, « Sous la cible »), the leak's
   stage in the list (the diagnosis edge), the leak slide's calculation
   card. Measured: on every board screen, those reds all point at the shown
   side's one leak, and none appears on supply without targets. The other
   stages under their targets (first order 20 % for 25 %; paid seller churn
   3 % for 2.5 %) are named in ink, beside it — on the leak slide too, where
   the self-serve slide (screenshot 12) paints a second stage red.
3. **No reference at all (C73).** No range, no "commonly cited", nothing
   that situates: PaybackChart is drawn with `reference: null` (no dotted
   tick); the LTV:CAC tile has no note; the "À côté" list says « sans cible
   d'équipe » where a stage has no target, and nothing else. Only team
   targets name a stage.
4. **"?" never 0.** Demand without the commissions' margin
   (`board-demand-nomargin`, `whatif-demand-nomargin`): LTV, LTV:CAC, the
   gap, payback, months after and cash tied up are the dashed, hatched "?"
   box, each saying what is missing (« il manque la marge sur le revenu
   net »). A stream that does not exist (supply without subscriptions) is
   said in words (`SideNote`), never printed as 0.
5. **No margin, LTV or payback without its own stream's margin.** The
   buyer uses the commissions' margin (55–65 %, an estimate: the LTV and the
   payback stay ranges), the paid seller the subscriptions' (85 %). The
   no-margin state says it in words: « et jamais la marge des abonnements à
   sa place : chaque flux a la sienne ». The slides' assumptions repeat it.
6. **French and English, two vocabularies, from the same components.** Every
   screen exists in EN and FR, products and services (`&vocab=services`):
   372 renders measured. COPY.md gives all four columns for every string.
   What breaks in the services words, and what changed, is question 12.
7. **AA contrast; 390, and 320 with no horizontal scroll.** Every pair the
   new parts draw passes AA (table below). The measuring script renders
   every screen at 1280, 390 and 320, in both languages and vocabularies:
   **0 issues in 372 renders** (no horizontal scroll, no target under 44px,
   no overlapping targets, no script error).

**And the constraints that held 07 and 09.** Tokens only: the new tokens
are measures (`tokens/marketplace.css`), no new colour — the two sides share
every colour, so only their words tell them apart. The system first (list
above). 44px targets, none overlapping (measured). Red's three meanings:
the primary (Prépare tes slides), the diagnosis (the leak), the advice (the
backup line's dashed edge) — nothing else. One loud thing per screen: one
raised card (the side's funnel) and one primary, measured on every board
state (the stacked counterfactual has two raised cards: one reason not to
stack). Dashed means not yet: the "not enough targets" note, the "?"
boxes. No icons: → and ? only (and the disclosures' +/−). Local and
deterministic. The data model: see "What the design needs from the data".

---

## The answers

### 1. Where the total and the side selector sit; the first screen's controls

The hybrid's order, kept: **engine bar → TotalBand → next step →
« Côté affiché »**. The total is the marketplace's headline — its title is
the given sentence (« La place de marché rapporte 58 954 € par mois :
32 854 € de commissions, 26 100 € d'abonnements des vendeurs. ») and the
deck's first title — so it comes where self-serve puts its verdict: first,
then the next step that refers to it (« Le total, ci-dessus, est le titre
de ta première slide. »). The selector opens the side's part, under a solid
rule.

**The first screen holds today's controls** — at 1280: Réglages, the engine
menu, the primary, Enregistrer (.json): 4, as self-serve today; the
selector starts at 884px, just under the fold, so it adds none. At 390:
Settings, the engine menu, and the next step; the primary's bottom edge
sits at 851px in English (partly in the 844px screen) and 900px in French —
below self-serve today (788px), above the hybrid today (1,091px). We moved
the one "?" the band had (net revenue) into demand's money to keep the
first screen at today's count. If the primary must be fully on the phone's
first screen, the only lever left is to put the next step above the band;
we do not recommend it — the total would lose its place as the title the
next step points to.

Without the subscriptions there is no band (one stream is not a sum): the
selector then sits on the first screen (6 controls: the 4, and its two
options) — the one state where it does.

### 2. What is shared, what belongs to a side; whose next step

**Shared, above the selector**: the engine bar, the total, the next step.
**A side's, under it**: its verdict (the funnel's sentence, in ink: its
stressed words bold, never red), its diagnosis, its money, its "What if?"
(card and panel), its funnel (the one raised card). **The numbers list is
shared** and comes after (question 9).

**Whose next step — our recommendation differs from the brief's**: we
recommend **a shared next step, above the selector**, not the shown
side's. Why:

- The next step is the engine's one action (type the next number, follow up
  an ask, prepare the slides, save): the deck is one deck, the file one
  file, the numbers one list. None of these is a side's.
- A side's next step would have to sit under the selector, which pushes the
  primary below it and puts the selector on the first screen: four
  controls instead of three on a phone, five instead of four at 1280.
- If it followed the selector, toggling the side would change *the* action
  of the screen — and, since the selector starts on demand, demand's action
  would be everyone's first: a quiet ranking of the sides.
- When the action is about one side's number, the step names the side in
  its words (« Prochain chiffre côté vendeurs : … ») and opens the number;
  the selector does not move. `nextStepFor` picks by the journey's order,
  never by the sides' figures.

The selector starts on demand, as the brief recommends (commissions exist in
every marketplace, subscriptions only when the box is ticked). **Antoine
decides**; the brief's version is a move of NextStep under SideShown and a
`side` argument to `nextStepFor`.

### 3. The demand funnel; the referred; the fill rate's place and kind

**SideFunnel, not a Peloton with two columns** (and not a Peloton at all:
it is not in the synced system). It keeps the peloton's grammar whole — 100
dots, columns counted on the same 100, the referred as rings (8, DotGrid
`referred`), the upstream line (« ~2 000 visiteurs par mois pour 100
inscrits · GA4 · août 2026 »), the cohort note, the legend — and adds what a
side needs: a second base, rates, an aside.

**The fill rate lives in the demand funnel, on its own base**: after a rule,
under its own heading, « Liquidité · sur 100 recherches ? », a column of 100
searches with 9 filled, and the given sentence under it (« Taux de service :
9 % des recherches aboutissent à une commande »). A search is not a person,
so it is never a fourth column of the sign-ups; the note says it (« une
autre base, pas les mêmes personnes »). **Its kind is the heading's and the
sentence's word**: « recherches » or « demandes envoyées » (see question
12 for why not « demandes »). It is a demand stage — in the diagnosis
(Activation), the list (tagged « Liquidité »), the panel's levers — and, in
the example, the leak: red dots and « Sous la cible ». Supply points to it
when it has no money of its own (question 11).

### 4. The supply funnel; the two churns; one column without subscriptions

Three columns on the same 100 seller sign-ups: the 100, « Première vente
sous 60 jours » (30), « Abonnés sous 90 jours » (15, the leak in the
example). **The two churns are monthly rates, not columns**: a line under
the columns, « Chaque mois — Vendeurs actifs qui partent 3 % · Vendeurs
payants qui résilient 3 % · cible 2,5 % ». Dots counted on 100 sign-ups
would claim they are the same people over the same time; they are not. A
rate the diagnosis named would take the diagnosis edge (`holds`).

**Without the subscriptions**: the 100 and the first sale, at the left (a
column never grows past the peloton's width: no two lonely grids spread
across the card), the seller churn alone in the rates, and one line: « Leur
travail se lit dans le taux de service, côté demande : 9 % des recherches
aboutissent à une commande. »

### 5. Supply's headline numbers (★): should it have any, and which?

**Yes — we recommend three, one per stage where supply has a number of its
own**: **first sale** (Activation), **monthly seller churn** (Retention),
and, with the subscriptions, **subscription conversion** (Revenue). Why
these: they are the three the supply funnel draws (a column, the rates, a
column); each is in the marketplace's own back office (no finance ask, no
tool to buy) — the "five minutes" test the ★ stands for; and they are the
three stages a supply diagnosis can name. Not the cost per active seller
(a finance number, an hour at least), not the paid seller churn (the
seller churn is its parent and exists without the subscriptions), not the
price or the margin (known by heart, or asked).

This is a data-model change (a ★ on three number definitions, and the
start card's plan line: "19 numbers: 8 in five minutes…") — **Antoine's
decision**. In `fixture.js` the three carry `star: "proposed"`.

### 6. Each side's money; the cost of a paid seller explained

MoneyBlock, unchanged, by props; once per surface with the band above.

- **Demand** — figures: « Revenu net annualisé ? » (394 243 €; the "?"
  teaches net revenue) and « Volume d'affaires (GMV) ? » (273 780 €); this
  month's net revenue is the band's (without the subscriptions it becomes
  MoneyBlock's first figure). « Ce que vaut un nouvel acheteur »: « Chaque
  nouvel acheteur coûte 30 € et rapporte ~32 € à 38 € de marge sur les
  commissions : ~2 € à 8 € de plus que ce qu'il coûte. », the bars (hatched
  to the high end: the margin is an estimate), the months line (« … en 20 à
  23 mois et reste ~25 mois : 2 à 5 mois de marge après le remboursement
  ? »). **What one active buyer brings** is the note, said as the product
  that makes it: « Un acheteur actif rapporte 2,34 € de revenu net par mois :
  0,25 commande × 78 € × 12 % de commission ? » (the take rate's "?").
  Cash: 18 000 € spent this month, ~180 000 € à 210 000 € tied up.
- **Supply** — figure: « MRR d'abonnement annualisé » (313 200 €). « Ce que
  vaut un nouveau vendeur payant »: 200 € against ~820 €, the bars, the
  months (8 months to pay back, ~33 months' stay). **The cost of a paid
  seller is explained** in the note, as its formula with the side's own
  numbers: « Le coût d'un vendeur payant est calculé : 100 € par vendeur
  actif × 30 % de première vente ÷ 15 % de conversion à l'abonnement = 200 €
  — un vendeur payant pour 2 actifs. » On its slide, the tile says
  « calculé : 100 € × 30 % ÷ 15 % ». It is never called a CAC (it is not
  typed). Cash: 12 000 €, ~49 000 €.

### 7. The total: TotalBand adapted or new; with the what-ifs

**TotalBand, unchanged, by props** — no delta. Its `engines` become the two
streams in the sum's order (« Commissions (revenu net) », « Abonnements des
vendeurs »), `total` « Total par mois », `title` the given sentence,
`totals` what adds up: « Total annualisé » (707 443 €), « Nouveau chaque
mois » (~3 100 €), « Dans 12 mois au rythme actuel » (~70 000 €).

**With the what-ifs** of either side, the band's last figure becomes « Dans
12 mois avec tes « Et si », des deux côtés » (~88 000 €) and its last line
gives today's pace (« Au rythme actuel : ~70 000 € dans 12 mois. Les « Et
si » des deux côtés s'additionnent ici, et seulement ici. »). The band is
the only place where both sides' what-ifs are known together, so the cards
carry no total line (the hybrid's card did — the marketplace makes the band
the one place).

**Not summed**: the cash tied up (the hybrid's band sums it). The brief's
total is the revenue streams; a summed cash would print one range that one
side's spend dominates, next to the other's — read as shares. Each side's
cash stays in its money. **Antoine decides** — adding it is one more
`totals` entry.

**Without the subscriptions**: no band. One stream is not a sum; the net
revenue is demand's MoneyBlock's first figure (`total-nosubs`).

### 8. "What if?" per side; the jump at month 1; the total's curve

**Each side has its own card and panel**, under the selector: LeverCard
with the lever of the stage its leak names (demand: the fill rate; supply:
the subscription conversion), its curve, its two 12-month figures
(« Revenu net dans 12 mois », « Annualisé, dans 12 mois »; supply: « MRR
d'abonnement dans 12 mois »), « Vois les 8 leviers » / « Vois les 3
leviers ». The panels list each side's levers only (8 and 3), its figures
by meaning (the stream, one unit, the cash), and, for several levers,
LeverSum's compounding (demand's three: +3 400 €, +4 500 €, +2 800 € each
alone; +11 000 € added up; +13 000 € together).

**The jump** (MrrCurve delta): when a money lever moved, a ring on the
what-if line at month 1, and a line under the plot with the same ring:
« Mois 1 : la commission passe à 13 % sur chaque commande dès le mois
prochain — ~2 700 € de revenu net en plus par mois sur les seuls acheteurs
d'aujourd'hui. » The steep first segment is explained where it is seen,
on the card and on the slide; without a money lever (supply's conversion)
nothing is added.

**The total's curve: nowhere, on purpose.** One line for two streams hides
which one moves; a stacked area shows their shares — a comparison. Its end
point is the band's « Dans 12 mois ».

### 9. The side tag in the numbers list

**Plain words, never a Tag**: a fixed column before the name, mono, small,
uppercase, muted — « ACHETEURS », « VENDEURS », « LIQUIDITÉ » (services:
« CLIENTS », « PRESTATAIRES »). In this list a Tag is a status (estimated,
asked, can't be found): a boxed side would read as one. No colour: colour
would set the sides apart as rivals. On a phone the side sits on its own
line above the name.

**The stage groups mix the sides** — one list by stage (C41), the brief's
table order within a stage. Splitting each stage by side would make two
lists in one. **The list is shared** and follows the side's part; **its one
red follows the side shown**: demand shown, Activation is flagged (the fill
rate); supply shown, Revenue (the conversion); supply without targets,
none. One red per screen, the shown side's — said under the title: « Les
deux côtés, une liste par étape. L'étape signalée est celle que nomme le
côté affiché. » A number's own screen (not redrawn here) keeps its layout;
we recommend it take the side's words and the same side line above its
title.

### 10. The deck's order; how a slide says its side; the total slide

**Order** (with the subscriptions): **№ 1 the total**, then **the buyers'
four** (№ 2 funnel, № 3 leak, № 4 "What if?", № 5 unit economics), then
**the sellers' four** (№ 6–9, the same), then the numbers and sources as
today. The total first because it is the marketplace's title and the only
slide about both — and it is a sum. Then one side after the other, never
interleaved (an interleaved deck would set demand's leak against supply's
on facing pages). Demand first, as the selector: a fixed order, never by
value. **Without the subscriptions**: no total slide; the buyers' four,
then the sellers' funnel alone (their leak waits for targets).

**How a slide says its side**: in ink, above its title, the side's given
title — « LA DEMANDE : LES ACHETEURS », « L'OFFRE : LES VENDEURS » — on
every slide of a side; the header line stays as it is (« Moteur de growth ·
août 2026 · données internes »). The title's own words carry it too:
« inscrits côté acheteurs », « revenu net » (demand), « MRR d'abonnement »
(supply).

**The total slide** is `SlideStreams`: a ledger read down — the commissions,
the sellers' subscriptions, the total under a solid rule — for this month,
new a month, in 12 months (and with our what-ifs when any moved). Under each
stream's name, where it is read on its own (« les acheteurs · slides 2 à
5 »). No bar, no share, no "+": the hybrid's two cards facing each other
with an arrow (screenshot 15) are exactly what C70 rules out.

The funnel slides use the given titles (« Sur 100 inscrits côté acheteurs,
20 passent une première commande et **5 en passent une deuxième**. »,
« Sur 100 vendeurs inscrits, 30 font une première vente et **15
s'abonnent**. ») and SideFunnel on the 1 920 canvas, the rates at the
columns' right, the legend on the upstream line.

### 11. Supply without subscriptions; "not enough targets": their look

It keeps the side's order and says each absence in a full sentence, with
the one thing that would change it (`SideNote`):

- the verdict: « Sur 100 vendeurs inscrits, **30 font une première
  vente**. »;
- **not enough targets** — `pending`: the system's dashed edge (not yet),
  never red: « Pas assez de cibles pour nommer ce qui freine les vendeurs —
  Côté vendeurs, une seule étape a une cible d'équipe : la première vente
  (40 % ; elle est à 30 %). C'est trop peu pour désigner l'étape qui les
  freine. » and « Fixer les cibles des vendeurs → »;
- **no money** — `absent`: in the money's place, under its own eyebrow
  (« L'argent · août 2026 »), no frame: « Les vendeurs ne paient pas :
  l'offre ne rapporte rien en direct », where the money is instead (the
  commissions, the fill rate), why there is no "What if?" either, and « Tes
  vendeurs paient un abonnement ? Coche-le dans les réglages »;
- the funnel card (raised, as on every board): two columns, the seller
  churn, the fill rate's line.

No "?" box (no figure to compute), no zero, no empty card, no red. The same
`pending` note serves any side whose diagnosis is "not enough targets".

### 12. The services vocabulary: what breaks, what changed

Every screen draws in services words (`&vocab=services`; the key ones:
`board-services`, `board-services-supply`, `slide-services-funnel`). **What
broke, and the fix:**

- **Word swaps don't work in French**: « passent une première commande »
  would become « passent une première réservation ». The verb changes with
  the noun (« faire une réservation »): every services string is written
  out in full in COPY.md, never built by substitution.
- **« Première vente » has no services word that isn't the clients'**:
  « première réservation » is the client's first booking. A provider's
  first is a job done: **« Première prestation sous {n} jours » / "First
  job within {n} days"**, « 30 réalisent une première prestation ».
- **« Demandes » collides with « Demande »**: a fill rate on requests,
  « sur 100 demandes », sits right under « Côté affiché : Demande ».
  **« Demandes envoyées » / "requests sent"** names a request.
- **« Panier moyen »** is a shopping word: **« Montant moyen d'une
  réservation » / "Average booking value"**.
- **"Gross merchandise value"**: **"Gross booking value (GMV)"** in English;
  « Volume d'affaires (GMV) » fits both in French.
- **Longer words** (« Prestataires », « Première réservation sous 30
  jours » on three lines): the list's side column is sized for the longest
  (9.5em), the funnel's column heads have one height for one to three
  lines, so the grids start on one line. Nothing else breaks at 320
  (measured in both vocabularies).

The side selector's options stay « Demande » / « Offre » in both.

### 13. New words taught (C72): where, with the engine's "?"

The engine's "?" (EngineTerm), one definition open at a time, its text in
COPY.md (`term.*`, in both vocabularies):

| Word | Where its "?" sits | Screen to see it open |
|---|---|---|
| **GMV** (« Volume d'affaires (GMV) ») | demand's money, the GMV figure's label | `term-gmv` |
| **Take rate** (« Taux de commission ») | demand's money, the note on what one active buyer brings | `term-take` |
| **Liquidity** (« Liquidité ») | the demand funnel's base heading, « Liquidité · sur 100 recherches ? » | `term-liquidity` |
| **Net revenue** (« Revenu net ») — *proposed, beyond C72* | demand's money, « Revenu net annualisé ? » (not in the band: the first screen keeps today's controls) | `term-net` |

The two money words the board already teaches (« Trésorerie immobilisée »,
« Mois après remboursement ») have their definitions rewritten in side
words: "customers" become buyers and paid sellers, and "contraction" —
which a marketplace does not have — goes.

---

## Decisions for Antoine

1. **The next step: shared, above the selector** (we recommend), or the
   shown side's (the brief's) — question 2.
2. **Supply's ★: first sale, seller churn, subscription conversion** — a
   data-model change — question 5.
3. **The cash tied up: not summed in the band** (we recommend), or summed
   as the hybrid does — question 7.
4. **The leak's amount: « ~470 € »** (the engine's rule for a projection:
   two significant digits and ~, as the self-serve leak's « ~600 € ») or
   « 468 € » (the given copy) — COPY.md, `diag.worth.demand`.
5. **« Demandes envoyées »** for a fill rate on requests — question 12.
6. **The list's red follows the side shown** — question 9.
7. **No total curve** — question 8.
8. **The deck's order**: total, the buyers' four, the sellers' four —
   question 10.

## What the design needs from the data

Nothing new for the screens, **except** supply's ★ if Antoine takes
question 5. It reads what §22 already holds: each number's side (the
brief's table), the fill rate's kind (requests or searches), the windows,
the "Sellers pay a subscription" box, the team targets. One check for
MKT-7: the side of each number must be available to NumberList's rows
(`row.side`); if the definitions don't carry it yet, it is a field.

---

## The density — before and after

Measured the way returns 07 and 09 measured: Playwright on the board's own
screens, CSS pixels, viewports 1280 × 900 and 390 × 844; a control is
visible, focusable and not inside a closed disclosure; a block is a direct
child of the tool. **Before** is the engine today: the board heights from
brief 10's screenshots of the production build (03, 04), the blocks counted
on them (03: the engine bar, the verdict, the next step, the diagnosis, the
money, "Et si ?", the peloton, the list, the Tour, the table entry; 04: the
same, and the band and the selector), the control counts from return 09's
measures of the same boards (as ported). The board here does not draw the
table entry (unchanged): its block counts below include it, +1. **After** is this
board (`measures.js`); **stacked** is the counterfactual the selector
avoids: both sides on one board (`measure-stacked`).

| | Self-serve today | Hybrid today | **Marketplace, demand shown** | Supply shown | Supply, no subscriptions | Both sides stacked |
|---|---|---|---|---|---|---|
| Board height, FR 1280 | 4,296 px | 4,692 px | **4,871 px** | 4,940 px | 3,416 px | 7,310 px |
| Board height, EN 390 | 5,059 px | 5,654 px | **5,861 px** | 5,804 px | 3,749 px | 8,603 px |
| Blocks | 10 | 12 | **12** | 12 | 10 | 18 |
| Controls | 26 | 27 | **34** | 30 | 23 | 36 |
| First screen, 1280 | 4 | 3 | **4** | 4 | 6 | 4 |
| First screen, 390 (EN) | 3 | 2 | **3** (the primary at its edge) | 3 | 6 | 3 |
| Raised cards / primaries | 1 / 1 | 1 / 1 | **1 / 1** | 1 / 1 | 1 / 1 | 2 / 1 |

Reading it:

- **A marketplace board is a hybrid board**, not two boards: 12 blocks like
  the hybrid's, +179px at 1280 over it (+4 %) and +207px on a phone. The
  stacked board would be 50 % taller (7,310 against 4,871px), 18 blocks, and
  two raised cards — the selector saves 2,439px at 1280 and 2,742px on a
  phone.
- **The 34 controls**: self-serve's 26, + the selector's 2 options, + 2
  numbers in the list (19 against 17), + 4 "?" for the words the marketplace
  must teach (GMV, take rate, liquidity — C72 — and net revenue, proposed).
  Dropping the proposed "?" gives 33. Supply shown: 30 (3 levers, no GMV).
- In the services words the boards are within 60px of the products ones
  (longer labels); every number above is in `measures.js`, per language,
  width and vocabulary.

## The contrast, measured

From the live primitives (`contrast.mjs`), translucent colours composed on
their ground. The marketplace adds no colour: these are the live system's
pairs, where the new parts put them.

| Kind | Pair | Foreground | Ground | Ratio | Needs |
|---|---|---|---|---|---|
| Text | SideShown: label, side title | --ink-0 | --paper-1 | 12.97:1 | 4.5:1 ✓ |
| Text | SideShown: the note | --ink-1 | --paper-1 | 5.81:1 | 4.5:1 ✓ |
| Text | Segmented: the side shown | --paper-0 | --ink-0 | 16.06:1 | 4.5:1 ✓ |
| Text | Segmented: the other side | --ink-1 | --paper-0 | 7.20:1 | 4.5:1 ✓ |
| Text | SideFunnel: figures, labels, base line, rates | --ink-0 | --paper-0 | 16.06:1 | 4.5:1 ✓ |
| Text | SideFunnel: sources, base heading, rate labels | --ink-1 | --paper-0 | 7.20:1 | 4.5:1 ✓ |
| Text | SideFunnel: the leak's tag (bold caps) | --paper-0 | --paint-red-action | 4.65:1 | 4.5:1 ✓ |
| Text | SideNote: title and body | --ink-0 | --paper-1 | 12.97:1 | 4.5:1 ✓ |
| Text | NumberList delta: the side, the lead | --ink-1 | --paper-1 | 5.81:1 | 4.5:1 ✓ |
| Text | MrrCurve delta: the jump's note | --ink-0 | --paper-1 | 12.97:1 | 4.5:1 ✓ |
| Text | SlideStreams: figures and names | --ink-0 | --paper-1 | 12.97:1 | 4.5:1 ✓ |
| Text | SlideStreams: heads, sides, note | --ink-1 | --paper-1 | 5.81:1 | 4.5:1 ✓ |
| Text | Slides: the side's line above the title | --ink-0 | --paper-1 | 12.97:1 | 4.5:1 ✓ |
| Text | The diagnosis' stage (30px display) | --paint-red | --paper-1 | 3.57:1 | 3:1 ✓ (large) |
| Text | The diagnosis' eyebrow | --paint-red-deep | --paper-1 | 5.42:1 | 4.5:1 ✓ |
| Mark | SideFunnel: the leak's dots | --paint-red | --paper-0 | 4.42:1 | 3:1 ✓ |
| Mark | SideFunnel: measured dots, referred rings | --ink-0 | --paper-0 | 16.06:1 | 3:1 ✓ |
| Mark | SideFunnel: empty dots | --ink-1 | --paper-0 | 7.20:1 | 3:1 ✓ |
| Mark | SideShown: the opening rule | --ink-0 | --paper-1 | 12.97:1 | 3:1 ✓ |
| Mark | SideNote pending: the dashed edge | --ink-1 | --paper-1 | 5.81:1 | 3:1 ✓ |
| Mark | MrrCurve delta: the jump's ring, on the gain wash | --ink-0 | ink-0 14 % on paper-1 | 9.84:1 | 3:1 ✓ |
| Mark | SlideStreams: the total's rule | --ink-0 | --paper-1 | 12.97:1 | 3:1 ✓ |
| Mark | NumberList: the leak stage's edge | --paint-red | --paper-1 | 3.57:1 | 3:1 ✓ |

The dashed dividers (1.55:1) are decoration, never the only carrier of
information: the funnel's liquidity base, which a divider sets off, also
has its own heading.

---

## Notes for the port

- **The model**: `market.js` is a board replica of §22.5, written to check
  the screens, not to be ported: `node board/market-check.mjs` reproduces
  every figure of the brief's table (net revenue in 12 months 33 723,61 €,
  46 351,72 € with the what-ifs; subscription MRR 35 866,43 €, 41 785,48 €;
  the total 58 953,60 €, 707 443,20 €, 3 144 €, 69 590,04 €, 88 137,19 €;
  the leaks 468 €, 351 €, 580 €, 130,50 €; the units, the cash).
- **The stand-ins** (`board/sys/`, `board/app.js`) draw the live markup and
  class names so that the live CSS (`system-snapshot.css`, the synced
  `_ds_bundle.css`) draws them. They are not ported. The slides' frame and
  the bodies of the leak, "What if?" and unit-economics slides are drawn on
  the live deck's 1 920 × 1 080 canvas with the slide type tokens; they
  stand for the app's own and change only their words per side (COPY.md).
- **PaybackChart**: unchanged. On the buyer's numbers the payback (20–23
  months) and the departure (~25 months) fall close; the board's stand-in
  writes the departure after its dot — the live chart's own placement
  should be checked on these numbers.
- **Given copy, used as written**, with two exceptions said in COPY.md: the
  leak's amount printed with the engine's rule (« ~470 € »), and the stressed
  words (\*\*…\*\*) drawn in bold ink.
