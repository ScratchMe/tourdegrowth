import { LTV_CAP_MONTHS, derivedShapeOf } from "./catalog-shape";
import { div, mapBounds, mul, scale } from "./interval";
import type {
  Confidence,
  DerivedId,
  DerivedValue,
  EngineCalcContext,
  EngineState,
  Interval,
  Known,
  MetricId,
  Motion,
  SlgUnitEconomics,
  UnitEconomics,
} from "./types";
import { currentSnapshot, entryOf, knownIn } from "./values";

/**
 * unit-economics.ts — what a customer is worth (engine spec §5.7, §6.8).
 *
 * The computed figures, in intervals, and never 0: an input that
 * isn't known makes the figure "uncomputable — missing: …" with the inputs
 * named. **Never a fallback on revenue when the margin is missing**: the
 * glossary says it plainly — revenue pays nothing back, margin does, and the
 * revenue version is the flattering one (500 ÷ 120 = 4.2 months looks far
 * better than the truth). The CAC's variant always travels with the result,
 * because "media-only CAC" and "fully loaded CAC" are two different numbers
 * that print the same.
 */

type Knowns = Record<MetricId, Known>;

/**
 * The inputs to name in "can't be computed — missing: …". Usually the
 * unknown ones; when every input is known and the figure still can't be
 * computed, it is because a divisor spans 0 (a margin estimated at -5 to
 * 10 %) — that input is named, so the sentence never ends on nothing.
 */
function missingOf(id: DerivedId, knowns: Partial<Knowns>): MetricId[] {
  const inputs = derivedShapeOf(id).inputs;
  const unknown = inputs.filter((input) => knowns[input]?.kind !== "known");
  if (unknown.length > 0) return unknown;
  return inputs.filter((input) => {
    const k = knowns[input];
    return k?.kind === "known" && k.value.lo <= 0 && k.value.hi >= 0;
  });
}

function confidenceOfInputs(id: DerivedId, knowns: Partial<Knowns>): Exclude<Confidence, "unknown"> {
  return derivedShapeOf(id).inputs.every((input) => {
    const k = knowns[input];
    return k?.kind === "known" && k.confidence === "solid";
  })
    ? "solid"
    : "approximate";
}

function known(k: Known | undefined): Interval | null {
  return k?.kind === "known" ? k.value : null;
}

/** Months of margin a customer is counted for: 1 ÷ monthly churn, capped at 36 — "we take the low end" of three to five years. */
export function lifetimeMonths(churnPercent: Interval): Interval {
  const months = (c: number) => (c <= 0 ? LTV_CAP_MONTHS : Math.min(100 / c, LTV_CAP_MONTHS));
  // Higher churn, shorter life: the bounds swap.
  return { lo: months(churnPercent.hi), hi: months(churnPercent.lo) };
}

/**
 * Monthly GRR and NRR, in percent, from the churn and the two MRR movements
 * (2026-09-26). GRR = 100 − churn − contraction, floored at 0; NRR = GRR +
 * expansion. The churn is LOGO churn standing in for revenue churn — the
 * engine does not ask for churned MRR — so the result is never "solid".
 * Pure: shared with « Et si ? », which feeds it targets instead of readings.
 */
export function revenueRetention(churn: Interval, contraction: Interval, expansion: Interval | null): { grr: Interval; nrr: Interval | null } {
  const grr = { lo: Math.max(0, 100 - churn.hi - contraction.hi), hi: Math.max(0, 100 - churn.lo - contraction.lo) };
  return { grr, nrr: expansion ? { lo: grr.lo + expansion.lo, hi: grr.hi + expansion.hi } : null };
}

