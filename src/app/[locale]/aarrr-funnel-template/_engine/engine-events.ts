import { trackEvent } from "@/lib/analytics/goatcounter";
import type { Pillar } from "@/lib/scoring/pillars";

/**
 * The engine's closed analytics vocabulary — spec §11.6. PATHS ONLY: the
 * name of what happened and, for two of them, which stage or which file
 * type. Never a diagnosis state, a status, a number or a label the person
 * typed — the page promises in writing that what is entered never leaves the
 * browser (D16), and an analytics path is a way out like any other.
 *
 * Typed so a caller cannot pass anything else: the detail of
 * `engine_stage_saved` is a `Pillar`, of `engine_exported` one of four
 * literals. P7 moves these lists into `lib/analytics/goatcounter.ts` (and
 * `goatcounter-api.ts`, or the dashboard under-counts them — R-11) and
 * points this module at them; the boundary test's rule 5 then checks every
 * call site against the exported lists.
 */
export const ENGINE_EXPORT_FORMATS = ["png", "pdf", "text", "json"] as const;

type EngineEvent =
  | { name: "engine_opened" }
  | { name: "engine_stage_saved"; detail: Pillar }
  | { name: "engine_request_copied" }
  | { name: "engine_deck_opened" }
  | { name: "engine_exported"; detail: (typeof ENGINE_EXPORT_FORMATS)[number] }
  | { name: "engine_tour_linked" };

export function trackEngine(event: EngineEvent): void {
  trackEvent(event.name, "detail" in event ? event.detail : undefined);
}
