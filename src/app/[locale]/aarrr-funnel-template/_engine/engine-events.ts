import {
  ENGINE_DECK_OPENED_EVENT,
  ENGINE_EXPORT_FORMATS,
  ENGINE_EXPORTED_EVENT,
  ENGINE_OPENED_EVENT,
  ENGINE_REQUEST_COPIED_EVENT,
  ENGINE_STAGE_SAVED_EVENT,
  ENGINE_STAGES,
  ENGINE_TOUR_LINKED_EVENT,
  trackEvent,
} from "@/lib/analytics/goatcounter";

/**
 * The engine's one door to analytics — spec §11.6. The vocabulary itself
 * lives in `lib/analytics/goatcounter.ts`, next to the Tour's, because the
 * dashboard (`goatcounter-api.ts`) asks GoatCounter for those exact paths:
 * a name typed here and not there is an event counted and never shown (R-11).
 *
 * Typed so a caller cannot pass anything else: the name is one of six
 * constants, the detail of `engine_stage_saved` a stage and of
 * `engine_exported` one of four formats. Never a diagnosis state, a status,
 * a number or a label the person typed (D16) — and `engine-boundary.test.ts`
 * rule 5 reads every call site to hold it, since a type is erased and a
 * `trackEvent` written next to this module would not be checked by it.
 */
export { ENGINE_EXPORT_FORMATS };

type EngineEvent =
  | { name: typeof ENGINE_OPENED_EVENT }
  | { name: typeof ENGINE_STAGE_SAVED_EVENT; detail: (typeof ENGINE_STAGES)[number] }
  | { name: typeof ENGINE_REQUEST_COPIED_EVENT }
  | { name: typeof ENGINE_DECK_OPENED_EVENT }
  | { name: typeof ENGINE_EXPORTED_EVENT; detail: (typeof ENGINE_EXPORT_FORMATS)[number] }
  | { name: typeof ENGINE_TOUR_LINKED_EVENT };

export function trackEngine(event: EngineEvent): void {
  trackEvent(event.name, "detail" in event ? event.detail : undefined);
}
