import { describe, expect, it } from "vitest";
import { HEADLINE_CAP, type Mission } from "../schema";
import { validateMission } from "../validate";
import { entry, finding, mission, pass, withPasses } from "./fixtures";

function valid(): Mission {
  const m = mission();
  const p = pass(m, [
    entry("m01", "measured"),
    entry("m04", "reported-without-definition"),
    entry("m07", "not-accessible"),
    entry("m12", "absent"),
    entry("m09", "contested"),
    entry("m17", "measured", {
      criterion: { kind: "argued-threshold", value: 0.2, justification: "Au-delà de 20 % du volume sans mécanisme, le meilleur ROI de la grille." },
      decisionAtStake: "Financer un programme de recommandation ou non.",
    }),
  ]);
  return withPasses(m, { ...p, findings: [finding("f1", { priority: true, headline: true }), finding("f2", { headline: true })] });
}

/** Run the validator on a deep copy, after an optional mutation — the way an imported file arrives. */
function check(mutate?: (m: Mission) => void) {
  const m = JSON.parse(JSON.stringify(valid())) as Mission;
  mutate?.(m);
  return validateMission(m);
}

function errorsOf(mutate: (m: Mission) => void): string[] {
  const result = check(mutate);
  return result.ok ? [] : result.errors;
}

describe("validateMission — a realistic mission passes", () => {
  it("accepts the fixture after a JSON round trip", () => {
    const result = check();
    expect(result).toMatchObject({ ok: true });
  });

  it("never throws on a foreign object", () => {
    expect(validateMission(null)).toEqual({ ok: false, errors: ["mission: not an object"] });
    expect(validateMission("x").ok).toBe(false);
    expect(validateMission({}).ok).toBe(false);
    expect(validateMission({ schemaVersion: 1, passes: "no", catalog: 3 }).ok).toBe(false);
  });
});

