import { afterEach, describe, expect, it } from "vitest";
import { summarizeSubmissions, scoreBandOf } from "@/lib/submissions/growth-stats";
import { isPublicMetricsEnabled, MIN_SUBMISSIONS_TO_PUBLISH, toPublicMetrics } from "../public-metrics";
import type { Submission } from "@/lib/submissions/types";

function submission(over: Partial<Submission> = {}): Submission {
  return {
    id: "x",
    createdAt: new Date().toISOString(),
    locale: "en",
    tone: "neutral",
    total: 60,
    pillars: { acquisition: 12, activation: 12, retention: 12, referral: 12, revenue: 12 },
    weakestPillar: "retention",
    answers: {},
    refId: null,
    segment: null,
    deepDive: null,
    ...over,
  } as Submission;
}

describe("scoreBandOf", () => {
  it("cuts at 40, 60 and 80, with the ends inside their own band", () => {
    expect(scoreBandOf(0)).toBe("0-39");
    expect(scoreBandOf(39)).toBe("0-39");
    expect(scoreBandOf(40)).toBe("40-59");
    expect(scoreBandOf(59)).toBe("40-59");
    expect(scoreBandOf(60)).toBe("60-79");
    expect(scoreBandOf(79)).toBe("60-79");
    expect(scoreBandOf(80)).toBe("80-100");
    expect(scoreBandOf(100)).toBe("80-100");
  });
});

describe("toPublicMetrics (REVIEW-02.md R2-28)", () => {
  it("withholds meaning below the floor, and grants it exactly at the floor", () => {
    const below = Array.from({ length: MIN_SUBMISSIONS_TO_PUBLISH - 1 }, () => submission());
    expect(toPublicMetrics(summarizeSubmissions(below)).meaningful).toBe(false);
    const at = Array.from({ length: MIN_SUBMISSIONS_TO_PUBLISH }, () => submission());
    expect(toPublicMetrics(summarizeSubmissions(at)).meaningful).toBe(true);
  });

  it("publishes counts and ratios, never a field the dashboard added for itself", () => {
    const m = toPublicMetrics(summarizeSubmissions([submission()]));
    expect(Object.keys(m).sort()).toEqual([
      "averageScore",
      "deepDiveRate",
      "kFactor",
      "meaningful",
      "referredTours",
      "scoreBands",
      "toursLast30Days",
      "tours",
    ].sort());
    // The private dashboard's splits must not ride along.
    expect(m).not.toHaveProperty("byLocale");
    expect(m).not.toHaveProperty("byTone");
    expect(m).not.toHaveProperty("freeContextProvided");
  });

  it("carries the K-factor R2-01 defined, not the ratio it replaced", () => {
    // 4 Tours, 1 of them referred by another result: K = 1/4, not 1/1.
    const subs = [submission(), submission(), submission(), submission({ refId: "a" })];
    const m = toPublicMetrics(summarizeSubmissions(subs));
    expect(m.kFactor).toBeCloseTo(0.25);
    expect(m.referredTours).toBe(1);
  });

  it("counts the score bands and rounds the average for display", () => {
    const m = toPublicMetrics(summarizeSubmissions([submission({ total: 30 }), submission({ total: 91 })]));
    expect(m.scoreBands).toEqual({ "0-39": 1, "40-59": 0, "60-79": 0, "80-100": 1 });
    expect(m.averageScore).toBe(61); // 60.5 rounded
  });
});

describe("isPublicMetricsEnabled", () => {
  const original = process.env.METRICS_PAGE_ENABLED;
  afterEach(() => {
    if (original === undefined) delete process.env.METRICS_PAGE_ENABLED;
    else process.env.METRICS_PAGE_ENABLED = original;
  });

  it("is closed unless the flag says exactly 'true' — an unset or fuzzy value never opens it", () => {
    delete process.env.METRICS_PAGE_ENABLED;
    expect(isPublicMetricsEnabled()).toBe(false);
    for (const v of ["", "false", "1", "yes", "TRUE"]) {
      process.env.METRICS_PAGE_ENABLED = v;
      expect(isPublicMetricsEnabled(), v).toBe(false);
    }
    process.env.METRICS_PAGE_ENABLED = "true";
    expect(isPublicMetricsEnabled()).toBe(true);
  });
});
