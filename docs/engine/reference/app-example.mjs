// The consumer app's example (ENGINE.md §21.9, docs/engine/app-grand-public.md),
// recomputed WITHOUT the engine's code: the loop and the sums written out
// again, by hand, on the example's numbers. It is the oracle §21.9.2 quotes;
// the engine's tests must find its numbers, never the reverse.
//
//   node docs/engine/reference/app-example.mjs
//
// Points only (every entry of the example is measured).

/** 13 points: [0] = today, then twelve months of t ← t × kept ÷ 100 + new, from `start`. */
function path(today, start, add, keptPercent) {
  const p = [today];
  let t = start;
  for (let m = 0; m < 12; m++) {
    t = (t * keptPercent) / 100 + add;
    p.push(t);
  }
  return p;
}
/** The margin of an install over `n` months: Σ s·qs^(k−1) + u·qa^(k−1). */
function value(n, s, u, qs, qa) {
  let v = 0;
  for (let k = 1; k <= n; k++) v += s * qs ** (k - 1) + u * qa ** (k - 1);
  return v;
}
/** The month the cumulative margin crosses the cost, interpolated in the month it falls; null past 36. */
function payback(cost, s, u, qs, qa) {
  let total = 0;
  for (let k = 1; k <= 36; k++) {
    const m = s * qs ** (k - 1) + u * qa ** (k - 1);
    if (total + m >= cost) return k - 1 + (cost - total) / m;
    total += m;
  }
  return null;
}
const tmf = (c) => (c <= 0 ? 12 : (1 - (1 - c / 100) ** 12) / (c / 100));

// §21.9.1
const installs = 12_000, d30 = 12, paid = 3, arpa = 6.4, churn = 7, nrr = 93.5, mrr = 28_800;
const actives = 15_000, retention = 90, purchases = 0.3, ads = 0.4, margin = 80, cpi = 18_000 / 12_000;

function run({ d30t = d30, commission = 22, subscriptions = true, usage = true }) {
  const f = d30t / d30; // day 30 carries the paying (d30-drives-paying), and the new actives (D9)
  const per = usage ? purchases + ads : 0;
  const newMrr = subscriptions ? ((installs * paid) / 100) * f * arpa : 0;
  const subs = subscriptions ? path(mrr, mrr, newMrr, nrr) : Array(13).fill(0);
  const newActives = (installs * d30t) / 100;
  const use = usage ? path(actives * per, actives * per, newActives * per, retention) : Array(13).fill(0);
  const total = subs.map((v, m) => v + use[m]);
  const storeBilled = ((100 - commission) * margin) / 100;
  const s = subscriptions ? (((paid * f) / 100) * arpa * storeBilled) / 100 : 0;
  const u = usage ? ((d30t / 100) * (purchases * storeBilled + ads * margin)) / 100 : 0;
  const qs = 1 - churn / 100, qa = retention / 100;
  return {
    newRevenue: newMrr + newActives * per,
    subs12: subs[12], use12: use[12], total12: total[12], path: total.map(Math.round),
    s, u, v12: value(12, s, u, qs, qa), v36: value(36, s, u, qs, qa), payback: payback(cpi, s, u, qs, qa),
  };
}

const r2 = (v) => Math.round(v * 100) / 100;
const today = run({});
const both = run({ d30t: 15, commission: 15 });
const d30Alone = run({ d30t: 15 });
const commissionAlone = run({ commission: 15 });
const usageOnly = run({ subscriptions: false });

console.log("Revenu du mois", mrr + actives * (purchases + ads), "annualisé", (mrr + actives * (purchases + ads)) * 12);
console.log("Nouveau revenu", today.newRevenue, "Dans 12 mois", r2(today.total12), "=", r2(today.subs12), "+", r2(today.use12), "annualisé", r2(today.total12 * 12));
console.log("Courbe", today.path.join(" · "));
console.log("Marge du premier mois", today.s, "+", today.u, "valeur 12", today.v12.toFixed(4), "36", today.v36.toFixed(4), "ratio", (today.v12 / cpi).toFixed(2), "remboursement", today.payback.toFixed(4));
console.log("Classement : J30", 360 * 0.25 * 6.4, "+", 1_440 * 0.25 * 0.7, "; conversion", 360 * (4 / 3 - 1) * 6.4, "; rétention des actifs", 15_000 * 0.02 * 0.7);
console.log("Et si", r2(both.total12), "(+" + r2(both.total12 - today.total12) + ")", "nouveau revenu", both.newRevenue, "valeur 12", both.v12.toFixed(4), "36", both.v36.toFixed(4), "ratio", (both.v12 / cpi).toFixed(2), "remboursement", both.payback.toFixed(2));
console.log("Courbe de l'Et si", both.path.join(" · "));
console.log("Seul : J30", r2(d30Alone.total12 - today.total12), "remboursement", d30Alone.payback.toFixed(2), "; commission", r2(commissionAlone.total12 - today.total12), "remboursement", commissionAlone.payback.toFixed(2));
console.log("Chaîne de J30 : annuel", r2(576 * tmf(churn) + 252 * tmf(100 - retention)));
console.log("Sans abonnements : valeur 36", usageOnly.v36.toFixed(4), "remboursement", usageOnly.payback, "revenu du mois", actives * (purchases + ads));
