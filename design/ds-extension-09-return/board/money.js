// The engine's money, as ENGINE.md §20 (A20.a, ported) computes it — a
// board-only replica, so every figure the screens draw comes from one
// calculation and the brief's table can be checked against it
// (`node board/money-check.mjs`). Not ported: the app has its own.
//
// Every quantity is a range [lo, hi]: an estimate stays a range at every step
// (a typed figure is [x, x]). `null` means unknown: the figure prints "?".

const R = (x) => (x == null ? null : Array.isArray(x) ? x : [x, x]);
const lo = (r) => r[0];
const hi = (r) => r[1];
const map2 = (a, b, f) => {
  if (!a || !b) return null;
  const v = [f(a[0], b[0]), f(a[0], b[1]), f(a[1], b[0]), f(a[1], b[1])];
  return [Math.min(...v), Math.max(...v)];
};
const mul = (a, b) => map2(a, b, (x, y) => x * y);
const div = (a, b) => map2(a, b, (x, y) => x / y);
const sub = (a, b) => (a && b ? [a[0] - b[1], a[1] - b[0]] : null);
const add = (a, b) => (a && b ? [a[0] + b[0], a[1] + b[1]] : null);
const k = (a, c) => (a ? [a[0] * c, a[1] * c] : null);
const cap = (a, m) => (a ? [Math.min(a[0], m), Math.min(a[1], m)] : null);

export const LIFETIME_CAP = 36; // months, the engine's cap on a counted lifetime

/**
 * Self-serve. `e` is the engine's typed numbers; `w` the what-ifs (levers
 * moved), as absolute values of the lever, e.g. { churn: 0.04 }.
 */
export const selfServe = (e, w = {}) => {
  const v = (name) => R(w[name] ?? e[name]);
  const churn = v("churn");
  const contraction = v("contraction");
  const expansion = v("expansion");
  const arpa = v("arpa");
  const margin = R(e.margin); // gross margin is not a lever
  // New paying customers: sign-ups × paid conversion. Activation, day-30
  // retention and paid conversion move together: the paying are part of the
  // activated and follow activation in the same proportion (the panel's own
  // assumption).
  const signupsToday = R(e.signups);
  const signups = w.signupRate ? k(signupsToday, w.signupRate / e.signupRate) : signupsToday;
  const actRatio = w.activation ? w.activation / e.activation : 1;
  const paid = k(v("paid"), actRatio);
  const payersToday = mul(signupsToday, R(e.paid));
  const payers = mul(signups, paid);
  const newMrr = mul(payers, arpa);
  const nrr = add(sub([1, 1], add(churn, contraction)), expansion);
  const grr = sub([1, 1], add(churn, contraction));

  // MRR: a fact, never moves. ARR = MRR × 12.
  const mrr = R(e.mrr);
  const arr = k(mrr, 12);

  // The curve: 13 points, today first; one loop for both ends.
  let curve = null;
  if (mrr && newMrr && nrr) {
    curve = [mrr];
    for (let t = 1; t <= 12; t += 1) {
      const prev = curve[t - 1];
      curve.push([prev[0] * nrr[0] + newMrr[0], prev[1] * nrr[1] + newMrr[1]]);
    }
  }
  const mrr12 = curve ? curve[12] : null;
  const arr12 = k(mrr12, 12);

  // One customer.
  const cacToday = R(e.cac);
  // With the what-ifs: the same spend for more payers.
  const cac = cacToday && payers && payersToday ? map2(cacToday, div(payersToday, payers), (c, r) => c * r) : cacToday;
  const monthlyMargin = margin && arpa ? mul(arpa, margin) : null;
  // Lifetime: 1 ÷ churn, capped (the low churn gives the long lifetime).
  const life = churn ? cap([1 / churn[1], 1 / churn[0]], LIFETIME_CAP) : null;
  const ltv = monthlyMargin && life ? mul(monthlyMargin, life) : null;
  const ratio = ltv && cac ? div(ltv, cac) : null;
  const gap = ltv && cac ? sub(ltv, cac) : null;
  const finding = !ltv || !cac ? null : hi(ltv) < lo(cac) ? "loss" : lo(ltv) >= hi(cac) ? "none" : "maybe";
  const payback = cac && monthlyMargin ? div(cac, monthlyMargin) : null; // not churn
  const after = life && payback ? sub(life, payback) : null;
  const spend = payersToday && cacToday ? mul(payersToday, cacToday) : null; // never moves
  const cash = spend && payback ? k(mul(spend, payback), 0.5) : null;

  return {
    motion: "ss", mrr, arr, curve, mrr12, arr12, payers, newMrr, nrr, grr,
    cac, ltv, ratio, gap, finding, payback, lifetime: life, after, spend, cash, monthlyMargin,
    // The cash floor: churn and contraction stretch the return, unless
    // expansion outpaces them (NRR above 100 %).
    floor: nrr ? hi(nrr) <= 1 : true,
    // When the customer leaves before paying back, the cash does not all
    // come back.
    comesBack: after ? lo(after) >= 0 : null,
    missing: [!margin && "margin", !cacToday && "cac"].filter(Boolean),
  };
};

