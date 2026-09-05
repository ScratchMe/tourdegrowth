import { describe, expect, it } from "vitest";
import { PILLARS } from "@/lib/scoring/pillars";
import type { DeepDiveResult, DeepDiveVerdict } from "../types";
import { toDeepDiveView } from "../view-model";

function verdict(prefix: string): DeepDiveVerdict {
  const pillarRecommendations = Object.fromEntries(
    PILLARS.map((p) => [p, `${prefix} ${p} recommendation.`]),
  ) as DeepDiveVerdict["pillarRecommendations"];

  return { pillarRecommendations, priorityAction: `${prefix} priority action.`, modelUsed: "gemini-3.6-flash" };
}

const SECRET_CONTEXT = "We sell to accounting firms, trust is a bigger blocker than price.";

const deepDive: DeepDiveResult = {
  completed: true,
  contextAnswers: { "deep-acq-1": "Outbound sales", "deep-ret-1": "We don't measure it" },
  freeContext: SECRET_CONTEXT,
  verdicts: { neutral: verdict("Neutral"), roast: verdict("Roast") },
};

/** REVIEW.md R-02 — /r/<id> is public, so this is a privacy boundary, not a tidiness one. */
describe("toDeepDiveView", () => {
  it("keeps both tones' recommendations and priority action", () => {
    const view = toDeepDiveView(deepDive);

    expect(view?.verdicts.neutral.priorityAction).toBe("Neutral priority action.");
    expect(view?.verdicts.roast.priorityAction).toBe("Roast priority action.");
    for (const pillar of PILLARS) {
      expect(view?.verdicts.neutral.pillarRecommendations[pillar]).toBe(`Neutral ${pillar} recommendation.`);
      expect(view?.verdicts.roast.pillarRecommendations[pillar]).toBe(`Roast ${pillar} recommendation.`);
    }
  });

  it("never lets the free-text context, the context answers or the model name through", () => {
    const serialized = JSON.stringify(toDeepDiveView(deepDive));

    expect(serialized).not.toContain(SECRET_CONTEXT);
    expect(serialized).not.toContain("accounting firms");
    expect(serialized).not.toContain("Outbound sales");
    expect(serialized).not.toContain("deep-acq-1");
    expect(serialized).not.toContain("gemini");
    expect(serialized).not.toContain("freeContext");
  });

  it("maps a Quick result (no Deep dive) to null", () => {
    expect(toDeepDiveView(null)).toBeNull();
    expect(toDeepDiveView(undefined)).toBeNull();
  });
});
