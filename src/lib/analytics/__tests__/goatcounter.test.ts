import { afterEach, describe, expect, it, vi } from "vitest";
import { ENGINE_SETUP_DETAILS, engineSetupDetail, resetPendingEventsForTests, trackEvent } from "../goatcounter";

describe("trackEvent (SPEC.md §8: GoatCounter custom events)", () => {
  const originalWindow = (globalThis as { window?: unknown }).window;

  afterEach(() => {
    resetPendingEventsForTests();
    vi.useRealTimers();
    (globalThis as { window?: unknown }).window = originalWindow;
  });

  it("is a no-op on the server (no window)", () => {
    (globalThis as { window?: unknown }).window = undefined;
    expect(() => trackEvent("share")).not.toThrow();
  });

  it("does not throw when the GoatCounter script hasn't loaded (no window.goatcounter)", () => {
    (globalThis as { window?: unknown }).window = {};
    expect(() => trackEvent("share")).not.toThrow();
  });

  it("calls window.goatcounter.count with the event name as path", () => {
    const count = vi.fn();
    (globalThis as { window?: unknown }).window = { goatcounter: { count } };
    trackEvent("submission_completed");
    expect(count).toHaveBeenCalledWith({ path: "submission_completed", event: true });
  });

  it("appends the detail after the event name (e.g. tone breakdown)", () => {
    const count = vi.fn();
    (globalThis as { window?: unknown }).window = { goatcounter: { count } };
    trackEvent("share", "roast");
    expect(count).toHaveBeenCalledWith({ path: "share/roast", event: true });
  });

  it("swallows an error thrown by window.goatcounter.count", () => {
    const count = vi.fn(() => {
      throw new Error("boom");
    });
    (globalThis as { window?: unknown }).window = { goatcounter: { count } };
    expect(() => trackEvent("share")).not.toThrow();
  });
});

/**
 * REVIEW-03.md A4. Every event before `landing_return` was fired from a
 * click, long after `strategy="afterInteractive"` had loaded `count.js`.
 * One fired at mount races that load — and the optional chaining made
 * losing that race completely silent, so the count would simply have run
 * low with nothing anywhere to show for it.
 */
