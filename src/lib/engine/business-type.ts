import { derivedShapeOf, shapeOf, type Benchmark, type DerivedShape, type MetricShape } from "./catalog-shape";
import { isApp } from "./setup-type";
import { toolFamiliesFor } from "./tools";
import type { BusinessType, DerivedId, MetricId, Motion, PlgDerivedId, PlgMetricId, ToolId } from "./types";
export { ALWAYS_OPEN_TYPE, BUSINESS_TYPES, DEFAULT_APP_MONETIZATION, isApp, monetizationOf } from "./setup-type";

/** What a type may tick (§21.1 D1): the consumer app sells self-serve only. */
export function motionsAllowed(type: BusinessType): readonly Motion[] {
  return type === "consumer-app" ? ["plg"] : ["plg", "slg"];
}

// --- The display layer (§21.4.3, A22 APP-2) -------------------------------------------------------------------------
// What a screen or the deck shows of a number's shape, which depends on the type of the engine: where it is found,
// the reference that situates it, the glossary term it links to. The calculation never reads these fields; the shapes
// of `catalog-shape.ts` stay the SaaS's and the app's own, and a screen asks `displayShapeOf` for what it prints.

export type DisplayFields = Pick<MetricShape, "sources" | "glossary"> & { benchmark?: Benchmark };
export type DerivedDisplayFields = Pick<DerivedShape, "glossary"> & { benchmark?: Benchmark };

/**
 * The fifteen self-serve numbers a consumer app shows, as it shows them (§21.4.3). A `benchmark` present with the value
 * `undefined` REMOVES the SaaS reference (it holds for a SaaS's traffic, onboarding or churn, not an app's — C60); a
 * `benchmark` with a value is the app's own, restated from the approved glossary term it names.
 */
export const DISPLAY_OVERRIDES: Readonly<Record<"consumer-app", Partial<Record<PlgMetricId, Partial<DisplayFields>>>>> = {
  "consumer-app": {
    "acq.signup-rate": { sources: ["app-store-connect", "play-console", "appsflyer"], benchmark: undefined, glossary: "acquisition" },
    "acq.top-channel-share": { sources: ["app-store-connect", "play-console", "appsflyer", "adjust"], glossary: "acquisition" },
    "act.event": { sources: [], glossary: "aha-moment" },
    "act.rate": { sources: ["ga4", "amplitude", "mixpanel"], benchmark: undefined, glossary: "activation" },
    "act.ttv": { sources: ["ga4", "amplitude", "mixpanel"], glossary: "time-to-value" },
    "ret.d30": { sources: ["ga4", "amplitude", "mixpanel"], benchmark: { term: "retention", lo: 20, hi: 30, direction: "higher" }, glossary: "retention" },
    "ret.logo-churn": { sources: ["revenuecat", "stripe"], benchmark: undefined, glossary: "churn" },
    "ret.churn-cause": { sources: ["revenuecat", "product-db"], glossary: "churn" },
    "ref.mechanism": { sources: [], glossary: "referral" },
    "ref.referred-share": { sources: ["product-db", "appsflyer", "adjust"], glossary: "referral" },
    "ref.k-factor": { sources: ["product-db", "amplitude", "mixpanel"], glossary: "viral-coefficient" },
    "rev.paid-conversion": { sources: ["revenuecat", "product-db"], glossary: "revenue" },
    "rev.arpa": { sources: ["revenuecat", "stripe"], glossary: "arpu" },
    "rev.expansion": { sources: ["revenuecat", "stripe"], glossary: "nrr-grr" },
    "rev.contraction": { sources: ["revenuecat", "stripe"], glossary: "nrr-grr" },
  },
};

/** The computed figures' display fields for an app: none differ (`rev.grr` and `rev.nrr` carry no reference; the three SaaS figures never show). */
export const DERIVED_DISPLAY_OVERRIDES: Readonly<Record<"consumer-app", Partial<Record<PlgDerivedId, Partial<DerivedDisplayFields>>>>> = {
  "consumer-app": {},
};

/**
 * The shape as the screens and the deck show it: `{ ...shapeOf(id), ...override }` for an app's self-serve number, and
 * the object `shapeOf(id)` returns, the SAME reference, for a SaaS and for any `app.*` id (those are already the app's).
 * A `benchmark` that is `undefined` in the override removes the reference, the key kept on the result.
 */
export function displayShapeOf(id: MetricId, type: BusinessType): MetricShape {
  const shape = shapeOf(id);
  if (!isApp({ type })) return shape;
  const override = (DISPLAY_OVERRIDES["consumer-app"] as Partial<Record<MetricId, Partial<DisplayFields>>>)[id];
  return override ? { ...shape, ...override } : shape;
}

/** Same, for the computed figures. */
export function displayDerivedShapeOf(id: DerivedId, type: BusinessType): DerivedShape {
  const shape = derivedShapeOf(id);
  if (!isApp({ type })) return shape;
  const override = (DERIVED_DISPLAY_OVERRIDES["consumer-app"] as Partial<Record<DerivedId, Partial<DerivedDisplayFields>>>)[id];
  return override ? { ...shape, ...override } : shape;
}

/** The setup's tool list (§21.6.5): b2b-saas keeps `SETUP_TOOLS` as before the app; an app lists its own families' tools. */
export function setupToolsFor(type: BusinessType): readonly ToolId[] {
  return toolFamiliesFor(type).flatMap((f) => f.tools);
}
