import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Answers } from "@/lib/scoring/score";
import {
  clearDeepDiveProgress,
  clearRefId,
  clearStoredAnswers,
  findOwnerToken,
  isOwnResult,
  loadDeepDiveProgress,
  loadRefId,
  loadStoredAnswers,
  loadStoredResults,
  rememberResult,
  saveDeepDiveProgress,
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

  // REVIEW.md R-03 — first-touch attribution.
  it("keeps the first ref seen and ignores a later one", () => {
    saveRefId("sub_first");
    saveRefId("sub_second");
    expect(loadRefId()).toBe("sub_first");
  });

  it("accepts a new ref once the previous one has been spent", () => {
    saveRefId("sub_first");
    clearRefId();
    saveRefId("sub_second");
    expect(loadRefId()).toBe("sub_second");
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

/** REVIEW.md R-20 — the Deep dive stopped being throwaway once it grew to 11 screens. */
describe("deep dive progress storage", () => {
  const originalWindow = (globalThis as { window?: unknown }).window;

  beforeEach(() => {
    (globalThis as { window?: unknown }).window = { localStorage: createFakeLocalStorage() };
  });

  afterEach(() => {
    (globalThis as { window?: unknown }).window = originalWindow;
  });

  it("round-trips answers and free context for the submission it was saved under", () => {
    saveDeepDiveProgress({ submissionId: "sub-1", answers: { q1: 2 }, freeContext: "we sell to accountants" });
    expect(loadDeepDiveProgress("sub-1")).toEqual({
      submissionId: "sub-1",
      answers: { q1: 2 },
      freeContext: "we sell to accountants",
    });
  });

  it("never leaks one result's progress into another's", () => {
    saveDeepDiveProgress({ submissionId: "sub-1", answers: { q1: 2 }, freeContext: "x" });
    expect(loadDeepDiveProgress("sub-2")).toBeNull();
  });

  it("keeps only the latest Deep dive — a newer one replaces the old", () => {
    saveDeepDiveProgress({ submissionId: "sub-1", answers: { q1: 0 }, freeContext: "" });
    saveDeepDiveProgress({ submissionId: "sub-2", answers: { q1: 1 }, freeContext: "" });
    expect(loadDeepDiveProgress("sub-1")).toBeNull();
    expect(loadDeepDiveProgress("sub-2")?.answers).toEqual({ q1: 1 });
  });

  it("clears completely — the free text does not outlive the request it was written for", () => {
    saveDeepDiveProgress({ submissionId: "sub-1", answers: { q1: 2 }, freeContext: "our churn is brutal" });
    clearDeepDiveProgress();
    expect(loadDeepDiveProgress("sub-1")).toBeNull();
  });

  it("ignores a malformed entry rather than restoring garbage into the flow", () => {
    (globalThis as { window: { localStorage: { setItem: (k: string, v: string) => void } } }).window.localStorage.setItem(
      "tdg.deepDive.v1",
      JSON.stringify({ submissionId: "sub-1", answers: { q1: "two" }, freeContext: "" }),
    );
    expect(loadDeepDiveProgress("sub-1")).toBeNull();
  });

  it("no-ops on the server, where there is no window", () => {
    (globalThis as { window?: unknown }).window = undefined;
    expect(() => saveDeepDiveProgress({ submissionId: "s", answers: {}, freeContext: "" })).not.toThrow();
    expect(loadDeepDiveProgress("s")).toBeNull();
  });
});

/** REVIEW.md R-20 — the landing reads the most recent entry back. */
describe("stored results: the score kept for the landing", () => {
  const originalWindow = (globalThis as { window?: unknown }).window;

  beforeEach(() => {
    (globalThis as { window?: unknown }).window = { localStorage: createFakeLocalStorage() };
  });

  afterEach(() => {
    (globalThis as { window?: unknown }).window = originalWindow;
  });

  it("keeps the score alongside the token, most recent first", () => {
    rememberResult({ id: "a", ownerToken: "t1", createdAt: "2026-01-01T00:00:00Z", total: 61 });
    rememberResult({ id: "b", ownerToken: "t2", createdAt: "2026-01-02T00:00:00Z", total: 74 });
    expect(loadStoredResults()[0]).toMatchObject({ id: "b", total: 74 });
  });

  it("still accepts an entry written before R-20, with no score at all", () => {
    rememberResult({ id: "a", ownerToken: "t1", createdAt: "2026-01-01T00:00:00Z" });
    const [entry] = loadStoredResults();
    expect(entry?.id).toBe("a");
    expect(entry?.total).toBeUndefined();
  });

  it("drops an entry whose score is not a real number", () => {
    (globalThis as { window: { localStorage: { setItem: (k: string, v: string) => void } } }).window.localStorage.setItem(
      "tdg.results.v1",
      JSON.stringify([{ id: "a", ownerToken: "t", createdAt: "2026-01-01T00:00:00Z", total: "74" }]),
    );
    expect(loadStoredResults()).toEqual([]);
  });
});
