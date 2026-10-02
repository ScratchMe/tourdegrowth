import type { MetricShape } from "@/lib/engine/catalog-shape";
import type { NextMonth } from "@/lib/engine/series";
import type { MetricId, RoleId, YearMonth } from "@/lib/engine/types";
import { PILLARS } from "@/lib/scoring/pillars";
import type { CollectPlan } from "./collect";

/**
 * The board's one next step (design system extension 07, `NextStep`; A18
 * T0): the screen's only primary action, chosen by a fixed order — the
 * first rule that matches wins (`NextStep.prompt.md`, « Which action is the
 * primary »):
 *
 *   1. the browser refused to save        → save to a file (.json)
 *   2. a past month is on screen           → back to the current month
 *   3. the next month can start            → start it
 *   4. a five-minute number is still to do → that number
 *   5. numbers to ask for, not yet asked   → one: ask its role for it;
 *                                            two or more: copy the requests
 *   6. a number of about an hour to do     → that number
 *   7. nothing left to type, requests out  → the slides (the requests wait)
 *   8. every number has an answer          → the slides
 *
 * Antoine's own sentence, made a rule: send the requests today, fill in the
 * rest while waiting — after the five-minute numbers, so the first number
 * is typed within two screens of arriving. Within a rank, the funnel's order
 * (acquisition → revenue), then the catalogue's: in the hybrid, one primary
 * for both engines, the two motions' numbers taken stage by stage.
 *
 * Built on the collect plan, so the board's next step and its lists never
 * disagree: a number none of the team's tools covers is « to ask for »
 * here as it is there. Pure: the same engine always gets the same step.
 *
 * One reading of the prompt, made here: it gives the requests' screen to
 * « two or more on a first visit » and says nothing of a return. A return
 * with two or more requests not yet sent gets the same screen — one request
 * per screen would send them over several visits, which is what rank 5 is
 * there to avoid.
 */
export type NextStepChoice =
  | { kind: "save-file" }
  | { kind: "back-to-current" }
  | { kind: "start-month"; referenceMonth: YearMonth }
  /** Ranks 4 and 6: the number's own screen. */
  | { kind: "number"; id: MetricId; effort: "self-5min" | "self-1h" | "build" }
  /** Rank 5, one number to ask for: its screen, « I'll ask for it » open. */
  | { kind: "ask-one"; id: MetricId; role: RoleId }
  /** Rank 5, two or more: the requests, one screen (AskList). In the funnel's order. */
  | { kind: "ask-all"; ids: readonly MetricId[] }
  /** Ranks 7 and 8: the requests still out (empty when every number has an answer). */
  | { kind: "slides"; waiting: readonly MetricId[] };

export interface NextStepFacts {
  /** The month on screen's collect plan (`collectPlan`, with the team's tools when ticked). */
  plan: CollectPlan;
  /** The numbers the setup asks for (`motionShapes`): where a number sits in the funnel, and its effort. */
  shapes: readonly MetricShape[];
  /** The last write was refused (quota, private mode): a file is the only way left to keep the work. */
  writeFailed: boolean;
  /** A closed month is on screen, read only. */
  viewingPast: boolean;
  /** `nextMonthOf(state, today)`. */
  nextMonth: NextMonth;
}

export function nextStepFor({ plan, shapes, writeFailed, viewingPast, nextMonth }: NextStepFacts): NextStepChoice {
  if (writeFailed) return { kind: "save-file" };
  if (viewingPast) return { kind: "back-to-current" };
  if (nextMonth.kind === "ready") return { kind: "start-month", referenceMonth: nextMonth.referenceMonth };

  const order = funnelOrder(shapes);
  const shapeOf = new Map(shapes.map((s) => [s.id, s]));
  const self = order([...plan.self.flatMap((g) => g.ids), ...(plan.byTool ?? []).flatMap((g) => g.ids)]);
  const effortOf = (id: MetricId) => shapeOf.get(id)?.effort;

  const quick = self.find((id) => effortOf(id) === "self-5min");
  if (quick) return { kind: "number", id: quick, effort: "self-5min" };

  const toAsk = order(plan.ask.flatMap((g) => g.toAsk));
  if (toAsk.length === 1) {
    const id = toAsk[0]!;
    return { kind: "ask-one", id, role: plan.ask.find((g) => g.toAsk.includes(id))!.role };
  }
  if (toAsk.length > 1) return { kind: "ask-all", ids: toAsk };

  const long = self.find((id) => {
    const effort = effortOf(id);
    return effort === "self-1h" || effort === "build";
  });
  if (long) return { kind: "number", id: long, effort: effortOf(long) as "self-1h" | "build" };

  return { kind: "slides", waiting: order(plan.ask.flatMap((g) => g.requested)) };
}

/** Sorts ids by stage (acquisition → revenue), then by their place in `shapes`. An id `shapes` does not hold goes last. */
function funnelOrder(shapes: readonly MetricShape[]): (ids: readonly MetricId[]) => MetricId[] {
  const rank = new Map(shapes.map((s, i) => [s.id, PILLARS.indexOf(s.stage) * shapes.length + i]));
  const at = (id: MetricId) => rank.get(id) ?? Number.MAX_SAFE_INTEGER;
  return (ids) => [...ids].sort((a, b) => at(a) - at(b));
}
