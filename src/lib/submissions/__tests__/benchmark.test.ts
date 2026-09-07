import { beforeEach, describe, expect, it, vi } from "vitest";

const getGlobalStats = vi.fn<() => Promise<{ count: number; scoreSum: number } | null>>();
const getSegmentStats = vi.fn<(id: string) => Promise<{ count: number; scoreSum: number } | null>>();

vi.mock("@/lib/submissions/repository", () => ({
  getGlobalStats: () => getGlobalStats(),
  getSegmentStats: (id: string) => getSegmentStats(id),
}));

// `unstable_cache` needs a Next request context it doesn't have here; the
// caching itself is Next's job, not this module's, so it's passed straight
// through and what gets tested is the logic that sits inside it.
vi.mock("next/cache", () => ({
  unstable_cache: (fn: () => unknown) => fn,
}));

const { BENCHMARK_MIN_SUBMISSIONS, getBenchmarkAverage, getBenchmarkFor } = await import("../benchmark");

/** REVIEW.md R-20. */
describe("getBenchmarkAverage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the rounded average once there are enough Tours to mean something", async () => {
    getGlobalStats.mockResolvedValue({ count: 100, scoreSum: 5834 });
    expect(await getBenchmarkAverage()).toBe(58);
  });

  it("stays hidden below the minimum sample — an average of three people is not a benchmark", async () => {
    getGlobalStats.mockResolvedValue({ count: BENCHMARK_MIN_SUBMISSIONS - 1, scoreSum: 1000 });
    expect(await getBenchmarkAverage()).toBeNull();
  });

  it("shows up exactly at the threshold, not one above it", async () => {
    getGlobalStats.mockResolvedValue({ count: BENCHMARK_MIN_SUBMISSIONS, scoreSum: BENCHMARK_MIN_SUBMISSIONS * 62 });
    expect(await getBenchmarkAverage()).toBe(62);
  });

  it("returns null when the counter document doesn't exist yet", async () => {
    getGlobalStats.mockResolvedValue(null);
    expect(await getBenchmarkAverage()).toBeNull();
  });

  it("swallows a Firestore failure — a benchmark must never take a result page down", async () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    getGlobalStats.mockRejectedValue(new Error("firestore down"));

    expect(await getBenchmarkAverage()).toBeNull();
    expect(errors).toHaveBeenCalled();
    errors.mockRestore();
  });
});

/**
 * REVIEW-02.md R2-26. The cascade is the whole feature: a segment average
 * when that segment has enough people in it, the global one otherwise, and
 * nothing when neither qualifies. Getting the fallback wrong would either
 * show an average of four people as "SaaS B2B like you" or blank the line
 * out for months while twelve segments fill up.
 */
describe("getBenchmarkFor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getGlobalStats.mockResolvedValue({ count: 200, scoreSum: 200 * 61 });
  });

  it("prefers the segment average once that segment is big enough", async () => {
    getSegmentStats.mockResolvedValue({ count: BENCHMARK_MIN_SUBMISSIONS, scoreSum: BENCHMARK_MIN_SUBMISSIONS * 67 });

    expect(await getBenchmarkFor({ stage: "scaling", model: "b2b" })).toEqual({ score: 67, scope: "segment" });
    expect(getSegmentStats).toHaveBeenCalledWith("scaling__b2b");
  });

  it("falls back to the global average while a thin segment fills up", async () => {
    getSegmentStats.mockResolvedValue({ count: BENCHMARK_MIN_SUBMISSIONS - 1, scoreSum: 4 * 90 });

    expect(await getBenchmarkFor({ stage: "pre-launch", model: "marketplace" })).toEqual({ score: 61, scope: "global" });
  });

  it("never reads a segment aggregate for a half-answered segment", async () => {
    expect(await getBenchmarkFor({ stage: "unknown", model: "b2b" })).toEqual({ score: 61, scope: "global" });
    expect(await getBenchmarkFor(null)).toEqual({ score: 61, scope: "global" });
    expect(getSegmentStats).not.toHaveBeenCalled();
  });

  it("falls back rather than failing when the segment read throws", async () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    getSegmentStats.mockRejectedValue(new Error("firestore down"));

    expect(await getBenchmarkFor({ stage: "scaling", model: "b2b" })).toEqual({ score: 61, scope: "global" });
    expect(errors).toHaveBeenCalled();
    errors.mockRestore();
  });

  it("shows nothing at all when neither the segment nor the global average qualifies", async () => {
    getSegmentStats.mockResolvedValue(null);
    getGlobalStats.mockResolvedValue({ count: 3, scoreSum: 180 });

    expect(await getBenchmarkFor({ stage: "scaling", model: "b2b" })).toBeNull();
  });
});
