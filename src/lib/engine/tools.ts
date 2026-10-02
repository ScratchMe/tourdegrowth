import type { ToolId } from "./types";

/**
 * tools.ts — the team's tools, ticked at setup (engine spec §19.5.1, C32 Q9,
 * A14 T4). Optional: nothing ticked is allowed, and then nothing changes
 * from the engine without them. Ticked, the sheet offers them first, the
 * collect list is grouped by them (`collect.ts`), and a number none of them
 * covers goes to « À demander ».
 *
 * By family, in the order the setup lists them. App Store Connect and Play
 * Console are not offered: no number cites them, they wait for the consumer
 * app (C32 Q9) — a file that carries them keeps them, unread.
 */
export type ToolFamily = "analytics" | "billing" | "crm" | "ads" | "other";

export const TOOL_FAMILIES: readonly { family: ToolFamily; tools: readonly ToolId[] }[] = [
  { family: "analytics", tools: ["ga4", "mixpanel", "amplitude", "posthog"] },
  { family: "billing", tools: ["stripe", "chargebee", "chartmogul"] },
  { family: "crm", tools: ["hubspot", "salesforce", "pipedrive"] },
  { family: "ads", tools: ["google-ads", "meta-ads", "linkedin-ads"] },
  { family: "other", tools: ["product-db", "spreadsheet", "cs-platform"] },
];

/** Every tool the setup offers, in the families' order. */
export const SETUP_TOOLS: readonly ToolId[] = TOOL_FAMILIES.flatMap((f) => f.tools);

/** The team's tools the engine reads: the offered ones, in the families' order, once each. */
export function teamTools(tools: readonly ToolId[] | undefined): ToolId[] {
  if (!tools || tools.length === 0) return [];
  return SETUP_TOOLS.filter((t) => tools.includes(t));
}
