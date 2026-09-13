import { describe, expect, it } from "vitest";
import type { Coverage } from "../coverage";
import {
  FORBIDDEN_WITHOUT_MANDATE,
  NO_EXTERNAL_BENCHMARK_NOTE,
  canMarkHeadline,
  deliverableVocabulary,
  effectiveCriterion,
  headlineCount,
  isPromotable,
  setPriority,
  splitAtBudget,
  wordCount,
} from "../findings";
import { BRIEF_WORD_BUDGET, HEADLINE_CAP } from "../schema";
import { entry, finding } from "./fixtures";

describe("effectiveCriterion — a benchmark without its population is not a benchmark", () => {
  it("degrades a public benchmark missing population or n into an internal trend, with the printed note", () => {
    const noN = effectiveCriterion({ kind: "public-benchmark", value: 0.85, source: "blog", population: "SaaS PME" });
    expect(noN.kind).toBe("internal-trend");
    expect(noN.degraded).toBe(true);
    expect(noN.note).toBe(NO_EXTERNAL_BENCHMARK_NOTE);
    const noPop = effectiveCriterion({ kind: "public-benchmark", value: 0.85, n: 400 });
    expect(noPop.degraded).toBe(true);
  });

  it("keeps a complete public benchmark, an argued threshold and an internal trend as they are", () => {
    expect(effectiveCriterion({ kind: "public-benchmark", value: 0.85, population: "SaaS PME", n: 400, year: 2025 }).degraded).toBe(false);
    expect(effectiveCriterion({ kind: "argued-threshold", value: 0.2, justification: "…" }).degraded).toBe(false);
    expect(effectiveCriterion({ kind: "internal-trend" }).degraded).toBe(false);
  });
});

describe("isPromotable — a number without a criterion and a decision stays a number", () => {
  it("needs both a criterion and a non-empty decision at stake", () => {
    expect(isPromotable(entry("m01", "measured"))).toBe(false);
    expect(isPromotable(entry("m01", "measured", { criterion: { kind: "internal-trend" } }))).toBe(false);
    expect(isPromotable(entry("m01", "measured", { criterion: { kind: "internal-trend" }, decisionAtStake: "   " }))).toBe(false);
    expect(isPromotable(entry("m01", "measured", { criterion: { kind: "internal-trend" }, decisionAtStake: "Quelle base fait référence." }))).toBe(true);
  });
});

describe("priority and headline — rarity is structural", () => {
  it("setPriority marks one and demotes any other, without touching the rest", () => {
    const list = [finding("a", { priority: true, headline: true }), finding("b"), finding("c", { headline: true })];
    const next = setPriority(list, "b");
    expect(next.map((f) => [f.id, f.priority, f.headline])).toEqual([
      ["a", false, true],
      ["b", true, true],
      ["c", false, true],
    ]);
    expect(list[0]!.priority).toBe(true); // input untouched
    expect(() => setPriority(list, "zz")).toThrow(/Unknown finding/);
  });

  it("the headline cap excludes the priority and is a constant", () => {
    const list = [finding("p", { priority: true, headline: true }), ...Array.from({ length: HEADLINE_CAP }, (_, i) => finding(`h${i}`, { headline: true })), finding("x")];
    expect(headlineCount(list)).toBe(HEADLINE_CAP);
    expect(canMarkHeadline(list, "x")).toBe(false);
    expect(canMarkHeadline(list.slice(0, -2), "x")).toBe(false); // x not in list
    expect(canMarkHeadline([...list.slice(0, HEADLINE_CAP), finding("x")], "x")).toBe(true);
    expect(canMarkHeadline(list, "p")).toBe(false); // already priority
    expect(HEADLINE_CAP).toBe(8);
  });
});

describe("deliverableVocabulary — the mandate changes the words, not the grid", () => {
  const D = 24;
  const fine: Coverage = { denominator: D, documented: 16, companyLacks: 6, noAccess: 2, pending: 0 };
  const thin: Coverage = { denominator: D, documented: 5, companyLacks: 12, noAccess: 7, pending: 0 };

  function allText(v: ReturnType<typeof deliverableVocabulary>): string {
    return [v.documentTitle, v.documentWord, v.thesis, v.escalationTitle ?? ""].join(" ").toLowerCase();
  }

  it("without a mandate, none of the auditor's words is ever printed — even when escalating", () => {
    for (const coverage of [fine, thin]) {
      const text = allText(deliverableVocabulary("no-mandate", coverage, "la rétention"));
      for (const term of FORBIDDEN_WITHOUT_MANDATE) expect(text, term).not.toContain(term);
    }
  });

  it("without a mandate the document is a diagnostic, and the access block goes to the working annex", () => {
    const v = deliverableVocabulary("no-mandate", fine, "la rétention");
    expect(v.documentTitle).toBe("Diagnostic growth");
    expect(v.accessBlock).toBe("working-annex");
    expect(v.escalationTitle).toBeNull();
  });

  it("with a mandate the document is an audit, the thesis carries the counters, and the access block is printed", () => {
    const v = deliverableVocabulary("mandated", fine, "la rétention");
    expect(v.documentTitle).toBe("Audit growth");
    expect(v.accessBlock).toBe("reading-build");
    expect(v.thesis).toBe("Une revue de croissance a besoin de répondre à 24 questions ; vous pouvez en documenter 16.");
    expect(v.escalationTitle).toBeNull();
  });

  it("escalates under a third, in the tense of the mandate", () => {
    expect(deliverableVocabulary("mandated", thin, "la rétention").escalationTitle).toBe(
      "Sur 19 des 24 lignes applicables, aucun chiffre n'a pu être obtenu ; cet audit ne peut pas conclure sur la rétention, et c'est le constat principal.",
    );
    expect(deliverableVocabulary("no-mandate", thin, "la rétention").escalationTitle).toMatch(/ne peut pas encore conclure/);
  });

  it("writes a half point the French way", () => {
    const half: Coverage = { ...fine, documented: 16.5, companyLacks: 5.5 };
    expect(deliverableVocabulary("mandated", half, "x").thesis).toContain("documenter 16,5.");
  });
});

describe("the brief budget — overflow goes to the annex, never silently cut", () => {
  it("counts words the way the counter will", () => {
    expect(wordCount("")).toBe(0);
    expect(wordCount("  un   deux\ntrois ")).toBe(3);
  });

  it("splits at the budget and keeps everything", () => {
    const words = Array.from({ length: BRIEF_WORD_BUDGET + 10 }, (_, i) => `w${i}`);
    const { kept, overflow } = splitAtBudget(words.join(" "));
    expect(kept.split(" ")).toHaveLength(BRIEF_WORD_BUDGET);
    expect(overflow.split(" ")).toHaveLength(10);
    expect(`${kept} ${overflow}`).toBe(words.join(" "));
    expect(splitAtBudget("court")).toEqual({ kept: "court", overflow: "" });
    expect(BRIEF_WORD_BUDGET).toBe(400);
  });
});
