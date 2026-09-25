import { describe, expect, expectTypeOf, it } from "vitest";
import { resolveTree, tc, type Resolved } from "../translatable";

describe("tc", () => {
  it("picks the requested language", () => {
    expect(tc({ en: "Start", fr: "Commencer" }, "fr")).toBe("Commencer");
    expect(tc({ en: "Start", fr: "Commencer" }, "en")).toBe("Start");
  });
});

describe("resolveTree (engine spec §4.4)", () => {
  const tree = {
    title: { en: "Your growth engine", fr: "Ton moteur de croissance" },
    nested: {
      deep: { en: "Deep", fr: "Profond" },
      count: 15,
      open: false,
      nothing: null,
      raw: "untranslated id",
    },
    faq: [
      { q: { en: "Sent anywhere?", fr: "Envoyé ?" }, a: { en: "No.", fr: "Non." } },
      { q: { en: "Why counts?", fr: "Pourquoi des comptes ?" }, a: { en: "Checkable.", fr: "Vérifiable." } },
    ],
    list: [{ en: "one", fr: "un" }, { en: "two", fr: "deux" }],
  };

  it("replaces every { en, fr } leaf by the chosen language, at any depth, arrays included", () => {
    expect(resolveTree(tree, "fr")).toEqual({
      title: "Ton moteur de croissance",
      nested: { deep: "Profond", count: 15, open: false, nothing: null, raw: "untranslated id" },
      faq: [
        { q: "Envoyé ?", a: "Non." },
        { q: "Pourquoi des comptes ?", a: "Vérifiable." },
      ],
      list: ["un", "deux"],
    });
    expect(resolveTree(tree, "en").faq[1]?.q).toBe("Why counts?");
  });

  it("never mutates the tree it reads — content modules are shared by every render", () => {
    const before = JSON.stringify(tree);
    resolveTree(tree, "fr");
    resolveTree(tree, "en");
    expect(JSON.stringify(tree)).toBe(before);
  });

  it("leaves no French in an English tree and no English in a French one", () => {
    const english = JSON.stringify(resolveTree(tree, "en"));
    for (const fr of ["Profond", "Non.", "deux"]) expect(english).not.toContain(fr);
    const french = JSON.stringify(resolveTree(tree, "fr"));
    for (const en of ["Deep", "No.", "two"]) expect(french).not.toContain(en);
  });

  it("types a leaf as string and keeps everything else's shape", () => {
    const resolved = resolveTree(tree, "en");
    expectTypeOf(resolved.title).toEqualTypeOf<string>();
    expectTypeOf(resolved.nested.count).toEqualTypeOf<number>();
    expectTypeOf(resolved.faq).toEqualTypeOf<{ q: string; a: string }[]>();
    expectTypeOf<Resolved<{ en: string; fr: string }[]>>().toEqualTypeOf<string[]>();
  });
});
