import { appLeverAlone, appLeverIds, buildAppScenario } from "./app";
import { LEVER_IDS } from "./catalog-shape";
import { buildScenario, leverAlone, type Scenario } from "./scenario";
import type { EngineCalcContext, EngineSetup, EngineState, LeverId } from "./types";

/**
 * scenario-of.ts — the one entry point for the calculations a screen or a slide reads (engine spec §21.1 D4, §21.5.1).
 *
 * The board, the « Et si » panel and the slides ask for a `Scenario`; which model builds it depends on the engine's
 * type, and nothing above this file needs to know. The SaaS gets `buildScenario` and `leverAlone` exactly as before;
 * an app gets its own (`app.ts`). Each caller is moved onto these functions by the unit that owns its screen
 * (APP-8, APP-9): until then this module is not imported by any of them.
 */

/** The levers `leverViews` takes: never the link's. */
export type PanelLeverId = Exclude<LeverId, "link.pql-handoff">;
/** The self-serve levers a setup moves, in panel order: the SaaS's nine, or an app's (§21.5.3). Never the sales-assisted ones. */
export function leverIdsOf(setup: Pick<EngineSetup, "type" | "motions" | "monetization">): readonly PanelLeverId[] {
  return setup.type === "consumer-app" ? appLeverIds(setup) : LEVER_IDS;
}
/** The self-serve scenario, whatever the type (§21.1 D4): one entry point for the board, the panel and the slides. */
export function scenarioOf(state: EngineState, targets: Partial<Record<LeverId, number>>, ctx: EngineCalcContext): Scenario {
  return state.setup.type === "consumer-app" ? buildAppScenario(state, targets, ctx) : buildScenario(state, targets, ctx);
}
/** Each moved lever on its own, whatever the type: what the deck prints one slide per lever for. */
export function leverAloneOf(state: EngineState, id: LeverId, ctx: EngineCalcContext): Scenario | null {
  return state.setup.type === "consumer-app" ? appLeverAlone(state, id, ctx) : leverAlone(state, id, ctx);
}
