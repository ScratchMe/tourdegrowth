import { describe, expect, it } from "vitest";
import { AUDIT_CATALOG, AUDIT_CATALOG_VERSION, AUDIT_PROFILE_MODELS } from "../audit-catalog";
import { QUESTIONS } from "../copy-library";
import { GLOSSARY_TERMS } from "../glossary-terms";

const CORE = AUDIT_CATALOG.filter((r) => /^m\d\d$/.test(r.id));
const VARIANTS = AUDIT_CATALOG.filter((r) => /^v[asc m]-\d\d$/.test(r.id) || /^v[ascm]-\d\d$/.test(r.id));

describe("audit catalog — the shape the instrument depends on", () => {
  it("has 19 core rows and 20 profile variants, all with unique ids", () => {
    expect(CORE).toHaveLength(19);
    expect(VARIANTS).toHaveLength(20);
    expect(CORE.length + VARIANTS.length).toBe(AUDIT_CATALOG.length);
    expect(new Set(AUDIT_CATALOG.map((r) => r.id)).size).toBe(AUDIT_CATALOG.length);
  });

  it("every appliesTo is a non-empty subset of the four profiles — this is the denominator", () => {
    for (const row of AUDIT_CATALOG) {
      expect(row.appliesTo.length, row.id).toBeGreaterThan(0);
      for (const model of row.appliesTo) expect(AUDIT_PROFILE_MODELS, `${row.id} → ${model}`).toContain(model);
    }
  });

  it("a variant applies to exactly its own profile, and its prefix says which", () => {
    const prefix = { va: "b2b-assiste", vs: "b2b-selfserve", vc: "b2c", vm: "marketplace" } as const;
    for (const row of VARIANTS) {
      const key = row.id.slice(0, 2) as keyof typeof prefix;
      expect(row.appliesTo, row.id).toEqual([prefix[key]]);
      expect(row.why, row.id).toBeTruthy();
    }
  });

  it("every profile has at least 15 applicable rows, and the core applies broadly", () => {
    for (const model of AUDIT_PROFILE_MODELS) {
      expect(AUDIT_CATALOG.filter((r) => r.appliesTo.includes(model)).length, model).toBeGreaterThanOrEqual(15);
    }
    for (const row of CORE) expect(row.appliesTo.length, row.id).toBeGreaterThanOrEqual(2);
  });

  it("every glossary link points at a real term, every Tour link at a real question", () => {
    for (const row of AUDIT_CATALOG) {
      if (row.glossary) expect(Object.keys(GLOSSARY_TERMS), `${row.id} → ${row.glossary}`).toContain(row.glossary);
      if (row.tourQuestionId) expect(QUESTIONS.map((q) => q.id), `${row.id} → ${row.tourQuestionId}`).toContain(row.tourQuestionId);
    }
  });

  it("the Tour axis is set on the lines the questions literally ask about measuring", () => {
    const linked = Object.fromEntries(AUDIT_CATALOG.filter((r) => r.tourQuestionId).map((r) => [r.id, r.tourQuestionId]));
    expect(linked).toEqual({
      m09: "acq-3",
      m10: "acq-1",
      m11: "act-1",
      m12: "act-2",
      m14: "ret-1",
      m16: "ret-3",
      m17: "ref-3",
      "vs-03": "act-3",
      "vc-01": "ref-3",
      "vc-03": "ret-1",
    });
  });

  it("no text field is empty, and each core row explains what its absence says", () => {
    for (const row of AUDIT_CATALOG) {
      for (const field of ["name", "cost", "definition"] as const) expect(row[field].trim(), `${row.id}.${field}`).not.toBe("");
    }
    for (const row of CORE) {
      for (const field of ["trap", "where", "decision", "absence"] as const) expect(row[field]?.trim(), `${row.id}.${field}`).toBeTruthy();
    }
  });

  it("the version is a date with a counter, to be bumped on every row change", () => {
    expect(AUDIT_CATALOG_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}\.\d+$/);
  });

  it("the three exceptions to « the core applies everywhere » are the argued ones", () => {
    const only = (id: string) => [...AUDIT_CATALOG.find((r) => r.id === id)!.appliesTo].sort();
    expect(only("m03")).toEqual(["b2b-assiste", "b2b-selfserve"]); // NRR/GRR
    expect(only("m15")).toEqual(["b2b-assiste", "b2b-selfserve"]); // consumption ÷ commitment
    expect(only("m04")).toEqual(["b2b-assiste", "b2b-selfserve", "marketplace"]); // logo churn — b2c has D1/D7/D30
    expect(only("m05")).toEqual(["b2b-assiste", "b2b-selfserve", "marketplace"]); // concentration — b2c has top 1 %
  });
});
