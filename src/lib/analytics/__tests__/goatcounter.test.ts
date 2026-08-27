import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { trackEvent } from "../goatcounter";

describe("trackEvent (SPEC.md §8: GoatCounter custom events)", () => {
  const originalWindow = (globalThis as { window?: unknown }).window;

  afterEach(() => {
    (globalThis as { window?: unknown }).window = originalWindow;
  });

  it("is a no-op on the server (no window)", () => {
    (globalThis as { window?: unknown }).window = undefined;
    expect(() => trackEvent("share")).not.toThrow();
  });

  it("is a no-op when the GoatCounter script hasn't loaded (no window.goatcounter)", () => {
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
