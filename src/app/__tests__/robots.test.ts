import { describe, expect, it } from "vitest";
import robots from "../robots";
import { AI_ANSWER_AGENTS, AI_TRAINING_AGENTS } from "@/lib/seo/ai-agents";
import { SITE_URL } from "@/lib/site";

type Rule = { userAgent?: string | string[]; allow?: string | string[]; disallow?: string | string[] };

const rules = (): Rule[] => {
  const r = robots().rules;
  return Array.isArray(r) ? r : [r];
};
const agentsOf = (rule: Rule) => (Array.isArray(rule.userAgent) ? rule.userAgent : [rule.userAgent ?? ""]);

/**
 * CHANTIERS.md C26, decided on 2026-09-30: every robot, AI ones included, is
 * let in, and the AI robots are NAMED so that the file says it. A `Disallow`
 * in one of these groups is a decision to revisit C26, not a tidy-up: this
 * test is the place that says so.
 */
describe("robots.txt (C26)", () => {
  it("names every AI robot, training and answers alike", () => {
    const named = rules().flatMap(agentsOf);
    for (const agent of [...AI_TRAINING_AGENTS, ...AI_ANSWER_AGENTS]) {
      expect(named, agent).toContain(agent);
    }
    // The two families the publishers now keep apart, each worth naming.
    expect(AI_TRAINING_AGENTS).toEqual(expect.arrayContaining(["GPTBot", "ClaudeBot", "Google-Extended"]));
    expect(AI_ANSWER_AGENTS).toEqual(expect.arrayContaining(["OAI-SearchBot", "Claude-SearchBot", "PerplexityBot"]));
  });

  it("lets every group in, with no Disallow anywhere", () => {
    for (const rule of rules()) {
      expect(rule.allow, agentsOf(rule).join(", ")).toBe("/");
      expect(rule.disallow, agentsOf(rule).join(", ")).toBeUndefined();
    }
  });

  it("keeps the catch-all group and the sitemap", () => {
    expect(rules().some((rule) => agentsOf(rule).includes("*"))).toBe(true);
    expect(robots().sitemap).toBe(`${SITE_URL}/sitemap.xml`);
  });
});
