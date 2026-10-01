import { describe, expect, it } from "vitest";
import { GLOSSARY, type GlossaryTermId } from "../glossary";
import { QUESTIONS } from "../copy-library";
import { GLOSSARY_DEEP } from "../glossary-deep";
import { AUDIT_CATALOG } from "../audit-catalog";

const ALL_IDS = Object.keys(GLOSSARY) as GlossaryTermId[];

describe("GLOSSARY (growth-plan Phase 2: extended /glossary/[term] content)", () => {
  it("every entry has non-empty extended copy in both locales", () => {
    for (const id of ALL_IDS) {
      const { extended } = GLOSSARY[id];
      expect(extended.en.trim().length, `${id}.extended.en`).toBeGreaterThan(0);
      expect(extended.fr.trim().length, `${id}.extended.fr`).toBeGreaterThan(0);
    }
  });

  it("every related id points to a real glossary entry — no dangling internal links", () => {
    for (const id of ALL_IDS) {
      for (const relatedId of GLOSSARY[id].related) {
        expect(ALL_IDS, `${id}.related contains "${relatedId}"`).toContain(relatedId);
      }
    }
  });

  it("no entry lists itself as related", () => {
    for (const id of ALL_IDS) {
      expect(GLOSSARY[id].related, id).not.toContain(id);
    }
  });

  it("every entry has 2-4 related terms — enough for real internal linking, not a token single link", () => {
    // Upper bound raised from 3 to 4 by REVIEW-02.md R2-13: the five pillars
    // each gained `aarrr`, the head term of the whole topic and until then the
    // least-linked page of the glossary. A deliberate decision, not a loosening.
    for (const id of ALL_IDS) {
      expect(GLOSSARY[id].related.length, id).toBeGreaterThanOrEqual(2);
      expect(GLOSSARY[id].related.length, id).toBeLessThanOrEqual(4);
    }
  });

  it("every term is linked from at least two others (GROWTH-PLAN.md 2.4)", () => {
    // Measured by hand after each batch of wave 2.2, a rule since A7.3.e
    // (2026-09-30), whose four terms needed eight swaps to get there. The
    // four new ones must be reached from pages that existed before them, not
    // only from each other. Non-vacuity (2026-09-30): putting `activation`
    // back in place of `lead-to-opportunity` in `pql.related` fails this test
    // alone ("lead-to-opportunity ← acquisition: expected 1").
    const NEW_SALES_TERMS: GlossaryTermId[] = ["win-rate", "sales-cycle", "acv", "lead-to-opportunity"];
    for (const id of ALL_IDS) {
      const from = ALL_IDS.filter((other) => GLOSSARY[other].related.includes(id));
      expect(from.length, `${id} ← ${from.join(", ")}`).toBeGreaterThanOrEqual(2);
      if (NEW_SALES_TERMS.includes(id)) {
        const older = from.filter((other) => !NEW_SALES_TERMS.includes(other));
        expect(older.length, `${id} ← ${older.join(", ")}`).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("every pillar links the framework it belongs to (REVIEW-02.md R2-13)", () => {
    for (const pillar of ["acquisition", "activation", "retention", "referral", "revenue"] as const) {
      expect(GLOSSARY[pillar].related, pillar).toContain("aarrr");
    }
  });
});

describe("search snippets (REVIEW-02.md R2-08)", () => {
  it("every term's effective meta description is snippet-sized in both locales", () => {
    for (const [id, entry] of Object.entries(GLOSSARY)) {
      for (const locale of ["fr", "en"] as const) {
        const text = (entry.metaDescription ?? entry.definition)[locale];
        expect(text.length, `${id} (${locale}) is ${text.length} chars`).toBeGreaterThanOrEqual(70);
        expect(text.length, `${id} (${locale}) is ${text.length} chars`).toBeLessThanOrEqual(160);
      }
    }
  });

  it("only overrides the definition where the definition itself is the wrong length", () => {
    for (const [id, entry] of Object.entries(GLOSSARY)) {
      if (!entry.metaDescription) continue;
      const outOfRange = (["fr", "en"] as const).some(
        (l) => entry.definition[l].length < 70 || entry.definition[l].length > 160,
      );
      expect(outOfRange, `${id} overrides a definition that already fit`).toBe(true);
    }
  });
});

/**
 * REVIEW-02.md R2-11 — the long-form sections. Shape checks plus the one
 * number the finding was about: a term page that has them must weigh what a
 * page that ranks weighs. Counted on `extended` + every deep string, per
 * language; the finding measured 76-105 words per term before.
 */
describe("long-form term pages (REVIEW-02.md R2-11)", () => {
  const DEEP_IDS = Object.keys(GLOSSARY_DEEP) as GlossaryTermId[];
  const words = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

  it("covers every glossary term — the five batches are complete", () => {
    expect(DEEP_IDS.sort()).toEqual([...ALL_IDS].sort());
  });

  it("every deep entry is dated and points at a real Tour question", () => {
    for (const id of DEEP_IDS) {
      expect(GLOSSARY[id].updatedAt, id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      const { questionId } = GLOSSARY_DEEP[id]!.inTheTour;
      expect(QUESTIONS.map((q) => q.id), `${id} → ${questionId}`).toContain(questionId);
    }
  });

  it.each(["en", "fr"] as const)("has every section filled, within the agreed sizes, in %s", (locale) => {
    for (const id of DEEP_IDS) {
      const deep = GLOSSARY_DEEP[id]!;
      expect(deep.formula.expression[locale], id).toMatch(/[=÷×]/);
      expect(deep.formula.terms.length, id).toBeGreaterThanOrEqual(2);
      expect(deep.example.steps.length, id).toBeGreaterThanOrEqual(3);
      expect(deep.benchmark.length, id).toBeGreaterThanOrEqual(2);
      expect(deep.howToImprove.length, id).toBeGreaterThanOrEqual(3);
      expect(deep.howToImprove.length, id).toBeLessThanOrEqual(5);
      expect(deep.faq.length, id).toBeGreaterThanOrEqual(3);
      expect(deep.faq.length, id).toBeLessThanOrEqual(5);
      const all = [
        deep.formula.expression,
        ...deep.formula.terms.flatMap((x) => [x.symbol, x.meaning]),
        deep.formula.note,
        deep.example.title,
        ...deep.example.steps,
        deep.example.takeaway,
        ...deep.benchmark,
        ...deep.howToImprove,
        deep.inTheTour.body,
        ...deep.faq.flatMap((x) => [x.question, x.answer]),
      ].filter((x): x is NonNullable<typeof x> => Boolean(x));
      for (const text of all) {
        expect(text[locale].trim(), `${id} (${locale}) empty string`).not.toBe("");
        expect(text[locale], `${id} (${locale})`).not.toMatch(/TODO/);
      }
    }
  });

  it.each(["en", "fr"] as const)("weighs at least 500 words per term in %s — the point of the finding", (locale) => {
    for (const id of DEEP_IDS) {
      const deep = GLOSSARY_DEEP[id]!;
      const total =
        words(GLOSSARY[id].extended[locale]) +
        words(deep.formula.expression[locale]) +
        deep.formula.terms.reduce((n, x) => n + words(x.meaning[locale]), 0) +
        words(deep.formula.note?.[locale] ?? "") +
        deep.example.steps.reduce((n, x) => n + words(x[locale]), 0) +
        words(deep.example.takeaway[locale]) +
        deep.benchmark.reduce((n, x) => n + words(x[locale]), 0) +
        deep.howToImprove.reduce((n, x) => n + words(x[locale]), 0) +
        words(deep.inTheTour.body[locale]) +
        deep.faq.reduce((n, x) => n + words(x.answer[locale]), 0);
      expect(total, `${id} (${locale}) is ${total} words`).toBeGreaterThanOrEqual(500);
    }
  });
});

/**
 * A7.3.e (2026-09-30) — the four sales-assisted terms carry NONE of the audit
 * instrument's orders of magnitude (ENGINE.md §18.4.1 and decision 6). Those
 * figures — a win rate of 25-35% for small companies and 12-18% for large
 * ones, a pipeline coverage of 3× to 6× by deal size — live in
 * `audit-catalog.ts`, whose review (bon à tirer nº4) settled one card out of
 * 39, and the web repeats them everywhere, which is exactly how they would
 * slip in. The ranges are READ from the catalogue rather than listed here,
 * so a figure added to it later is covered the day it lands.
 *
 * Non-vacuity, measured on 2026-09-30, both sabotages at once: "25-35 %"
 * written into the French example of `win-rate` and "3×" into the English
 * benchmark of `acv` fail exactly the two language cases below — `win-rate
 * (fr)` found "25-35", `acv (en)` found "3×" — and the 14 other tests of this
 * file pass. The catalogue yields 24 figures that day.
 */
describe("sales-assisted terms, and the audit instrument's figures (A7.3.e)", () => {
  const SALES_TERMS: GlossaryTermId[] = ["win-rate", "sales-cycle", "acv", "lead-to-opportunity"];
  /** Spaces unified, dashes and « à » read as one range sign, so "25 à 35 %" and "25-35%" are the same figure. */
  const normalise = (text: string) =>
    text
      .replace(/[\u00a0\u202f]/g, " ")
      .replace(/(\d)\s*(?:-|–|—|à|to)\s*(\d)/g, "$1-$2")
      .replace(/(\d)\s+(\d{3})(?!\d)/g, "$1$2");
  const auditFigures = [
    ...new Set(
      AUDIT_CATALOG.filter((row) => row.appliesTo.includes("b2b-assiste"))
        .flatMap((row) => [row.definition, row.trap, row.where, row.decision, row.absence, row.why])
        .filter((x): x is string => Boolean(x))
        .flatMap((text) => normalise(text).match(/\d+(?:,\d+)?-\d+(?:,\d+)?|\d+(?:,\d+)?×|\d+ ?k€/g) ?? []),
    ),
  ];
  const pageText = (id: GlossaryTermId, locale: "en" | "fr") => {
    const bits: string[] = [];
    (function walk(v: unknown) {
      if (v == null) return;
      if (typeof v === "object" && "fr" in (v as object) && "en" in (v as object)) {
        bits.push(String((v as Record<string, unknown>)[locale]));
        return;
      }
      if (typeof v === "object") Object.values(v as object).forEach(walk);
    })({ entry: GLOSSARY[id], deep: GLOSSARY_DEEP[id] });
    return normalise(bits.join("\n"));
  };

  it("reads the catalogue's figures, including the two the spec names — otherwise the check below proves nothing", () => {
    expect(auditFigures).toContain("25-35");
    expect(auditFigures).toContain("12-18");
    expect(auditFigures).toContain("3×");
    expect(auditFigures.length).toBeGreaterThan(5);
  });

  it.each(["en", "fr"] as const)("none of them appears on the four pages (%s)", (locale) => {
    for (const id of SALES_TERMS) {
      const text = pageText(id, locale);
      expect(text.length, id).toBeGreaterThan(3000);
      const found = auditFigures.filter((figure) => new RegExp(`(?<![\\d,])${figure.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\d,])`).test(text));
      expect(found, `${id} (${locale})`).toEqual([]);
    }
  });
});
