import type { StoredResult } from "@/lib/quiz/storage";
import { appDerived, appUnitEconomics } from "./app";
import { buildMirror } from "./bridge";
import { motionCoverage, setupCoverage } from "./coverage";
import { diagnose, diagnoseSide } from "./diagnose";
import { findings } from "./findings";
import type { UnitWords } from "./format";
import { mktUnitEconomics } from "./mkt-economics";
import { buildMktFunnel } from "./mkt-funnel";
import { mktTotal } from "./mkt-scenario";
import { buildPeloton } from "./peloton";
import { buildRelays } from "./relays";
import { sanityChecks } from "./sanity";
import { deriveSeries } from "./series";
import { activeMotions, isApp } from "./setup-type";
import type { ResolvedBridge } from "./strings";
import { buildTotal } from "./total";
import type { EngineCalcContext, EngineDerived, EngineState, MotionDerived } from "./types";
import { slgUnitEconomics, unitEconomics } from "./unit-economics";
import { currentSnapshot } from "./values";

/**
 * derive.ts — everything the board renders, in one pass (engine spec §4.2).
 *
 * The derived shapes are computed on every render and NEVER stored: a
 * stored diagnosis is one that can disagree with the numbers it was drawn
 * from. One function composes them so the board, the slides and the text
 * export read the same object, in the same order the findings need it
 * (findings are built from the rest, so they come last).
 *
 * `words` (the `units` slice of the resolved copy) is an addition to the P0
 * contract: the sanity checks and the findings carry their placeholders
 * already formatted, and a range needs its "{lo} à {hi}" template.
 *
 * The mirror is only built for the Tour result the state is LINKED to (D13):
 * the island passes the most recent result with answers, and if the link
 * points elsewhere — or the result was cleared from the device — there is no
 * mirror, and the board says so.
 *
 * The motions (§18.6.1): each ticked motion is derived on its own, in
 * `MOTIONS` order, from its own numbers only — no function here sees both
 * motions' candidates, so none can rank one leak against the other. Only the
 * total adds, and only in the hybrid. Self-serve's peloton, diagnosis and
 * unit economics are also kept at the top, where every v1 reader finds them
 * (`EngineDerived`): the same objects as the `plg` motion's. An app (§21.5.5)
 * derives its per-install economics in place of the customer's, and alone
 * carries the `app` key: its twelve-month value and its two streams. A
 * marketplace (§22) derives its one motion, `mkt`, with two sides — each its
 * own diagnosis and economics, never read against the other (C70) — and the
 * total that adds them; the top-level self-serve fields describe an empty
 * self-serve engine, as for an assisted one alone.
 */
export function deriveEngine(
  state: EngineState,
  ctx: EngineCalcContext,
  tourResult: StoredResult | null,
  bridges: ResolvedBridge[],
  words: UnitWords,
): EngineDerived {
  const snapshot = currentSnapshot(state);
  const { motions: ticked } = state.setup;
  const mirror =
    state.tourLink && tourResult && tourResult.id === state.tourLink.resultId ? buildMirror(state, tourResult, bridges) : null;

  const peloton = buildPeloton(state, ctx);
  const diagnosis = diagnose(state, ctx);
  // An app's economy is per install (§21.5.5): its own figures take the place of the customer's.
  const app = isApp(state.setup);
  const unit = app ? appUnitEconomics(state, ctx) : unitEconomics(state, ctx);
  const motions: MotionDerived[] = [];
  if (ticked.plg) motions.push({ motion: "plg", coverage: motionCoverage(snapshot, "plg", state.setup), peloton, diagnosis, unit });
  if (ticked.slg) {
    motions.push({
      motion: "slg",
      coverage: motionCoverage(snapshot, "slg"),
      relays: buildRelays(state, ctx),
      diagnosis: diagnose(state, ctx, "slg"),
      unit: slgUnitEconomics(state, ctx),
    });
  }
  // A marketplace's motion is derived from its type, not ticked (§22.1 D1): two sides, each on its own, then their total.
  if (activeMotions(state.setup).includes("mkt")) {
    motions.push({
      motion: "mkt",
      coverage: motionCoverage(snapshot, "mkt", state.setup),
      funnel: buildMktFunnel(state, ctx),
      sides: {
        demand: { side: "demand", diagnosis: diagnoseSide(state, ctx, "demand"), unit: mktUnitEconomics(state, ctx, "demand") },
        supply: { side: "supply", diagnosis: diagnoseSide(state, ctx, "supply"), unit: mktUnitEconomics(state, ctx, "supply") },
      },
      total: mktTotal(state, ctx),
    });
  }

  const partial: Omit<EngineDerived, "findings"> = {
    coverage: setupCoverage(snapshot, state.setup),
    peloton,
    diagnosis,
    unit,
    motions,
    total: buildTotal(state, ctx),
    sanity: sanityChecks(state, ctx, words),
    mirror,
  };
  // The series only exists from the second month: a one-month engine — every v1 and v2 file — derives with no key for it.
  const series = deriveSeries(state, ctx);
  // Only an app has the `app` key: the SaaS derives exactly what it did (the goldens never see it).
  return { ...partial, findings: findings(state, partial, ctx, words), ...(series ? { series } : {}), ...(app ? { app: appDerived(state, ctx) } : {}) };
}
