import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Answers } from "@/lib/scoring/score";
import {
  clearRefId,
  clearStoredAnswers,
  loadRefId,
  loadStoredAnswers,
  saveRefId,
  saveStoredAnswers,
} from "../storage";

/** A minimal in-memory localStorage fake — no jsdom needed for this. */
function createFakeLocalStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
  };
}

describe("quiz answers storage", () => {
  const originalWindow = (globalThis as { window?: unknown }).window;

  beforeEach(() => {
    (globalThis as { window?: unknown }).window = { localStorage: createFakeLocalStorage() };
  });

  afterEach(() => {
    (globalThis as { window?: unknown }).window = originalWindow;
  });

  it("returns an empty object when nothing has been saved", () => {
    expect(loadStoredAnswers()).toEqual({});
  });

  it("round-trips answers through save/load", () => {
    const answers: Answers = { "acquisition-1": 3, "retention-2": 0 };
    saveStoredAnswers(answers);
    expect(loadStoredAnswers()).toEqual(answers);
  });

  it("clears stored answers", () => {
    saveStoredAnswers({ "acquisition-1": 2 });
    clearStoredAnswers();
    expect(loadStoredAnswers()).toEqual({});
  });

  it("ignores corrupted JSON instead of throwing", () => {
    window.localStorage.setItem("tdg.quiz.answers.v1", "{not json");
    expect(loadStoredAnswers()).toEqual({});
  });

  it("ignores a value that isn't a valid answers map", () => {
    window.localStorage.setItem("tdg.quiz.answers.v1", JSON.stringify({ "acquisition-1": 7 }));
    expect(loadStoredAnswers()).toEqual({});
  });

  it("is a no-op on the server (no window)", () => {
    (globalThis as { window?: unknown }).window = undefined;
    expect(loadStoredAnswers()).toEqual({});
    expect(() => saveStoredAnswers({ "acquisition-1": 1 })).not.toThrow();
    expect(() => clearStoredAnswers()).not.toThrow();
  });
});

describe("ref id storage (SPEC.md §7 attribution)", () => {
  const originalWindow = (globalThis as { window?: unknown }).window;

  beforeEach(() => {
    (globalThis as { window?: unknown }).window = { localStorage: createFakeLocalStorage() };
  });

  afterEach(() => {
    (globalThis as { window?: unknown }).window = originalWindow;
  });

  it("returns null when nothing has been saved", () => {
    expect(loadRefId()).toBeNull();
  });

  it("round-trips a ref id through save/load", () => {
    saveRefId("sub_abc123");
    expect(loadRefId()).toBe("sub_abc123");
  });

  it("clears the ref id", () => {
    saveRefId("sub_abc123");
    clearRefId();
    expect(loadRefId()).toBeNull();
  });

  it("is a no-op on the server (no window)", () => {
    (globalThis as { window?: unknown }).window = undefined;
    expect(loadRefId()).toBeNull();
    expect(() => saveRefId("sub_abc123")).not.toThrow();
    expect(() => clearRefId()).not.toThrow();
  });
});
