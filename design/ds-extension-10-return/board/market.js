// The marketplace's money, as ENGINE.md §22.5 (`docs/engine/place-de-marche.md`)
// computes it — a board-only replica, so every figure the screens draw comes
// from one calculation and brief 10's table can be checked against it
// (`node board/market-check.mjs`). Not ported: the app has its own model,
// coded and tested.
//
// Every quantity is a range [lo, hi]: an estimate stays a range at every step
// (a typed figure is [x, x]). `null` means unknown: the figure prints "?".

const R = (x) => (x == null ? null : Array.isArray(x) ? x : [x, x]);
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
const lo = (r) => r[0];
const hi = (r) => r[1];

export const LIFETIME_CAP = 36; // months, the engine's cap on a counted lifetime

// The loop both streams share (an MRR loop): kept at (1 − churn) each month,
// plus the month's new revenue. `base1` is the base the loop starts from at
// month 1: today's, or — when a money lever moved (take rate, order value,
// frequency; the subscription price) — today's base re-priced, which is why
// the what-if curve jumps at month 1.
const loop = (start, base1, churn, fresh) => {
  if (!start || !base1 || !churn || !fresh) return null;
  const keep = sub([1, 1], churn);
  const pts = [start];
  let prev = base1;
  for (let t = 1; t <= 12; t += 1) {
    const next = [prev[0] * keep[0] + fresh[0], prev[1] * keep[1] + fresh[1]];
    pts.push(next);
    prev = next;
  }
  return pts;
};

// One unit (a buyer, a paid seller): what it costs, what it brings back.
const unit = ({ cost, monthlyMargin, churn, newUnits }) => {
  const life = churn ? cap([1 / churn[1], 1 / churn[0]], LIFETIME_CAP) : null;
  const ltv = monthlyMargin && life ? mul(monthlyMargin, life) : null;
  const ratio = ltv && cost ? div(ltv, cost) : null;
  const gap = ltv && cost ? sub(ltv, cost) : null;
  const finding = !ltv || !cost ? null : hi(ltv) < lo(cost) ? "loss" : lo(ltv) >= hi(cost) ? "none" : "maybe";
  const payback = cost && monthlyMargin ? div(cost, monthlyMargin) : null;
  const after = life && payback ? sub(life, payback) : null;
  return { cost, monthlyMargin, lifetime: life, ltv, ratio, gap, finding, payback, after };
};

/**
 * Demand: the buyers. The marketplace keeps a commission on every order; its
 * revenue is the net revenue = GMV × take rate = active buyers × what one
 * active buyer brings a month (order frequency × average order value × take
 * rate). `e` holds the side's typed numbers; `w` the what-ifs, as absolute
 * values of the levers ({ fillRate: 0.12, takeRate: 0.13 }).
 */
export const demand = (e, w = {}) => {
  const v = (name) => R(w[name] ?? e[name]);
  const moved = Object.keys(w).length > 0;
  const perBuyerToday = e.frequency && e.aov && e.takeRate ? R(e.frequency * e.aov * e.takeRate) : null;
  const perBuyer = mul(mul(v("frequency"), v("aov")), v("takeRate")); // € a month, one active buyer
  const net = perBuyerToday ? k(perBuyerToday, e.activeBuyers) : null; // this month: a fact
  const gmv = e.frequency && e.aov ? R(e.activeBuyers * e.frequency * e.aov) : null;
  // New buyers a month: buyer sign-ups × first order; the fill rate prices
  // liquidity on new buyers only (the engine says that is a minimum).
  const ratio = (name) => (w[name] != null ? w[name] / e[name] : 1);
  const referredLift = w.referred != null ? (1 - e.referred) / (1 - w.referred) : 1;
  const signups = e.signups * ratio("signupRate") * referredLift;
  const newBuyersToday = e.signups * e.firstOrder;
  const newBuyers = signups * e.firstOrder * ratio("firstOrder") * ratio("fillRate");
  const fresh = perBuyer ? k(perBuyer, newBuyers) : null;
  const base1 = perBuyer ? k(perBuyer, e.activeBuyers) : null;
  const churn = v("churn");
  const curve = loop(net, base1, churn, fresh);
  const in12 = curve ? curve[12] : null;
  // One buyer. The same acquisition spend with the what-ifs: more new buyers
  // make each one cheaper.
  const spend = e.cac != null ? R(newBuyersToday * e.cac) : null; // never moves
  const cost = e.cac != null ? R(e.cac * (newBuyersToday / newBuyers)) : null;
  const margin = R(e.margin); // the commissions' own margin; never the subscriptions'
  const monthlyMargin = perBuyer && margin ? mul(perBuyer, margin) : null;
  const u = unit({ cost, monthlyMargin, churn, newUnits: newBuyers });
  const cash = spend && u.payback ? k(mul(spend, u.payback), 0.5) : null;
  return {
    side: "demand", moved,
    thisMonth: net, annual: k(net, 12), gmv, perBuyer, newBuyers, newBuyersToday,
    fresh, curve, in12, annual12: k(in12, 12),
    ...u, spend, cash,
    missing: [!margin && "margin", e.cac == null && "cac"].filter(Boolean),
  };
};

