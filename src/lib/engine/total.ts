import { fillTemplate, formatInterval, type UnitWords } from "./format";
import { add, mapBounds } from "./interval";
import { buildScenario, mrrToday } from "./scenario";
import { knownSharedCount } from "./shared-counts";
import { buildSlgScenario, oppsCreated, slgMrrToday } from "./slg-scenario";
import { wonPerQuarter } from "./slg-impact";
import type { Confidence, DerivedValue, EngineCalcContext, EngineState, Interval, MetricId, TotalView } from "./types";
import { countsOf, currentSnapshot, entryOf, knownIn } from "./values";

/**
 * total.ts — « deux moteurs, un total » (engine spec §18.6.2), the hybrid only.
 *
 * The one module that reads both motions, and it only ADDS: the MRR, the
 * new MRR a month, the MRR in twelve months at the current pace. It never
 * compares, ranks or subtracts one motion from the other (§18.6.4), and a
 * leak of one motion is never added to the other's (§18.5.4).
 *
 * **A total exists only when both of its parts do (S9).** With one part
 * unknown, the total is `uncomputable` and names the missing part — never
 * the known part passed off as the total: a partial total presented as a
 * total is exactly the false precision §16 R1 fights.
 *
 * **Who counts where (S8, C25 Q3).** A customer counts in the motion that
 * signed its current contract. That rule is the entries' (the person types
 * each motion's MRR by it, and the sheets say so); this module trusts it and
 * adds — the footer of the `total` slide prints it.
 */

type Part = DerivedValue;

/** A part known, or uncomputable naming the inputs it lacks — the unknown ones first, else the first one. */
function part(state: EngineState, ctx: EngineCalcContext, value: Interval | null, confidence: Exclude<Confidence, "unknown">, inputs: MetricId[]): Part {
  if (value) return { kind: "known", value, confidence };
  const unknown = inputs.filter((id) => knownIn(state, id, ctx).kind !== "known");
  return { kind: "uncomputable", missing: unknown.length > 0 ? unknown : inputs.slice(0, 1) };
}

/** Two parts added: both known, or uncomputable with what each one lacks (S9). */
export function sumParts(a: Part, b: Part): Part {
  if (a.kind === "known" && b.kind === "known") {
    return { kind: "known", value: add(a.value, b.value), confidence: a.confidence === "solid" && b.confidence === "solid" ? "solid" : "approximate" };
  }
  return { kind: "uncomputable", missing: [...(a.kind === "uncomputable" ? a.missing : []), ...(b.kind === "uncomputable" ? b.missing : [])] };
}

export function buildTotal(state: EngineState, ctx: EngineCalcContext): TotalView | null {
  const { motions } = state.setup;
  if (!(motions.plg && motions.slg)) return null;
  const snapshot = currentSnapshot(state);

  // The MRR: two amounts typed as counts add to an EXACT sum, without « ~ ».
  const plgTyped = knownSharedCount(snapshot, "mrrEnd") !== null;
  const plgMrr = part(state, ctx, mrrToday(state, ctx), plgTyped ? "solid" : "approximate", ["rev.arpa"]);
  const slgTyped = countsOf(entryOf(snapshot, "slg.rev.arpa")) !== null;
  const slgMrr = part(state, ctx, slgMrrToday(state, ctx), slgTyped ? "solid" : "approximate", ["slg.rev.arpa"]);

  // New MRR a month and in twelve months: models (the average price, the current pace), never exact.
  const plg = buildScenario(state, {}, ctx).today.kpis;
  const slg = buildSlgScenario(state, {}, ctx).today;
  const slgNewInputs: MetricId[] = wonPerQuarter(state) ? ["slg.rev.acv"] : ["slg.rev.win-rate", "slg.rev.acv"];
  const plgNew = part(state, ctx, plg.newMrr, "approximate", ["rev.arpa", "acq.cac"]);
  const slgNew = part(state, ctx, slg.newMrr, "approximate", slgNewInputs);
  const plg12 = part(state, ctx, plg.mrr12, "approximate", ["rev.arpa", "acq.cac", "ret.logo-churn"]);
  const slg12 = part(state, ctx, slg.mrr12, "approximate", ["slg.rev.arpa", ...slgNewInputs, "slg.ret.renewal"]);

  const linkCounts = countsOf(entryOf(snapshot, "link.pql-handoff"));
  return {
    mrr: { plg: plgMrr, slg: slgMrr, total: sumParts(plgMrr, slgMrr) },
    newMrrPerMonth: { plg: plgNew, slg: slgNew, total: sumParts(plgNew, slgNew) },
    mrrIn12Months: { plg: plg12, slg: slg12, total: sumParts(plg12, slg12) },
    link: { known: knownIn(state, "link.pql-handoff", ctx), fromSelfServe: linkCounts?.numerator ?? null, oppsCreated: oppsCreated(state) },
  };
}

/** `v` rounded to a multiple of `unit`, a power of ten — without the float residue of 0.1 × 3. */
function toUnit(v: number, unit: number): number {
  const steps = Math.round(v / unit);
  return unit >= 1 ? steps * unit : steps / Math.round(1 / unit);
}

/**
 * The rule a sum is displayed by (§18.6.2): the parts rounded to ONE common
 * unit, the one of the two significant digits of the smallest part, and the
 * total printed is the sum of the parts printed — the reader redoes the
 * addition on a calculator, as with the §6.7 chain. Exact parts (two amounts
 * typed as counts) print as they are.
 */
export function displayedSum(parts: readonly Interval[], exact: boolean): { parts: Interval[]; total: Interval } {
  const sum = (xs: readonly Interval[]) => xs.reduce((acc, x) => add(acc, x), { lo: 0, hi: 0 });
  if (exact) return { parts: [...parts], total: sum(parts) };
  const smallest = Math.min(...parts.flatMap((p) => [Math.abs(p.lo), Math.abs(p.hi)]).filter((v) => v > 0));
  if (!Number.isFinite(smallest)) return { parts: [...parts], total: sum(parts) };
  const unit = 10 ** (Math.floor(Math.log10(smallest)) - 1);
  const shown = parts.map((p) => mapBounds(p, (v) => toUnit(v, unit)));
  return { parts: shown, total: sum(shown) };
}

/**
 * A total line, formatted: each part and the total, by `displayedSum`.
 * null when the total is uncomputable — the consumer then says which part is
 * missing (`total.missing`), never prints the known one alone.
 */
export function formatSum(
  row: TotalView["mrr"],
  currency: EngineState["setup"]["currency"],
  ctx: EngineCalcContext,
  words: UnitWords,
): { plg: string; slg: string; total: string; exact: boolean } | null {
  if (row.plg.kind !== "known" || row.slg.kind !== "known") return null;
  const exact = row.total.kind === "known" && row.total.confidence === "solid";
  const { parts, total } = displayedSum([row.plg.value, row.slg.value], exact);
  const print = (i: Interval) => {
    const amount = formatInterval(i, "money", ctx, words, { currency });
    return exact ? amount : fillTemplate(words.approx, { n: amount });
  };
  return { plg: print(parts[0]!), slg: print(parts[1]!), total: print(total), exact };
}
