import type { EngineSetup, EngineState } from "../types";
import { newEngineState } from "../validate";

/** Deterministic ids, so two states built the same way serialise to the same bytes. */
function counter(): () => string {
  let n = 0;
  return () => `id-${++n}`;
}

export const SETUP: EngineSetup = {
  profile: "selfserve",
  currency: "EUR",
  activationWindowDays: 7,
  paidWindowDays: 30,
  companyLabel: "Mon produit",
};

/** An engine with one entry of each status, all valid — the shape a real half-day of collection produces. */
export function fullState(): EngineState {
  const state = newEngineState(SETUP, "2026-09-24T10:00:00.000Z", { referenceMonth: "2026-08", cohortMonth: "2026-07" }, counter());
  const at = "2026-09-24T10:05:00.000Z";
  state.snapshots[0]!.metrics = {
    "acq.signup-rate": { status: "measured", value: { kind: "ratio", numerator: 180, denominator: 3200 }, source: { kind: "tool", tool: "ga4" }, updatedAt: at },
    "acq.cac": { status: "estimated", estimate: { low: 400, high: 600, basis: "team-hunch" }, variant: "media-only", updatedAt: at },
    "act.rate": {
      status: "conflicting",
      conflict: {
        a: { value: { kind: "rate", percent: 18 }, source: { kind: "tool", tool: "amplitude" } },
        b: { value: { kind: "rate", percent: 24 }, source: { kind: "person", role: "product" } },
      },
      updatedAt: at,
    },
    "ret.d30": { status: "missing", missing: { cause: "not-tracked", repair: "sprint", ownerRole: "data" }, updatedAt: at },
    "ref.k-factor": { status: "not-applicable", naReason: "no-invite-mechanism", updatedAt: at },
    "rev.arpa": { status: "requested", request: { role: "finance", requestedAt: at }, updatedAt: at },
    "ref.mechanism": { status: "measured", value: { kind: "choice", choice: "product" }, source: { kind: "other" }, updatedAt: at },
  };
  state.snapshots[0]!.targets = { "act.rate": 30 };
  return state;
}
