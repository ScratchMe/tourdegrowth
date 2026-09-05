import { beforeEach, describe, expect, it, vi } from "vitest";

const getGlobalStats = vi.fn<() => Promise<{ count: number; scoreSum: number } | null>>();

vi.mock("@/lib/submissions/repository", () => ({
  getGlobalStats: () => getGlobalStats(),
}));

// `unstable_cache` needs a Next request context it doesn't have here; the
// caching itself is Next's job, not this module's, so it's passed straight
// through and what gets tested is the logic that sits inside it.
vi.mock("next/cache", () => ({
  unstable_cache: (fn: () => unknown) => fn,
}));

const { BENCHMARK_MIN_SUBMISSIONS, getBenchmarkAverage } = await import("../benchmark");

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
