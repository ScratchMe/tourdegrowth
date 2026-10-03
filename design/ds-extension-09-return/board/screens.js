// The board's states, as brief 09's "The states we need" lists them. Every
// screen draws in both languages and at both widths from the same
// components: board.html?screen=<id>&lang=en|fr&w=390|1280. `key` marks the
// key screens (FR 1280 and EN 390 in the brief); the others are drawn in
// both languages too. `measure` marks the screens drawn only for the
// before/after measures (README, "The density").
export const SCREENS = [
  { id: "board-loss", group: "The board, self-serve", title: "The film's SaaS: the loss is certain", key: true },
  { id: "board-healthy", group: "The board, self-serve", title: "A healthy engine (the public example with a 75 % margin)", key: true },
  { id: "board-nomargin", group: "The board, self-serve", title: "No margin: the “?” states", key: true },
  { id: "board-maybe", group: "The board, self-serve", title: "A “maybe” loss (churn estimated at 4–6 %)", key: true },
  { id: "board-before", group: "The board, self-serve", title: "Today's board (A18) on the film's SaaS, redrawn for the measures", measure: true },

  { id: "cash-none", group: "The cash warning", title: "Absent: no runway typed, the two facts alone", key: true },
  { id: "cash-runway", group: "The cash warning", title: "Present: a payback of 11 months, a runway of 9", key: true },
  { id: "cash-maybe", group: "The cash warning", title: "“Maybe”: a payback of 9–13 months, a runway of 12", key: true },
  { id: "cash-runway-ok", group: "The cash warning", title: "Absent with a runway typed (18 months, longer than the payback)" },
  { id: "cash-loss", group: "The cash warning", title: "Never with the loss: a runway of 9, the loss speaks" },
  { id: "cash-term", group: "The cash warning", title: "“Cash tied up” taught: its “?” open" },
  { id: "settings-runway", group: "The cash warning", title: "Settings: where the runway is typed (empty)", key: true },
  { id: "settings-runway-typed", group: "The cash warning", title: "Settings: the runway typed (9 months)" },

  { id: "whatif-untouched", group: "What if?", title: "The card, untouched: today's pace", key: true },
  { id: "whatif-churn", group: "What if?", title: "Churn 6 → 4 % alone: out of the loss", key: true },
  { id: "whatif-expansion", group: "What if?", title: "Expansion 2 → 3 % alone: still a loss (panel open)", key: true },
  { id: "whatif-three", group: "What if?", title: "The film's three levers (panel open)", key: true },
  { id: "whatif-panel", group: "What if?", title: "The panel open, untouched" },
  { id: "whatif-maybe", group: "What if?", title: "The card on an estimate: the curve as a range" },
  { id: "board-panel", group: "What if?", title: "The whole board with the panel open", measure: true },
  { id: "board-panel-before", group: "What if?", title: "Today's board with today's panel open, redrawn for the measures", measure: true },
  { id: "whatif-before-three", group: "What if?", title: "Today's panel with the three levers, redrawn for the measures", measure: true },

  { id: "hybrid-ss", group: "The hybrid", title: "TotalBand with the money; self-serve shown", key: true },
  { id: "hybrid-sa", group: "The hybrid", title: "Sales-assisted shown", key: true },
  { id: "hybrid-whatif", group: "The hybrid", title: "A what-if in the hybrid: both engines' MRR in 12 months" },
  { id: "hybrid-before", group: "The hybrid", title: "Today's hybrid board (A18), redrawn for the measures", measure: true },

  { id: "slide-unit-loss", group: "The slides", title: "Unit economics: the loss as the title (№ 2)", key: true },
  { id: "slide-unit-healthy", group: "The slides", title: "Unit economics: healthy", key: true },
  { id: "slide-unit-warning", group: "The slides", title: "Unit economics: healthy, with the runway warning" },
  { id: "slide-unit-nomargin", group: "The slides", title: "Unit economics: no margin", key: true },
  { id: "slide-whatif-one", group: "The slides", title: "“What if?”, one lever, with its curve", key: true },
  { id: "slide-together", group: "The slides", title: "“What if?”, together, with the compounding", key: true },
  { id: "slide-unit-both", group: "The slides", title: "The hybrid: both engines side by side", key: true },
  { id: "deck-order", group: "The slides", title: "The deck when the loss is certain (C48)", key: true },

  { id: "arrival", group: "The page", title: "The first screen with the new promise (C52)", key: true },
];
