// The engine's public example (§6.0 of its spec: a fictional self-serve SaaS)
// in the states brief 07 asks for. "returning" is the brief's own: the
// example with four numbers taken back to "to do", last touched 12 days ago
// (7 found · 2 estimated · 5 in progress · 3 can't find). Figures not visible
// on the brief's screenshots are invented, consistent with the visible ones,
// and marked `example` in COPY.md: they are data, not copy.

const NB = " ";

// What each number shows when found, per language.
export const FIGURES = {
  "ss:sign-up-rate": { en: "3.1%", fr: `3,1${NB}%` },
  "ss:top-channel-share": { en: "41% · organic search", fr: `41${NB}% · recherche organique` },
  "ss:cac": { en: "€410", fr: `410${NB}€` },
  "ss:activation-rate": { en: "18%", fr: `18${NB}%` },
  "ss:activation-event": { en: "“created a first project”", fr: `«${NB}a créé un premier projet${NB}»` },
  "ss:median-time-to-value": { en: "3 days", fr: "3 jours" },
  "ss:day-30-retention": { en: "31%", fr: `31${NB}%` },
  "ss:monthly-logo-churn": { en: "3.4%", fr: `3,4${NB}%` },
  "ss:main-churn-cause": { en: "“no second project after the trial”", fr: `«${NB}pas de second projet après l'essai${NB}»` },
  "ss:referred-sign-up-share": { en: "9%", fr: `9${NB}%` },
  "ss:referral-mechanism": { en: "“invite a teammate”", fr: `«${NB}inviter un collègue${NB}»` },
  "ss:viral-coefficient-k": { en: "0.12", fr: "0,12" },
  "ss:paid-conversion": { en: "7%", fr: `7${NB}%` },
  "ss:monthly-arpa": { en: "€89", fr: `89${NB}€` },
  "ss:gross-margin": { en: "81%", fr: `81${NB}%` },
  "ss:monthly-expansion": { en: "1.9%", fr: `1,9${NB}%` },
  "ss:monthly-contraction": { en: "0.8%", fr: `0,8${NB}%` },
  "ss:ltv": { en: "€2,120", fr: `2${NB}120${NB}€` },
  "ss:cac-payback": { en: "5.7 months", fr: "5,7 mois" },
  "ss:ltv-cac": { en: "5.2", fr: "5,2" },
  "ss:monthly-grr": { en: "95.8%", fr: `95,8${NB}%` },
  "ss:monthly-nrr": { en: "97.7%", fr: `97,7${NB}%` },
};

// What an estimated number shows (its range).
export const RANGES = {
  "ss:median-time-to-value": { en: "2–4 days", fr: "2 à 4 jours" },
  "ss:paid-conversion": { en: "6–9%", fr: `6 à 9${NB}%` },
};

// What a computed number needs when an input is missing.
export const NEEDS = {
  "ss:ltv": { en: "gross margin", fr: "la marge brute" },
  "ss:cac-payback": { en: "CAC, gross margin", fr: "le CAC, la marge brute" },
  "ss:ltv-cac": { en: "CAC, gross margin", fr: "le CAC, la marge brute" },
  "ss:monthly-grr": { en: "contraction", fr: "la rétrogradation" },
  "ss:monthly-nrr": { en: "expansion, contraction", fr: "l'expansion, la rétrogradation" },
};

// Who is asked, for the numbers whose effort is "Ask someone".
export const ROLE = {
  "ss:cac": "finance",
  "ss:gross-margin": "finance",
  "ss:viral-coefficient-k": "data",
  "ss:paid-conversion": "data",
  "ss:main-churn-cause": "cs",
};

const SS = [
  "ss:sign-up-rate", "ss:top-channel-share", "ss:cac",
  "ss:activation-rate", "ss:activation-event", "ss:median-time-to-value",
  "ss:day-30-retention", "ss:monthly-logo-churn", "ss:main-churn-cause",
  "ss:referred-sign-up-share", "ss:referral-mechanism", "ss:viral-coefficient-k",
  "ss:paid-conversion", "ss:monthly-arpa", "ss:gross-margin", "ss:monthly-expansion", "ss:monthly-contraction",
];

const all = (status) => Object.fromEntries(SS.map((id) => [id, status]));

