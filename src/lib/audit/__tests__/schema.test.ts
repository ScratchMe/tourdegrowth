import { describe, expect, it } from "vitest";
import { AUDIT_CATALOG, AUDIT_CATALOG_VERSION } from "@/content/audit-catalog";
import {
  DEFAULT_ABSENT_CAUSE,
  applicableRows,
  confidenceOf,
  latestObservation,
  newMission,
  newPass,
  normalizeEntry,
  parseDefinitionRef,
  registerDefinition,
} from "../schema";
import { definition, entry, header, mission, observation } from "./fixtures";

describe("newMission — the catalog is embedded, not referenced", () => {
  it("copies the current catalog with its version into the mission", () => {
    const m = newMission({ id: "m", createdAt: "2026-09-13T00:00:00.000Z", header: header() });
    expect(m.catalog.version).toBe(AUDIT_CATALOG_VERSION);
    expect(m.catalog.rows).toHaveLength(AUDIT_CATALOG.length);
    expect(m.catalog.rows.map((r) => r.id)).toEqual(AUDIT_CATALOG.map((r) => r.id));
  });

  it("mutating the embedded copy never touches the live catalog", () => {
    const m = newMission({ id: "m", createdAt: "2026-09-13T00:00:00.000Z", header: header() });
    m.catalog.rows[0]!.name = "changed";
    (m.catalog.rows[0]!.appliesTo as string[]).push("b2c");
    expect(AUDIT_CATALOG[0]!.name).not.toBe("changed");
    expect(AUDIT_CATALOG[0]!.appliesTo).not.toContain("b2c-after-mutation");
    expect(AUDIT_CATALOG[0]!.appliesTo.length).toBeLessThan(m.catalog.rows[0]!.appliesTo.length);
  });

  it("starts with no passes and no definitions", () => {
    const m = newMission({ id: "m", createdAt: "2026-09-13T00:00:00.000Z", header: header() });
    expect(m.passes).toEqual([]);
    expect(m.definitions).toEqual({});
  });
});

describe("newPass — nothing is defaulted for the auditor", () => {
  it("seeds an entry ONLY for rows outside the profile, with a reason taken from the catalog", () => {
    const m = mission("b2c");
    const p = newPass(m, { id: "p", date: "2026-09-13" });
    const applicable = new Set(applicableRows(m.catalog, "b2c").map((r) => r.id));
    expect(p.entries.length).toBe(m.catalog.rows.length - applicable.size);
    for (const e of p.entries) {
      expect(applicable.has(e.metricId)).toBe(false);
      expect(e.status).toBe("not-applicable");
      expect(e.notApplicableReason).toMatch(/Hors profil « b2c »/);
    }
  });

  it("leaves every applicable row WITHOUT an entry — a status is never defaulted", () => {
    const m = mission("b2b-assiste");
    const p = newPass(m, { id: "p", date: "2026-09-13" });
    const seeded = new Set(p.entries.map((e) => e.metricId));
    for (const row of applicableRows(m.catalog, "b2b-assiste")) expect(seeded.has(row.id)).toBe(false);
  });

  it("starts with empty Tour answers, findings and brief", () => {
    const p = newPass(mission(), { id: "p", date: "2026-09-13", label: "Photo" });
    expect(p.tourAnswers).toEqual({});
    expect(p.findings).toEqual([]);
    expect(p.brief).toEqual({ mainFinding: "", priorityAction: "", proof: "" });
    expect(p.label).toBe("Photo");
  });
});

describe("normalizeEntry — the one default, and it is the non-guess", () => {
  it("gives an absence without a cause `type-not-established`, never a flattering one", () => {
    const e = normalizeEntry({ metricId: "m12", status: "absent", observations: [] });
    expect(e.absentCause).toBe(DEFAULT_ABSENT_CAUSE);
    expect(DEFAULT_ABSENT_CAUSE).toBe("type-not-established");
  });

  it("keeps an absent cause the auditor did set", () => {
    const e = normalizeEntry({ metricId: "m12", status: "absent", absentCause: "not-computed", observations: [] });
    expect(e.absentCause).toBe("not-computed");
  });

  it("strips an absent cause left on a non-absent status", () => {
    const e = normalizeEntry({ ...entry("m01", "measured"), absentCause: "not-reliable" });
    expect(e.absentCause).toBeUndefined();
    expect(e.status).toBe("measured");
  });
});

describe("registerDefinition — immutable, addressed by version", () => {
  it("adds a definition under `id@version`", () => {
    const m = registerDefinition(newMission({ id: "m", createdAt: "x", header: header() }), definition("m01", "mrr", 1));
    expect(Object.keys(m.definitions)).toEqual(["mrr@1"]);
  });

  it("refuses to overwrite an existing version with different content", () => {
    const m = registerDefinition(newMission({ id: "m", createdAt: "x", header: header() }), definition("m01", "mrr", 1));
    expect(() => registerDefinition(m, { ...definition("m01", "mrr", 1), unit: "logo" })).toThrow(/bump the version/);
    expect(() => registerDefinition(m, { ...definition("m01", "mrr", 2), unit: "logo" })).not.toThrow();
  });

  it("re-registering identical content is a no-op", () => {
    const m = registerDefinition(newMission({ id: "m", createdAt: "x", header: header() }), definition("m01", "mrr", 1));
    expect(registerDefinition(m, definition("m01", "mrr", 1))).toBe(m);
  });

  it("parseDefinitionRef round-trips and rejects garbage", () => {
    expect(parseDefinitionRef("mrr@3")).toEqual({ id: "mrr", version: 3 });
    expect(parseDefinitionRef("mrr")).toBeNull();
    expect(parseDefinitionRef("mrr@x")).toBeNull();
  });
});

describe("latestObservation — the series is ordered by period, then by pull date", () => {
  it("picks the most recent period end", () => {
    const e = entry("m01", "measured", {
      observations: [
        observation(1, { id: "a", periodEnd: "2026-06-30" }),
        observation(2, { id: "b", periodEnd: "2026-08-31" }),
        observation(3, { id: "c", periodEnd: "2026-07-31" }),
      ],
    });
    expect(latestObservation(e)?.id).toBe("b");
  });

  it("breaks a period tie on the pull date, and does not mutate the entry", () => {
    const e = entry("m01", "measured", {
      observations: [observation(1, { id: "early", asOf: "2026-09-03" }), observation(2, { id: "late", asOf: "2026-09-28" })],
    });
    expect(latestObservation(e)?.id).toBe("late");
    expect(e.observations.map((o) => o.id)).toEqual(["early", "late"]);
  });
});

describe("confidenceOf — derived, never entered", () => {
  it("is high for a raw extract with a complete definition", () => {
    expect(confidenceOf(observation(1), definition("m01"))).toBe("high");
  });

  it("is medium when the source is a third-party report, or the definition is incomplete", () => {
    expect(confidenceOf(observation(1, { sourceKind: "aggregated-report" }), definition("m01"))).toBe("medium");
    expect(confidenceOf(observation(1), undefined)).toBe("medium");
    expect(confidenceOf(observation(1), { ...definition("m01"), denominatorPopulation: " " })).toBe("medium");
  });

  it("is low for anything heard in a meeting, whatever the definition says", () => {
    expect(confidenceOf(observation(1, { sourceKind: "stated-orally" }), definition("m01"))).toBe("low");
    expect(confidenceOf(observation(1, { obtainedHow: "oral" }), definition("m01"))).toBe("low");
    expect(confidenceOf(observation(1, { sourceKind: "interested-party" }), definition("m01"))).toBe("low");
  });
});
