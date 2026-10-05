import { isApp } from "./setup-type"; // the leaf, never business-type.ts (§21.2.2): business-type.ts imports this module
import type { BusinessType, ToolId } from "./types";

/**
 * tools.ts — the team's tools, ticked at setup (engine spec §19.5.1, C32 Q9,
 * A14 T4). Optional: nothing ticked is allowed, and then nothing changes
 * from the engine without them. Ticked, the sheet offers them first, the
 * collect list is grouped by them (`collect.ts`), and a number none of them
 * covers goes to « À demander ».
 *
 * By family, in the order the setup lists them. A SaaS is offered the five
 * families of `TOOL_FAMILIES`: App Store Connect and Play Console are not
 * among them, no SaaS number cites them. A consumer app is offered its own
 * families (`APP_TOOL_FAMILIES`, §21.6.5), the stores and the mobile tools
 * first — a file that carries a tool its type does not offer keeps it, unread.
 */
export type ToolFamily = "mobile" | "analytics" | "billing" | "crm" | "ads" | "other";

export const TOOL_FAMILIES: readonly { family: ToolFamily; tools: readonly ToolId[] }[] = [
  { family: "analytics", tools: ["ga4", "mixpanel", "amplitude", "posthog"] },
  { family: "billing", tools: ["stripe", "chargebee", "chartmogul"] },
  { family: "crm", tools: ["hubspot", "salesforce", "pipedrive"] },
  { family: "ads", tools: ["google-ads", "meta-ads", "linkedin-ads"] },
  { family: "other", tools: ["product-db", "spreadsheet", "cs-platform"] },
];

/** A consumer app's families (§21.6.5): the stores and the mobile tools first. */
export const APP_TOOL_FAMILIES: readonly { family: ToolFamily; tools: readonly ToolId[] }[] = [
  { family: "mobile", tools: ["app-store-connect", "play-console", "revenuecat", "appsflyer", "adjust"] },
  { family: "analytics", tools: ["ga4", "amplitude", "mixpanel", "posthog"] },
  { family: "ads", tools: ["google-ads", "meta-ads"] },
  { family: "billing", tools: ["stripe"] },
  { family: "other", tools: ["product-db", "spreadsheet"] },
];

/** Every tool a SaaS setup offers, in the families' order. */
export const SETUP_TOOLS: readonly ToolId[] = TOOL_FAMILIES.flatMap((f) => f.tools);

/** The families a type's setup lists. b2b-saas: `TOOL_FAMILIES`, as before the app. */
export function toolFamiliesFor(type: BusinessType): readonly { family: ToolFamily; tools: readonly ToolId[] }[] {
  return isApp({ type }) ? APP_TOOL_FAMILIES : TOOL_FAMILIES;
}

/** Every tool a type's setup offers, in its families' order (`business-type.ts#setupToolsFor` is this, for the screens). */
function offeredBy(type: BusinessType): readonly ToolId[] {
  return isApp({ type }) ? APP_TOOL_FAMILIES.flatMap((f) => f.tools) : SETUP_TOOLS;
}

/** The team's tools the engine reads: the type's offered ones, in the families' order, once each (`type` absent: a SaaS). */
export function teamTools(tools: readonly ToolId[] | undefined, type: BusinessType = "b2b-saas"): ToolId[] {
  if (!tools || tools.length === 0) return [];
  return offeredBy(type).filter((t) => tools.includes(t));
}

/**
 * What a save of the settings writes as `setup.tools` (§19.5, §21.6.5): the tools ticked, among the ones the type offers,
 * then the ones the setup already holds that the type does NOT offer — a file's, kept unread, never dropped. The kept ones
 * are measured against the type's own list: against the SaaS's, a store tool of an app would count as « kept » AND as
 * ticked, be written twice, and `validate.ts` would refuse the setup (« a tool listed twice »).
 */
export function savedTools(ticked: readonly ToolId[], held: readonly ToolId[] | undefined, type: BusinessType): ToolId[] {
  const offered = offeredBy(type);
  const kept = (held ?? []).filter((t) => !offered.includes(t));
  return [...teamTools(ticked, type), ...kept];
}
