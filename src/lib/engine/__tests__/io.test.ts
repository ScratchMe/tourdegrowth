import { describe, expect, it } from "vitest";
import { engineFileName, parseEngineFile, serializeEngine } from "../io";
import type { EngineState } from "../types";
import { fullState } from "./storage-fixtures";

/**
 * The file is the engine's only durable copy (spec §4.3). What these tests
 * hold: an export reads back to the same state, two exports of the same state
 * are the same bytes, and reading never throws — a newer version is refused,
 * a half-filled file is opened WITH its warnings.
 *
 * Non-vacuity, measured (one test falls each, the other nine pass): dropping
 * the key-sorting replacer fails "two exports … byte-identical"; disabling the
 * newer-version branch fails "a newer schema version is refused…" (the file
 * then reads as `not-engine`); returning `state: null` on validation errors
 * fails "a half-filled file is opened…".
 */

/** The same state with its keys inserted in reverse order, deep. */
function reversedKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(reversedKeys);
  if (typeof value !== "object" || value === null) return value;
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(value).reverse()) out[k] = reversedKeys((value as Record<string, unknown>)[k]);
  return out;
}

describe("serializeEngine / parseEngineFile", () => {
  it("round-trips a filled engine to an equal state with no warnings", () => {
    const state = fullState();
    const parsed = parseEngineFile(serializeEngine(state));
    expect(parsed).toEqual({ state, errors: [] });
  });

  it("two exports of the same state are byte-identical, whatever order its keys were written in", () => {
    const a = fullState();
    const b = reversedKeys(fullState()) as EngineState;
    expect(JSON.stringify(a)).not.toBe(JSON.stringify(b)); // the insertion orders really differ
    expect(serializeEngine(b)).toBe(serializeEngine(a));
  });

  it("keeps arrays in their order: the order of ask bullets is data", () => {
    const state = fullState();
    state.deck.ask.bullets = ["zeta", "alpha"];
    expect(parseEngineFile(serializeEngine(state)).state?.deck.ask.bullets).toEqual(["zeta", "alpha"]);
  });

  it("is indented and ends with a newline, so a folder of monthly files diffs line by line", () => {
    const text = serializeEngine(fullState());
    expect(text.endsWith("}\n")).toBe(true);
    expect(text.split("\n").length).toBeGreaterThan(50);
  });

  it("corrupt or truncated JSON is `unreadable`, never a throw", () => {
    const text = serializeEngine(fullState());
    for (const broken of [text.slice(0, text.length / 2), "", "not json at all"]) {
      const parsed = parseEngineFile(broken);
      expect(parsed.refusal).toBe("unreadable");
      expect(parsed.state).toBeNull();
      expect(parsed.errors).toHaveLength(1);
    }
  });

  it("a newer schema version is refused, not opened with errors", () => {
    const future = { ...JSON.parse(serializeEngine(fullState())), schemaVersion: 2 };
    const parsed = parseEngineFile(JSON.stringify(future));
    expect(parsed).toMatchObject({ state: null, refusal: "unknown-version" });
    // Even when the newer version moved its fields around, it still reads as "newer", not "wrong file".
    const moved = { schemaVersion: 3, id: "x", snapshots: [], somethingNew: {} };
    expect(parseEngineFile(JSON.stringify(moved)).refusal).toBe("unknown-version");
  });

  it("something that isn't an engine — an audit mission, an array, a number — is `not-engine`", () => {
    const mission = { schemaVersion: 1, id: "m-1", header: { company: "ACME" }, passes: [] };
    for (const other of [mission, [], 42, { schemaVersion: 1 }]) {
      expect(parseEngineFile(JSON.stringify(other))).toMatchObject({ state: null, refusal: "not-engine" });
    }
  });

  it("a half-filled file is opened WITH its warnings — the fourteen other numbers aren't lost for one estimate", () => {
    const state = fullState();
    delete (state.snapshots[0]!.metrics["acq.cac"]!.estimate as { basis?: string }).basis;
    const parsed = parseEngineFile(serializeEngine(state));
    expect(parsed.refusal).toBeUndefined();
    expect(parsed.state?.snapshots[0]?.metrics["acq.signup-rate"]).toEqual(fullState().snapshots[0]!.metrics["acq.signup-rate"]);
    expect(parsed.errors).toEqual(["snapshots[0].metrics.acq.cac.estimate.basis: missing or unknown"]);
  });
});

describe("engineFileName", () => {
  const words = { fileName: "tdg-moteur-{month}.json" } as Parameters<typeof engineFileName>[1];

  it("names the file after the flows' month, so monthly saves sort in a folder", () => {
    expect(engineFileName(fullState(), words)).toBe("tdg-moteur-2026-08.json");
  });

  it("never puts arbitrary text in a file name: a malformed month falls back to the creation month", () => {
    const state = fullState();
    state.snapshots[0]!.referenceMonth = "../../etc";
    expect(engineFileName(state, words)).toBe("tdg-moteur-2026-09.json");
  });
});
