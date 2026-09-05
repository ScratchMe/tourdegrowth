import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Answers } from "@/lib/scoring/score";
import {
  clearRefId,
  clearStoredAnswers,
  findOwnerToken,
  isOwnResult,
  loadRefId,
  loadStoredAnswers,
  loadStoredResults,
  rememberResult,
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
    const answers: Answers = { "acquisition-1": 2, "retention-2": 0 };
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

/** REVIEW.md R-01 — the client half of Deep dive ownership. */
describe("created-results store", () => {
  const originalWindow = (globalThis as { window?: unknown }).window;

  beforeEach(() => {
    (globalThis as { window?: unknown }).window = { localStorage: createFakeLocalStorage() };
  });

  afterEach(() => {
    (globalThis as { window?: unknown }).window = originalWindow;
  });

  function result(id: string, token = `token-${id}`) {
    return { id, ownerToken: token, createdAt: "2026-09-05T10:00:00.000Z" };
  }

  it("has nothing before any Tour is completed", () => {
    expect(loadStoredResults()).toEqual([]);
    expect(findOwnerToken("sub_a")).toBeNull();
    expect(isOwnResult("sub_a")).toBe(false);
  });

  it("remembers a created result and returns its owner token", () => {
    rememberResult(result("sub_a"));

    expect(findOwnerToken("sub_a")).toBe("token-sub_a");
    expect(isOwnResult("sub_a")).toBe(true);
  });

  it("treats someone else's shared result as not owned", () => {
    rememberResult(result("sub_mine"));

    expect(isOwnResult("sub_theirs")).toBe(false);
    expect(findOwnerToken("sub_theirs")).toBeNull();
  });

  it("keeps several results, most recent first", () => {
    rememberResult(result("sub_a"));
    rememberResult(result("sub_b"));

    expect(loadStoredResults().map((r) => r.id)).toEqual(["sub_b", "sub_a"]);
    expect(isOwnResult("sub_a")).toBe(true);
    expect(isOwnResult("sub_b")).toBe(true);
  });

  it("replaces rather than duplicates an id recorded twice", () => {
    rememberResult(result("sub_a", "old-token"));
    rememberResult(result("sub_a", "new-token"));

    expect(loadStoredResults()).toHaveLength(1);
    expect(findOwnerToken("sub_a")).toBe("new-token");
  });

  it("caps the list at 20 entries, dropping the oldest", () => {
    for (let i = 0; i < 25; i += 1) rememberResult(result(`sub_${i}`));

    const stored = loadStoredResults();
    expect(stored).toHaveLength(20);
    expect(stored[0]?.id).toBe("sub_24");
    expect(isOwnResult("sub_0")).toBe(false);
    expect(isOwnResult("sub_5")).toBe(true);
  });

  it("ignores corrupted or foreign entries instead of throwing", () => {
    (globalThis as { window: { localStorage: { setItem: (k: string, v: string) => void } } }).window.localStorage.setItem(
      "tdg.results.v1",
      JSON.stringify([{ id: "sub_a" }, "nonsense", null, result("sub_ok")]),
    );

    expect(loadStoredResults().map((r) => r.id)).toEqual(["sub_ok"]);
    expect(isOwnResult("sub_a")).toBe(false);
  });

  it("is a no-op on the server (no window)", () => {
    (globalThis as { window?: unknown }).window = undefined;
    expect(loadStoredResults()).toEqual([]);
    expect(findOwnerToken("sub_a")).toBeNull();
    expect(isOwnResult("sub_a")).toBe(false);
    expect(() => rememberResult(result("sub_a"))).not.toThrow();
  });
});
