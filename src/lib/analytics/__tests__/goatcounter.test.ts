import { afterEach, describe, expect, it, vi } from "vitest";
import { resetPendingEventsForTests, trackEvent } from "../goatcounter";

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

  it("still delivers immediately when the script is already there", () => {
    vi.useFakeTimers();
    const count = vi.fn();
    (globalThis as { window?: unknown }).window = { goatcounter: { count } };

    trackEvent("quiz_started");

    expect(count).toHaveBeenCalledWith({ path: "quiz_started", event: true });
  });
});
