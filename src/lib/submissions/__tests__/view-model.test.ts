import { describe, expect, it } from "vitest";
import { PILLARS } from "@/lib/scoring/pillars";
import type { DeepDiveResult, DeepDiveVerdict } from "../types";
import { buildQuickVerdicts, toDeepDiveView } from "../view-model";

function verdict(prefix: string): DeepDiveVerdict {
  const pillarRecommendations = Object.fromEntries(
    PILLARS.map((p) => [p, `${prefix} ${p} recommendation.`]),
  ) as DeepDiveVerdict["pillarRecommendations"];

  return { pillarRecommendations, priorityAction: `${prefix} priority action.`, modelUsed: "gemini-3.6-flash" };
}

const SECRET_CONTEXT = "We sell to accounting firms, trust is a bigger blocker than price.";

const deepDive: DeepDiveResult = {
  completed: true,
  freeContextProvided: true,
  // Legacy fields (pre-R2-20 documents still carry them) — kept in this fixture
  // precisely so the leak assertions below keep meaning something.
  contextAnswers: { "deep-acq-1": "Outbound sales", "deep-ret-1": "We don't measure it" },
  freeContext: SECRET_CONTEXT,
  verdicts: { neutral: verdict("Neutral"), roast: verdict("Roast") },
};

/** REVIEW.md R-02 — /r/<id> is public, so this is a privacy boundary, not a tidiness one. */
describe("toDeepDiveView", () => {
  it("keeps both tones' recommendations and priority action", () => {
    const view = toDeepDiveView(deepDive, "en");

    expect(view?.verdicts.neutral.priorityAction).toBe("Neutral priority action.");
    expect(view?.verdicts.roast.priorityAction).toBe("Roast priority action.");
    for (const pillar of PILLARS) {
      expect(view?.verdicts.neutral.pillarRecommendations[pillar]).toBe(`Neutral ${pillar} recommendation.`);
      expect(view?.verdicts.roast.pillarRecommendations[pillar]).toBe(`Roast ${pillar} recommendation.`);
    }
  });

  it("never lets the free-text context, the context answers or the model name through", () => {
    const serialized = JSON.stringify(toDeepDiveView(deepDive, "en"));

    expect(serialized).not.toContain(SECRET_CONTEXT);
    expect(serialized).not.toContain("accounting firms");
    expect(serialized).not.toContain("Outbound sales");
    expect(serialized).not.toContain("deep-acq-1");
    expect(serialized).not.toContain("gemini");
    expect(serialized).not.toContain("freeContext");
  });

  it("maps a Quick result (no Deep dive) to null", () => {
    expect(toDeepDiveView(null, "en")).toBeNull();
    expect(toDeepDiveView(undefined, "en")).toBeNull();
  });
});

/**
 * The Deep dive follows the reader too — the gap R-09 left, reported by
 * Antoine: his own English result opened in French kept the per-pillar
 * explanations and the priority action in English.
 */
describe("toDeepDiveView — the reader's language", () => {
  const bilingual: DeepDiveResult = {
    ...deepDive,
    locale: "en",
    verdicts: { neutral: verdict("EN neutral"), roast: verdict("EN roast") },
    localized: {
      en: { neutral: verdict("EN neutral"), roast: verdict("EN roast") },
      fr: { neutral: verdict("FR neutre"), roast: verdict("FR roast") },
    },
  };

  it("serves a French reader the French generation", () => {
    const view = toDeepDiveView(bilingual, "fr");
    expect(view?.verdicts.neutral.priorityAction).toBe("FR neutre priority action.");
    expect(view?.verdicts.roast.pillarRecommendations.retention).toBe("FR roast retention recommendation.");
  });

  it("serves an English reader the English generation", () => {
    expect(toDeepDiveView(bilingual, "en")?.verdicts.neutral.priorityAction).toBe("EN neutral priority action.");
  });

  it("falls back to the generation locale when the other language is missing", () => {
    // Best-effort by design: the second language's generation can fail
    // without costing the author the Deep dive they answered ten questions
    // for. Wrong language beats no recommendation.
    const onlyEnglish: DeepDiveResult = {
      ...deepDive,
      locale: "en",
      verdicts: { neutral: verdict("EN neutral"), roast: verdict("EN roast") },
      localized: { en: { neutral: verdict("EN neutral"), roast: verdict("EN roast") } },
    };
    expect(toDeepDiveView(onlyEnglish, "fr")?.verdicts.neutral.priorityAction).toBe("EN neutral priority action.");
  });

  it("still renders a document written before Deep dives were bilingual", () => {
    // No `localized` at all — exactly the old behaviour, not a crash.
    expect(toDeepDiveView(deepDive, "fr")?.verdicts.neutral.priorityAction).toBe("Neutral priority action.");
  });
});

/** REVIEW.md R-09 — the verdict belongs to whoever is reading. */
describe("buildQuickVerdicts", () => {
  const pillars = [
    { pillar: "acquisition" as const, score: 20 },
    { pillar: "activation" as const, score: 18 },
    { pillar: "retention" as const, score: 2 },
    { pillar: "referral" as const, score: 16 },
    { pillar: "revenue" as const, score: 20 },
  ];

  it("resolves both tones for the requested locale", () => {
    const en = buildQuickVerdicts("en", pillars, "retention");

    expect(en.neutral.headline.length).toBeGreaterThan(0);
    expect(en.roast.headline.length).toBeGreaterThan(0);
    for (const p of PILLARS) {
      expect(en.neutral.pillarSentences[p].length).toBeGreaterThan(0);
      expect(en.roast.pillarSentences[p].length).toBeGreaterThan(0);
    }
  });

  it("returns different text per locale for the same scores", () => {
    const en = buildQuickVerdicts("en", pillars, "retention");
    const fr = buildQuickVerdicts("fr", pillars, "retention");

    expect(fr.neutral.headline).not.toBe(en.neutral.headline);
    expect(fr.neutral.pillarSentences.retention).not.toBe(en.neutral.pillarSentences.retention);
    // Same input, same output: this is a pure lookup, safe to resolve per request.
    expect(buildQuickVerdicts("fr", pillars, "retention")).toEqual(fr);
  });

  it("keys the headline off the weakest pillar, not the author's choices", () => {
    const weakRetention = buildQuickVerdicts("en", pillars, "retention");
    const weakRevenue = buildQuickVerdicts("en", pillars, "revenue");

    expect(weakRetention.neutral.headline).not.toBe(weakRevenue.neutral.headline);
  });

  it("gives a low-scoring pillar different copy than a high-scoring one", () => {
    const v = buildQuickVerdicts("en", pillars, "retention");
    expect(v.neutral.pillarSentences.retention).not.toBe(v.neutral.pillarSentences.revenue);
  });
});
