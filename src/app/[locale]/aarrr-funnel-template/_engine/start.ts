import type { StartMotion } from "@/components/engine/EngineStart";
import { shapesOf } from "@/lib/engine/catalog-shape";
import { defaultCohortMonth, defaultReferenceMonth } from "@/lib/engine/cohort";
import { SETUP_V2_DEFAULTS, type Currency, type EngineSetup, type Motion, type YearMonth } from "@/lib/engine/types";

/** The currency an engine starts in: the start screen's sentence says « en euros » (`start.defaults`). */
export const DEFAULT_CURRENCY: Currency = "EUR";
/** The two self-serve windows an engine starts with, the v1 defaults. */
export const DEFAULT_WINDOWS = { activationWindowDays: 7, paidWindowDays: 30 } as const satisfies Pick<EngineSetup, "activationWindowDays" | "paidWindowDays">;

/**
 * Everything the start screen does not ask (brief 07 Q4): the defaults the
 * full setup card opens on, and what « Commencer » creates. The months are
 * the ones the screen SHOWS — computed from the same `today` — not the
 * engine's own fallback: the two can differ around midnight.
 */
export function startDefaults(motions: Readonly<Record<Motion, boolean>>, today: Date): { setup: EngineSetup; referenceMonth: YearMonth; cohortMonth: YearMonth } {
  const setup: EngineSetup = {
    type: SETUP_V2_DEFAULTS.type,
    motions: { ...motions },
    currency: DEFAULT_CURRENCY,
    ...DEFAULT_WINDOWS,
    qualificationWindowDays: SETUP_V2_DEFAULTS.qualificationWindowDays,
    goLiveWindowDays: SETUP_V2_DEFAULTS.goLiveWindowDays,
  };
  return { setup, referenceMonth: defaultReferenceMonth(today), cohortMonth: defaultCohortMonth(setup, today) };
}

/**
 * The first screen's one question (design system extension 07, A18 T3.a):
 * how the company sells, as one radio group — self-serve, sales-assisted or
 * both — over the model's two motion booleans, which do not change.
 */
export function motionsOf(start: StartMotion): Record<Motion, boolean> {
  return { plg: start !== "sa", slg: start !== "ss" };
}

/** The radio a setup's motions read as. Neither ticked cannot be stored (`shapesOf` throws): it reads as self-serve. */
export function startMotionOf(motions: Readonly<Record<Motion, boolean>>): StartMotion {
  if (motions.plg && motions.slg) return "both";
  return motions.slg ? "sa" : "ss";
}

/**
 * « 17 chiffres : 5 se lisent en cinq minutes, 7 demandent environ une heure
 * chacun, 5 sont à demander à quelqu'un » — from the catalogue's effort tags,
 * never typed: 17, 15 or 33 numbers (the hybrid's link counts, as it does on
 * the board). A number to build counts with the hour-long ones.
 */
export function startPlan(motions: Readonly<Record<Motion, boolean>>): { n: number; quick: number; hour: number; ask: number } {
  // The motions alone are known here: the SaaS list, until APP-7 passes the setup (§21.11).
  const shapes = shapesOf({ type: "b2b-saas", motions });
  const count = (efforts: readonly string[]) => shapes.filter((s) => efforts.includes(s.effort)).length;
  return { n: shapes.length, quick: count(["self-5min"]), hour: count(["self-1h", "build"]), ask: count(["ask"]) };
}