describe("validateMission — the rules a form could bypass", () => {
  it("refuses a hand-entered not-applicable on a row the catalog says applies", () => {
    const errors = errorsOf((m) => m.passes[0]!.entries.push(entry("m02", "not-applicable")));
    expect(errors.some((e) => /entries\[\d+\]\.status: not-applicable cannot be entered by hand/.test(e))).toBe(true);
  });

  it("refuses any other status on a row outside the profile", () => {
    // va-01 (pipeline coverage) only applies to b2b-assiste; the fixture is b2b-selfserve.
    const errors = errorsOf((m) => {
      m.passes[0]!.entries = m.passes[0]!.entries.filter((e) => e.metricId !== "va-01");
      m.passes[0]!.entries.push(entry("va-01", "measured"));
    });
    expect(errors.some((e) => /va-01 does not apply to profile b2b-selfserve/.test(e))).toBe(true);
  });

  it("refuses an absence without a cause, and without a repair cost (q10)", () => {
    expect(errorsOf((m) => delete m.passes[0]!.entries.find((e) => e.metricId === "m12")!.absentCause)).toEqual(
      expect.arrayContaining([expect.stringMatching(/absentCause: required when absent/)]),
    );
    expect(errorsOf((m) => delete m.passes[0]!.entries.find((e) => e.metricId === "m12")!.repairCost)).toEqual(
      expect.arrayContaining([expect.stringMatching(/repairCost: required when absent \(q10\)/)]),
    );
  });

  it("refuses an absent cause on a non-absent status", () => {
    const errors = errorsOf((m) => {
      m.passes[0]!.entries.find((e) => e.metricId === "m01")!.absentCause = "not-computed";
    });
    expect(errors).toEqual(expect.arrayContaining([expect.stringMatching(/absentCause: only allowed when status is absent/)]));
  });

  it("requires a valued observation and a registered definition for a measured line", () => {
    expect(
      errorsOf((m) => {
        m.passes[0]!.entries.find((e) => e.metricId === "m01")!.observations = [];
      }),
    ).toEqual(expect.arrayContaining([expect.stringMatching(/measured requires at least one observation with a value/)]));
    expect(
      errorsOf((m) => {
        m.passes[0]!.entries.find((e) => e.metricId === "m01")!.definitionRef = "ghost@9";
      }),
    ).toEqual(expect.arrayContaining([expect.stringMatching(/ghost@9 is not registered/)]));
    expect(
      errorsOf((m) => {
        delete m.passes[0]!.entries.find((e) => e.metricId === "m01")!.definitionRef;
      }),
    ).toEqual(expect.arrayContaining([expect.stringMatching(/definitionRef: required when measured/)]));
  });

  it("requires two observations for a contested line — both figures stay side by side", () => {
    const errors = errorsOf((m) => {
      m.passes[0]!.entries.find((e) => e.metricId === "m09")!.observations.pop();
    });
    expect(errors).toEqual(expect.arrayContaining([expect.stringMatching(/contested keeps both figures/)]));
  });

  it("requires the argument behind an argued threshold (q5)", () => {
    const errors = errorsOf((m) => {
      delete m.passes[0]!.entries.find((e) => e.metricId === "m17")!.criterion!.justification;
    });
    expect(errors).toEqual(expect.arrayContaining([expect.stringMatching(/criterion\.justification: an argued threshold/)]));
  });

  it("refuses two priority findings and more than the headline cap", () => {
    expect(errorsOf((m) => m.passes[0]!.findings.push(finding("f3", { priority: true })))).toEqual(
      expect.arrayContaining([expect.stringMatching(/2 priority findings; the priority action is exclusive/)]),
    );
    expect(
      errorsOf((m) => {
        for (let i = 0; i < HEADLINE_CAP; i++) m.passes[0]!.findings.push(finding(`h${i}`, { headline: true }));
      }),
    ).toEqual(expect.arrayContaining([expect.stringMatching(new RegExp(`${HEADLINE_CAP + 1} headline findings; the cap is ${HEADLINE_CAP}`))]));
  });

  it("refuses a finding that references a line outside the embedded catalog, or none at all", () => {
    expect(errorsOf((m) => (m.passes[0]!.findings[1]!.refs = [{ metricId: "m99" }]))).toEqual(
      expect.arrayContaining([expect.stringMatching(/refs\[0\]\.metricId: m99 is not in the embedded catalog/)]),
    );
    expect(errorsOf((m) => (m.passes[0]!.findings[1]!.refs = []))).toEqual(
      expect.arrayContaining([expect.stringMatching(/a finding references at least one value/)]),
    );
  });

  it("refuses free text where the schema wants a closed list", () => {
    expect(errorsOf((m) => ((m.passes[0]!.findings[0] as unknown as { cause: string }).cause = "Marie n'a pas répondu"))).toEqual(
      expect.arrayContaining([expect.stringMatching(/cause: one of .* a closed list, never free text/)]),
    );
    expect(errorsOf((m) => ((m.passes[0]!.entries[0] as unknown as { status: string }).status = "ok"))).toEqual(
      expect.arrayContaining([expect.stringMatching(/status: one of/)]),
    );
  });

  it("refuses duplicates: entries, passes, observations, findings, catalog rows", () => {
    expect(errorsOf((m) => m.passes[0]!.entries.push(entry("m01", "measured")))).toEqual(
      expect.arrayContaining([expect.stringMatching(/duplicate entry for m01/)]),
    );
    expect(errorsOf((m) => m.passes.push(m.passes[0]!))).toEqual(expect.arrayContaining([expect.stringMatching(/passes\[1\]\.id: duplicate/)]));
    expect(errorsOf((m) => m.catalog.rows.push(m.catalog.rows[0]!))).toEqual(expect.arrayContaining([expect.stringMatching(/duplicate id m01/)]));
  });

  it("refuses a definition stored under the wrong key", () => {
    const errors = errorsOf((m) => {
      m.definitions["wrong@1"] = m.definitions["m01@1"]!;
    });
    expect(errors).toEqual(expect.arrayContaining([expect.stringMatching(/definitions\.wrong@1: key must equal m01@1/)]));
  });

  it("checks the header vocabularies: mandate, locale, profile, showTourScore", () => {
    expect(errorsOf((m) => ((m.header as unknown as { mandate: string }).mandate = "auditor"))).toEqual(
      expect.arrayContaining([expect.stringMatching(/header\.mandate: one of mandated, no-mandate/)]),
    );
    expect(errorsOf((m) => ((m.header as unknown as { deliverableLocale: string }).deliverableLocale = "de"))).toEqual(
      expect.arrayContaining([expect.stringMatching(/header\.deliverableLocale: one of en, fr/)]),
    );
    expect(errorsOf((m) => ((m.header.profile as unknown as { model: string }).model = "b2b"))).toEqual(
      expect.arrayContaining([expect.stringMatching(/header\.profile\.model: one of/)]),
    );
    expect(errorsOf((m) => delete (m.header as Partial<Mission["header"]>).showTourScore)).toEqual(
      expect.arrayContaining([expect.stringMatching(/showTourScore: boolean required \(q3\)/)]),
    );
  });

  it("accepts an empty company and scope — that is what a purged file looks like", () => {
    const result = check((m) => {
      m.header.company = "";
      m.header.scope = "";
    });
    expect(result.ok).toBe(true);
  });
});