export function unitEconomics(state: EngineState, ctx: EngineCalcContext): UnitEconomics {
  const ids: MetricId[] = ["acq.cac", "rev.arpa", "rev.gross-margin", "ret.logo-churn", "rev.expansion", "rev.contraction"];
  const knowns = Object.fromEntries(ids.map((id) => [id, knownIn(state, id, ctx)])) as Partial<Knowns>;

  const cac = known(knowns["acq.cac"]);
  const arpa = known(knowns["rev.arpa"]);
  const margin = known(knowns["rev.gross-margin"]);
  const churn = known(knowns["ret.logo-churn"]);

  // Gross profit per customer per month: ARPA × margin — never ARPA alone.
  const monthlyMargin = arpa && margin ? mul(arpa, scale(margin, 1 / 100)) : null;

  const result = (id: DerivedId, value: Interval | null): DerivedValue =>
    value
      ? { kind: "known", value, confidence: confidenceOfInputs(id, knowns) }
      : { kind: "uncomputable", missing: missingOf(id, knowns) };

  const ltvValue = monthlyMargin && churn ? mul(monthlyMargin, lifetimeMonths(churn)) : null;
  // A margin that includes 0 has no payback at all: `div` says null, and the figure is uncomputable, not infinite.
  const paybackValue = cac && monthlyMargin ? div(cac, monthlyMargin) : null;
  const ltvCacValue = ltvValue && cac ? div(ltvValue, cac) : null;

  const contraction = known(knowns["rev.contraction"]);
  const expansion = known(knowns["rev.expansion"]);
  const retention = churn && contraction ? revenueRetention(churn, contraction, expansion) : null;
  // Logo churn stands in for revenue churn: never solid, whatever the inputs' own confidence.
  const approximate = (id: DerivedId, value: Interval | null): DerivedValue => {
    const r = result(id, value);
    return r.kind === "known" ? { ...r, confidence: "approximate" } : r;
  };

  const entry = currentSnapshot(state).metrics["acq.cac"];
  return {
    cacVariant: entry?.variant ?? null,
    ltv: result("rev.ltv", ltvValue),
    payback: result("rev.cac-payback", paybackValue && mapBounds(paybackValue, (v) => Math.max(0, v))),
    ltvCac: result("rev.ltv-cac", ltvCacValue),
    grr: approximate("rev.grr", retention?.grr ?? null),
    nrr: approximate("rev.nrr", retention?.nrr ?? null),
  };
}

// --- Sales-assisted (§18.5.6) ------------------------------------------------

/**
 * Months a sales-assisted customer is counted for, from the renewal of
 * contracts up for renewal (C25 Q6: the same 36-month cap as self-serve).
 * An annual contract that renews at r % lives 12 ÷ (1 − r/100) months; a
 * monthly one, 1 ÷ (1 − r/100). A higher renewal gives a longer life: no
 * bound swaps here, unlike churn.
 */
export function slgLifetimeMonths(renewalPercent: Interval, term: "annual" | "monthly"): Interval {
  const months = (r: number) => (r >= 100 ? LTV_CAP_MONTHS : Math.min((term === "annual" ? 12 : 1) / (1 - r / 100), LTV_CAP_MONTHS));
  return { lo: months(renewalPercent.lo), hi: months(renewalPercent.hi) };
}

/**
 * The sales-assisted computed figures: from the NEW contracts' ACV (the CAC
 * is spent on them, §18.4.7) and the motion's OWN margin (C25 Q4). A margin
 * unknown makes all three uncomputable — never a fallback on revenue, never
 * self-serve's margin. A margin taken from the company's (`company-wide`) is
 * an estimate: the three come out approximate, as any estimate does.
 */
