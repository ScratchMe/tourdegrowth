// The engines the screens are drawn on: their typed numbers, as the money
// model reads them. Data, not copy.
//
// FILM — the film's SaaS (brief 09, "The numbers on the screenshots"): every
//   state of the money; a certain loss today.
// HEALTHY — the public example ("See a filled-in example") given a gross
//   margin of 75 % (the brief's "healthy engine", C50). Its CAC (€500, media
//   only), GRR 96 % and NRR 100 % are the example's own (screenshot 10); its
//   ARPA, MRR and sign-ups are not on any screenshot and are invented,
//   consistent with them. LTV:CAC comes out at 3.0 — the glossary's
//   reference — which is the case where a reference must situate and never
//   designate.
// NO_MARGIN — the public example as it is: no gross margin.
// MAYBE — the film's SaaS with its churn estimated at 4–6 % instead of typed
//   at 6 %: the LTV range and the CAC overlap.
// HEALTHY_CAC_RANGE — the healthy engine with its CAC estimated at
//   €400–600: a payback range, for the warning's "maybe".
// SA — the sales-assisted engine of the hybrid (screenshot 11: MRR
//   €180,000); its ACV, renewal, deals and CAC are invented.

export const FILM = {
  mrr: 48000, arpa: 120, margin: 0.75,
  churn: 0.06, contraction: 0.01, expansion: 0.02,
  signups: 820, signupRate: 0.032, paid: 0.06, activation: 0.18,
  cac: 1900,
};

export const HEALTHY = {
  mrr: 24000, arpa: 60, margin: 0.75,
  churn: 0.03, contraction: 0.01, expansion: 0.04,
  signups: 600, signupRate: 0.031, paid: 0.06, activation: 0.18,
  cac: 500,
};

export const NO_MARGIN = { ...HEALTHY, margin: null };

export const MAYBE = { ...FILM, churn: [0.04, 0.06] };

export const HEALTHY_CAC_RANGE = { ...HEALTHY, cac: [400, 600] };

export const SA = {
  mrr: 180000, acv: 24000, margin: 0.8,
  renewal: 0.85, deals: 3,
  cac: 30000,
};

// The film's three what-ifs, and the one-lever states.
export const THREE = { churn: 0.04, expansion: 0.03, activation: 0.24 };
export const CHURN_ONLY = { churn: 0.04 };
export const EXPANSION_ONLY = { expansion: 0.03 };

// The runway states of the warning (C49), in months.
export const RUNWAY = { none: null, typed: 9, maybe: 12 };
