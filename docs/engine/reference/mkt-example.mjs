// The marketplace's example (ENGINE.md §22.10, docs/engine/place-de-marche.md),
// recomputed WITHOUT the engine's code: the loop, the sums and the unit
// economics written out again on the example's numbers. It is the oracle
// §22.10.2 quotes; the engine's tests must find its numbers, never the reverse.
// The demand side is the first draft's reference model (§22.11 of
// 2026-10-04), unchanged; the supply side follows C64 and C93.
//
//   node docs/engine/reference/mkt-example.mjs
//
// Intervals where the example has one (the commissions' margin, 55 to 65 %).

const I = (lo, hi = lo) => ({ lo, hi });
const mul = (a, b) => { const p = [a.lo * b.lo, a.lo * b.hi, a.hi * b.lo, a.hi * b.hi]; return I(Math.min(...p), Math.max(...p)); };
const div = (a, b) => (b.lo <= 0 && b.hi >= 0 ? null : mul(a, I(1 / b.hi, 1 / b.lo)));
const scale = (a, k) => (k >= 0 ? I(a.lo * k, a.hi * k) : I(a.hi * k, a.lo * k));
const lifetime = (churn) => { const m = (c) => (c <= 0 ? 36 : Math.min(100 / c, 36)); return I(m(churn.hi), m(churn.lo)); };
/** 13 points: [0] = today, then twelve months of t ← t × q + newR from `start`, bound by bound. */
const path = (today, start, newR, q) => {
  const run = (s, n, k) => { const p = []; let t = s; for (let m = 0; m < 12; m++) { t = t * k + n; p.push(t); } return p; };
  const lo = [today.lo, ...run(start.lo, newR.lo, q.lo)];
  const hi = [today.hi, ...run(start.hi, newR.hi, q.hi)];
  return lo.map((v, i) => I(v, hi[i]));
};
const keep = (churn) => I(1 - churn.hi / 100, 1 - churn.lo / 100);
const tmf = (c) => { c = c / 100; return c <= 0 ? 12 : (1 - (1 - c) ** 12) / c; };
const r2 = (v) => Math.round(v * 100) / 100;
const show = (i) => (i.lo === i.hi ? `${r2(i.lo)}` : `${r2(i.lo)} à ${r2(i.hi)}`);

// --- Demand (§22.10.1, the first draft, unchanged) ---
const firstOrder = I(20), buyerChurn = I(4), buyerCac = I(30), freq = I(0.3), aov = I(65), take = I(12), fill = I(9), margin = I(55, 65);
const R0 = I(32853.6), N = I(600);
const a = mul(mul(freq, aov), scale(take, 1 / 100));
const demand = path(R0, R0, mul(N, a), keep(buyerChurn));
const mB = mul(a, scale(margin, 1 / 100));
const ltvB = mul(mB, lifetime(buyerChurn));
const paybackB = div(buyerCac, mB);
console.log("Demande : a", show(a), "; revenu net dans 12 mois", show(demand[12]), "; courbe", demand.map((p) => Math.round(p.lo)).join(" · "));
console.log("  un acheteur : marge", show(mB), "LTV", show(ltvB), "payback", show(paybackB), "LTV:CAC", show(div(ltvB, buyerCac)));
// The what-if's targets: fill rate 12 % (today `fill`), first order 25 % (today `firstOrder`), take rate 13 %.
const fFill = 12 / fill.lo, fFirst = 25 / firstOrder.lo;
console.log("  classement : taux de service", show(mul(mul(N, I(fFill - 1)), a)), "; première commande", show(mul(mul(N, I(fFirst - 1)), a)));
const fN = fFill * fFirst, fA = 13 / 12;
const whatIfD = path(R0, scale(R0, fA), mul(scale(N, fN), scale(a, fA)), keep(buyerChurn));
console.log("  « Et si » (service 12 %, première commande 25 %, commission 13 %)", show(whatIfD[12]), "gain", r2(whatIfD[12].lo - demand[12].lo));
console.log("  courbe de l'« Et si »", whatIfD.map((p) => Math.round(p.lo)).join(" · "));
const lifeB = lifetime(buyerChurn), spendB = mul(N, buyerCac);
console.log("  argent : R annualisé", show(scale(R0, 12)), "; GMV", show(div(R0, scale(take, 1 / 100))), "annualisé", show(scale(div(R0, scale(take, 1 / 100)), 12)), "; nouveau revenu net", show(mul(N, a)), "; dans 12 mois annualisé", show(scale(demand[12], 12)));
console.log("  durée", show(lifeB), "; après le remboursement", show(I(lifeB.lo - paybackB.hi, lifeB.hi - paybackB.lo)), "; dépense", show(spendB), "; trésorerie", show(scale(mul(spendB, paybackB), 1 / 2)));
console.log("  chaîne du taux de service : 600 →", r2(600 * fFill), "; +", r2(600 * fFill - 600), "; ×", show(a), "=", r2((600 * fFill - 600) * a.lo), "; annuel ×", r2(tmf(4)), "=", r2((600 * fFill - 600) * a.lo * tmf(4)));
const aW = scale(a, fA), cacW = scale(buyerCac, 1 / fN), mBW = mul(aW, scale(margin, 1 / 100)), ltvBW = mul(mBW, lifeB), paybackBW = div(cacW, mBW);
console.log("  « Et si » : N'", r2(600 * fN), "; a'", show(aW), "; nouveau revenu net", show(mul(scale(N, fN), aW)), "; annualisé", show(scale(whatIfD[12], 12)), "; CAC", show(cacW), "; LTV", show(ltvBW), "; payback", show(paybackBW), "; LTV:CAC", show(div(ltvBW, cacW)));
const aloneD = (fNa, fAa) => r2(path(R0, scale(R0, fAa), mul(scale(N, fNa), scale(a, fAa)), keep(buyerChurn))[12].lo - demand[12].lo);
const sD = aloneD(fFill, 1) + aloneD(fFirst, 1) + aloneD(1, 13 / 12);
console.log("  seuls : service", aloneD(fFill, 1), "; première commande", aloneD(fFirst, 1), "; commission", aloneD(1, 13 / 12), "; somme", r2(sD), "; effet composé", r2(whatIfD[12].lo - demand[12].lo - sD));

