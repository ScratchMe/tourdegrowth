import { describe, expect, it } from "vitest";

// A JS module in an `allowJs: false` project — same trick as
// next-config.test.ts: widen the specifier so the import is untyped.
const mod = (await import("../../scripts/utm-channels.mjs" as string)) as {
  CAMPAIGNS: string[];
  WAVE_CAMPAIGNS: string[];
  LAUNCH_CAMPAIGNS: string[];
  EXCLUDED: string[];
  CHANNELS: Record<string, { source: string; campaign: string }>;
  DYNAMIC_PREFIXES: Record<string, { campaign: string }>;
  KNOWN_DIRECTORIES: string[];
  DEFAULT_SITE_URL: string;
  resolveChannel: (key: string) => { source: string; campaign: string } | null;
  buildUtmUrl: (key: string, path?: string, siteUrl?: string, campaign?: string) => string | null;
};

/**
 * GROWTH-PLAN.md (2026-09-13) was written under two constraints: no
 * LinkedIn, and the author is never named. The UTM vocabulary is the one
 * place a channel gets a name before a link goes out, so it is where the
 * first constraint is enforced rather than remembered — a `linkedin` source
 * added back by habit fails here, not in GoatCounter three weeks later.
 */
describe("the UTM vocabulary follows GROWTH-PLAN.md", () => {
  it("contains no channel the plan excludes — in keys, sources or families", () => {
    const words = [
      ...Object.keys(mod.CHANNELS),
      ...Object.values(mod.CHANNELS).map((c) => c.source),
      ...Object.keys(mod.DYNAMIC_PREFIXES),
    ];
    const offenders = words.filter((w) => mod.EXCLUDED.some((x) => w.includes(x)));
    expect(offenders).toEqual([]);
    expect(mod.EXCLUDED).toContain("linkedin");
  });

  it("uses only the plan's waves as campaigns, and lowercase snake_case sources", () => {
    for (const [key, { source, campaign }] of Object.entries(mod.CHANNELS)) {
      expect(mod.CAMPAIGNS, key).toContain(campaign);
      expect(source, key).toMatch(/^[a-z0-9_]+$/);
    }
    for (const [prefix, { campaign }] of Object.entries(mod.DYNAMIC_PREFIXES)) {
      expect(mod.CAMPAIGNS, prefix).toContain(campaign);
    }
  });

  it("never maps two keys onto the same source+campaign pair — that would merge two channels in the dashboard", () => {
    const pairs = Object.values(mod.CHANNELS).map((c) => `${c.source}|${c.campaign}`);
    expect(new Set(pairs).size).toBe(pairs.length);
  });

  it("keeps the channels the launch wave depends on", () => {
    for (const key of ["hackernews", "indiehackers", "reddit_sideproject", "reddit_roastmystartup", "reddit_saas", "bluesky"]) {
      expect(mod.CHANNELS[key], key).toBeDefined();
    }
  });
});

describe("resolveChannel / buildUtmUrl", () => {
  it("resolves a fixed channel and a dynamic one, and refuses the rest", () => {
    expect(mod.resolveChannel("reddit_saas")).toEqual({ source: "reddit_saas", campaign: "launch_week" });
    expect(mod.resolveChannel("directory:uneed")).toEqual({ source: "directory_uneed", campaign: "directories" });
    expect(mod.resolveChannel("newsletter:growthunhinged")).toEqual({ source: "newsletter_growthunhinged", campaign: "seeding" });
    expect(mod.resolveChannel("linkedin")).toBeNull();
    expect(mod.resolveChannel("directory:Une-ed")).toBeNull();
    expect(mod.resolveChannel("slack:growthmakers")).toBeNull();
  });

  it("builds the link on the canonical www host, with the path normalised", () => {
    expect(mod.buildUtmUrl("reddit_roastmystartup")).toBe(
      "https://www.tourdegrowth.com/?utm_source=reddit_roastmystartup&utm_campaign=launch_week",
    );
    expect(mod.buildUtmUrl("directory:fazier", "en/glossary/aarrr")).toBe(
      "https://www.tourdegrowth.com/en/glossary/aarrr?utm_source=directory_fazier&utm_campaign=directories",
    );
    expect(mod.buildUtmUrl("nope")).toBeNull();
    expect(mod.DEFAULT_SITE_URL).toBe("https://www.tourdegrowth.com");
  });

  it("names every directory of the plan as a valid dynamic key", () => {
    expect(mod.KNOWN_DIRECTORIES.length).toBeGreaterThanOrEqual(10);
    for (const slug of mod.KNOWN_DIRECTORIES) {
      expect(mod.resolveChannel(`directory:${slug}`), slug).not.toBeNull();
    }
  });
});

/**
 * marketing/campaigns/README.md sequences three launches through the same
 * communities. The source says WHERE a visit came from, the campaign says
 * WHICH launch sent it — so the override is what lets GoatCounter tell the
 * engine's Show HN from the Tour's, and it must refuse a campaign it does
 * not know rather than mint a new row.
 */
describe("launch campaigns", () => {
  it("names the three sequenced launches, all inside the campaign vocabulary", () => {
    expect(mod.LAUNCH_CAMPAIGNS).toEqual(["relaunch_tour", "launch_engine", "launch_game"]);
    for (const campaign of mod.LAUNCH_CAMPAIGNS) {
      expect(mod.CAMPAIGNS, campaign).toContain(campaign);
      expect(campaign).toMatch(/^[a-z0-9_]+$/);
      expect(mod.WAVE_CAMPAIGNS, campaign).not.toContain(campaign);
    }
  });

  it("overrides the channel's wave with a known campaign, and keeps the source", () => {
    expect(mod.buildUtmUrl("hackernews", "/en/aarrr-funnel-template", undefined, "launch_engine")).toBe(
      "https://www.tourdegrowth.com/en/aarrr-funnel-template?utm_source=hackernews&utm_campaign=launch_engine",
    );
    expect(mod.buildUtmUrl("directory:uneed", "/fr/game", undefined, "launch_game")).toBe(
      "https://www.tourdegrowth.com/fr/game?utm_source=directory_uneed&utm_campaign=launch_game",
    );
  });

  it("falls back to the channel's own wave when no campaign is given", () => {
    expect(mod.buildUtmUrl("hackernews", "/en")).toBe(
      "https://www.tourdegrowth.com/en?utm_source=hackernews&utm_campaign=launch_week",
    );
  });

  it("refuses an unknown campaign instead of minting a new GoatCounter row", () => {
    expect(mod.buildUtmUrl("hackernews", "/en", undefined, "launch_week2")).toBeNull();
    expect(mod.buildUtmUrl("hackernews", "/en", undefined, "Launch_Engine")).toBeNull();
    expect(mod.buildUtmUrl("hackernews", "/en", undefined, "")).toBeNull();
  });
});
