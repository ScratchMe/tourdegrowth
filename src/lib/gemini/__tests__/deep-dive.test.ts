import { describe, expect, it } from "vitest";
import { PILLARS } from "@/lib/scoring/pillars";
import { parseDeepDiveVerdict } from "@/lib/submissions/verdict";
import { DEEP_DIVE_RESPONSE_SCHEMA, callDeepDiveGemini } from "../deep-dive";

/**
 * REVIEW.md R-25. The schema the API enforces and the parser we run on what
 * it returns describe the same contract — these tests keep them from
 * drifting apart, which is the one failure that would be invisible in
 * production (the API would happily enforce a shape the parser rejects).
 */
describe("DEEP_DIVE_RESPONSE_SCHEMA", () => {
  const schema = DEEP_DIVE_RESPONSE_SCHEMA as {
    required: string[];
    properties: { pillarRecommendations: { required: string[]; properties: Record<string, unknown> } };
  };

  it("requires exactly the five pillars, in canonical order, plus the priority action", () => {
    expect(schema.required).toEqual(["pillarRecommendations", "priorityAction"]);
    expect(schema.properties.pillarRecommendations.required).toEqual([...PILLARS]);
    expect(Object.keys(schema.properties.pillarRecommendations.properties)).toEqual([...PILLARS]);
  });

  it("describes a shape the parser accepts — the two contracts agree", () => {
    // The smallest object that satisfies every `required` in the schema.
    const minimal = {
      pillarRecommendations: Object.fromEntries(PILLARS.map((p) => [p, `advice for ${p}`])),
      priorityAction: "do this first",
    };
    const verdict = parseDeepDiveVerdict(JSON.stringify(minimal), "test-model");
    expect(verdict.priorityAction).toBe("do this first");
    for (const pillar of PILLARS) expect(verdict.pillarRecommendations[pillar]).toBe(`advice for ${pillar}`);
  });
});

describe("callDeepDiveGemini", () => {
  it("attaches the Deep dive schema to the request — the same call production and the live probe make", async () => {
    let body: { generationConfig: Record<string, unknown> } | undefined;
    const fetchImpl = (async (_url: string | URL | Request, init?: RequestInit) => {
      body = JSON.parse(init?.body as string);
      return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: "{}" }] } }] }), { status: 200 });
    }) as unknown as typeof fetch;

    await callDeepDiveGemini("prompt", "k", { fetchImpl, sleepImpl: async () => {} });

    expect(body?.generationConfig.responseSchema).toEqual(DEEP_DIVE_RESPONSE_SCHEMA);
  });
});
