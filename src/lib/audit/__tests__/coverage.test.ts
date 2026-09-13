import { describe, expect, it } from "vitest";
import { AUDIT_CATALOG, AUDIT_PROFILE_MODELS } from "@/content/audit-catalog";
import { REFUSAL_FRACTION, computeCoverage, formatFraction, isReadoutReady, shouldRefuseToConclude } from "../coverage";
import { applicableRows } from "../schema";
import { entry, fillRemaining, mission, pass } from "./fixtures";

describe("computeCoverage — the denominator is a datum, not an opinion", () => {
  it("is the number of catalog rows whose appliesTo names the profile, for every profile", () => {
    for (const model of AUDIT_PROFILE_MODELS) {
      const m = mission(model);
      const expected = AUDIT_CATALOG.filter((r) => r.appliesTo.includes(model)).length;
      expect(computeCoverage(pass(m), m).denominator).toBe(expected);
      expect(expected).toBeGreaterThanOrEqual(15);
    }
  });

  it("the b2b-selfserve denominator is 24 — the « 16 sur 24 » of the design notes", () => {
    const m = mission("b2b-selfserve");
    expect(computeCoverage(pass(m), m).denominator).toBe(24);
  });

  it("a variant of another profile never enters the denominator", () => {
    const m = mission("b2c");
    const ids = applicableRows(m.catalog, "b2c").map((r) => r.id);
    expect(ids.some((id) => id.startsWith("va-") || id.startsWith("vs-") || id.startsWith("vm-"))).toBe(false);
    expect(ids.filter((id) => id.startsWith("vc-"))).toHaveLength(4);
  });

  it("the four counters always sum to the denominator", () => {
    const m = mission();
    const p = pass(m, [
      entry("m01", "measured"),
      entry("m04", "reported-without-definition"),
      entry("m07", "not-accessible"),
      entry("m12", "absent"),
      entry("m09", "contested"),
    ]);
    const c = computeCoverage(p, m);
    expect(c).toEqual({ denominator: 24, documented: 1.5, companyLacks: 2.5, noAccess: 1, pending: 19 });
    expect(c.documented + c.companyLacks + c.noAccess + c.pending).toBe(c.denominator);
  });

  it("a line reported without a definition is half a presence and half an absence — never a full point either way", () => {
    const m = mission();
    const c = computeCoverage(fillRemaining(m, pass(m), "reported-without-definition"), m);
    expect(c.documented).toBe(12);
    expect(c.companyLacks).toBe(12);
    expect(c.noAccess + c.pending).toBe(0);
  });

  it("its worst value is reachable: a pass where nobody gave anything reads 0 documented, not 100 %", () => {
    const m = mission();
    const c = computeCoverage(fillRemaining(m, pass(m), "not-accessible"), m);
    expect(c).toEqual({ denominator: 24, documented: 0, companyLacks: 0, noAccess: 24, pending: 0 });
  });

  it("a refusal LOWERS documented and leaves the denominator alone — the R2-01 property", () => {
    const m = mission();
    const before = computeCoverage(fillRemaining(m, pass(m), "measured"), m);
    const withRefusal = fillRemaining(m, pass(m, [entry("m07", "not-accessible"), entry("m08", "not-accessible")]), "measured");
    const after = computeCoverage(withRefusal, m);
    expect(before.documented).toBe(24);
    expect(after.documented).toBe(22);
    expect(after.noAccess).toBe(2);
    expect(after.denominator).toBe(before.denominator);
  });

  it("a hand-entered not-applicable on an applicable row counts as pending, never as documented", () => {
    const m = mission();
    const c = computeCoverage(fillRemaining(m, pass(m, [entry("m02", "not-applicable")]), "measured"), m);
    expect(c.documented).toBe(23);
    expect(c.pending).toBe(1);
  });

  it("entries for non-applicable rows are ignored whatever they say", () => {
    const m = mission("b2c");
    const p = pass(m);
    // m03 (NRR/GRR) does not apply to b2c; seeded as not-applicable. Corrupt it.
    const corrupted = { ...p, entries: p.entries.map((e) => (e.metricId === "m03" ? entry("m03", "measured") : e)) };
    expect(computeCoverage(corrupted, m)).toEqual(computeCoverage(p, m));
  });
});

describe("readiness and escalation", () => {
  it("a readout needs zero pending lines", () => {
    const m = mission();
    expect(isReadoutReady(computeCoverage(pass(m), m))).toBe(false);
    expect(isReadoutReady(computeCoverage(fillRemaining(m, pass(m), "absent"), m))).toBe(true);
  });

  it("refuses to conclude strictly under a third of documented lines, and not at a third", () => {
    expect(REFUSAL_FRACTION).toBe(1 / 3);
    expect(shouldRefuseToConclude({ denominator: 24, documented: 7, companyLacks: 17, noAccess: 0, pending: 0 })).toBe(true);
    expect(shouldRefuseToConclude({ denominator: 24, documented: 8, companyLacks: 16, noAccess: 0, pending: 0 })).toBe(false);
    expect(shouldRefuseToConclude({ denominator: 24, documented: 7.5, companyLacks: 16, noAccess: 0, pending: 0.5 })).toBe(true);
    expect(shouldRefuseToConclude({ denominator: 0, documented: 0, companyLacks: 0, noAccess: 0, pending: 0 })).toBe(false);
  });

  it("formats as a fraction, never a bare percentage, with a French half point", () => {
    expect(formatFraction(16, 24)).toBe("16 sur 24");
    expect(formatFraction(16.5, 24)).toBe("16,5 sur 24");
    expect(formatFraction(0, 24)).toBe("0 sur 24");
  });
});
