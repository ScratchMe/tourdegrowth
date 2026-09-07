import { describe, expect, it } from "vitest";
import { summarizeSubmissions } from "../growth-stats";
import type { DeepDiveResult, Submission } from "../types";

// REVIEW-02.md R2-10: this file computes the K-factor — the number SPEC.md §1
// says the project exists to quote — and had no test at all until now, which
// is how the definition error of R2-01 lived for a week.

const NOW = Date.parse("2026-09-06T12:00:00Z");
const DAY = 24 * 60 * 60 * 1000;

function daysAgo(n: number): string {
  return new Date(NOW - n * DAY).toISOString();
}

const DEEP_DIVE: DeepDiveResult = {
  completed: true,
  locale: "en",
  freeContextProvided: false,
  verdicts: {
    neutral: { pillarRecommendations: {} as never, priorityAction: "", modelUsed: "x" },
    roast: { pillarRecommendations: {} as never, priorityAction: "", modelUsed: "x" },
  },
};

function submission(overrides: Partial<Submission> & { id: string }): Submission {
  return {
    createdAt: daysAgo(1),
    locale: "en",
    tone: "neutral",
    answers: {},
    pillars: [],
    total: 50,
    weakestPillar: "retention",
    refId: null,
    segment: null,
    ownerTokenHash: null,
    deepDive: null,
    ...overrides,
  };
}

describe("summarizeSubmissions — K-factor (REVIEW-02.md R2-01)", () => {
  it("divides referred submissions by ALL submissions, so K can be below 1", () => {
    // Three results shared (a, b, c); only a's link converted anyone — twice.
    const stats = summarizeSubmissions(
      [
        submission({ id: "a" }),
        submission({ id: "b" }),
        submission({ id: "c" }),
        submission({ id: "d", refId: "a" }),
        submission({ id: "e", refId: "a" }),
      ],
      NOW,
    );
    expect(stats.referredSubmissions).toBe(2);
    expect(stats.totalSubmissions).toBe(5);
    expect(stats.kFactor).toBeCloseTo(0.4);
    // The old formula gave 2 / 1 = 2.00 for this exact dataset — a viral
    // coefficient above 1 for a product where one link in three converted.
    expect(stats.kFactor).toBeLessThan(1);
  });

  it("keeps the old ratio under its honest name: referrals per converting result", () => {
    const stats = summarizeSubmissions(
      [submission({ id: "a" }), submission({ id: "d", refId: "a" }), submission({ id: "e", refId: "a" })],
      NOW,
    );
    expect(stats.convertingResults).toBe(1);
    expect(stats.referralsPerConvertingResult).toBe(2);
  });

  it("is 0, never NaN, when nothing has been referred or nothing exists", () => {
    expect(summarizeSubmissions([], NOW).kFactor).toBe(0);
    expect(summarizeSubmissions([], NOW).referralsPerConvertingResult).toBe(0);
    const noReferrals = summarizeSubmissions([submission({ id: "a" }), submission({ id: "b" })], NOW);
    expect(noReferrals.kFactor).toBe(0);
    expect(noReferrals.convertingResults).toBe(0);
  });

  it("can never exceed the share of submissions that carry a ref", () => {
    const all = [
      submission({ id: "a" }),
      submission({ id: "b", refId: "a" }),
      submission({ id: "c", refId: "a" }),
      submission({ id: "d", refId: "b" }),
    ];
    const stats = summarizeSubmissions(all, NOW);
    expect(stats.kFactor).toBeCloseTo(3 / 4);
    expect(stats.kFactor).toBeLessThanOrEqual(1);
  });
});

describe("summarizeSubmissions — the rest of the dashboard", () => {
  it("counts the 7- and 30-day windows against the `now` it is given", () => {
    const stats = summarizeSubmissions(
      [
        submission({ id: "a", createdAt: daysAgo(0.5) }),
        submission({ id: "b", createdAt: daysAgo(6.9) }),
        submission({ id: "c", createdAt: daysAgo(7.1) }),
        submission({ id: "d", createdAt: daysAgo(29) }),
        submission({ id: "e", createdAt: daysAgo(31) }),
      ],
      NOW,
    );
    expect(stats.last7Days).toBe(2);
    expect(stats.last30Days).toBe(4);
    expect(stats.totalSubmissions).toBe(5);
  });

  it("leaves a malformed createdAt out of the windows without throwing", () => {
    const stats = summarizeSubmissions([submission({ id: "a", createdAt: "not a date" })], NOW);
    expect(stats.last7Days).toBe(0);
    expect(stats.last30Days).toBe(0);
    expect(stats.totalSubmissions).toBe(1);
  });

  it("averages the score and splits by tone and locale", () => {
    const stats = summarizeSubmissions(
      [
        submission({ id: "a", total: 40, tone: "neutral", locale: "en" }),
        submission({ id: "b", total: 60, tone: "roast", locale: "fr" }),
        submission({ id: "c", total: 80, tone: "roast", locale: "fr" }),
      ],
      NOW,
    );
    expect(stats.averageScore).toBe(60);
    expect(stats.byTone).toEqual({ neutral: 1, roast: 2 });
    expect(stats.byLocale).toEqual({ en: 1, fr: 2 });
  });

  it("measures Deep dive completion and the free-context fill rate against the right denominators", () => {
    // A document written before REVIEW-02.md R2-20 carries the text and no
    // boolean; it must still count, or the rate would drop the day the
    // boolean shipped.
    const legacyWithText = { ...DEEP_DIVE, freeContextProvided: undefined, freeContext: "we sell to accounting firms" };
    const legacyWithout = { ...DEEP_DIVE, freeContextProvided: undefined, freeContext: null };
    const stats = summarizeSubmissions(
      [
        submission({ id: "a" }),
        submission({ id: "b", deepDive: DEEP_DIVE }),
        submission({ id: "c", deepDive: { ...DEEP_DIVE, freeContextProvided: true } }),
        submission({ id: "d", deepDive: legacyWithText as unknown as DeepDiveResult }),
        submission({ id: "e", deepDive: legacyWithout as unknown as DeepDiveResult }),
      ],
      NOW,
    );
    expect(stats.deepDiveCompleted).toBe(4);
    expect(stats.deepDiveCompletionRate).toBeCloseTo(4 / 5);
    expect(stats.freeContextProvided).toBe(2);
    expect(stats.freeContextRate).toBeCloseTo(2 / 4);
  });

  it("returns zeros, not NaN, for an empty collection", () => {
    const stats = summarizeSubmissions([], NOW);
    expect(stats.averageScore).toBe(0);
    expect(stats.deepDiveCompletionRate).toBe(0);
    expect(stats.freeContextRate).toBe(0);
  });
});
