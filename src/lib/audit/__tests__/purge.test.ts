import { describe, expect, it } from "vitest";
import { computeCoverage } from "../coverage";
import { diffPasses } from "../diff";
import { purgeMission } from "../purge";
import type { Mission } from "../schema";
import { validateMission } from "../validate";
import { entry, fillRemaining, finding, mission, observation, pass, withPasses } from "./fixtures";

const COMPANY = "Acme Analytics";
const SECRET_VALUE = 1_234_567;

function loaded() {
  const m = mission("b2b-selfserve", { company: COMPANY, scope: "entité France, ligne Pro" });
  const p1 = fillRemaining(
    m,
    pass(
      m,
      [
        entry("m01", "measured", {
          observations: [observation(SECRET_VALUE, { id: "o1", sourceSystem: "Stripe" })],
          decisionAtStake: "Quelle base fait référence — le MRR de 1 234 567 € ou l'autre.",
          canonicalDeviation: "MRR calculé sur le facturé, pas le reconnu.",
          exposure: { inputs: [{ label: "budget", value: 900_000, source: "finance" }], calculation: "budget × 0,3", range: "200-300 k€" },
          tracking: { routedTo: "RevOps lead", mandateLevel: "peer" },
        }),
        entry("m12", "absent", { systemCause: "tool-does-not-emit" }),
        entry("m17", "measured", { criterion: { kind: "argued-threshold", value: 0.2, justification: "chez Acme, 20 % est la barre" } }),
      ],
      "pass-1",
    ),
    "not-accessible",
  );
  const withFindings = {
    ...p1,
    findings: [finding("f1", { priority: true, headline: true, agreedAction: { action: "Trancher la base du MRR", ownerRole: "DAF", date: "2026-10-01" } })],
    brief: { mainFinding: `Chez ${COMPANY}, le MRR vaut ${SECRET_VALUE}.`, priorityAction: "Trancher la base.", proof: "Stripe vs finance." },
  };
  const p2 = fillRemaining(m, pass(m, [entry("m01", "measured"), entry("m12", "measured")], "pass-2", "2027-03-01"), "not-accessible");
  return withPasses(m, withFindings, p2);
}

describe("purgeMission — the absolutes leave, the structure stays", () => {
  it("removes the company, the scope, every value, every prose field and the named systems", () => {
    // The embedded catalog is public prose and legitimately names Stripe or a
    // budget; what must be clean is everything the mission ADDED to it.
    const purged = purgeMission(loaded());
    const json = JSON.stringify({ header: purged.header, passes: purged.passes, definitions: purged.definitions });
    expect(purged.purged).toBe(true);
    expect(json).not.toContain(COMPANY);
    expect(json).not.toContain(String(SECRET_VALUE));
    expect(json).not.toContain("900000");
    expect(json).not.toContain("Stripe");
    expect(json).not.toContain("France");
    expect(json).not.toContain("Trancher la base");
    expect(json).not.toContain("RevOps lead");
    expect(json).not.toContain("chez Acme");
    expect(json).not.toContain("decisionAtStake");
    expect(json).not.toContain("exposure");
    expect(json).not.toContain("agreedAction");
  });

  it("keeps statuses, causes, repair costs, definitions, criteria kinds and the canonical deviation", () => {
    const purged = purgeMission(loaded());
    const p = purged.passes[0]!;
    const m12 = p.entries.find((e) => e.metricId === "m12")!;
    expect(m12).toMatchObject({ status: "absent", absentCause: "not-instrumented", systemCause: "tool-does-not-emit", repairCost: { scale: "quarter" } });
    const m01 = p.entries.find((e) => e.metricId === "m01")!;
    expect(m01.canonicalDeviation).toBe("MRR calculé sur le facturé, pas le reconnu.");
    expect(m01.definitionRef).toBe("m01@1");
    expect(m01.observations[0]).toMatchObject({ id: "o1", value: null, sourceKind: "raw-extract-self", periodEnd: "2026-08-31" });
    expect(p.entries.find((e) => e.metricId === "m17")!.criterion).toMatchObject({ kind: "argued-threshold", value: 0.2 });
    expect(Object.keys(purged.definitions).length).toBe(Object.keys(loaded().definitions).length);
    expect(p.findings[0]).toMatchObject({ id: "f1", gap: "evidence", cause: "definition-never-settled", priority: true, headline: true });
  });

  it("the counters and the diff between passes are identical before and after", () => {
    const before = loaded();
    const after = purgeMission(before);
    for (const i of [0, 1]) expect(computeCoverage(after.passes[i]!, after)).toEqual(computeCoverage(before.passes[i]!, before));
    expect(diffPasses(after, "pass-1", "pass-2")).toEqual(diffPasses(before, "pass-1", "pass-2"));
  });

  it("a purged mission still loads — the two value rules are relaxed for it, and only for it", () => {
    const purged = JSON.parse(JSON.stringify(purgeMission(loaded()))) as Mission;
    expect(validateMission(purged)).toMatchObject({ ok: true });
    // The same file without the flag is what a hand-edited export would look like: refused, for the right reasons.
    const { purged: _flag, ...unflagged } = purged;
    const result = validateMission(unflagged);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => /requires at least one observation with a value/.test(e))).toBe(true);
      expect(result.errors.some((e) => /an argued threshold carries its argument/.test(e))).toBe(true);
    }
  });

  it("does not mutate its input", () => {
    const before = loaded();
    const snapshot = JSON.stringify(before);
    purgeMission(before);
    expect(JSON.stringify(before)).toBe(snapshot);
  });
});
