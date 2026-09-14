import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Mission } from "../schema";
import { deleteMission, hasUnexportedChanges, loadDraftMeta, loadMissions, markExported, saveMission } from "../storage";
import { mission } from "./fixtures";

/**
 * The rule this file exists for, and the one that separates the audit
 * instrument from the quiz: a failed write is RETURNED, never swallowed.
 * Losing a quiz answer costs three minutes; losing a mission's entry costs
 * hours of interviews and chasing. The screen has to be able to say so.
 *
 * Same in-memory `window` fake as `quiz/__tests__/storage.test.ts` — no jsdom.
 */
function createFakeLocalStorage(onSet?: (key: string, value: string) => void) {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      onSet?.(key, value);
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
  };
}

describe("audit mission storage", () => {
  const originalWindow = (globalThis as { window?: unknown }).window;

  beforeEach(() => {
    (globalThis as { window?: unknown }).window = { localStorage: createFakeLocalStorage() };
  });

  afterEach(() => {
    (globalThis as { window?: unknown }).window = originalWindow;
  });

  it("returns nothing on a device that has never held a mission", () => {
    expect(loadMissions()).toEqual([]);
    expect(loadDraftMeta()).toEqual([]);
  });

  it("round-trips a mission, and a second save of the same id replaces it rather than appending", () => {
    const m = mission();
    expect(saveMission(m)).toEqual({ ok: true });
    expect(loadMissions().map((x) => x.id)).toEqual([m.id]);

    const renamed: Mission = { ...m, header: { ...m.header, company: "Autre SAS" } };
    expect(saveMission(renamed)).toEqual({ ok: true });
    const stored = loadMissions();
    expect(stored).toHaveLength(1);
    expect(stored[0]!.header.company).toBe("Autre SAS");
  });

  it("keeps several missions side by side and deletes only the one named", () => {
    saveMission(mission());
    saveMission({ ...mission(), id: "mission-2" });
    expect(loadMissions().map((m) => m.id).sort()).toEqual(["mission-1", "mission-2"]);

    expect(deleteMission("mission-1")).toEqual({ ok: true });
    expect(loadMissions().map((m) => m.id)).toEqual(["mission-2"]);
  });

  it("records the export date per mission, replacing the previous one", () => {
    markExported("mission-1", "2026-09-14T09:00:00.000Z");
    markExported("mission-1", "2026-09-14T18:00:00.000Z");
    markExported("mission-2", "2026-09-13T08:00:00.000Z");
    expect(loadDraftMeta().sort((a, b) => a.missionId.localeCompare(b.missionId))).toEqual([
      { missionId: "mission-1", lastExportedAt: "2026-09-14T18:00:00.000Z" },
      { missionId: "mission-2", lastExportedAt: "2026-09-13T08:00:00.000Z" },
    ]);
  });

  /**
   * The two dates share one entry, so neither write may clobber the other.
   * If it did, the "unexported changes" warning would switch itself on or
   * off — and a warning you cannot justify is worse than none.
   */
  it("keeps both dates: saving after an export does not erase the export date, and the reverse", () => {
    markExported("mission-1", "2026-09-14T09:00:00.000Z");
    saveMission(mission(), "2026-09-14T10:00:00.000Z");
    expect(loadDraftMeta()[0]).toEqual({
      missionId: "mission-1",
      lastExportedAt: "2026-09-14T09:00:00.000Z",
      lastSavedAt: "2026-09-14T10:00:00.000Z",
    });

    markExported("mission-1", "2026-09-14T11:00:00.000Z");
    expect(loadDraftMeta()[0]).toEqual({
      missionId: "mission-1",
      lastExportedAt: "2026-09-14T11:00:00.000Z",
      lastSavedAt: "2026-09-14T10:00:00.000Z",
    });
  });

  it("warns about unexported work — never exported is the dangerous case, not an exception", () => {
    expect(hasUnexportedChanges(undefined)).toBe(false);
    expect(hasUnexportedChanges({ missionId: "m", lastExportedAt: null })).toBe(false);
    expect(hasUnexportedChanges({ missionId: "m", lastExportedAt: null, lastSavedAt: "2026-09-14T10:00:00.000Z" })).toBe(true);
    expect(
      hasUnexportedChanges({ missionId: "m", lastExportedAt: "2026-09-14T11:00:00.000Z", lastSavedAt: "2026-09-14T10:00:00.000Z" }),
    ).toBe(false);
    expect(
      hasUnexportedChanges({ missionId: "m", lastExportedAt: "2026-09-14T10:00:00.000Z", lastSavedAt: "2026-09-14T11:00:00.000Z" }),
    ).toBe(true);
  });

  /**
   * The difference from the quiz, stated as a test rather than a comment: a
   * full quota must reach the screen. The message names the way out —
   * exporting the file — because that is the only thing that makes room.
   */
  it("reports a full quota instead of swallowing it, and names exporting as the way out", () => {
    (globalThis as { window?: unknown }).window = {
      localStorage: createFakeLocalStorage(() => {
        throw new DOMException("full", "QuotaExceededError");
      }),
    };
    const result = saveMission(mission());
    expect(result.ok).toBe(false);
    expect(result).toMatchObject({ reason: "quota" });
    if (!result.ok) expect(result.message).toMatch(/export/i);
  });

  it("reports an unavailable store rather than throwing on a server or a locked-down browser", () => {
    (globalThis as { window?: unknown }).window = undefined;
    expect(loadMissions()).toEqual([]);
    expect(saveMission(mission())).toMatchObject({ ok: false, reason: "unavailable" });

    (globalThis as { window?: unknown }).window = {
      get localStorage(): never {
        throw new Error("blocked");
      },
    };
    expect(loadMissions()).toEqual([]);
    expect(deleteMission("mission-1")).toMatchObject({ ok: false, reason: "unavailable" });
  });

  it("ignores entries that are not missions instead of losing the ones that are", () => {
    const store = createFakeLocalStorage();
    store.setItem("tdg.audit.v1", JSON.stringify([{ nope: true }, "string", null]));
    (globalThis as { window?: unknown }).window = { localStorage: store };
    expect(loadMissions()).toEqual([]);

    saveMission(mission());
    expect(loadMissions().map((m) => m.id)).toEqual(["mission-1"]);
  });

  it("survives a corrupted key rather than blanking the screen", () => {
    const store = createFakeLocalStorage();
    store.setItem("tdg.audit.v1", "{not json");
    store.setItem("tdg.audit.exports.v1", "{not json");
    (globalThis as { window?: unknown }).window = { localStorage: store };
    expect(loadMissions()).toEqual([]);
    expect(loadDraftMeta()).toEqual([]);
  });
});
