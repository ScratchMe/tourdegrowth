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
    expect(result.stats).toEqual({ homeViews: 100, profileClicks: 6, rate: 0.06 });

    // Auth header + the exact-path filter (not a substring filter, which
    // "/" would trip on almost every path in this app).
    const [url, init] = fetchMock.mock.calls[0]!;
    expect((init as RequestInit).headers).toMatchObject({ Authorization: "Bearer test-token" });
    const requested = new URL(url as string);
    expect(requested.searchParams.get("path_by_name")).toBe("true");
    expect(requested.searchParams.get("include_paths")).toBe(
      "/,profile_click/footer_cv,profile_click/card_cv,profile_click/card_linkedin,profile_click/sitefooter_cv",
    );
  });

  it("returns rate: null when there are zero homepage views to divide by", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({ total: 0, more: false, hits: [] }));
    const result = await fetchFunnelWindow("2024-01-01T00:00:00Z", "All-time");
    expect(result.stats).toEqual({ homeViews: 0, profileClicks: 0, rate: null });
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