export function slgUnitEconomics(state: EngineState, ctx: EngineCalcContext): SlgUnitEconomics {
  const ids: MetricId[] = ["slg.acq.cac", "slg.rev.acv", "slg.rev.gross-margin", "slg.ret.renewal"];
  const knowns = Object.fromEntries(ids.map((id) => [id, knownIn(state, id, ctx)])) as Partial<Knowns>;

  const cac = known(knowns["slg.acq.cac"]);
  const acv = known(knowns["slg.rev.acv"]);
  const margin = known(knowns["slg.rev.gross-margin"]);
  const renewal = known(knowns["slg.ret.renewal"]);
  const term = renewal ? (entryOf(currentSnapshot(state), "slg.ret.renewal")?.variant === "monthly" ? "monthly" : "annual") : null;

  // Gross profit per new contract per month: ACV ÷ 12 × margin — never the ACV alone.
  const monthlyMargin = acv && margin ? mul(scale(acv, 1 / 12), scale(margin, 1 / 100)) : null;
  const lifetime = renewal && term ? slgLifetimeMonths(renewal, term) : null;

  const result = (id: DerivedId, value: Interval | null): DerivedValue =>
    value
      ? { kind: "known", value, confidence: confidenceOfInputs(id, knowns) }
      : { kind: "uncomputable", missing: missingOf(id, knowns) };

  const ltvValue = monthlyMargin && lifetime ? mul(monthlyMargin, lifetime) : null;
  const paybackValue = cac && monthlyMargin ? div(cac, monthlyMargin) : null;
  const ltvCacValue = ltvValue && cac ? div(ltvValue, cac) : null;
  const renewalKnown = knowns["slg.ret.renewal"];

  const entry = currentSnapshot(state).metrics["slg.acq.cac"];
  return {
    cacVariant: entry?.variant ?? null,
    renewalTerm: term,
    lifetimeMonths:
      lifetime && renewalKnown?.kind === "known"
        ? { kind: "known", value: lifetime, confidence: renewalKnown.confidence }
        : { kind: "uncomputable", missing: ["slg.ret.renewal"] },
    ltv: result("slg.rev.ltv", ltvValue),
    payback: result("slg.rev.cac-payback", paybackValue && mapBounds(paybackValue, (v) => Math.max(0, v))),
    ltvCac: result("slg.rev.ltv-cac", ltvCacValue),
  };
}

/**
 * « Clients perdus sur un an », the line the two motions share on the slide
 * that sets them side by side (C25 Q5) — one unit per line, never a monthly
 * rate next to an annual one. Self-serve: the monthly logo churn compounded,
 * 100 × (1 − (1 − c)^12), always approximate (it assumes the churn holds all
 * year). Sales-assisted: the contracts up for renewal that weren't renewed,
 * 100 − r for annual contracts; monthly ones compound like self-serve.
 */
export function lostInAYear(state: EngineState, ctx: EngineCalcContext, motion: Motion): DerivedValue {
  if (motion === "plg") {
    const churn = knownIn(state, "ret.logo-churn", ctx);
    if (churn.kind !== "known") return { kind: "uncomputable", missing: ["ret.logo-churn"] };
    const lost = (c: number) => 100 * (1 - Math.pow(1 - Math.min(100, Math.max(0, c)) / 100, 12));
    return { kind: "known", value: { lo: lost(churn.value.lo), hi: lost(churn.value.hi) }, confidence: "approximate" };
  }
  const renewal = knownIn(state, "slg.ret.renewal", ctx);
  if (renewal.kind !== "known") return { kind: "uncomputable", missing: ["slg.ret.renewal"] };
  const monthly = entryOf(currentSnapshot(state), "slg.ret.renewal")?.variant === "monthly";
  // A higher renewal loses fewer: the bounds swap.
  const lost = (r: number) => (monthly ? 100 * (1 - Math.pow(Math.min(100, Math.max(0, r)) / 100, 12)) : 100 - r);
  return {
    kind: "known",
    value: { lo: lost(renewal.value.hi), hi: lost(renewal.value.lo) },
    confidence: monthly ? "approximate" : renewal.confidence,
  };
}

/**
 * Whether a motion's margin is the company's, taken in the hybrid (C25 Q4):
 * the slide's footer says « marge globale reprise ». An estimate whose basis
 * is `company-wide`, and nothing else.
 */
export function marginIsCompanyWide(state: EngineState, motion: Motion): boolean {
  const entry = entryOf(currentSnapshot(state), motion === "plg" ? "rev.gross-margin" : "slg.rev.gross-margin");
  return entry?.status === "estimated" && entry.estimate?.basis === "company-wide";
}
