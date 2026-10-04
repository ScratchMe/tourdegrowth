# Design system extension brief 10 — the marketplace

*Tour de Growth · from the codebase to Claude Design · written 2026-10-04,
deposited by unit MKT-B (`docs/engine/place-de-marche.md` §22.7), launched by
Antoine*

## The constraints, first

These come before everything else in this brief. A design that breaks one
of them cannot be ported, however good it looks.

1. **Never supply against demand** (decision C70). A marketplace has two
   sides, and each has its own diagnosis, its own "What if?", its own unit
   economics. They are **never compared, never ranked, never put face to
   face**: no "which side first", no "supply vs demand", no chart with both
   sides on one axis, no slide that sets them side by side. One side is
   shown at a time, under a selector, exactly like the hybrid SaaS's
   "Engine shown". The only thing that joins them is a **sum**: "two
   streams, one total" (commissions + seller subscriptions), never a
   comparison.
2. **Never red for a projection** (design audit S-5), never red for a loss
   (C48): ink. Red is the leak only: the stage a team target names ("Holds
   you back"), one per side.
3. **No reference at all** (C73). The marketplace has no published
   benchmark: no range, no "commonly cited", nothing that situates. Only a
   team target names a stage.
4. **A figure that cannot be computed prints "?", never 0**, and says what
   is missing. An unknown has its own shape (the hatched, dashed "?" box).
5. **No margin, no LTV and no payback.** Each stream has its own margin
   (commissions, seller subscriptions); one is never used for the other.
6. **French and English, from the same component.** And **two vocabularies**
   (C65): "products" (buyers, sellers, orders, listings) and "services"
   (clients, providers, bookings, profiles). The same screens, other words:
   a design that only fits the shorter words is not done.
7. **AA contrast**, checked by our CI with no exception; **390px**, and from
   320px with no horizontal scroll.

And the constraints that held briefs 07 and 09, unchanged: tokens only (a
new value is a new token); the system first (Button, Card, Callout,
StatTile, DataTable, Disclosure, Tag, MetaLabel, GlossaryTerm, BulletChart,
DotGrid, Segmented, and the engine's components: `Peloton`, `TotalBand`,
`LeverCard`, `NextStep`, `PaybackChart`, `WhatIfFigures`… — synced into
this project on 2026-10-04); 44px targets, none overlapping; **red means one
of three things** (solid red fill = the primary; red wash or solid red edge
= a diagnosis; dashed red = advice); **one loud thing per screen** (one
raised card, one primary); dashed means "not yet"; no icons (→ ← № ? and a
disclosure's +/−); local and deterministic (no account, no server, no AI);
the data model changes only by a decision with Antoine (say so in the
README if a design needs a field).

**And do not bring the density back.** Return 07 took the board from 12
blocks and 75 controls to 8 and 27; return 09 put the money on it without
undoing that. A marketplace has two sides: that must not mean two boards
stacked. Measure the way returns 07 and 09 measured.

---

## Why this brief

The engine reads a B2B SaaS (self-serve, sales-assisted, or both) and, from
A22, a consumer app. The third business type is the **marketplace** (A23).
Its model is specified and decided (`ENGINE.md` §22, decisions C64 to C74
and C93, all taken on 2026-10-04), and its pure model is coded and tested.
Antoine decided (C71) that **its screens and slides come from you** before
anything is ported: the model, the settings and the copy go ahead without
you; the board, the two funnels, the liquidity, the total and the slides
wait for your return.

## What the engine is, in one paragraph

A free tool, local to the browser, for a growth PM or a founder. They type
their own funnel numbers by hand, and the engine gives back a verdict, the
stage that holds it back (only against a team target), the funnel as 100
sign-ups (the "peloton"), the money (MRR, ARR, what one customer is worth,
the cash an acquisition pace keeps tied up), "What if?" levers that move
together with a 12-month curve, and a deck of slides for a leadership
meeting or an investor. It is one journey: a start card, a "Targets"
screen, one screen per number, a requests screen, and a board (the engine
bar, the verdict, one next step; the money; the diagnosis; the peloton,
the one raised card; "Your numbers" as one list by stage; the "What if?"
lever card and its full panel). The screenshots below show it as it is.

## What a marketplace is, in the engine

Two sides, each earning its own way:

- **Demand, the buyers.** The marketplace keeps a **commission** (take rate)
  on every order. Its revenue is the **net revenue**: GMV × take rate =
  active buyers × what one active buyer brings a month (order frequency ×
  average order value × take rate). An active buyer ordered in the last 12
  months. Net revenue is projected like an MRR: kept at (1 − buyer churn)
  each month, plus the month's new buyers.
- **Supply, the sellers.** If the team ticks **"Sellers pay a
  subscription"** (unticked by default), the sellers' subscriptions are an
  MRR: the month's seller sign-ups × the subscription conversion become new
  paid sellers; paid sellers leave at their churn. Without the box, supply
  earns nothing directly; it shows in the fill rate.
- **Liquidity** reads in one figure, the **fill rate**: the share of
  requests (or searches) that end in an order. It is a demand stage, priced
  on new buyers only, and the engine says that is a minimum.
- **Supply is priced only through its subscriptions** (C67): converting a
  seller and keeping a paid seller are worth money; the first sale and an
  active seller leaving are named, without an amount.

**19 numbers** with the subscriptions, **14** without:

| Side | Stage | Number |
|---|---|---|
| Buyers | acquisition | buyer sign-up rate ★, buyer CAC |
| Sellers | acquisition | cost per active seller, seller sign-up rate (subscriptions) |
| Buyers | activation | first order ★ (within 7, 30 or 90 days) |
| Sellers | activation | first sale (within 30, 60 or 90 days) |
| Liquidity | activation | fill rate (requests or searches) |
| Buyers | retention | second order ★ (within 60, 90 or 180 days), monthly buyer churn |
| Sellers | retention | monthly seller churn, monthly paid seller churn (subscriptions) |
| Buyers | referral | referred share ★ |
| Liquidity | revenue | take rate ★, margin on net revenue |
| Buyers | revenue | average order value, order frequency |
| Sellers | revenue | subscription conversion, revenue per paid seller, margin on seller subscriptions (all three: subscriptions) |

★: the stage's headline number on the demand side. Supply has none yet:
**tell us whether it should, and which.**

## What the model computes, per side

Everything is computed today and with the what-ifs, in ranges (an estimate
stays a range at every step). The spec is `docs/engine/place-de-marche.md`
§22.5.

| Figure | Demand | Supply (with subscriptions) |
|---|---|---|
| This month | net revenue R (and its GMV) | subscription MRR S |
| Annualised | R × 12 | S × 12 |
| New a month | new buyers × what one active buyer brings | new paid sellers × subscription price |
| In 12 months, and the 13-point curve | the MRR loop on net revenue | the MRR loop on subscriptions |
| What one unit is worth | a buyer: LTV, CAC, payback, LTV:CAC, the loss finding, the months after payback | a paid seller: the same five, with the cost of a paid seller = cost per active seller × first sale ÷ subscription conversion |
| The cash | the month's spend, the cash tied up (a floor) | the same, on paid sellers |
| The diagnosis | its own leak, named only against a team target, priced in net revenue | its own leak, priced in subscription MRR (the first sale named, unpriced) |
| The funnel | 100 buyer sign-ups: first order, second order; the referred; the fill rate | 100 seller sign-ups: first sale, subscribed; the two churns |
| "What if?" levers | sign-up rate, referred share, first order, fill rate, buyer churn, order frequency, average order value, take rate | subscription conversion, paid seller churn, subscription price |
| **The total** | net revenue + subscription MRR, this month, new a month, in 12 months, today and with the what-ifs of both sides: **a sum, never a comparison** | |

### The numbers on the screenshots you will draw

Use **the example of §22.10** (a second-hand furniture marketplace, in
euros, figures of August 2026, cohort of May, today 24 September 2026). The
engine prints projected amounts at two significant digits with "~".

| | Demand | Supply |
|---|---|---|
| Funnel | ~2,000 visitors for 100 sign-ups; 8 referred; first order 20, second order 5; fill rate 9 % (searches) | ~2,000 seller page visitors for 100 seller sign-ups; first sale 30, subscribed 15; seller churn 3 %, paid seller churn 3 % |
| This month / annualised | net revenue €32,853.60 / €394,243.20; GMV €273,780 | subscription MRR €26,100 / €313,200 |
| New a month | €1,404 (600 new buyers × €2.34) | €1,740 (60 new paid sellers × €29) |
| In 12 months | €33,723.61 | €35,866.43 |
| The leak (team targets) | **fill rate** holds it back: 9 % for a target of 12 %, worth €468 of new net revenue a month (first order, 20 % for 25 %, is worth €351) | **subscription conversion** holds it back: 15 % for 20 %, worth €580 of new subscription MRR a month (paid seller churn, 3 % for 2.5 %, €130.50); the first sale, 30 % for 40 %, is named, unpriced |
| One unit | a buyer: CAC €30, LTV €32.17 to €38.03 (the commissions' margin is an estimate, 55 to 65 %), payback 19.7 to 23.3 months, LTV:CAC 1.07 to 1.27 | a paid seller: cost €200, LTV €821.67, payback 8.1 months, LTV:CAC 4.11 |
| The cash | €18,000 a month, ~€180,000 to €210,000 tied up | €12,000 a month, ~€49,000 tied up |
| "What if?" | fill rate 12 %, first order 25 %, take rate 13 %: €46,351.72 in 12 months (+€12,628.11) | subscription conversion 20 %: €41,785.48 in 12 months (+€5,919.05) |

**The total**: €58,953.60 this month (€707,443.20 annualised), €3,144 new a
month, €69,590.04 in 12 months; with the what-ifs of both sides,
€88,137.19.

**Without the subscriptions**: supply has no money and one funnel column
(first sale 30); its diagnosis is "not enough targets" (only the first sale
has one); the total is the net revenue alone.

## The words we already have

The copy below is written (spec §22.8.5) and will be reviewed by Antoine
(the bon à tirer). Use it; if a design needs other words, put them in
`COPY.md` and say why.

- The side selector: « Côté affiché » / "Side shown", « Demande » /
  "Demand", « Offre » / "Supply". The two titles: « La demande : les
  acheteurs » / "Demand: the buyers", « L'offre : les vendeurs » / "Supply:
  the sellers". A number's side tag in the list: « Acheteurs », « Vendeurs »,
  « Liquidité » / "Buyers", "Sellers", "Liquidity".
- The funnels' columns: « Première commande sous {n} jours », « Deuxième
  commande sous {n} jours », « Première vente sous {n} jours », « Abonnés
  sous {n} jours » / "First order within {n} days"… The fill rate: « Taux
  de service : {fill} des recherches aboutissent à une commande ».
- The slide titles: « Sur 100 inscrits côté acheteurs, 20 passent une
  première commande et **5 en passent une deuxième**. » / "Out of 100 buyer
  sign-ups, 20 place a first order and **5 place a second one**." ;
  « Sur 100 vendeurs inscrits, 30 font une première vente et **15
  s'abonnent**. » ; « La place de marché rapporte **{total}** par mois :
  {demand} de commissions, {supply} d'abonnements des vendeurs. »
- The generic screens (the leak, the money, "What if?", the unit economics)
  keep their components and change their words per side: on demand,
  "customer" reads "buyer" and "MRR" reads "net revenue"; on supply,
  "customer" reads "paid seller" and "MRR" reads "subscription MRR"
  (« Ramener le taux de service à 12 % vaudrait **468 € de revenu net
  nouveau** chaque mois. »).
- The total band: « Deux flux, un total » / "Two streams, one total",
  « Commissions (revenu net) », « Abonnements des vendeurs », « Total par
  mois ».

---

## The screenshots

In `design/ds-extension-10/`, from a real production build, taken by
`scripts/engine-density.capture.ts` (tests "brief 10"), the browser clock
on 24 September 2026, 2×, the sticky header released. Each key screen in
**French at 1280px** and **English at 390px**. No marketplace screen exists
yet: these are the screens a marketplace will reuse or replace.

| File | What it shows |
|---|---|
| `01-start-card-{fr-desktop,en-mobile}` | The start card: the business types it offers today |
| `02-setup-types-fr-desktop` | The setup card: the type list, « Place de marché » greyed (« Plus tard ») |
| `03-board-full-{…}` | The board on the public example (self-serve): the money, the diagnosis, the peloton, the list, the lever card |
| `04-hybrid-board-{…}` | The hybrid: `TotalBand`, the "Engine shown" selector, one engine shown — the pattern the side selector follows |
| `05-peloton-{…}` | The peloton card: three columns on the same 100 sign-ups, the referred dots, the upstream line |
| `06-relays-fr-desktop` | Sales-assisted's relays: a funnel that is not a peloton (three bases of 100) |
| `07-money-{…}` | The money block: MRR, ARR, what one customer is worth, the cash |
| `08-whatif-panel-{…}` | The full "What if?" panel, two levers moved: the curve, the figures, the compounding |
| `09-numbers-list-{…}` | "Your numbers", one list by stage |
| `10-metric-sheet-fr-desktop` | A number's own screen |
| `11-slide-peloton-fr-desktop`, `12-slide-leak-fr-desktop`, `13-slide-unit-economics-fr-desktop`, `14-slide-whatif-fr-desktop` | The self-serve slides a side will reuse |
| `15-slide-total-fr-desktop` | The hybrid's total slide |

## What we ask

### 1. The board of a marketplace

- Where do **the total** and **the side selector** sit, and what does the
  first screen hold (it has three controls today)?
- For one side shown: its diagnosis, its money, its "What if?", its funnel,
  in the self-serve reading order (C54). What stays shared above the
  selector (the engine bar, the verdict, the next step, the total), and what
  belongs to a side?
- **The next step** names one action: with two sides, whose? (Our
  recommendation: the shown side's, and the selector starts on demand.)
- **Supply without subscriptions**: no money, one funnel column, often "not
  enough targets". It must not look broken or empty.

### 2. The two funnels, and liquidity

- **Demand**: two columns on the same 100 buyer sign-ups (first order,
  second order), the referred dots, the upstream line. A `Peloton` with two
  columns, or something else?
- **Supply**: first sale and subscribed on the same 100 seller sign-ups,
  and two churns (active sellers, paid sellers) that are monthly rates, not
  columns. One column without subscriptions.
- **The fill rate** is a demand stage but reads both sides (« Liquidité »):
  where does it live, and how does it show its kind (requests or searches)?

### 3. The money of each side, and the total

- Demand: net revenue (not "MRR"), its annualised value, the GMV, what one
  active buyer brings, what one buyer is worth. Supply: subscription MRR,
  annualised, what one paid seller is worth, **with the cost of a paid
  seller explained** (it is derived: cost per active seller × first sale ÷
  subscription conversion).
- The total: `TotalBand` adapted ("two streams, one total"), or a new
  band? Today, new a month, in 12 months, with the what-ifs of both sides.

### 4. "What if?" per side

- Each side's lever card and panel, with its curve. The demand's money
  levers (frequency, order value, take rate) apply to every buyer from the
  next month; the supply's price applies to every paid seller: the curve
  jumps at month 1. How does that read?
- Does the total's curve (both sides' what-ifs) appear anywhere?

### 5. The numbers list and a number's screen

- One list by stage (C41) with a side tag on each row: the tag's form, and
  whether the stage groups split by side or mix.

### 6. The slides

- The deck of a marketplace: per side, the funnel, the leak, the what-ifs,
  the unit economics; the total slide when sellers pay. **In what order**,
  and how does a reader know which side a slide is about, **without any
  slide facing the sides**?
- The supply funnel slide, and the demand funnel slide (titles above).

### 7. The two vocabularies

- Show at least the board and one slide in "services" words (clients,
  providers, bookings, profiles), in French: « Sur 100 inscrits côté clients,
  20 font une première réservation… ». Anything that breaks?

## Questions

Answer each, numbered, in the README.

1. Where the total and the side selector sit; the first screen's controls.
2. What is shared above the selector, what belongs to a side; whose next
   step.
3. The demand funnel's form; the referred; the fill rate's place and kind.
4. The supply funnel's form; the two churns; one column without
   subscriptions.
5. Supply's headline numbers (★): should it have any, and which?
6. Each side's money block; the cost of a paid seller explained.
7. The total: `TotalBand` adapted or new; what it shows with the what-ifs.
8. "What if?" per side; the jump at month 1; the total's curve or not.
9. The side tag in the numbers list.
10. The deck's order; how a slide says its side; the total slide.
11. Supply without subscriptions, and a side whose diagnosis is "not enough
    targets": their look.
12. The services vocabulary: what breaks, what you changed.
13. Any new word the marketplace needs taught (GMV, take rate and liquidity
    get glossary terms, C72): where, with the engine's "?" definitions.

## The states we need

At **1280px in French and 390px in English** (the others in one language,
saying which):

- **the board**: the example, demand shown; the example, supply shown;
  without subscriptions, supply shown; the example in "services" words;
- **a side with unknowns**: the demand without the commissions' margin (its
  LTV, payback and cash "?");
- **"What if?"**: each side untouched and with the example's what-ifs;
- **the total**: with subscriptions, with the what-ifs; without
  subscriptions;
- **the slides**: each side's funnel, leak, a what-if, unit economics; the
  total slide; the deck's order as a strip.

## Both languages

"Tu" in French, "you" in English. Stage names stay in English on French
screens. French typography: a thin no-break space before `:`, `;`, `?`,
`!` and inside « »; figures grouped by a no-break space (`32 853,60 €`); the
euro after the figure in French, before it in English. The slides say
« on » / « nous » (they are presented to a meeting), never « tu ».

## What we need back

Under `design/ds-extension-10-return/`, the shape of returns 07 and 09, so
the port is mechanical:

- a `README.md`: what is in the bundle; an answer to each numbered
  question; the density measures, before and after; the constraints one by
  one; the contrast measured;
- **`INVENTORY.md`, where every figure goes**: each figure of "What the
  model computes, per side" and of the total, with its place on the board,
  in the card, in the panel, on each slide — or "not shown" and why;
- the screens: `board/index.html` and `board/board.html?screen=&lang=&w=`
  (`en`/`fr`, `390`/`1280`) with every state above, **openable from its
  own source in the folder**;
- for each new or changed piece: `components/engine/<Name>/` as React +
  `.d.ts` + `.prompt.md` + CSS; a `*.delta.md` for any synced component
  that changes, or a line saying none does; new tokens in `tokens/*.css`;
- **`COPY.md`**: every new or changed string, French and English side by
  side, in both vocabularies, with the screen it sits on. It goes to
  Antoine's review before anything ships.

Write nothing outside that folder.

## Handoff back

Write the return under `design/ds-extension-10-return/` in this project; we
copy it into the repo, file by file, at the same paths. Antoine answers the
questions it opens; the port (units MKT-7 and MKT-8, a PR per unit, the
marketplace still closed), the tests and the measures against the real
build are on our side.
