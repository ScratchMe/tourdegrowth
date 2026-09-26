import { METRIC_SHAPES } from "@/lib/engine/catalog-shape";
import type { Snapshot } from "@/lib/engine/types";

/**
 * The step-by-step's positions — Antoine, 2026-09-25: « un Stepper, où on y
 * va vraiment étape par étape pour éviter un cognitive load trop important »,
 * in big steps: the targets the team already has, the numbers and their
 * definitions, then the potential targets and their impact on the funnel.
 *
 * Pure, so where a returning person lands is tested rather than guessed.
 */
export type StepPosition =
  | { phase: "targets" }
  | { phase: "base" }
  | { phase: "number"; index: number }
  | { phase: "whatif" }
  | { phase: "done" };

/** The four big steps the header shows; the base belongs to « Tes chiffres ». */
export type StepPhase = "targets" | "numbers" | "whatif" | "deck";
export const STEP_PHASES: readonly StepPhase[] = ["targets", "numbers", "whatif", "deck"];

export const NUMBER_COUNT = METRIC_SHAPES.length;

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

export function nextPosition(position: StepPosition): StepPosition {
  switch (position.phase) {
    case "targets":
      return { phase: "base" };
    case "base":
      return { phase: "number", index: 0 };
    case "number":
      return position.index + 1 < NUMBER_COUNT ? { phase: "number", index: position.index + 1 } : { phase: "whatif" };
    case "whatif":
      return { phase: "done" };
    case "done":
      return position;
  }
}

export function previousPosition(position: StepPosition): StepPosition {
  switch (position.phase) {
    case "targets":
      return position;
    case "base":
      return { phase: "targets" };
    case "number":
      return position.index > 0 ? { phase: "number", index: position.index - 1 } : { phase: "base" };
    case "whatif":
      return { phase: "number", index: NUMBER_COUNT - 1 };
    case "done":
      return { phase: "whatif" };
  }
}

/**
 * Where « Reprendre le pas à pas » lands: the start for an engine nobody has
 * touched; else the first number nobody has looked at; else the what-if. A
 * person who set targets but typed no number resumes at the base, not back
 * at the targets they already gave.
 */
export function resumePosition(snapshot: Snapshot): StepPosition {
  const touched = Object.keys(snapshot.metrics).length > 0;
  const hasTargets = Object.keys(snapshot.targets).length > 0;
  const hasBase = Object.keys(snapshot.base ?? {}).length > 0;
  if (!touched && !hasTargets && !hasBase) return { phase: "targets" };
  if (!touched && !hasBase) return { phase: "base" };
  const index = METRIC_SHAPES.findIndex((shape) => (snapshot.metrics[shape.id]?.status ?? "todo") === "todo");
  return index === -1 ? { phase: "whatif" } : { phase: "number", index };
}
