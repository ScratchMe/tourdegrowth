import { describe, expect, it } from "vitest";
import { APP_TOOL_FAMILIES, MKT_TOOL_FAMILIES, SETUP_TOOLS, TOOL_FAMILIES, savedTools, teamTools, toolFamiliesFor } from "../tools";
import type { EngineSetup, ToolId } from "../types";
import { validateEngine } from "../validate";
import { emptyState } from "./fixtures";

/** « Tes outils » (engine spec §19.5.1, C32 Q9, A14 T4): by family, optional, read in one order. */
describe("the team's tools", () => {
  it("five families, every tool once, and no app store: no number cites them yet", () => {
    expect(TOOL_FAMILIES.map((f) => f.family)).toEqual(["analytics", "billing", "crm", "ads", "other"]);
    expect(new Set(SETUP_TOOLS).size).toBe(SETUP_TOOLS.length);
    expect(SETUP_TOOLS).not.toContain("app-store-connect");
    expect(SETUP_TOOLS).not.toContain("play-console");
  });

  it("read in the families' order, once each, the offered ones only; nothing said is nothing", () => {
    expect(teamTools(["stripe", "ga4", "stripe", "play-console"])).toEqual(["ga4", "stripe"]);
    expect(teamTools(undefined)).toEqual([]);
    expect(teamTools([])).toEqual([]);
  });

  it("a SaaS's families, offered tools and reading are those of before the app — `type` absent is a SaaS", () => {
    expect(toolFamiliesFor("b2b-saas")).toBe(TOOL_FAMILIES);
    expect(teamTools(["stripe", "ga4", "revenuecat"], "b2b-saas")).toEqual(["ga4", "stripe"]);
    expect(teamTools(["revenuecat"])).toEqual([]);
  });
});

/**
 * A consumer app's tools (engine spec §21.6.5, A22 APP-2): the stores and the mobile tools first, its own list of offered tools.
 *
 * Non-vacuity, measured on 2026-10-05 (each sabotage applied alone, the unit's test files run, then restored): the
 * « kept » tools measured against the SaaS's list (`SETUP_TOOLS`) instead of the type's falls the three `savedTools`
 * cases that hold an app tool (3: `revenuecat` written twice); `teamTools` ignoring its `type`, 3.
 */
describe("a consumer app's tools", () => {
  it("lists five families, mobile first, every tool once, the three mobile tools and the two stores among them", () => {
    expect(toolFamiliesFor("consumer-app")).toBe(APP_TOOL_FAMILIES);
    expect(APP_TOOL_FAMILIES.map((f) => f.family)).toEqual(["mobile", "analytics", "ads", "billing", "other"]);
    expect(APP_TOOL_FAMILIES[0]!.tools).toEqual(["app-store-connect", "play-console", "revenuecat", "appsflyer", "adjust"]);
    const all = APP_TOOL_FAMILIES.flatMap((f) => f.tools);
    expect(new Set(all).size).toBe(all.length);
    // The tools of a B2B SaaS's sales stack are not an app's.
    for (const tool of ["hubspot", "salesforce", "pipedrive", "chargebee", "chartmogul", "linkedin-ads", "cs-platform"] as ToolId[]) expect(all).not.toContain(tool);
  });

  it("reads the team's tools among the app's offered ones, in its families' order", () => {
    expect(teamTools(["revenuecat", "chargebee"], "consumer-app")).toEqual(["revenuecat"]);
    expect(teamTools(["stripe", "play-console", "ga4", "app-store-connect"], "consumer-app")).toEqual(["app-store-connect", "play-console", "ga4", "stripe"]);
    expect(teamTools(undefined, "consumer-app")).toEqual([]);
  });

  // « Un test de `Setup` » (§21.6.5): the settings card computes what it writes with `savedTools`. An app that holds
  // `["revenuecat"]` and is saved unchanged must keep exactly that. Against the SaaS's list, `revenuecat` would be « kept »
  // (not offered) AND ticked (offered): written twice, and the setup refused (« a tool listed twice »).
  describe("saved unchanged by the settings card", () => {
    const appSetup = (tools: ToolId[]): EngineSetup => ({
      ...emptyState().setup,
      type: "consumer-app",
      motions: { plg: true, slg: false },
      monetization: { subscriptions: true, purchases: false, ads: false },
      tools,
    });
    const toolErrors = (tools: ToolId[]) => validateEngine({ ...emptyState(), setup: appSetup(tools) }).filter((e) => e.startsWith("setup.tools"));

    it("keeps an app's `revenuecat` once, and the setup stays valid", () => {
      const held: ToolId[] = ["revenuecat"];
      const saved = savedTools(teamTools(held, "consumer-app"), held, "consumer-app");
      expect(saved).toEqual(["revenuecat"]);
      expect(toolErrors(saved)).toEqual([]);
    });

    it("keeps a tool a file brought that the app does not offer, unread, after the ticked ones", () => {
      const held: ToolId[] = ["revenuecat", "chargebee", "ga4"];
      expect(savedTools(teamTools(held, "consumer-app"), held, "consumer-app")).toEqual(["revenuecat", "ga4", "chargebee"]);
      expect(toolErrors(savedTools(teamTools(held, "consumer-app"), held, "consumer-app"))).toEqual([]);
    });

    it("keeps, for a SaaS, what it always kept: a store tool a file brought rides along, the ticked ones first", () => {
      const held: ToolId[] = ["app-store-connect", "stripe", "ga4"];
      expect(savedTools(teamTools(held, "b2b-saas"), held, "b2b-saas")).toEqual(["ga4", "stripe", "app-store-connect"]);
    });

    it("writes only what is ticked, then what was held and is not offered — an untick takes a tool out", () => {
      expect(savedTools(["ga4"], ["ga4", "revenuecat"], "consumer-app")).toEqual(["ga4"]);
      expect(savedTools([], undefined, "consumer-app")).toEqual([]);
      expect(savedTools([], ["chargebee"], "consumer-app")).toEqual(["chargebee"]);
    });
  });
});