// found · est · asked · cant · todo, per number.
export const STATUSES = {
  // First visit, nothing typed.
  start: all("todo"),
  // First visit, after the five 5-minute numbers.
  mid: {
    ...all("todo"),
    "ss:sign-up-rate": "found", "ss:activation-event": "found", "ss:monthly-logo-churn": "found",
    "ss:referral-mechanism": "found", "ss:monthly-arpa": "found",
  },
  // First visit, the last number on screen.
  last: {
    ...all("found"),
    "ss:cac": "asked", "ss:main-churn-cause": "asked", "ss:viral-coefficient-k": "asked", "ss:gross-margin": "asked",
    "ss:paid-conversion": "est", "ss:median-time-to-value": "est", "ss:day-30-retention": "cant",
    "ss:monthly-contraction": "todo",
  },
  // First visit, every number answered.
  end: {
    ...all("found"),
    "ss:cac": "asked", "ss:main-churn-cause": "asked", "ss:viral-coefficient-k": "asked", "ss:gross-margin": "asked",
    "ss:paid-conversion": "est", "ss:median-time-to-value": "est", "ss:day-30-retention": "cant",
  },
  // The brief's "returning": 7 found, 2 estimated, 1 asked + 4 to do, 3 can't find.
  returning: {
    "ss:sign-up-rate": "found", "ss:top-channel-share": "found", "ss:cac": "todo",
    "ss:activation-rate": "found", "ss:activation-event": "found", "ss:median-time-to-value": "est",
    "ss:day-30-retention": "cant", "ss:monthly-logo-churn": "found", "ss:main-churn-cause": "cant",
    "ss:referred-sign-up-share": "todo", "ss:referral-mechanism": "found", "ss:viral-coefficient-k": "asked",
    "ss:paid-conversion": "est", "ss:monthly-arpa": "found", "ss:gross-margin": "cant",
    "ss:monthly-expansion": "todo", "ss:monthly-contraction": "todo",
  },
  // Everything found.
  found: all("found"),
};

// The team targets typed so far (only the six that can name a stage).
export const TARGETS = {
  start: {},
  mid: {},
  last: { "ss:activation-rate": { en: "20%", fr: `20${NB}%`, value: 20 } },
  end: { "ss:activation-rate": { en: "20%", fr: `20${NB}%`, value: 20 } },
  returning: { "ss:activation-rate": { en: "20%", fr: `20${NB}%`, value: 20 } },
  found: { "ss:activation-rate": { en: "20%", fr: `20${NB}%`, value: 20 } },
};

// The verdict: the first slide's title, from the engine's function (kept).
// Drawn with the example's data; `red` is its last clause, as today.
export const VERDICTS = {
  returning: {
    en: ["Out of 100 sign-ups, 18 reach first value and 6–9 pay.", "In between, we see nothing: day-30 retention isn't measured."],
    fr: ["Sur 100 inscrits, 18 atteignent la première valeur et 6 à 9 paient.", "Entre les deux, on ne voit rien : la rétention à J30 n'est pas mesurée."],
  },
  found: {
    en: ["Out of 100 sign-ups, 18 reach first value, 31 are still active at day 30 and 7 pay.", "Activation holds the engine back."],
    fr: ["Sur 100 inscrits, 18 atteignent la première valeur, 31 sont encore actifs à J30 et 7 paient.", "C'est l'activation qui freine le moteur."],
  },
  past: {
    en: ["Out of 100 sign-ups, 16 reach first value, 29 are still active at day 30 and 6 pay.", "Activation holds the engine back."],
    fr: ["Sur 100 inscrits, 16 atteignent la première valeur, 29 sont encore actifs à J30 et 6 paient.", "C'est l'activation qui freine le moteur."],
  },
};

// The peloton's four columns: [count, kind] per column.
export const PELOTON = {
  returning: { activated: 18, active: null, paying: [6, 9] },
  found: { activated: 18, active: 31, paying: [7, 7] },
  past: { activated: 16, active: 29, paying: [6, 6] },
};

export const MONTHS = {
  current: { en: "August 2026", fr: "août 2026" },
  next: { en: "September 2026", fr: "septembre 2026" },
  past: { en: "July 2026", fr: "juillet 2026" },
  copiedOn: { en: "September 24", fr: "24 septembre" },
};

// What if: the activation lever (the stage the target names).
export const LEVER = {
  today: 18,
  moved: 22,
  mrr12: { today: { en: "€61,400", fr: `61${NB}400${NB}€` }, moved: { en: "€66,900", fr: `66${NB}900${NB}€` } },
  newPaying: { today: { en: "62", fr: "62" }, moved: { en: "75", fr: "75" } },
};

// The hybrid: two engines, one total.
export const HYBRID = {
  ss: { en: "€48,100", fr: `48${NB}100${NB}€` },
  sa: { en: "€71,500", fr: `71${NB}500${NB}€` },
  total: { en: "€119,600", fr: `119${NB}600${NB}€` },
  link: 12,
};
