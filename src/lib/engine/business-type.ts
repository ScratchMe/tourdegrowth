import type { BusinessType, Motion } from "./types";
export { ALWAYS_OPEN_TYPE, BUSINESS_TYPES, DEFAULT_APP_MONETIZATION, isApp, monetizationOf } from "./setup-type";

/** What a type may tick (§21.1 D1): the consumer app sells self-serve only. */
export function motionsAllowed(type: BusinessType): readonly Motion[] {
  return type === "consumer-app" ? ["plg"] : ["plg", "slg"];
}