/**
 * Sales-assisted: its own payback (ACV ÷ 12 × its own margin), its own
 * lifetime (from renewal), its own curve — annual contracts come up for
 * renewal evenly over the year, so the base moves in a straight line.
 */
export const salesAssisted = (e, w = {}) => {
  const v = (name) => R(w[name] ?? e[name]);
  const mrr = R(e.mrr);
  const arr = k(mrr, 12);
  const acv = v("acv");
  const margin = R(e.margin);
  const renewal = v("renewal"); // share of annual contracts renewed
  const deals = v("deals"); // new deals a month
  const dealsToday = R(e.deals);
  const newMrr = mul(deals, k(acv, 1 / 12));
  const lostShare = sub([1, 1], renewal); // a year's churn, spread evenly
  let curve = null;
  if (mrr && newMrr && lostShare) {
    const lostPerMonth = k(mul(mrr, lostShare), 1 / 12);
    curve = Array.from({ length: 13 }, (_, t) => [
      mrr[0] + t * (newMrr[0] - lostPerMonth[1]),
      mrr[1] + t * (newMrr[1] - lostPerMonth[0]),
    ]);
  }
  const mrr12 = curve ? curve[12] : null;
  const arr12 = k(mrr12, 12);
  const cacToday = R(e.cac);
  const cac = cacToday && deals && dealsToday ? map2(cacToday, div(dealsToday, deals), (c, r) => c * r) : cacToday;
  const monthlyMargin = margin && acv ? k(mul(acv, margin), 1 / 12) : null;
  const life = lostShare ? cap([12 / lostShare[1], 12 / lostShare[0]], LIFETIME_CAP) : null;
  const ltv = monthlyMargin && life ? mul(monthlyMargin, life) : null;
  const ratio = ltv && cac ? div(ltv, cac) : null;
  const gap = ltv && cac ? sub(ltv, cac) : null;
  const finding = !ltv || !cac ? null : hi(ltv) < lo(cac) ? "loss" : lo(ltv) >= hi(cac) ? "none" : "maybe";
  const payback = cac && monthlyMargin ? div(cac, monthlyMargin) : null;
  const after = life && payback ? sub(life, payback) : null;
  const spend = dealsToday && cacToday ? mul(dealsToday, cacToday) : null;
  const cash = spend && payback ? k(mul(spend, payback), 0.5) : null;
  return {
    motion: "sa", mrr, arr, curve, mrr12, arr12, payers: deals, newMrr, cac, ltv, ratio, gap, finding, monthlyMargin,
    payback, lifetime: life, after, spend, cash, floor: true, comesBack: after ? lo(after) >= 0 : null,
    missing: [!margin && "margin", !cacToday && "cac"].filter(Boolean),
  };
};

/** The hybrid: the ARR, the curve and the cash add up; nothing else does. */
export const hybrid = (ss, sa) => ({
  mrr: add(ss.mrr, sa.mrr),
  arr: add(ss.arr, sa.arr),
  curve: ss.curve && sa.curve ? ss.curve.map((p, i) => add(p, sa.curve[i])) : null,
  mrr12: add(ss.mrr12, sa.mrr12),
  arr12: add(ss.arr12, sa.arr12),
  cash: ss.cash && sa.cash ? add(ss.cash, sa.cash) : null,
});

/**
 * The long-payback warning (C49): its trigger is a slot. `limit` is what the
 * payback is compared with — the team's runway, or a payback target of the
 * team — in months, or null (no trigger: no warning, the two facts alone).
 * A published reference may situate, never trigger (constraint 2): it is
 * never passed here.
 * Returns null (nothing to say), "warn" or "maybe". Never when the loss
 * speaks: a customer who leaves first is the loss, not a late return.
 */
export const paybackWarning = (m, limit) => {
  if (limit == null || !m.payback || m.finding === "loss") return null;
  if (lo(m.payback) > limit) return "warn";
  if (hi(m.payback) > limit) return "maybe";
  return null;
};

/** What each lever brings on its own, together, and the difference. */
export const compounding = (fn, e, levers) => {
  const base = hi(fn(e).mrr12);
  const alone = levers.map((l) => ({ ...l, gain: hi(fn(e, { [l.key]: l.to }).mrr12) - base }));
  const all = Object.fromEntries(levers.map((l) => [l.key, l.to]));
  const together = hi(fn(e, all).mrr12) - base;
  const sum = alone.reduce((s, l) => s + l.gain, 0);
  return { alone, sum, together, extra: together - sum };
};
