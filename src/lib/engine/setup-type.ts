import type { AppMonetization } from "./app-model";
import type { BusinessType, EngineSetup } from "./types";

/*
 * setup-type.ts — what the engine knows of a setup's TYPE (engine spec §21.2.2, A22 APP-0).
 *
 * A LEAF on purpose: it imports types only (`business-type.test.ts` holds that). `catalog-shape.ts` reads it to
 * tell an app from a SaaS, and `access.ts` — which the Edge proxy, the sitemap, `llms.ts` and the owner preview
 * import — reads the list of types from it: read from `business-type.ts`, which imports the catalogue from
 * APP-2 on, they would drag the whole catalogue into the proxy's bundle.
 */

/** Every type the code knows, in the order the setup lists them. Here, not in business-type.ts: access.ts (read by the Edge proxy) imports it. */
export const BUSINESS_TYPES: readonly BusinessType[] = ["b2b-saas", "consumer-app"];
/** The type every build opens, whatever ENGINE_TYPES says. */
export const ALWAYS_OPEN_TYPE: BusinessType = "b2b-saas";
/** An app starts with subscriptions only (the start card's default, §21.6.1). */
export const DEFAULT_APP_MONETIZATION: AppMonetization = { subscriptions: true, purchases: false, ads: false };
export function isApp(setup: Pick<EngineSetup, "type">): boolean {
  return setup.type === "consumer-app";
}
/**
 * The app's monetization, or null for any other type. A stored app always has one (validate.ts requires it); the
 * default only covers a setup built in code before it is validated (the start card's choice in progress).
 */
export function monetizationOf(setup: Pick<EngineSetup, "type" | "monetization">): AppMonetization | null {
  return setup.type === "consumer-app" ? (setup.monetization ?? DEFAULT_APP_MONETIZATION) : null;
}
