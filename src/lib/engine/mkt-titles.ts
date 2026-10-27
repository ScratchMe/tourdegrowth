import { fillTemplate, formatPerHundredCount, joinList } from "./format";
import { mapBounds, point } from "./interval";
import type { MktFunnelColumn, MktSideFunnel } from "./mkt-funnel";
import { numbered } from "./phrases";
import type { EngineStrings } from "./strings";
import { formatSum } from "./total";
import type { DerivedValue, EngineCalcContext, EngineDerived, EngineState, MktSide, SlideTitle, MktTotal } from "./types";
import { knownIn } from "./values";

/**
 * mkt-titles.ts — the two sentences a marketplace's board and deck both open with (engine spec §22.8.5 e, A23 MKT-7b,
 * MKT-R finding 39): the total of its two streams, and each side's funnel verdict. The SAME functions feed the board
 * (`Board`'s band, `EngineWorkbench#verdictOf`, a side's verdict) and the slides (`buildMarketplaceDeck`, MKT-8), as
 * `pelotonTitle` and `totalTitle` do for the other motions: a screen and a slide cannot word one engine two ways.
 *
 * Nothing here compares the two sides (D2, D14): the total is a sum, each funnel counts on its own 100 sign-ups, and no
 * function reads the other side's numbers.
 */

type Words = EngineStrings;

/** The streams of a total row, as the sum prints them: each part and the total, rounded to one common unit (`total.ts#formatSum`, §18.6.2). */
export interface StreamSum {
  demand: string;
  supply: string;
  total: string;
  /** Both parts were typed as counts: the sum is exact, printed without « ~ ». */
  exact: boolean;
}

/**
 * A total row's two streams, formatted by the rule of every sum here (`formatSum`: the parts rounded to one common unit, so the
 * reader redoes the addition on a calculator). null when either part is unknown (S9) — never one stream passed off as the
 * total — or when the sellers pay nothing and there is no second stream to add.
 */
export function streamSum(row: MktTotal["now"], state: EngineState, ctx: EngineCalcContext, strings: Words): StreamSum | null {
  if (!row.supply) return null;
  // `formatSum` reads a hybrid's row (`plg`, `slg`): the first stream and the second, in the order of the sum.
  const printed = formatSum({ plg: row.demand, slg: row.supply, total: row.total }, state.setup.currency, ctx, strings.units);
  return printed ? { demand: printed.plg, supply: printed.slg, total: printed.total, exact: printed.exact } : null;
}

/**
 * The band's title and the deck's first one (`mktTotal`): the two streams summed — the commissions' net revenue and the
 * sellers' subscriptions — or which stream is not measured (S9: a total exists only when both of its parts do). Only for a
 * marketplace whose sellers pay a subscription: with one stream there is no sum, and no title (`mktFunnelTitle` of the demand opens the board).
 */
export function mktTotalTitle(derived: EngineDerived, state: EngineState, strings: Words, ctx: EngineCalcContext): SlideTitle {
  const total = derived.motions.find((m): m is Extract<EngineDerived["motions"][number], { motion: "mkt" }> => m.motion === "mkt")?.total;
  if (!total?.now.supply) throw new Error("mktTotalTitle: a marketplace whose sellers pay no subscription has no total to title");
  const sum = streamSum(total.now, state, ctx, strings);
  if (sum) return { key: "mktTotal", values: { total: sum.total, demand: sum.demand, supply: sum.supply } };
  const known = (part: DerivedValue) => part.kind === "known";
  const demandKnown = known(total.now.demand);
  const supplyKnown = known(total.now.supply);
  if (!demandKnown && !supplyKnown) return { key: "mktTotalUnknownBoth", values: {} };
  return { key: "mktTotalUnknown", values: { stream: demandKnown ? strings.mkt.total.ofSupply : strings.mkt.total.ofDemand } };
}

/** A column's clause of the verdict (`mkt.funnel.clause*`), and the placeholder that clause counts under (`{a}`, `{r}`, `{p}`). */
const CLAUSES = {
  "mkt.buy.first-order": ["clauseFirst", "a"],
  "mkt.buy.repeat": ["clauseRepeat", "r"],
  "mkt.sell.first-sale": ["clauseFirstSale", "a"],
  "mkt.sell.paid-conversion": ["clausePaid", "p"],
} as const satisfies Record<MktFunnelColumn["metric"], readonly [string, string]>;

/** The `unmeasured` phrase of a column — « la première commande », « la conversion en abonné » — feminine, like the peloton's. */
const UNMEASURED = {
  "mkt.buy.first-order": "first",
  "mkt.buy.repeat": "repeat",
  "mkt.sell.first-sale": "firstSale",
  "mkt.sell.paid-conversion": "paid",
} as const satisfies Record<MktFunnelColumn["metric"], keyof Words["mkt"]["funnel"]["unmeasured"]>;

/**
 * One side's verdict (§22.8.5 e): « Sur 100 inscrits côté acheteurs, 20 passent une première commande et **5 en passent une
 * deuxième**. » — each column counted on the SAME 100 sign-ups of its side, its verb agreeing with its own printed count
 * (« 1 passe »), read from the column's RAW rate so « moins de 1 » survives where the grid rounds to 0 — or what the funnel
 * does not let us see (a gap, a tail break, nothing). A side has two columns at most (the sellers' one without a
 * subscription), so only the `One` forms of the unmeasured cases exist; `funnel.chain` says which case it is.
 */
export function mktFunnelTitle(funnel: MktSideFunnel, side: MktSide, state: EngineState, strings: Words, ctx: EngineCalcContext): SlideTitle {
  const f = strings.mkt.funnel;
  const clauses = funnel.columns.map((column) => {
    const known = knownIn(state, column.metric, ctx);
    if (known.kind !== "known") return null;
    // As printed: under half a person the count reads « moins de 1 », which French agrees in the singular.
    const printed = known.value.hi > 0 && known.value.hi < 0.5 ? point(0) : mapBounds(known.value, Math.round);
    const [key, placeholder] = CLAUSES[column.metric];
    return fillTemplate(f[numbered(key, printed, ctx.locale)], { [placeholder]: formatPerHundredCount(known.value, ctx, strings.units) });
  });
  const keyOf = (name: "Complete" | "CompleteOne" | "GapOne" | "TailBreakOne" | "Empty") => `${side === "demand" ? "mktFunnel" : "mktSupplyFunnel"}${name}` as SlideTitle["key"];

  if (funnel.chain === "complete") {
    if (side === "supply" && clauses.length === 1) return { key: keyOf("CompleteOne"), values: { first: clauses[0]! } };
    return { key: keyOf("Complete"), values: { first: clauses[0]!, [side === "demand" ? "repeat" : "paid"]: clauses[1]! } };
  }
  if (funnel.chain === "empty") return { key: keyOf("Empty"), values: {} };

  const known = clauses.filter((c): c is string => c !== null);
  const unknown = funnel.columns.filter((_, i) => clauses[i] === null).map((c) => f.unmeasured[UNMEASURED[c.metric]]);
  return { key: keyOf(funnel.chain === "gap" ? "GapOne" : "TailBreakOne"), values: { clauses: joinList(known, strings.grammar), stages: joinList(unknown, strings.grammar) } };
}
