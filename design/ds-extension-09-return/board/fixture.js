// What the board draws around the money, for the engines of board/engines.js:
// the numbers list, the verdict, the diagnosis and the peloton, as A18
// prints them on brief 09's screenshots (the film's SaaS, `01-board-full`).
// Data, not copy: the money's own figures come from board/money.js.
//
// - film: the film's SaaS, exactly as on the screenshots (13 found · 1
//   estimated · 1 asked · 2 can't find; Retention holds it back: churn 6 %
//   against the team's 2 %).
// - healthy: the public example given a margin (C50). Its funnel, verdict and
//   peloton are the film's (the same 18 activated and 6 paying per 100), its
//   money its own: churn 3 %, ARPA €60, CAC €500, expansion 4 %.
// - nomargin: the same, the gross margin asked of Finance and not back.
// - maybe: the film's SaaS with its churn estimated at 4–6 %.

const NB = " ";

export const STAGES = ["Acquisition", "Activation", "Retention", "Referral", "Revenue"];

export const NUMBERS = [
  { id: "ss:sign-up-rate", stage: "Acquisition", en: "Sign-up rate", fr: "Taux d'inscription" },
  { id: "ss:top-channel-share", stage: "Acquisition", en: "Top channel share", fr: "Part du premier canal" },
  { id: "ss:cac", stage: "Acquisition", en: "CAC", fr: "CAC" },
  { id: "ss:activation-rate", stage: "Activation", en: "Activation rate", fr: "Taux d'activation" },
  { id: "ss:activation-event", stage: "Activation", en: "Activation event", fr: "Événement d'activation" },
  { id: "ss:median-time-to-value", stage: "Activation", en: "Median time to value", fr: "Time-to-value médian" },
  { id: "ss:day-30-retention", stage: "Retention", en: "Day-30 retention", fr: "Rétention à J30" },
  { id: "ss:monthly-logo-churn", stage: "Retention", en: "Monthly logo churn", fr: "Churn logo mensuel" },
  { id: "ss:main-churn-cause", stage: "Retention", en: "Main churn cause", fr: "Cause principale de churn" },
  { id: "ss:referred-sign-up-share", stage: "Referral", en: "Referred sign-up share", fr: "Part des inscrits recommandés" },
  { id: "ss:referral-mechanism", stage: "Referral", en: "Referral mechanism", fr: "Mécanisme de recommandation" },
  { id: "ss:viral-coefficient-k", stage: "Referral", en: "Viral coefficient (K)", fr: "Coefficient viral (K)" },
  { id: "ss:paid-conversion", stage: "Revenue", en: "Paid conversion", fr: "Conversion en payant" },
  { id: "ss:monthly-arpa", stage: "Revenue", en: "Monthly ARPA", fr: "ARPA mensuel" },
  { id: "ss:gross-margin", stage: "Revenue", en: "Gross margin", fr: "Marge brute" },
  { id: "ss:monthly-expansion", stage: "Revenue", en: "Monthly expansion", fr: "Expansion mensuelle" },
  { id: "ss:monthly-contraction", stage: "Revenue", en: "Monthly contraction", fr: "Rétrogradation mensuelle" },
];

export const COMPUTED = [
  { id: "ss:monthly-grr", en: "Monthly GRR", fr: "GRR mensuelle" },
  { id: "ss:monthly-nrr", en: "Monthly NRR", fr: "NRR mensuelle" },
];

const v = (en, fr = en) => ({ en, fr });
const pc = (n) => v(`${n}%`, `${String(n).replace(".", ",")}${NB}%`);

// Per number: [status, value]. Status: found · est · asked · cant.
const FILM = {
  "ss:sign-up-rate": ["found", pc(3.2)],
  "ss:top-channel-share": ["found", pc(50)],
  "ss:cac": ["found", v("€1,900", `1${NB}900${NB}€`)],
  "ss:activation-rate": ["found", pc(18)],
  "ss:activation-event": ["found", v("“a créé un premier projet”", `«${NB}a créé un premier projet${NB}»`)],
  "ss:median-time-to-value": ["est", v("1–3 days", "1 à 3 jours")],
  "ss:day-30-retention": ["cant", null, v("We don't measure it", "On ne la mesure pas")],
  "ss:monthly-logo-churn": ["found", pc(6)],
  "ss:main-churn-cause": ["cant", null, v("Nobody agrees on the definition", "Personne n'est d'accord sur la définition")],
  "ss:referred-sign-up-share": ["found", pc(6)],
  "ss:referral-mechanism": ["found", v("In the product", "Dans le produit")],
  "ss:viral-coefficient-k": ["asked", null],
  "ss:paid-conversion": ["found", pc(6)],
  "ss:monthly-arpa": ["found", v("€120", `120${NB}€`)],
  "ss:gross-margin": ["found", pc(75)],
  "ss:monthly-expansion": ["found", pc(2)],
  "ss:monthly-contraction": ["found", pc(1)],
};

