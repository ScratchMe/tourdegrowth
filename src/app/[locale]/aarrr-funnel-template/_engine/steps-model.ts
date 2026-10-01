import { LINK_METRIC_SHAPES, METRIC_SHAPES, SLG_METRIC_SHAPES, type MetricShape } from "@/lib/engine/catalog-shape";
import type { Motion, Snapshot } from "@/lib/engine/types";

/**
 * The step-by-step's positions — Antoine, 2026-09-25: « un Stepper, où on y
 * va vraiment étape par étape pour éviter un cognitive load trop important »,
 * in big steps: the targets the team already has, the numbers and their
 * definitions, then the potential targets and their impact on the funnel.
 *
 * With the motions (A7.3.c S3, engine spec §18.7) the big steps stay four:
 * the targets (both groups on one screen), then each motion's base —
 * self-serve's, then sales-assisted's — then the numbers, self-serve's, then
 * sales-assisted's, then the link in the hybrid (optional, skippable), then
 * « et si ». A number's place is its index in `numberSequence`: one list in
 * the fixed order, numbered per motion on screen, never « 21 of 32 ».
 *
 * Pure, so where a returning person lands is tested rather than guessed.
 * Every function defaults to self-serve alone: a v1 engine steps exactly as
 * it did (the golden v1 holds `resumePosition`).
 */
export type StepPosition =
  | { phase: "targets" }
  /** `motion` absent is self-serve's base — the only one a v1 engine had. */
  | { phase: "base"; motion?: Motion }
  | { phase: "number"; index: number }
  | { phase: "whatif" }
  | { phase: "done" };

/** The four big steps the header shows; the bases belong to « Tes chiffres ». */
export type StepPhase = "targets" | "numbers" | "whatif" | "deck";
export const STEP_PHASES: readonly StepPhase[] = ["targets", "numbers", "whatif", "deck"];

type Motions = Readonly<Record<Motion, boolean>>;
const SELF_SERVE: Motions = { plg: true, slg: false };

/** The numbers in the order the steps show them: self-serve's, sales-assisted's, then the link in the hybrid. */
export function numberSequence(motions: Motions = SELF_SERVE): readonly MetricShape[] {
  return [
    ...(motions.plg ? METRIC_SHAPES : []),
    ...(motions.slg ? SLG_METRIC_SHAPES : []),
    ...(motions.plg && motions.slg ? LINK_METRIC_SHAPES : []),
  ];
}

/** Self-serve's number count — the v1 step-by-step's « Chiffre 4 sur 17 ». */
export const NUMBER_COUNT = METRIC_SHAPES.length;

/** The bases, in order: self-serve's (its two sign-up counts), then sales-assisted's (its three counts, S6). */
function bases(motions: Motions): StepPosition[] {
  return [...(motions.plg ? [{ phase: "base" as const }] : []), ...(motions.slg ? [{ phase: "base" as const, motion: "slg" as const }] : [])];
}

const baseMotion = (position: Extract<StepPosition, { phase: "base" }>): Motion => position.motion ?? "plg";

/**
 * Where a number sits in its own motion: « Assisté · chiffre 4 sur 15 ». The
 * link counts on its own (« 1 sur 1 »): it belongs to neither motion's list.
 */
export function numberPlace(index: number, motions: Motions = SELF_SERVE): { group: "plg" | "slg" | "link"; i: number; n: number } {
  const sequence = numberSequence(motions);
  const shape = sequence[index]!;
  const group = shape.scope;
  const inGroup = sequence.filter((s) => s.scope === group);
  return { group, i: inGroup.indexOf(shape) + 1, n: inGroup.length };
}

/** The first number of the next group — « Passer à l'assisté → » — or null when the next thing is the what-if. */
export function nextGroupStart(index: number, motions: Motions = SELF_SERVE): number | null {
  const sequence = numberSequence(motions);
  const group = sequence[index]?.scope;
  const next = sequence.findIndex((s, i) => i > index && s.scope !== group);
  // The link is optional: skipping sales-assisted's numbers goes to the what-if, past it.
  if (next === -1 || sequence[next]!.scope === "link") return null;
  return next;
}

export function phaseOf(position: StepPosition): StepPhase {
  switch (position.phase) {
    case "targets":
      return "targets";
    case "base":
    case "number":
      return "numbers";
    case "whatif":
      return "whatif";
    case "done":
      return "deck";
  }
}

export function nextPosition(position: StepPosition, motions: Motions = SELF_SERVE): StepPosition {
  const count = numberSequence(motions).length;
  const allBases = bases(motions);
  switch (position.phase) {
    case "targets":
      return allBases[0] ?? (count > 0 ? { phase: "number", index: 0 } : { phase: "whatif" });
    case "base": {
      const i = allBases.findIndex((b) => b.phase === "base" && baseMotion(b) === baseMotion(position));
      return allBases[i + 1] ?? (count > 0 ? { phase: "number", index: 0 } : { phase: "whatif" });
    }
    case "number":
      return position.index + 1 < count ? { phase: "number", index: position.index + 1 } : { phase: "whatif" };
    case "whatif":
      return { phase: "done" };
    case "done":
      return position;
  }
}

export function previousPosition(position: StepPosition, motions: Motions = SELF_SERVE): StepPosition {
  const count = numberSequence(motions).length;
  const allBases = bases(motions);
  const lastBase = allBases[allBases.length - 1] ?? { phase: "targets" as const };
  switch (position.phase) {
    case "targets":
      return position;
    case "base": {
      const i = allBases.findIndex((b) => b.phase === "base" && baseMotion(b) === baseMotion(position));
      return i > 0 ? allBases[i - 1]! : { phase: "targets" };
    }
    case "number":
      return position.index > 0 ? { phase: "number", index: position.index - 1 } : lastBase;
    case "whatif":
      return count > 0 ? { phase: "number", index: count - 1 } : lastBase;
    case "done":
      return { phase: "whatif" };
  }
}

/**
 * Where « Reprendre le pas à pas » lands: the start for an engine nobody has
 * touched; else the first number nobody has looked at, in the fixed order
 * (§18.7: the cheapest todo of the ticked motions, canonical order — the
 * order IS the steps'); else the what-if. A person who set targets but typed
 * no number resumes at the base, not back at the targets they already gave.
 * The optional link is not waited on: a hybrid whose only « to do » is the
 * link resumes at the what-if.
 */
export function resumePosition(snapshot: Snapshot, motions: Motions = SELF_SERVE): StepPosition {
  const touched = Object.keys(snapshot.metrics).length > 0;
  const hasTargets = Object.keys(snapshot.targets).length > 0;
  const hasBase = Object.keys(snapshot.base ?? {}).length > 0;
  const firstBase = bases(motions)[0];
  if (!touched && !hasTargets && !hasBase) return { phase: "targets" };
  if (!touched && !hasBase && firstBase) return firstBase;
  const index = numberSequence(motions).findIndex((shape) => shape.scope !== "link" && (snapshot.metrics[shape.id]?.status ?? "todo") === "todo");
  return index === -1 ? { phase: "whatif" } : { phase: "number", index };
}
