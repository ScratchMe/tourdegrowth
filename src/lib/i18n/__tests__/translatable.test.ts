import { describe, expect, expectTypeOf, it } from "vitest";
import { resolveTree, tc, type DeepPartialTranslatable, type Resolved } from "../translatable";

describe("tc", () => {
  it("picks the requested language", () => {
    expect(tc({ en: "Start", fr: "Commencer" }, "fr")).toBe("Commencer");
    expect(tc({ en: "Start", fr: "Commencer" }, "en")).toBe("Start");
  });
});

describe("resolveTree (engine spec §4.4)", () => {
  const tree = {
    title: { en: "Your growth engine", fr: "Ton moteur de growth" },
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
      title: "Ton moteur de growth",
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

// Non-vacuity, measured on 2026-10-05: `DeepPartialTranslatable` letting a half leaf through (`Partial<Translatable>`) is 4
// `tsc` errors, among them the two `@ts-expect-error` lines below going unused. `resolveTree` has no sabotage of its own:
// it is the function the full-tree tests above already hold, and the partial tree goes through the same walk.
describe("resolveTree on a partial tree — an overlay (engine spec §21.8.1, A22 APP-3)", () => {
  type Full = {
    title: { en: string; fr: string };
    nested: { deep: { en: string; fr: string }; other: { en: string; fr: string } };
    faq: { q: { en: string; fr: string }; a: { en: string; fr: string } }[];
  };
  // Only one leaf of `nested`, nothing of `title`, the whole of `faq`: the shape of an overlay on `Full`.
  const overlay: DeepPartialTranslatable<Full> = {
    nested: { deep: { en: "Deeper", fr: "Plus profond" } },
    faq: [{ q: { en: "Kept?", fr: "Gardé ?" }, a: { en: "Yes.", fr: "Oui." } }],
  };

  it("resolves the leaves it carries and adds no key — a branch left out stays out", () => {
    expect(resolveTree(overlay, "fr")).toEqual({
      nested: { deep: "Plus profond" },
      faq: [{ q: "Gardé ?", a: "Oui." }],
    });
    const en = resolveTree(overlay, "en");
    expect(Object.keys(en).sort()).toEqual(["faq", "nested"]);
    expect(Object.keys(en.nested ?? {})).toEqual(["deep"]);
    expect("title" in en).toBe(false);
  });

  it("types an overlay by the full tree: a leaf is a whole { en, fr }, a branch may be missing", () => {
    expectTypeOf<DeepPartialTranslatable<Full>>().toHaveProperty("title");
    expectTypeOf(overlay.title).toEqualTypeOf<{ en: string; fr: string } | undefined>();
    expectTypeOf(overlay.nested?.other).toEqualTypeOf<{ en: string; fr: string } | undefined>();
    // @ts-expect-error a half leaf is no leaf: both languages or none
    const half: DeepPartialTranslatable<Full> = { title: { fr: "Seulement" } };
    expect(half).toBeDefined();
    // @ts-expect-error a key the full tree lacks is an orphan
    const orphan: DeepPartialTranslatable<Full> = { nowhere: { en: "x", fr: "x" } };
    expect(orphan).toBeDefined();
  });
});
