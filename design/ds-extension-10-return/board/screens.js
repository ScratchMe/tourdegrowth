// The board's states, as brief 10's "The states we need" lists them. Every
// screen draws in both languages, at both widths and in both vocabularies
// from the same components:
//   board.html?screen=<id>&lang=en|fr&w=390|1280[&vocab=services]
// `key` marks the states the brief asks for (FR 1280 and EN 390); `vocab`
// a screen drawn in the services words by default; `measure` a screen drawn
// only to measure (README, "The density").
export const SCREENS = [
  { id: "board-demand", group: "The board", title: "The example, demand shown (the selector starts there)", key: true },
  { id: "board-supply", group: "The board", title: "The example, supply shown", key: true },
  { id: "board-supply-nosubs", group: "The board", title: "Without the subscriptions, supply shown: no money, one column, not enough targets", key: true },
  { id: "board-demand-nosubs", group: "The board", title: "Without the subscriptions, demand shown: the net revenue is the whole money" },
  { id: "board-services", group: "The board", title: "The example in “services” words (clients, providers, bookings), demand shown", key: true, vocab: "services" },
  { id: "board-services-supply", group: "The board", title: "The example in “services” words, supply shown", key: true, vocab: "services" },
  { id: "board-demand-nomargin", group: "A side with unknowns", title: "Demand without the commissions' margin: its LTV, payback and cash “?”", key: true },
  { id: "whatif-demand-nomargin", group: "A side with unknowns", title: "The same, its card and panel: the “?” rows" },

  { id: "whatif-demand", group: "What if?", title: "Demand, untouched: the card and its panel", key: true },
  { id: "whatif-demand-moved", group: "What if?", title: "Demand, the example's three what-ifs (fill rate 12 %, first order 25 %, take rate 13 %): the jump at month 1", key: true },
  { id: "whatif-supply", group: "What if?", title: "Supply, untouched: the card and its panel", key: true },
  { id: "whatif-supply-moved", group: "What if?", title: "Supply, the example's what-if (subscription conversion 20 %)", key: true },

  { id: "total-moved", group: "The total", title: "With the subscriptions, with the what-ifs of both sides", key: true },
  { id: "total-nosubs", group: "The total", title: "Without the subscriptions: no band, the net revenue alone", key: true },

  { id: "slide-total", group: "The slides", title: "№ 1 · The total: two streams, one sum (with our what-ifs)", key: true },
  { id: "slide-demand-funnel", group: "The slides", title: "№ 2 · Demand: the funnel", key: true },
  { id: "slide-demand-leak", group: "The slides", title: "№ 3 · Demand: the leak (the fill rate)", key: true },
  { id: "slide-demand-whatif", group: "The slides", title: "№ 4 · Demand: “What if?”, the three levers", key: true },
  { id: "slide-demand-unit", group: "The slides", title: "№ 5 · Demand: unit economics (one buyer)", key: true },
  { id: "slide-supply-funnel", group: "The slides", title: "№ 6 · Supply: the funnel", key: true },
  { id: "slide-supply-leak", group: "The slides", title: "№ 7 · Supply: the leak (subscription conversion)", key: true },
  { id: "slide-supply-whatif", group: "The slides", title: "№ 8 · Supply: “What if?”, one lever", key: true },
  { id: "slide-supply-unit", group: "The slides", title: "№ 9 · Supply: unit economics (one paid seller)", key: true },
  { id: "slide-supply-nosubs", group: "The slides", title: "Without the subscriptions: the sellers' funnel, one column" },
  { id: "slide-services-funnel", group: "The slides", title: "Demand's funnel in “services” words (FR: « Sur 100 inscrits côté clients… »)", key: true, vocab: "services" },
  { id: "deck-order", group: "The slides", title: "The deck's order, as a strip", key: true },

  { id: "term-gmv", group: "The words taught (C72)", title: "GMV: its “?” open, in the money" },
  { id: "term-take", group: "The words taught (C72)", title: "Take rate: its “?” open, in the money" },
  { id: "term-liquidity", group: "The words taught (C72)", title: "Liquidity: its “?” open, in the funnel" },
  { id: "term-net", group: "The words taught (C72)", title: "Net revenue (proposed): its “?” open, in the money" },

  { id: "measure-stacked", group: "Measures", title: "Counterfactual: the two sides stacked on one board, no selector", measure: true },
];
