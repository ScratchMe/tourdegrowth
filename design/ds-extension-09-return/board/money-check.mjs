// Checks the board's money against brief 09's table (the film's SaaS).
// node board/money-check.mjs
import { selfServe, salesAssisted, hybrid, compounding } from "./money.js";
import { FILM, HEALTHY, NO_MARGIN, MAYBE, SA } from "./engines.js";

const f = (r) => (r ? (r[0] === r[1] ? Math.round(r[0] * 100) / 100 : `${Math.round(r[0] * 100) / 100}–${Math.round(r[1] * 100) / 100}`) : "?");
const show = (name, m) => {
  console.log(`\n${name}`);
  for (const key of ["mrr", "arr", "mrr12", "arr12", "payers", "newMrr", "nrr", "grr", "cac", "ltv", "ratio", "gap", "payback", "lifetime", "after", "spend", "cash"]) {
    console.log(`  ${key.padEnd(9)} ${f(m[key])}`);
  }
  console.log(`  finding   ${m.finding}  comesBack ${m.comesBack}  floor ${m.floor}`);
};
show("Film, today", selfServe(FILM));
show("Film, three levers", selfServe(FILM, { churn: 0.04, expansion: 0.03, activation: 0.24 }));
show("Film, churn 4% alone", selfServe(FILM, { churn: 0.04 }));
show("Film, expansion 3% alone", selfServe(FILM, { expansion: 0.03 }));
console.log("\ncompounding", compounding(selfServe, FILM, [{ key: "activation", to: 0.24 }, { key: "churn", to: 0.04 }, { key: "expansion", to: 0.03 }]));
show("Healthy", selfServe(HEALTHY));
show("No margin", selfServe(NO_MARGIN));
show("Maybe", selfServe(MAYBE));
show("Sales-assisted", salesAssisted(SA));
const h = hybrid(selfServe(FILM), salesAssisted(SA));
console.log("\nhybrid", Object.fromEntries(Object.entries(h).map(([k, v]) => [k, Array.isArray(v) && Array.isArray(v[0]) ? "curve" : f(v)])));
