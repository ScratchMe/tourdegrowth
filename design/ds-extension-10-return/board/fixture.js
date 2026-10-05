// The marketplace the screens are drawn on: brief 10's example (spec §22.10),
// a second-hand furniture marketplace, in euros, figures of August 2026, the
// cohort of May, today 24 September 2026. Data, not copy: the words are
// copy.js's, the money board/market.js's.
//
// DEMAND — the buyers: 14,040 active buyers ordering 0.25 times a month for
//   €78, a take rate of 12 %; 3,000 buyer sign-ups in the cohort (5 % of
//   ~60,000 visitors), 20 % first order, 5 % second order, 8 % referred; fill
//   rate 9 % of searches; buyer churn 4 %; CAC €30; the commissions' margin
//   estimated at 55–65 %. Team targets: fill rate 12 %, first order 25 %.
// SUPPLY — the sellers, who pay a subscription (the box ticked): 900 paid
//   sellers at €29; 400 seller sign-ups a month, 15 % subscribe, 30 % make a
//   first sale; seller churn 3 %, paid seller churn 3 %; €100 per active
//   seller; the subscriptions' margin 85 %. Team targets: conversion 20 %,
//   paid seller churn 2.5 %, first sale 40 %.
// SUPPLY_NOSUBS — the same sellers, the box unticked: no money, the first
//   sale and the seller churn only; the first sale's target alone ("not
//   enough targets").
// DEMAND_NOMARGIN — the commissions' margin not typed (asked of finance).

export const DEMAND = {
  activeBuyers: 14040, frequency: 0.25, aov: 78, takeRate: 0.12,
  churn: 0.04,
  signups: 3000, signupRate: 0.05, firstOrder: 0.2, secondOrder: 0.05, referred: 0.08,
  fillRate: 0.09, fillKind: "searches",
  cac: 30, margin: [0.55, 0.65],
  targets: { fillRate: 0.12, firstOrder: 0.25 },
};

export const DEMAND_NOMARGIN = { ...DEMAND, margin: null };

export const SUPPLY = {
  subscriptions: true,
  paidSellers: 900, price: 29, sellerSignups: 400, signupRate: 0.05,
  conversion: 0.15, paidChurn: 0.03, sellerChurn: 0.03,
  firstSale: 0.3, costPerActive: 100, subMargin: 0.85,
  targets: { conversion: 0.2, paidChurn: 0.025, firstSale: 0.4 },
};

export const SUPPLY_NOSUBS = {
  subscriptions: false,
  sellerSignups: 400, signupRate: 0.05, sellerChurn: 0.03, firstSale: 0.3, costPerActive: 100,
  targets: { firstSale: 0.4 },
};

// The example's what-ifs (brief 10, "What if?").
export const WHATIF = {
  demand: { fillRate: 0.12, firstOrder: 0.25, takeRate: 0.13 },
  supply: { conversion: 0.2 },
};

// The windows the team chose (setup card): first order within 30 days,
// second within 90; first sale within 60; subscribed within 90.
export const WINDOWS = { firstOrder: 30, secondOrder: 90, firstSale: 60, subscribed: 90 };

export const MONTH = { en: "August 2026", fr: "août 2026" };
export const COHORT = { en: "May 2026", fr: "mai 2026" };

// The levers of each side's panel, in funnel order (brief 10's table), with
// their slider bounds. `money`: a money lever (it re-prices the base from
// month 1). `unit`: "pct" (a share), "eur", "times" (orders a month).
export const LEVERS = {
  demand: [
    { key: "signupRate", unit: "pct", min: 0.01, max: 0.15, step: 0.005, digits: 1 },
    { key: "referred", unit: "pct", min: 0, max: 0.4, step: 0.01 },
    { key: "firstOrder", unit: "pct", min: 0.05, max: 0.6, step: 0.01 },
    { key: "fillRate", unit: "pct", min: 0.02, max: 0.5, step: 0.01 },
    { key: "churn", unit: "pct", min: 0.005, max: 0.15, step: 0.005, digits: 1 },
    { key: "frequency", unit: "times", min: 0.05, max: 2, step: 0.05, money: true },
    { key: "aov", unit: "eur", min: 10, max: 300, step: 1, money: true },
    { key: "takeRate", unit: "pct", min: 0.02, max: 0.4, step: 0.01, money: true },
  ],
  supply: [
    { key: "conversion", unit: "pct", min: 0.02, max: 0.6, step: 0.01 },
    { key: "paidChurn", unit: "pct", min: 0.005, max: 0.15, step: 0.005, digits: 1 },
    { key: "price", unit: "eur", min: 5, max: 200, step: 1, money: true },
  ],
};

