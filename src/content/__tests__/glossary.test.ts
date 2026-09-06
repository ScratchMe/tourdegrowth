import { describe, expect, it } from "vitest";
import { GLOSSARY, type GlossaryTermId } from "../glossary";
import { QUESTIONS } from "../copy-library";
import { GLOSSARY_DEEP } from "../glossary-deep";

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

  it("covers the terms delivered so far, in the order the plan set", () => {
    expect(DEEP_IDS).toEqual(
      expect.arrayContaining([
        "cac",
        "ltv",
        "churn",
        "retention",
        "activation",
        "viral-coefficient",
        "acquisition",
        "referral",
        "revenue",
        "aarrr",
        "aha-moment",
        "onboarding",
      ]),
    );
  });

  it("every deep entry is wired into GLOSSARY, dated, and points at a real Tour question", () => {
    for (const id of DEEP_IDS) {
      expect(GLOSSARY[id].deep, id).toBe(GLOSSARY_DEEP[id]);
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
