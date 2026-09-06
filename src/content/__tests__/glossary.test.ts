import { describe, expect, it } from "vitest";
import { GLOSSARY, type GlossaryTermId } from "../glossary";

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

  it("every entry has 2-3 related terms — enough for real internal linking, not a token single link", () => {
    for (const id of ALL_IDS) {
      expect(GLOSSARY[id].related.length, id).toBeGreaterThanOrEqual(2);
      expect(GLOSSARY[id].related.length, id).toBeLessThanOrEqual(3);
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