/**
 * A marketplace's tools (engine spec §22.2.2, A23 MKT-0): its own five families. Before them, `offeredBy` answered the
 * SaaS's list for any type but the app, so a marketplace was offered the SaaS's sales tools and a tool of the SaaS's
 * that the marketplace's card does not show was read as ticked instead of kept unread.
 *
 * Non-vacuity, measured on 2026-10-18 (each sabotage applied alone, the whole of `src/lib/engine` run, the file
 * restored; the count is the tests that fall): `offeredBy` back to the SaaS's list for any type but the app falls
 * « reads the team's tools among the marketplace's offered ones » and « saved unchanged by the settings card » (2: a
 * `chargebee` ticked is read as offered); `toolFamiliesFor` without the marketplace falls those two, the list of the
 * five families here, and `business-type.test.ts`'s `setupToolsFor` (4).
 */
describe("a marketplace's tools", () => {
  const marketSetup = (tools: ToolId[]): EngineSetup => ({ ...emptyState().setup, type: "marketplace", motions: { plg: false, slg: false }, tools });
  const toolErrors = (tools: ToolId[]) => validateEngine({ ...emptyState(), setup: marketSetup(tools) }).filter((e) => e.startsWith("setup.tools"));

  it("lists five families in the spec's order, every tool once: no store, no mobile tool, none of the SaaS's customer-success stack", () => {
    expect(toolFamiliesFor("marketplace")).toBe(MKT_TOOL_FAMILIES);
    expect(MKT_TOOL_FAMILIES).toEqual([
      { family: "analytics", tools: ["ga4", "mixpanel", "amplitude", "posthog"] },
      { family: "billing", tools: ["stripe"] },
      { family: "crm", tools: ["hubspot", "salesforce", "pipedrive"] },
      { family: "ads", tools: ["google-ads", "meta-ads", "linkedin-ads"] },
      { family: "other", tools: ["product-db", "spreadsheet"] },
    ]);
    const all = MKT_TOOL_FAMILIES.flatMap((f) => f.tools);
    expect(new Set(all).size).toBe(all.length);
    for (const tool of ["app-store-connect", "play-console", "revenuecat", "appsflyer", "adjust", "chargebee", "chartmogul", "cs-platform"] as ToolId[]) expect(all).not.toContain(tool);
  });

  it("the other types keep their families: the SaaS's and the app's are the very lists they were", () => {
    expect(toolFamiliesFor("b2b-saas")).toBe(TOOL_FAMILIES);
    expect(toolFamiliesFor("consumer-app")).toBe(APP_TOOL_FAMILIES);
  });

  it("reads the team's tools among the marketplace's offered ones, in its families' order, once each", () => {
    expect(teamTools(["hubspot", "stripe", "ga4", "stripe"], "marketplace")).toEqual(["ga4", "stripe", "hubspot"]);
    expect(teamTools(["chargebee", "revenuecat"], "marketplace")).toEqual([]);
    expect(teamTools(undefined, "marketplace")).toEqual([]);
    // The same tool is the SaaS's to read: the offered list belongs to the type.
    expect(teamTools(["chargebee"], "b2b-saas")).toEqual(["chargebee"]);
  });

  // The settings card writes `savedTools`: a marketplace that holds a tool its card does not offer keeps it unread, once,
  // and the setup stays valid (« a tool listed twice » would refuse it).
  it("saved unchanged by the settings card, keeps what the marketplace does not offer, once, after the ticked ones", () => {
    const held: ToolId[] = ["chargebee", "hubspot", "ga4"];
    const saved = savedTools(teamTools(held, "marketplace"), held, "marketplace");
    expect(saved).toEqual(["ga4", "hubspot", "chargebee"]);
    expect(toolErrors(saved)).toEqual([]);
    expect(savedTools(["ga4"], ["ga4", "chargebee"], "marketplace")).toEqual(["ga4", "chargebee"]);
    expect(savedTools([], undefined, "marketplace")).toEqual([]);
  });
});