// "Your numbers": the 19 numbers (14 without the subscriptions), one list
// by stage (C41), each with its side (« Acheteurs », « Vendeurs »,
// « Liquidité »). `subs`: exists only when sellers pay a subscription.
// `star`: the stage's headline number (★) — demand's as decided; supply's
// as this return proposes (README, question 5), marked `proposed`.
export const STAGES = ["Acquisition", "Activation", "Retention", "Referral", "Revenue"];

export const NUMBERS = [
  { id: "mk:buyer-sign-up-rate", stage: "Acquisition", side: "buyers", star: true },
  { id: "mk:buyer-cac", stage: "Acquisition", side: "buyers" },
  { id: "mk:cost-per-active-seller", stage: "Acquisition", side: "sellers" },
  { id: "mk:seller-sign-up-rate", stage: "Acquisition", side: "sellers", subs: true },
  { id: "mk:first-order", stage: "Activation", side: "buyers", star: true },
  { id: "mk:first-sale", stage: "Activation", side: "sellers", star: "proposed" },
  { id: "mk:fill-rate", stage: "Activation", side: "liquidity" },
  { id: "mk:second-order", stage: "Retention", side: "buyers", star: true },
  { id: "mk:buyer-churn", stage: "Retention", side: "buyers" },
  { id: "mk:seller-churn", stage: "Retention", side: "sellers", star: "proposed" },
  { id: "mk:paid-seller-churn", stage: "Retention", side: "sellers", subs: true },
  { id: "mk:referred-share", stage: "Referral", side: "buyers", star: true },
  { id: "mk:take-rate", stage: "Revenue", side: "liquidity", star: true },
  { id: "mk:net-revenue-margin", stage: "Revenue", side: "liquidity" },
  { id: "mk:aov", stage: "Revenue", side: "buyers" },
  { id: "mk:order-frequency", stage: "Revenue", side: "buyers" },
  { id: "mk:subscription-conversion", stage: "Revenue", side: "sellers", subs: true, star: "proposed" },
  { id: "mk:revenue-per-paid-seller", stage: "Revenue", side: "sellers", subs: true },
  { id: "mk:subscription-margin", stage: "Revenue", side: "sellers", subs: true },
];

// Each number's status and value on the example. Status: found · est ·
// asked. Values are formatted by board.js (kind: pct, eur, times, range).
export const VALUES = {
  "mk:buyer-sign-up-rate": ["found", "pct", 0.05],
  "mk:buyer-cac": ["found", "eur", 30],
  "mk:cost-per-active-seller": ["found", "eur", 100],
  "mk:seller-sign-up-rate": ["found", "pct", 0.05],
  "mk:first-order": ["found", "pct", 0.2],
  "mk:first-sale": ["found", "pct", 0.3],
  "mk:fill-rate": ["found", "pct", 0.09],
  "mk:second-order": ["found", "pct", 0.05],
  "mk:buyer-churn": ["found", "pct", 0.04],
  "mk:seller-churn": ["found", "pct", 0.03],
  "mk:paid-seller-churn": ["found", "pct", 0.03],
  "mk:referred-share": ["found", "pct", 0.08],
  "mk:take-rate": ["found", "pct", 0.12],
  "mk:net-revenue-margin": ["est", "range", [0.55, 0.65]],
  "mk:aov": ["found", "eur", 78],
  "mk:order-frequency": ["found", "times", 0.25],
  "mk:subscription-conversion": ["found", "pct", 0.15],
  "mk:revenue-per-paid-seller": ["found", "eur", 29],
  "mk:subscription-margin": ["found", "pct", 0.85],
};

// The badge's counts ("Data: measured 18 · estimates 1 · can't find 0").
export const BADGE = {
  subs: { measured: 18, approx: 1, cant: 0 },
  nosubs: { measured: 13, approx: 1, cant: 0 },
  nomargin: { measured: 18, approx: 0, cant: 0 },
};