// --- Supply: the sellers' subscriptions (C64, C93) ---
const sellerSignups = I(400), paidConversion = I(15), price = I(29), paidChurn = I(3), sellerMargin = I(85);
const activeSellerCac = I(100), firstSale = I(30);
const S0 = I(26_100);
const NS = mul(sellerSignups, scale(paidConversion, 1 / 100));
const supply = path(S0, S0, mul(NS, price), keep(paidChurn));
const paidCac = div(mul(activeSellerCac, firstSale), paidConversion);
const mS = mul(price, scale(sellerMargin, 1 / 100));
const ltvS = mul(mS, lifetime(paidChurn));
const paybackS = div(paidCac, mS);
console.log("Offre : nouveaux vendeurs abonnés", show(NS), "; MRR vendeurs dans 12 mois", show(supply[12]), "; courbe", supply.map((p) => Math.round(p.lo)).join(" · "));
console.log("  un vendeur abonné : coût", show(paidCac), "marge", show(mS), "durée", show(lifetime(paidChurn)), "LTV", show(ltvS), "payback", show(paybackS), "LTV:CAC", show(div(ltvS, paidCac)));
console.log("  classement : conversion en abonné", show(mul(mul(NS, I(20 / 15 - 1)), price)), "; churn des abonnés", show(mul(I((900 * 0.5) / 100), price)));
const conv20 = path(S0, S0, mul(I(80), price), keep(paidChurn));
const churn25 = path(S0, S0, mul(NS, price), keep(I(2.5)));
const price35 = path(S0, scale(S0, 35 / 29), mul(NS, I(35)), keep(paidChurn));
console.log("  seuls : conversion 20 %", r2(conv20[12].lo - supply[12].lo), "; churn 2,5 %", r2(churn25[12].lo - supply[12].lo), "; prix 35 €", r2(price35[12].lo - supply[12].lo), "(mois 1 :", r2(price35[1].lo) + ")");
console.log("  chaîne de la conversion : annuel", r2(580 * tmf(3)));
const lifeS = lifetime(paidChurn), spendS = mul(NS, paidCac);
console.log("  argent : S annualisé", show(scale(S0, 12)), "; nouveau MRR", show(mul(NS, price)), "; dans 12 mois annualisé", show(scale(supply[12], 12)));
console.log("  après le remboursement", show(I(lifeS.lo - paybackS.hi, lifeS.hi - paybackS.lo)), "; dépense", show(spendS), "; trésorerie", show(scale(mul(spendS, paybackS), 1 / 2)));
console.log("  chaîne de la conversion : 60 → 80 ; + 20 ; × 29 =", 20 * 29, "; annuel ×", r2(tmf(3)), "=", r2(580 * tmf(3)));
const paidCacW = div(mul(activeSellerCac, firstSale), I(20)), paybackSW = div(paidCacW, mS);
console.log("  « Et si » (conversion 20 %) :", show(conv20[12]), "gain", r2(conv20[12].lo - supply[12].lo), "; nouveau MRR", 80 * 29, "; coût d'un abonné", show(paidCacW), "; payback", show(paybackSW), "; LTV:CAC", show(div(ltvS, paidCacW)));
console.log("  courbe de l'« Et si »", conv20.map((p) => Math.round(p.lo)).join(" · "));

// --- The total (S9: both parts known) ---
const total = demand.map((p, m) => I(p.lo + supply[m].lo, p.hi + supply[m].hi));
console.log("Total : ce mois-ci", show(total[0]), "; dans 12 mois", show(total[12]), "; courbe", total.map((p) => Math.round(p.lo)).join(" · "));
console.log("  annualisé", show(scale(total[0], 12)), "; nouveau par mois", show(I(mul(N, a).lo + mul(NS, price).lo, mul(N, a).hi + mul(NS, price).hi)));
const totalW = whatIfD.map((p, m) => I(p.lo + conv20[m].lo, p.hi + conv20[m].hi));
console.log("  avec les « Et si » des deux côtés : dans 12 mois", show(totalW[12]), "; nouveau par mois", r2(mul(scale(N, fN), aW).lo + 80 * 29), "; courbe", totalW.map((p) => Math.round(p.lo)).join(" · "));
