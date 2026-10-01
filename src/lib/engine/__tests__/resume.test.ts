import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { engineResume } from "../resume";
import { saveEngine } from "../storage";
import { ENGINE_INDEX_KEY } from "../types";
import { exampleState, hybridState } from "./fixtures";

/**
 * The landing's way back (engine spec §19.10, A14 T6): the engine on screen,
 * its month and its found numbers out of its own — read only, never a value.
 */
const g = globalThis as { window?: unknown };

describe("engineResume", () => {
  const original = g.window;
  let map: Map<string, string>;
  beforeEach(() => {
    map = new Map();
    g.window = {
      localStorage: {
        getItem: (k: string) => map.get(k) ?? null,
        setItem: (k: string, v: string) => void map.set(k, v),
        removeItem: (k: string) => void map.delete(k),
        key: (i: number) => [...map.keys()][i] ?? null,
        get length() {
          return map.size;
        },
      },
    };
  });
  afterEach(() => {
    g.window = original;
  });

  it("nothing on the device, or nothing readable: no line", () => {
    expect(engineResume("fr")).toBeNull();
    map.set(ENGINE_INDEX_KEY, "{");
    expect(engineResume("fr")).toBeNull();
  });

  it("an engine whose shape reads but whose content cannot be counted: no line, never a throw", () => {
    const broken = { ...exampleState(), setup: { ...exampleState().setup, motions: { plg: false, slg: false } } };
    saveEngine(broken);
    expect(() => engineResume("fr")).not.toThrow();
    expect(engineResume("fr")).toBeNull();
    const badMonth = exampleState();
    badMonth.snapshots[0]!.referenceMonth = "août" as never;
    saveEngine(badMonth);
    expect(engineResume("fr")).toBeNull();
  });

  it("the month being filled and the found numbers of the ticked motions, the link left out", () => {
    saveEngine(exampleState());
    expect(engineResume("fr")).toEqual({ month: "août 2026", found: 11, total: 17 });
    expect(engineResume("en")).toEqual({ month: "August 2026", found: 11, total: 17 });
    saveEngine(hybridState());
    const hybrid = engineResume("en")!;
    expect(hybrid.total).toBe(32);
    // Read only: the device holds exactly what it held.
    const before = new Map(map);
    engineResume("en");
    expect(map).toEqual(before);
  });
});
