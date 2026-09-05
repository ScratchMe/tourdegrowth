import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchFunnelStats, fetchFunnelWindow } from "../goatcounter-api";

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => body,
  } as Response;
}

describe("fetchFunnelWindow (GoatCounter API — /admin/stats funnel section)", () => {
  const originalToken = process.env.GOATCOUNTER_API_TOKEN;
  const originalCode = process.env.NEXT_PUBLIC_GOATCOUNTER_CODE;

  beforeEach(() => {
    process.env.GOATCOUNTER_API_TOKEN = "test-token";
    process.env.NEXT_PUBLIC_GOATCOUNTER_CODE = "tourdegrowth";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalToken === undefined) delete process.env.GOATCOUNTER_API_TOKEN;
    else process.env.GOATCOUNTER_API_TOKEN = originalToken;
    if (originalCode === undefined) delete process.env.NEXT_PUBLIC_GOATCOUNTER_CODE;
    else process.env.NEXT_PUBLIC_GOATCOUNTER_CODE = originalCode;
  });

  it("returns an error (not a throw) when the API token isn't configured", async () => {
    delete process.env.GOATCOUNTER_API_TOKEN;
    const result = await fetchFunnelWindow("2024-01-01T00:00:00Z", "All-time");
    expect(result.stats).toBeNull();
    expect(result.error).toMatch(/not configured/);
  });

  it("returns an error when the site code isn't configured", async () => {
    delete process.env.NEXT_PUBLIC_GOATCOUNTER_CODE;
    const result = await fetchFunnelWindow("2024-01-01T00:00:00Z", "All-time");
    expect(result.stats).toBeNull();
    expect(result.error).toMatch(/not configured/);
  });

  it("sums homepage views and profile_click events from the hits response", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({
        total: 3,
        more: false,
        hits: [
          { path: "/", count: 100, event: false },
          { path: "profile_click/footer_cv", count: 4, event: true },
          { path: "profile_click/card_cv", count: 2, event: true },
        ],
      }),
    );

    const result = await fetchFunnelWindow("2024-01-01T00:00:00Z", "All-time");

    expect(result.error).toBeUndefined();
    expect(result.stats?.homeViews).toBe(100);
    expect(result.stats?.profileClicks).toBe(6);
    expect(result.stats?.rate).toBe(0.06);

    // Auth header + the exact-path filter (not a substring filter, which
    // "/" would trip on almost every path in this app).
    const [url, init] = fetchMock.mock.calls[0]!;
    expect((init as RequestInit).headers).toMatchObject({ Authorization: "Bearer test-token" });
    const requested = new URL(url as string);
    expect(requested.searchParams.get("path_by_name")).toBe("true");

    // Every instrumented event name must be asked for by exact path — one
    // missing here is a click the dashboard silently under-counts.
    const requestedPaths = requested.searchParams.get("include_paths")!.split(",");
    for (const path of [
      "/",
      "quiz_started",
      "quiz_stage_completed/1",
      "quiz_stage_completed/5",
      "tone_selected/neutral",
      "tone_selected/roast",
      "submission_completed/neutral",
      "submission_completed/roast",
      "share/neutral/native",
      "share/roast/copy",
      "deep_dive_started",
      "deep_dive_completed/with_context",
      "deep_dive_completed/no_context",
      "profile_click/footer_cv",
      "profile_click/sitefooter_cv",
    ]) {
      expect(requestedPaths).toContain(path);
    }

    // REVIEW.md R-11: the limit was hard-coded to 10 back when 4 paths were
    // requested — below the path count it silently truncates the response.
    expect(Number(requested.searchParams.get("limit"))).toBeGreaterThan(requestedPaths.length);
  });

  it("counts every funnel step, not just the two ends", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({
        total: 0,
        more: false,
        hits: [
          { path: "/", count: 200, event: false },
          { path: "quiz_started", count: 80, event: true },
          { path: "quiz_stage_completed/1", count: 70, event: true },
          { path: "quiz_stage_completed/5", count: 40, event: true },
          { path: "tone_selected/neutral", count: 30, event: true },
          { path: "tone_selected/roast", count: 8, event: true },
          { path: "submission_completed/neutral", count: 30, event: true },
          { path: "submission_completed/roast", count: 8, event: true },
          { path: "share/neutral/native", count: 5, event: true },
          { path: "share/roast/copy", count: 3, event: true },
          { path: "deep_dive_started", count: 9, event: true },
          { path: "deep_dive_completed/with_context", count: 4, event: true },
          { path: "deep_dive_completed/no_context", count: 2, event: true },
        ],
      }),
    );

    const { stats } = await fetchFunnelWindow("2024-01-01T00:00:00Z", "All-time");

    expect(stats?.quizStarted).toBe(80);
    expect(stats?.stagesCompleted).toEqual([70, 0, 0, 0, 40]);
    expect(stats?.toneSelected).toBe(38);
    expect(stats?.submissionsCompleted).toBe(38);
    expect(stats?.shares).toBe(8);
    expect(stats?.deepDiveStarted).toBe(9);
    expect(stats?.deepDiveCompleted).toBe(6);
  });

  it("returns rate: null when there are zero homepage views to divide by", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({ total: 0, more: false, hits: [] }));
    const result = await fetchFunnelWindow("2024-01-01T00:00:00Z", "All-time");
    expect(result.stats?.rate).toBeNull();
    expect(result.stats?.homeViews).toBe(0);
    expect(result.stats?.quizStarted).toBe(0);
  });

  it("surfaces a non-2xx response as an error, not a throw", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({}, false, 401));
    const result = await fetchFunnelWindow("2024-01-01T00:00:00Z", "All-time");
    expect(result.stats).toBeNull();
    expect(result.error).toMatch(/401/);
  });

  it("swallows a network error as an error, not a throw", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network down"));
    const result = await fetchFunnelWindow("2024-01-01T00:00:00Z", "All-time");
    expect(result.stats).toBeNull();
    expect(result.error).toMatch(/network down/);
  });

  it("fetchFunnelStats resolves both an all-time and a last-30-days window", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({ total: 0, more: false, hits: [] }));
    const windows = await fetchFunnelStats();
    expect(windows.map((w) => w.label)).toEqual(["All-time", "Last 30 days"]);
  });
});