const HEALTHY = {
  ...FILM,
  "ss:sign-up-rate": ["found", pc(3.1)],
  "ss:cac": ["found", v("€500", `500${NB}€`)],
  "ss:monthly-logo-churn": ["found", pc(3)],
  "ss:monthly-arpa": ["found", v("€60", `60${NB}€`)],
  "ss:monthly-expansion": ["found", pc(4)],
};

export const LISTS = {
  film: FILM,
  healthy: HEALTHY,
  nomargin: { ...HEALTHY, "ss:viral-coefficient-k": ["found", v("0.12", "0,12")], "ss:gross-margin": ["asked", null] },
  maybe: { ...FILM, "ss:monthly-logo-churn": ["est", v("4–6%", `4 à 6${NB}%`)] },
};

export const COMPUTED_VALUES = {
  film: { "ss:monthly-grr": pc(93), "ss:monthly-nrr": pc(95) },
  healthy: { "ss:monthly-grr": pc(96), "ss:monthly-nrr": pc(100) },
  nomargin: { "ss:monthly-grr": pc(96), "ss:monthly-nrr": pc(100) },
  maybe: { "ss:monthly-grr": v("93–95%", `93 à 95${NB}%`), "ss:monthly-nrr": v("95–97%", `95 à 97${NB}%`) },
};

// The verdict (the first slide's title, from the engine's function, kept):
// the same for the four, whose funnels are alike.
export const VERDICT = {
  en: ["Out of 100 sign-ups, 18 reach first value and 6 pay.", "In between, we see nothing: day-30 retention isn't measured."],
  fr: ["Sur 100 inscrits, 18 atteignent la première valeur et 6 paient.", "Entre les deux, on ne voit rien : la rétention à J30 n'est pas mesurée."],
};

// The diagnosis: churn against the team's target of 2 %.
export const CHURN_SHOWN = {
  film: pc(6),
  healthy: pc(3),
  nomargin: pc(3),
  maybe: v("4–6%", `4 à 6${NB}%`),
};
export const CHURN_TARGET = pc(2);

export const PELOTON = { activated: 18, active: null, paying: [6, 6] };

export const MONTH = v("August 2026", "août 2026");

// The funnel of the month, with the film's three what-ifs (the panel's
// raised card as ported, `05`): drawn as it is, not redesigned.
export const FUNNEL = {
  visitors: v("26,000", `26${NB}000`),
  signups: v("820", "820"),
  referred: 49,
  activated: { today: 148, whatif: 197 },
  paying: { today: 49, whatif: 66 },
};

// The panel's eight levers, in funnel order, as ported (`03`): the lever,
// today's value, its slider's range. `key` names the money model's input.
export const LEVERS = [
  { key: "signupRate", en: "Sign-up rate", fr: "Taux d'inscription", today: 0.032, min: 0, max: 0.1, step: 0.001, digits: 1 },
  { key: "referred", en: "Referred sign-up share", fr: "Part des inscrits recommandés", today: 0.06, min: 0, max: 0.5, step: 0.01 },
  { key: "activation", en: "Activation rate", fr: "Taux d'activation", today: 0.18, min: 0, max: 0.6, step: 0.01 },
  { key: "paid", en: "Paid conversion", fr: "Conversion en payant", today: 0.06, min: 0, max: 0.3, step: 0.01 },
  { key: "churn", en: "Monthly logo churn", fr: "Churn logo mensuel", today: 0.06, min: 0, max: 0.15, step: 0.005 },
  { key: "arpa", en: "Monthly ARPA", fr: "ARPA mensuel", today: 120, min: 0, max: 400, step: 5, money: true },
  { key: "expansion", en: "Monthly expansion", fr: "Expansion mensuelle", today: 0.02, min: 0, max: 0.1, step: 0.005 },
  { key: "contraction", en: "Monthly contraction", fr: "Rétrogradation mensuelle", today: 0.01, min: 0, max: 0.1, step: 0.005 },
];

// The sales-assisted engine's lever (the stage its target names: renewal).
export const SA_LEVER = { key: "renewal", today: 0.85, min: 0.5, max: 1, step: 0.01 };

// The slides' badge (the data's quality), as on `06`: 13 · 1 · 2 for the
// film; the public example's own for the healthy and no-margin slides (`10`).
export const BADGE = {
  film: { m: 13, a: 1, n: 2 },
  healthy: { m: 11, a: 2, n: 3 },
  nomargin: { m: 11, a: 2, n: 3 },
};
