import { describe, expect, it } from "vitest";
import { purgeMission } from "../purge";
import type { Mission } from "../schema";
import { fileNameFor, parseMissionFile, serializeMission } from "../io";
import { validateMission } from "../validate";
import { mission } from "./fixtures";

/**
 * The mission file is the only durable copy of a mission (AUDIT.md §5), so
 * three things have to hold: it reads back identical, it reads back the SAME
 * BYTES for the same mission (or a Git diff of a versioned mission is noise),
 * and reading one never throws — a truncated or foreign file has to become a
 * message on screen, not a blank page.
 */
describe("serializeMission", () => {
  it("round-trips a mission exactly", () => {
    const m = mission();
    expect(JSON.parse(serializeMission(m))).toEqual(JSON.parse(JSON.stringify(m)));
  });

  it("is byte-stable regardless of the order the properties were built in", () => {
    const m = mission();
    const shuffled = { passes: m.passes, header: m.header, id: m.id, createdAt: m.createdAt, catalog: m.catalog, definitions: m.definitions, schemaVersion: m.schemaVersion } as Mission;
    expect(serializeMission(shuffled)).toBe(serializeMission(m));
  });

  it("keeps arrays in their own order — that order is data, not formatting", () => {
    const m = mission();
    const rows = JSON.parse(serializeMission(m)).catalog.rows as { id: string }[];
    expect(rows.map((r) => r.id)).toEqual(m.catalog.rows.map((r) => r.id));
  });

  it("is indented and newline-terminated, so a diff of it is readable", () => {
    const text = serializeMission(mission());
    expect(text).toMatch(/\n {2}"createdAt"/);
    expect(text.endsWith("\n")).toBe(true);
  });
});

describe("fileNameFor", () => {
  it("names the company and the date, accents flattened", () => {
    const m: Mission = { ...mission(), header: { ...mission().header, company: "Éditions Fabre & Cie" } };
    expect(fileNameFor(m)).toBe("diagnostic-growth-editions-fabre-cie-2026-09-13.json");
  });

  /** The suffix is what stops the full file going out when the purged copy was meant. */
  it("marks a purged copy, which has no company left to name", () => {
    expect(fileNameFor(purgeMission(mission()))).toBe("diagnostic-growth-sans-nom-2026-09-13-purge.json");
  });

  it("says « diagnostic », never « audit » — AUDIT.md §2, there is no mandate", () => {
    expect(fileNameFor(mission())).toMatch(/^diagnostic-growth-/);
  });
});

describe("parseMissionFile", () => {
  it("reads back what serializeMission wrote", () => {
    const m = mission();
    const result = parseMissionFile(serializeMission(m));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.mission.id).toBe(m.id);
  });

  it("refuses a file whose shape is not a mission, without throwing", () => {
    for (const text of ["{not json", "[]", '{"hello":"world"}', '{"id":"m","passes":[]}', "null"]) {
      const result = parseMissionFile(text);
      expect(result.ok, text).toBe(false);
      if (!result.ok) expect(result.mission, text).toBeNull();
    }
  });

  /**
   * The case the import screen exists for (AUDIT-PLAN.md §3.3, decision 2):
   * a half-entered mission moved between two devices is shaped like a
   * mission and fails the validator. Refusing to open it would lose the rest
   * of the entry, so it comes back WITH its errors.
   */
  it("accepts a well-shaped file the validator rejects, and hands back both the mission and the errors", () => {
    const m = mission();
    const broken = { ...m, header: { ...m.header, mandate: "pas-un-mandat" } } as unknown as Mission;
    expect(validateMission(broken).ok).toBe(false);

    const result = parseMissionFile(serializeMission(broken));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.mission).not.toBeNull();
      expect(result.mission!.header.company).toBe("Acme Analytics");
      expect(result.errors.length).toBeGreaterThan(0);
    }
  });

  /**
   * A file from a FUTURE schema version is refused at the shape gate, not
   * opened with errors (AUDIT-PLAN.md §3.3, decision 2): we cannot read it,
   * so offering to work on it would mean working on a mission we are
   * misinterpreting. Tolerance is for our own half-finished drafts.
   */
  it("refuses a file from a schema version it cannot read, rather than opening it with errors", () => {
    const future = { ...mission(), schemaVersion: 99 } as unknown as Mission;
    const result = parseMissionFile(serializeMission(future));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.mission).toBeNull();
  });

  it("reads a purged file — the validator relaxes exactly two rules for one, and the company is gone", () => {
    const result = parseMissionFile(serializeMission(purgeMission(mission())));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.mission.purged).toBe(true);
      expect(result.mission.header.company).toBe("");
    }
  });
});
