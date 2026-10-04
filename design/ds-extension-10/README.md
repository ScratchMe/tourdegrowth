# Brief 10 — the marketplace · the screens it will reuse

*Tour de Growth · the codebase · 2026-10-04 · `CHANTIERS.md` A23, unit MKT-B*

The screenshots that [`../DS-EXTENSION-BRIEF-10.md`](../DS-EXTENSION-BRIEF-10.md) lists
under "The screenshots", twenty-two files, taken by `scripts/engine-density.capture.ts`
(the tests named "brief 10"). No marketplace screen exists yet: these are the screens a
marketplace will reuse or replace.

**How they were taken**

- A production build of commit `f5952fe` (the tip of `main` when the unit started; the
  unit changes nothing in the app), built with `ENGINE_ENABLED=true GAME_ENABLED=true`
  and served by `next start` with the same variables, so the engine is open at runtime.
- The browser clock fixed on 24 September 2026, 12:00: "August 2026" is the month of the
  figures and "July 2026" the cohort, as in the briefs 07 and 09.
- 2× pixels (a 1,040 px wide board is a 2,080 px wide file), the sticky header released.
  French at 1280 px, English at 390 px, as the brief asks.
- Each file is the box of one element: the page around it is not in the picture.
- The data is the page's own example (`exampleState()`, spec §6.0: a B2B SaaS, self-serve,
  with its team targets) for the self-serve screens, and the §18.9 hybrid (`hybridState()`)
  for the hybrid and for sales-assisted. For 08 and 14, two levers are moved on the
  example: the activation rate (18 → 24 %) and the monthly logo churn (2.5 → 1.5 %).

To take them again:

```sh
ENGINE_ENABLED=true GAME_ENABLED=true npm run build
ENGINE_ENABLED=true GAME_ENABLED=true npx next start -p 3000 &
OUT=design/ds-extension-10 npx playwright test --config scripts/engine-density.config.ts --grep "brief 10"
```

| File | What it shows |
|---|---|
| `01-start-card-fr-desktop`, `01-start-card-en-mobile` | The start card of a first visit: "How do you sell?" (self-serve, sales-assisted, both), the plan in one line (17 numbers: 5 in five minutes, 7 about an hour each, 5 from someone else), the defaults line ("Set for a B2B SaaS, in euros…") with its "Change" link, "Start", "See a filled-in example", "Import a file". It does not ask for the type: B2B SaaS is the only one it offers, and the type list is on the setup card (02). |
| `02-setup-types-fr-desktop` | The setup card, opened by "Change" (French): "Ton type d'entreprise" lists "SaaS B2B" (chosen), then "App grand public" and "Place de marché", dashed, each with "Plus tard : leur funnel n'a pas la même forme."; under it the motions, the windows, the month and cohort, the currency, the name, the tools. |
| `03-board-full-fr-desktop`, `03-board-full-en-mobile` | The whole board on the public example (self-serve): the engine bar, the verdict, the next step, the stage that holds the engine back (activation, against the team's 20 % target), the money, "Et si ?" (one lever, its 12-month curve, the fold of all the levers), the peloton card, "Your numbers", the Tour link, the table entry. |
| `04-hybrid-board-fr-desktop`, `04-hybrid-board-en-mobile` | The whole board of the hybrid: the total band ("Deux moteurs, un total", MRR of each engine and the total), the next step, the "Engine shown" selector with self-serve shown, then that one engine's diagnosis, money, "Et si ?", peloton and list. The pattern the side selector follows. |
| `05-peloton-fr-desktop`, `05-peloton-en-mobile` | The peloton card, the board's one raised card: the upstream line, four columns (the 100 sign-ups and three stages counted on those same 100: activated, active at day 30, paying), the referred dots, the "?" box of a number not measured, the legend. |
| `06-relays-fr-desktop` | The card sales-assisted draws in the hybrid (second button of the selector): the relays, three bases of 100 that are not the same people (MQL, closed opportunities, new customers), a stage marked "Sous la cible", a "?" box, and under them the open-pipeline band ("Couverture du pipeline"). A funnel that is not a peloton. |
| `07-money-fr-desktop`, `07-money-en-mobile` | The money block on the example: MRR and ARR, what one new customer is worth (cost against what it brings back, with its range), the cash (spent this month, tied up at this pace) and its note. |
| `08-whatif-panel-fr-desktop`, `08-whatif-panel-en-mobile` | The full "Et si ?" panel with two levers moved: the levers, "your growth numbers" in three tables (today, with the what-ifs, the gap), what each lever brings alone and together (the compounding), the month's funnel with the what-ifs, and the fold "what the calculation assumes". |
| `09-numbers-list-fr-desktop`, `09-numbers-list-en-mobile` | "Your numbers", one list by stage: the progress line, the legend, each stage with its numbers and their status (found, estimated, asked, can't be found), the stage that holds back flagged. |
| `10-metric-sheet-fr-desktop` | A number's own screen (the activation rate): definition, formula, the trap, where to find it, the counts to type, the source, where the number sits (the reference range and the team target of the self-serve SaaS), "Enregistre et vois ton moteur". |
| `11-slide-peloton-fr-desktop` | The self-serve peloton slide (the deck's first): the verdict as the title, the four columns, the legend. |
| `12-slide-leak-fr-desktop` | The self-serve leak slide: "what bringing the activation to 20 % would be worth", the calculation, the other stages aside. |
| `13-slide-unit-economics-fr-desktop` | The self-serve unit-economics slide: the figures (CAC, LTV, LTV:CAC, payback, months after payback, cash tied up) and the payback chart. |
| `14-slide-whatif-fr-desktop` | One what-if slide (the churn lever, 2.5 → 1.5 %): the 12-month curve and the growth figures, today against with the what-if. |
| `15-slide-total-fr-desktop` | The hybrid's total slide: the MRR of each engine, the link between them, the sums. |

Slides are drawn at 460 × 260 CSS px in the page (920 × 520 files).