describe("trackEvent — events fired before the script has loaded", () => {
  const originalWindow = (globalThis as { window?: unknown }).window;

  afterEach(() => {
    resetPendingEventsForTests();
    vi.useRealTimers();
    (globalThis as { window?: unknown }).window = originalWindow;
  });

  it("delivers an event fired before the script arrived, in order, once it does", () => {
    vi.useFakeTimers();
    const win: { goatcounter?: { count: ReturnType<typeof vi.fn> } } = {};
    (globalThis as { window?: unknown }).window = win;

    trackEvent("landing_return");
    trackEvent("share", "roast");

    const count = vi.fn();
    win.goatcounter = { count };
    // Nothing yet: the poller has not ticked.
    expect(count).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200);

    expect(count.mock.calls.map((c) => (c[0] as { path: string }).path)).toEqual([
      "landing_return",
      "share/roast",
    ]);
  });

  // Non-vacuity, measured rather than assumed: removing the queue fails the
  // first test below and the e2e "return and retake" spec. The give-up test
  // asserts an absence, so it passes either way — a companion assertion,
  // not a guarantee on its own.
  it("gives up rather than holding a queue forever when the script never loads", () => {
    vi.useFakeTimers();
    (globalThis as { window?: unknown }).window = {};

    trackEvent("landing_return");
    vi.advanceTimersByTime(11_000);

    // The script shows up long after the budget is spent (an ad blocker
    // that was removed, a very late load): the stale event stays dropped.
    const count = vi.fn();
    (globalThis as { window?: unknown }).window = { goatcounter: { count } };
    vi.advanceTimersByTime(1_000);
    expect(count).not.toHaveBeenCalled();
  });

  it("an event fired after the script arrived, before the poller ticked, does not overtake the queue", () => {
    vi.useFakeTimers();
    const win: { goatcounter?: { count: ReturnType<typeof vi.fn> } } = {};
    (globalThis as { window?: unknown }).window = win;

    // A mount event, fired before count.js loaded…
    trackEvent("game_started", "retention/direct");
    const count = vi.fn();
    win.goatcounter = { count };
    // …then a click, inside the poller's 150 ms gap.
    trackEvent("game_hangup", "1");

    // Nothing waits for the tick: both go out now, in the order they happened.
    expect(count.mock.calls.map((c) => (c[0] as { path: string }).path)).toEqual([
      "game_started/retention/direct",
      "game_hangup/1",
    ]);
    vi.advanceTimersByTime(200);
    expect(count).toHaveBeenCalledTimes(2);
  });

  // Non-vacuity: without the flush at the top of trackEvent, the test above
  // fails and this one still passes — a companion that pins the other branch
  // (script still missing), not a guarantee on its own.
  it("an event fired while the script is still missing joins the queue behind the earlier ones", () => {
    vi.useFakeTimers();
    const win: { goatcounter?: { count: ReturnType<typeof vi.fn> } } = {};
    (globalThis as { window?: unknown }).window = win;

    trackEvent("a");
    trackEvent("b");
    const count = vi.fn();
    win.goatcounter = { count };
    vi.advanceTimersByTime(200);
    expect(count.mock.calls.map((c) => (c[0] as { path: string }).path)).toEqual(["a", "b"]);
  });

  it("still delivers immediately when the script is already there", () => {
    vi.useFakeTimers();
    const count = vi.fn();
    (globalThis as { window?: unknown }).window = { goatcounter: { count } };

    trackEvent("quiz_started");

    expect(count).toHaveBeenCalledWith({ path: "quiz_started", event: true });
  });
});

/**
 * `engine_setup/<detail>` (engine spec §11.6, A22 APP-7): the motions an engine is set up with, and `app` for a consumer
 * app, whose motions are not a choice. The type decides before the boxes do.
 *
 * Non-vacuity, measured on 2026-10-07 (each sabotage alone, then put back; the count is the tests that fall): reading
 * the boxes alone (an app is self-serve, so `plg`) falls 2 here; `app` left out of `ENGINE_SETUP_DETAILS` falls 3, this
 * file's second test, the paths test of `goatcounter-api.test.ts` and the closed-vocabulary rule of
 * `engine-boundary.test.ts` among them.
 */
describe("engineSetupDetail (engine spec §11.6, §21.6.2)", () => {
  const both = { plg: true, slg: true };
  it("is `app` for a consumer app, whatever its boxes say, and the motions for a SaaS", () => {
    expect(engineSetupDetail({ type: "consumer-app", motions: { plg: true, slg: false } })).toBe("app");
    expect(engineSetupDetail({ type: "consumer-app", motions: both })).toBe("app");
    expect(engineSetupDetail({ type: "b2b-saas", motions: { plg: true, slg: false } })).toBe("plg");
    expect(engineSetupDetail({ type: "b2b-saas", motions: { plg: false, slg: true } })).toBe("slg");
    expect(engineSetupDetail({ type: "b2b-saas", motions: both })).toBe("hybrid");
  });

  it("every detail it can answer is in the closed list the dashboard asks GoatCounter for", () => {
    const answers = [
      engineSetupDetail({ type: "consumer-app", motions: both }),
      engineSetupDetail({ type: "b2b-saas", motions: { plg: true, slg: false } }),
      engineSetupDetail({ type: "b2b-saas", motions: { plg: false, slg: true } }),
      engineSetupDetail({ type: "b2b-saas", motions: both }),
    ];
    for (const answer of answers) expect(ENGINE_SETUP_DETAILS).toContain(answer);
    expect(new Set(answers).size).toBe(ENGINE_SETUP_DETAILS.length);
  });
});
