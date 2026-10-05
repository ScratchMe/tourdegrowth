// node board/market-check.mjs — the board's replica of the marketplace's
// money against brief 10's table ("The numbers on the screenshots you will
// draw"). Every figure the screens print comes from board/market.js.
import { demand, supply, total, leakDemand, leakSupply, compounding } from "./market.js";
import { DEMAND, SUPPLY, SUPPLY_NOSUBS, DEMAND_NOMARGIN, WHATIF } from "./fixture.js";

const near = (a, b, tol = 0.01) => Math.abs(a - b) <= tol;
let failed = 0;
const check = (label, got, want, tol) => {
  const ok = Array.isArray(want) ? near(got[0], want[0], tol) && near(got[1], want[1], tol) : near(got, want, tol);
  if (!ok) failed += 1;
  console.log(`${ok ? "ok  " : "FAIL"} ${label}: ${JSON.stringify(got)}${ok ? "" : ` (want ${JSON.stringify(want)})`}`);
};

const d0 = demand(DEMAND);
const d1 = demand(DEMAND, WHATIF.demand);
const s0 = supply(SUPPLY);
const s1 = supply(SUPPLY, WHATIF.supply);

check("demand net revenue", d0.thisMonth[0], 32853.6);
check("demand annualised", d0.annual[0], 394243.2);
check("demand GMV", d0.gmv[0], 273780);
check("demand per buyer", d0.perBuyer[0], 2.34);
check("demand new a month", d0.fresh[0], 1404);
check("demand new buyers", d0.newBuyers, 600);
check("demand in 12 months", d0.in12[0], 33723.61);
check("demand with what-ifs", d1.in12[0], 46351.72);
check("demand gain", d1.in12[0] - d0.in12[0], 12628.11);
check("buyer CAC", d0.cost[0], 30);
check("buyer LTV", d0.ltv, [32.175, 38.025]);
check("buyer payback", d0.payback, [19.72, 23.31], 0.01);
check("buyer LTV:CAC", d0.ratio, [1.0725, 1.2675], 0.001);
check("demand spend", d0.spend[0], 18000);
check("demand cash", d0.cash, [177515, 209790], 5);

const leakD = leakDemand(DEMAND);
check("leak: fill rate worth", leakD[0].worth, 468);
check("leak: first order worth", leakD[1].worth, 351);

check("supply MRR", s0.thisMonth[0], 26100);
check("supply annualised", s0.annual[0], 313200);
check("supply new a month", s0.fresh[0], 1740);
check("supply new paid", s0.newPaid, 60);
check("supply in 12 months", s0.in12[0], 35866.43);
check("supply with what-if", s1.in12[0], 41785.48);
check("supply gain", s1.in12[0] - s0.in12[0], 5919.05);
check("paid seller cost", s0.cost[0], 200);
check("paid seller LTV", s0.ltv[0], 821.67);
check("paid seller payback", s0.payback[0], 8.11);
check("paid seller LTV:CAC", s0.ratio[0], 4.11);
check("supply spend", s0.spend[0], 12000);
check("supply cash (brief: ~€49,000)", s0.cash[0], 48681.54, 1);

const leakS = leakSupply(SUPPLY);
check("leak: conversion worth", leakS[0].worth, 580);
check("leak: paid churn kept", leakS[1].worth, 130.5);
console.log(`     leak: first sale named, unpriced: ${leakS[2].key} worth ${leakS[2].worth}`);

const t0 = total(d0, s0);
const t1 = total(d1, s1);
check("total this month", t0.thisMonth[0], 58953.6);
check("total annualised", t0.annual[0], 707443.2);
check("total new a month", t0.fresh[0], 3144);
check("total in 12 months", t0.in12[0], 69590.04);
check("total with what-ifs", t1.in12[0], 88137.19);

console.log("     no subscriptions:", JSON.stringify(supply(SUPPLY_NOSUBS)), "total:", total(d0, supply(SUPPLY_NOSUBS)));
const dn = demand(DEMAND_NOMARGIN);
console.log("     no margin: ltv", dn.ltv, "payback", dn.payback, "cash", dn.cash, "missing", dn.missing);

const c = compounding(demand, DEMAND, Object.entries(WHATIF.demand).map(([key, to]) => ({ key, to })));
console.log("     compounding:", c.alone.map((l) => `${l.key} +${l.gain.toFixed(2)}`).join(", "), `sum ${c.sum.toFixed(2)} together ${c.together.toFixed(2)} extra ${c.extra.toFixed(2)}`);
console.log("     step at month 1 (demand):", (d1.curve[1][0] - d0.curve[1][0]).toFixed(2), "of which re-pricing", (d1.curve[1][0] - d0.curve[1][0] - (d1.fresh[0] - d0.fresh[0])).toFixed(2));
console.log("     with what-ifs: cost", d1.cost, "ltv", d1.ltv, "payback", d1.payback, "cash", d1.cash, "ratio", d1.ratio);
console.log("     supply with what-if: cost", s1.cost, "ltv", s1.ltv, "payback", s1.payback, "cash", s1.cash, "ratio", s1.ratio);
process.exit(failed ? 1 : 0);
