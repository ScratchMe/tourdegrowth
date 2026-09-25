import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchFunnelStats, fetchFunnelWindow } from "../goatcounter-api";
import { gameEventPaths } from "@/lib/game/events";
import { engineEventPaths } from "../goatcounter";

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
      // REVIEW-03.md A4 — the two return signals. Missing here would
      // mean the dashboard reads them as flat zero, with no error.
      "retake_started",
      "landing_return",
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

  it("counts value actions per result across all four ways a result can produce one", async () => {
    // REVIEW-03.md A4. 8 shares + 6 visitor Tours + 9 deep dives + 3 retakes
    // = 26 value actions over 20 results = 1.3 — above 1 on purpose: one
    // result can be shared twice AND opened by two visitors AND lead to a
    // Deep dive, which is exactly why this is not called a rate.
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({
        total: 0,
        more: false,
        hits: [
          { path: "submission_completed/neutral", count: 14, event: true },
          { path: "submission_completed/roast", count: 6, event: true },
          { path: "share/neutral/native", count: 5, event: true },
          { path: "share/roast/copy", count: 3, event: true },
          { path: "take_own_tour", count: 6, event: true },
          { path: "deep_dive_started", count: 9, event: true },
          { path: "retake_started", count: 3, event: true },
          { path: "landing_return", count: 11, event: true },
        ],
      }),
    );

    const { stats } = await fetchFunnelWindow("2024-01-01T00:00:00Z", "All-time");

    expect(stats?.retakeStarted).toBe(3);
    expect(stats?.landingReturn).toBe(11);
    expect(stats?.valueActionsPerResult).toBeCloseTo(1.3, 10);
  });

  it("returns valueActionsPerResult: null when no result exists to divide by", async () => {
    // A share with no result behind it is a data problem, not a ratio: it
    // must read as "nothing to say yet" rather than dividing by zero.
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({
        total: 0,
        more: false,
        hits: [{ path: "share/neutral/native", count: 2, event: true }],
      }),
    );

    const { stats } = await fetchFunnelWindow("2024-01-01T00:00:00Z", "All-time");

    expect(stats?.submissionsCompleted).toBe(0);
    expect(stats?.valueActionsPerResult).toBeNull();
    expect(stats?.retakeStarted).toBe(0);
    expect(stats?.landingReturn).toBe(0);
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

  it("asks for every game path exactly once, and no path twice overall (X15, G7)", async () => {
    // include_paths matches exact names: a game path missing here is an
    // event GoatCounter counts and /admin/stats never shows (REVIEW.md R-11).
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({ total: 0, more: false, hits: [] }));
    await fetchFunnelWindow("2024-01-01T00:00:00Z", "All-time");
    const requested = new URL(fetchMock.mock.calls[0]![0] as string);
    const paths = requested.searchParams.get("include_paths")!.split(",");

    expect(new Set(paths).size).toBe(paths.length);
    for (const path of gameEventPaths()) expect(paths).toContain(path);
    // G7, spelled out rather than derived: the four entry doors the brief names.
    for (const path of [
      "game_entry_clicked/result/retention",
      "game_entry_clicked/deep_dive/retention",
      "game_entry_clicked/footer",
      "game_entry_clicked/hub",
    ]) {
      expect(paths).toContain(path);
    }
    expect(Number(requested.searchParams.get("limit"))).toBeGreaterThan(paths.length);
    // A GET URL well under the ~8 KB proxies start refusing; the plan budgets 3 KB.
    expect(requested.toString().length).toBeLessThan(3_000);
  });

  it("reads the game block from the same response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({
        total: 0,
        more: false,
        hits: [
          { path: "game_entry_clicked/result/retention", count: 7, event: true },
          { path: "game_entry_clicked/footer", count: 2, event: true },
          { path: "game_started/retention/result", count: 6, event: true },
          { path: "game_started/retention/direct", count: 4, event: true },
          { path: "game_quarter/1", count: 9, event: true },
          { path: "game_quarter/4", count: 3, event: true },
          { path: "game_hangup/2", count: 5, event: true },
          { path: "game_ending/firedDark", count: 2, event: true },
          { path: "game_order/refused", count: 1, event: true },
          { path: "game_voice/angry", count: 4, event: true },
          { path: "game_resume/restart", count: 2, event: true },
          { path: "game_catalogue_open", count: 3, event: true },
          { path: "game_replay", count: 1, event: true },
          { path: "game_share", count: 2, event: true },
          { path: "game_tour_loop", count: 5, event: true },
        ],
      }),
    );

    const game = (await fetchFunnelWindow("2024-01-01T00:00:00Z", "All-time")).stats!.game;

    expect(game.entries).toEqual({ "result/retention": 7, "deep_dive/retention": 0, footer: 2, hub: 0 });
    expect(game.started).toEqual({ direct: 4, result: 6, deep_dive: 0, hub: 0 });
    expect(game.quartersRun).toEqual([9, 0, 0, 3]);
    expect(game.hangups).toEqual([0, 5, 0, 0]);
    expect(game.endings.firedDark).toBe(2);
    expect(game.endings.applause).toBe(0);
    expect(game.orders).toEqual({ obeyed: 0, refused: 1 });
    expect(game.voices.angry).toBe(4);
    expect(game.resume).toEqual({ resume: 0, restart: 2 });
    expect([game.catalogueOpened, game.replays, game.shares]).toEqual([3, 1, 2]);
    expect(game.tourLoops).toBe(5);
  });

  /**
   * Engine spec §11.6 and R-11: the engine's vocabulary reaches the request
   * exactly — spelled out, not derived, so a list that shrank or a path typed
   * differently in the island fails here. Non-vacuity: drop
   * `...engineEventPaths()` from ALL_PATHS and this test fails on the first
   * engine path; the game test above does not move.
   */
  it("asks for every engine path, the exact closed vocabulary", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({ total: 0, more: false, hits: [] }));
    await fetchFunnelWindow("2024-01-01T00:00:00Z", "All-time");
    const requested = new URL(fetchMock.mock.calls[0]![0] as string);
    const paths = requested.searchParams.get("include_paths")!.split(",");
    const expected = [
      "engine_opened",
      "engine_request_copied",
      "engine_deck_opened",
      "engine_tour_linked",
      ...["acquisition", "activation", "retention", "referral", "revenue"].map((s) => `engine_stage_saved/${s}`),
      ...["png", "pdf", "text", "json"].map((f) => `engine_exported/${f}`),
    ];
    expect([...engineEventPaths()].sort()).toEqual([...expected].sort());
    for (const path of expected) expect(paths).toContain(path);
    expect(new Set(paths).size).toBe(paths.length);
    expect(Number(requested.searchParams.get("limit"))).toBeGreaterThan(paths.length);
    expect(requested.toString().length).toBeLessThan(3_000);
  });

  it("reads the engine block from the same response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({
        total: 0,
        more: false,
        hits: [
          { path: "engine_opened", count: 9, event: true },
          { path: "engine_stage_saved/activation", count: 4, event: true },
          { path: "engine_stage_saved/revenue", count: 1, event: true },
          { path: "engine_request_copied", count: 3, event: true },
          { path: "engine_deck_opened", count: 2, event: true },
          { path: "engine_exported/pdf", count: 2, event: true },
          { path: "engine_exported/json", count: 5, event: true },
          { path: "engine_tour_linked", count: 1, event: true },
        ],
      }),
    );
    const engine = (await fetchFunnelWindow("2024-01-01T00:00:00Z", "All-time")).stats!.engine;
    expect(engine).toEqual({
      opened: 9,
      stagesSaved: { acquisition: 0, activation: 4, retention: 0, referral: 0, revenue: 1 },
      requestsCopied: 3,
      deckOpened: 2,
      exported: { png: 0, pdf: 2, text: 0, json: 5 },
      tourLinked: 1,
    });
  });

  it("fetchFunnelStats resolves both an all-time and a last-30-days window", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({ total: 0, more: false, hits: [] }));
    const windows = await fetchFunnelStats();
    expect(windows.map((w) => w.label)).toEqual(["All-time", "Last 30 days"]);
  });
});
