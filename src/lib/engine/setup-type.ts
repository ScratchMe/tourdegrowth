import type { AppMonetization } from "./app-model";
import type { BusinessType, EngineMotion, EngineSetup, Motion } from "./types";

/*
 * setup-type.ts — what the engine knows of a setup's TYPE (engine spec §21.2.2, §22.2.2, A22 APP-0, A23 MKT-0).
 *
 * A LEAF on purpose: it imports types only (`business-type.test.ts` holds that), not even the value `MOTIONS` of
 * `types.ts`: `lib/analytics/goatcounter.ts` reads `isApp` from here on every page, and a value import of `types.ts`
 * (which holds `ENGINE_INDEX_KEY`) would put the engine's storage keys in the code every page loads as soon as any
 * engine module calls `activeMotions` (A23 MKT-1: `bridge.ts`; `e2e/engine-entries.spec.ts` sees it on the landing).
 * `catalog-shape.ts` reads it to tell an app from a SaaS, and `access.ts` — which the Edge proxy, the sitemap,
 * `llms.ts` and the owner preview import — reads the list of types from it: read from `business-type.ts`, which
 * imports the catalogue from APP-2 on, they would drag the whole catalogue into the proxy's bundle.
 */

/** Every type the code knows, in the order the setup lists them. Here, not in business-type.ts: access.ts (read by the Edge proxy) imports it. */
export const BUSINESS_TYPES: readonly BusinessType[] = ["b2b-saas", "consumer-app", "marketplace"];
/** The type every build opens, whatever ENGINE_TYPES says. */
export const ALWAYS_OPEN_TYPE: BusinessType = "b2b-saas";
/** An app starts with subscriptions only (the start card's default, §21.6.1). */
export const DEFAULT_APP_MONETIZATION: AppMonetization = { subscriptions: true, purchases: false, ads: false };
export function isApp(setup: Pick<EngineSetup, "type">): boolean {
  return setup.type === "consumer-app";
}
/**
 * The app's monetization, or null for any other type. A stored app can carry a monetization that is not one: a file
 * opens with its errors (`parseEngineFile`, io.ts) and the state is stored as it came, so `"x"`, `[]`, `0`, a box
 * that is not a boolean or three unticked boxes can all sit where the type says `AppMonetization`. The function
 * does not trust the type: it returns the stored value only when it is an object (not an array) whose
 * `subscriptions`, `purchases` and `ads` are three booleans with at least one true, and the subscriptions-only
 * default otherwise (the same default covers an app built in code before it is validated, the start card's choice
 * in progress). The validator reports such an app on its own (validate.ts); this function only normalizes it to the
 * default, so no caller reads an invalid value. The check is written here, not imported: this module stays a leaf.
 */
export function monetizationOf(setup: Pick<EngineSetup, "type" | "monetization">): AppMonetization | null {
  if (setup.type !== "consumer-app") return null;
  const stored: unknown = setup.monetization;
  if (typeof stored !== "object" || stored === null || Array.isArray(stored)) return DEFAULT_APP_MONETIZATION;
  const { subscriptions, purchases, ads } = stored as Record<string, unknown>;
  const threeBooleans = typeof subscriptions === "boolean" && typeof purchases === "boolean" && typeof ads === "boolean";
  return threeBooleans && (subscriptions || purchases || ads) ? (stored as AppMonetization) : DEFAULT_APP_MONETIZATION;
}

export function isMarketplace(setup: Pick<EngineSetup, "type">): boolean {
  return setup.type === "marketplace";
}
/**
 * The two selling motions, in `MOTIONS` order. Written here, not read from `types.ts`, to keep this module a leaf
 * (see the header); `business-type.test.ts` holds that it equals `MOTIONS`, in the same order.
 */
export const SELLING_MOTIONS = ["plg", "slg"] as const satisfies readonly Motion[];
/** The motions an engine derives, in `ENGINE_MOTIONS` order (§22.1 D1): a marketplace's is its own, the others' are the boxes ticked. */
export function activeMotions(setup: Pick<EngineSetup, "type" | "motions">): EngineMotion[] {
  if (setup.type === "marketplace") return ["mkt"];
  return SELLING_MOTIONS.filter((m) => setup.motions[m]);
}
/** The narrowing §22.2.5 uses where an `EngineMotion` reaches code written for the two selling motions. */
export function isSellingMotion(m: EngineMotion): m is Motion {
  return m !== "mkt";
}

/** What a marketplace's setup says when it says nothing (D9, D10, D11): products, no seller subscriptions, the windows of §22.2.1. */
export const MKT_DEFAULTS = { offering: "products", sellerSubscriptions: false, firstOrderWindowDays: 30, repeatWindowDays: 90, firstSaleWindowDays: 60 } as const;

/** A stored window is read only when it is one of the values the setup offers, as `monetizationOf` reads a stored monetization. */
function windowOr<W extends number>(stored: unknown, allowed: readonly W[], fallback: W): W {
  return allowed.find((w) => w === stored) ?? fallback;
}
/**
 * A marketplace's own setup, each field from the setup or its default. Like `monetizationOf`, it does not trust the
 * type: a file opens with its errors and the state is stored as it came, so a window of 45 days, an offering that is
 * neither word or a box that is not a boolean can sit where the setup says otherwise; each reads as its default here,
 * and the validator (`validate.ts`) reports the file on its own. A setup of any other type reads as all defaults: the
 * fields belong to a marketplace, and a SaaS file that carries one has it refused, unread.
 */
export function mktSetup(setup: Pick<EngineSetup, "type" | "offering" | "sellerSubscriptions" | "firstOrderWindowDays" | "repeatWindowDays" | "firstSaleWindowDays">): {
  offering: "products" | "services";
  sellerSubscriptions: boolean;
  firstOrderWindowDays: 7 | 30 | 90;
  repeatWindowDays: 60 | 90 | 180;
  firstSaleWindowDays: 30 | 60 | 90;
} {
  if (!isMarketplace(setup)) return { ...MKT_DEFAULTS };
  return {
    offering: setup.offering === "services" ? "services" : MKT_DEFAULTS.offering,
    sellerSubscriptions: setup.sellerSubscriptions === true,
    firstOrderWindowDays: windowOr(setup.firstOrderWindowDays, [7, 30, 90], MKT_DEFAULTS.firstOrderWindowDays),
    repeatWindowDays: windowOr(setup.repeatWindowDays, [60, 90, 180], MKT_DEFAULTS.repeatWindowDays),
    firstSaleWindowDays: windowOr(setup.firstSaleWindowDays, [30, 60, 90], MKT_DEFAULTS.firstSaleWindowDays),
  };
}

/**
 * The barrier of the marketplace's screens (§22.3). While it was `false`, no build opened the type, whatever `ENGINE_TYPES`
 * said (`access.ts#openTypesWith`), and no file of that type opened (`io.ts`): no marketplace state reached the island
 * before the board that shows it existed. MKT-7b lifted it (A23, 2026-10-27: the board, its two sides and a number's screen
 * exist); `business-type.test.ts` holds its value. The type is still closed everywhere `ENGINE_TYPES` does not list it —
 * production among them — until the type's opening (§22.0, A22.e).
 */
export const MARKETPLACE_SCREENS_READY = true;