/**
 * Supply: the sellers. Only when the team ticks "Sellers pay a subscription"
 * does supply earn money of its own: the subscription MRR. Without it, supply
 * has no money (`subscriptions: false`) — it shows in the fill rate.
 * The cost of a paid seller is derived: cost per active seller × first sale
 * ÷ subscription conversion.
 */
export const supply = (e, w = {}) => {
  if (!e.subscriptions) return { side: "supply", subscriptions: false };
  const v = (name) => R(w[name] ?? e[name]);
  const moved = Object.keys(w).length > 0;
  const price = v("price");
  const mrr = R(e.paidSellers * e.price); // this month: a fact
  const conversion = v("conversion");
  const newPaidToday = e.sellerSignups * e.conversion;
  const newPaid = e.sellerSignups * conversion[0];
  const fresh = price ? k(price, newPaid) : null;
  const base1 = price ? k(price, e.paidSellers) : null;
  const churn = v("paidChurn");
  const curve = loop(mrr, base1, churn, fresh);
  const in12 = curve ? curve[12] : null;
  const costToday = e.costPerActive != null ? e.costPerActive * e.firstSale / e.conversion : null;
  const cost = e.costPerActive != null ? R(e.costPerActive * e.firstSale / conversion[0]) : null;
  const spend = costToday != null ? R(newPaidToday * costToday) : null; // never moves
  const margin = R(e.subMargin); // the subscriptions' own margin; never the commissions'
  const monthlyMargin = price && margin ? mul(price, margin) : null;
  const u = unit({ cost, monthlyMargin, churn, newUnits: newPaid });
  const cash = spend && u.payback ? k(mul(spend, u.payback), 0.5) : null;
  return {
    side: "supply", subscriptions: true, moved,
    thisMonth: mrr, annual: k(mrr, 12), newPaid, newPaidToday, fresh, curve, in12, annual12: k(in12, 12),
    ...u, spend, cash, costPerActive: e.costPerActive,
    missing: [!margin && "margin", e.costPerActive == null && "cost"].filter(Boolean),
  };
};

/** The total: a sum, never a comparison. With no subscriptions, no total. */
export const total = (d, s) => {
  if (!s.subscriptions) return null;
  return {
    thisMonth: add(d.thisMonth, s.thisMonth),
    annual: add(d.annual, s.annual),
    fresh: add(d.fresh, s.fresh),
    in12: add(d.in12, s.in12),
  };
};

/**
 * The leak of a side: each stage under its team target, priced as the side's
 * new revenue a month at the target (supply's churn: the revenue kept), the
 * named stage being the one worth most. Supply's first sale is named,
 * unpriced (C67). Fewer than two priced targets on a side… the engine's rule
 * stays the engine's: here the screens' data are given.
 */
export const leakDemand = (e) => {
  const today = demand(e);
  const worth = (key) => {
    if (e.targets[key] == null || e[key] >= e.targets[key]) return null;
    const m = demand(e, { [key]: e.targets[key] });
    return m.fresh[0] - today.fresh[0];
  };
  return ["fillRate", "firstOrder"].map((key) => ({ key, value: e[key], target: e.targets[key], worth: worth(key) }))
    .filter((x) => x.worth != null).sort((a, b) => b.worth - a.worth);
};

export const leakSupply = (e) => {
  const out = [];
  if (e.subscriptions && e.targets.conversion != null && e.conversion < e.targets.conversion) {
    out.push({ key: "conversion", value: e.conversion, target: e.targets.conversion, worth: e.sellerSignups * (e.targets.conversion - e.conversion) * e.price });
  }
  if (e.subscriptions && e.targets.paidChurn != null && e.paidChurn > e.targets.paidChurn) {
    out.push({ key: "paidChurn", value: e.paidChurn, target: e.targets.paidChurn, worth: e.paidSellers * e.price * (e.paidChurn - e.targets.paidChurn), kept: true });
  }
  out.sort((a, b) => b.worth - a.worth);
  if (e.targets.firstSale != null && e.firstSale < e.targets.firstSale) {
    out.push({ key: "firstSale", value: e.firstSale, target: e.targets.firstSale, worth: null });
  }
  return out;
};

/** What each lever brings on its own on the side's 12-month figure, together, and the difference. */
export const compounding = (fn, e, levers) => {
  const base = fn(e).in12[1];
  const alone = levers.map((l) => ({ ...l, gain: fn(e, { [l.key]: l.to }).in12[1] - base }));
  const all = Object.fromEntries(levers.map((l) => [l.key, l.to]));
  const together = fn(e, all).in12[1] - base;
  const sum = alone.reduce((acc, l) => acc + l.gain, 0);
  return { alone, sum, together, extra: together - sum };
};

// The money levers apply to every unit from next month: the what-if curve
// jumps at month 1 (MrrCurve.delta.md, `step`).
export const MONEY_LEVERS = { demand: ["takeRate", "aov", "frequency"], supply: ["price"] };
