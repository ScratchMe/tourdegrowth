import { describe, expect, it } from "vitest";
import { APP_TOOL_FAMILIES, SETUP_TOOLS, TOOL_FAMILIES, savedTools, teamTools, toolFamiliesFor } from "../tools";
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
