import { CashWarning } from "tour-de-growth";

/*
 * The long-payback warning (design system extension 09, Q5): « you make
 * money, but late — maybe after your cash runs out ». One sentence in the
 * advice's dashed edge, never the diagnosis's red; never drawn when the loss
 * is certain (a customer who leaves before paying back is the loss).
 *
 * The sentence is the product's own, never retyped: on the board
 * `moneyView(...).cash.warning` (app/[locale]/aarrr-funnel-template/
 * _engine/money-view.ts, « tu »), on the unit-economics slides the
 * `warning` row of `buildDeck` (lib/engine/deck.ts, « nous »), each run on
 * the engine's fixtures with the resolved copy. `maybe` is passed the way
 * `BoardMoney` and the slides pass it, from the same view.
 */

/**
 * On the board, in French: the film's SaaS with churn at 2 % and a CAC of 2 900 € (`late()` of
 * `e2e/engine-deck-unit.spec.ts`), paid back in 32 months, no loss. No runway typed in the
 * Settings, so the payback is held against the 30-month floor (C49) and the sentence says
 * where to type one. « Tu »: the screen speaks to the reader. `moneyView(...).cash.warning`,
 * placed by `BoardMoney` in MoneyBlock's cash part.
 */
export const Floor = () => (
  <div style={{ maxWidth: 720 }}>
    <CashWarning>{"Un client met 32 mois à rembourser son coût : 30 mois ou plus. Tu gagnes de l'argent, mais tard. Saisis ton runway dans les Réglages pour y comparer ton payback."}</CashWarning>
  </div>
);

/**
 * On the board, in English: the film's SaaS with churn at 2 %, its 1 900 € CAC paid back in
 * 21 months, and a runway of 9 months typed in the Settings (`setup.runwayMonths`, as in
 * money-view.test.ts). The payback is held against the team's runway, in its own words:
 * « longer than your runway (9 months) ».
 */
export const Runway = () => (
  <div style={{ maxWidth: 720 }}>
    <CashWarning>{"A customer takes 21 months to pay back its cost, longer than your runway (9 months): you make money, but maybe after your cash runs out."}</CashWarning>
  </div>
);

/**
 * On the board, in French, the `maybe` form: the CAC is estimated at 2 500 to 3 000 € (churn
 * at 2 %), so the payback is a range, 28 to 33 months, that straddles the 30-month floor:
 * « peut-être 30 mois ou plus ». Same look as the certain warning; only the words hedge.
 */
export const Maybe = () => (
  <div style={{ maxWidth: 720 }}>
    <CashWarning maybe>{"Un client met 28 à 33 mois à rembourser son coût : peut-être 30 mois ou plus. Saisis ton runway dans les Réglages pour y comparer ton payback."}</CashWarning>
  </div>
);

/**
 * The unit-economics slide's warning (`buildDeck`, the row `warning`, placed by
 * `SlideUnitEconomics` beside the picture), in English, on `late()`: « We make money, but
 * late » — the deck speaks for the team, and drops the pointer to the Settings. On the slide
 * the deck adds its own class (`unitWarning` in the island's deck.module.css: the slide's type
 * step, a 20px edge) — island CSS, not in the system, so here the sentence keeps the
 * component's own type. The cell is the width of the slide's side column (724px of its 1 920
 * canvas).
 */
export const OnASlide = () => (
  <div style={{ maxWidth: 724 }}>
    <CashWarning>{"A customer takes 32 months to pay back its cost: 30 months or more. We make money, but late."}</CashWarning>
  </div>
);

/**
 * The same slide, in French, the `maybe` form against a typed runway: a runway of 18 months
 * and the CAC estimated at 1 500 to 2 100 € (churn at 2 %) give a payback of 17 to 23 months:
 * « peut-être plus que notre runway (18 mois) ». On the slide the deck adds its own class
 * (`unitWarning` in the island's deck.module.css: the slide's type step, a 20px edge) — island
 * CSS, not in the system, so here the sentence keeps the component's own type.
 */
export const MaybeOnASlide = () => (
  <div style={{ maxWidth: 724 }}>
    <CashWarning maybe>{"Un client met 17 à 23 mois à rembourser son coût : peut-être plus que notre runway (18 mois)."}</CashWarning>
  </div>
);
