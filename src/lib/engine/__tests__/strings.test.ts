import { describe, expect, it } from "vitest";
import { mergeStrings, type DeepPartial } from "../strings";

/**
 * `mergeStrings` — the one merge of a type's overlay over the engine's strings (engine spec §21.8.1, A22 APP-3). It
 * runs in the island, on every render of an app's engine: what it must never do is touch the base, which every
 * render of every engine shares.
 *
 * Non-vacuity, measured on 2026-10-05 by sabotage, one at a time (tests that fall): the merge written into the base 3;
 * arrays merged item by item 1; a branch the overlay does not touch dropped 4; the overlay's leaf ignored 4; and under
 * `tsc`, `mergeStrings` inferring `T` from the overlay (no `NoInfer`) 6 errors, in `EngineWorkbench` and here.
 */

const base = {
  title: "Ton moteur",
  money: { mrr: "MRR", arr: "ARR, le MRR × 12", worthTitle: "Ce que vaut un nouveau client" },
  slideTitles: { total: "Deux moteurs", unit: "Un client rembourse son coût" },
  faq: [
    { q: "Envoyé ?", a: "Non." },
    { q: "Pourquoi ?", a: "Vérifiable." },
  ],
  count: 15,
};

/** Deep-freezes, so a write to the base throws in strict mode instead of passing unseen. */
function freeze<T>(value: T): T {
  if (value && typeof value === "object") {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

describe("mergeStrings", () => {
  it("replaces the leaves the overlay carries and keeps every other", () => {
    const merged = mergeStrings(base, { money: { mrr: "Revenu du mois" } });
    expect(merged.money).toEqual({ mrr: "Revenu du mois", arr: "ARR, le MRR × 12", worthTitle: "Ce que vaut un nouveau client" });
    expect(merged.slideTitles).toEqual(base.slideTitles);
    expect(merged.title).toBe("Ton moteur");
    expect(merged.count).toBe(15);
  });

  it("replaces a leaf at any depth, several branches at once", () => {
    const overlay: DeepPartial<typeof base> = {
      money: { worthTitle: "Ce que vaut une installation" },
      slideTitles: { unit: "Une installation rembourse son coût" },
    };
    const merged = mergeStrings(base, overlay);
    expect(merged.money.worthTitle).toBe("Ce que vaut une installation");
    expect(merged.money.mrr).toBe("MRR");
    expect(merged.slideTitles).toEqual({ total: "Deux moteurs", unit: "Une installation rembourse son coût" });
  });

  it("replaces an array whole, never item by item", () => {
    const merged = mergeStrings(base, { faq: [{ q: "Neuf ?", a: "Oui." }] });
    expect(merged.faq).toEqual([{ q: "Neuf ?", a: "Oui." }]);
    // The base's second item is gone, not kept behind the first: an array is one leaf.
    expect(merged.faq).toHaveLength(1);
  });

  it("returns the base for an empty overlay or none", () => {
    expect(mergeStrings(base, {})).toEqual(base);
    expect(mergeStrings(base, undefined)).toBe(base);
    expect(mergeStrings(base, { money: {} })).toEqual(base);
  });

  it("never mutates the base or the overlay — both are shared by every render", () => {
    const frozenBase = freeze(structuredClone(base));
    const overlay = freeze({ money: { mrr: "Revenu du mois" }, faq: [{ q: "Neuf ?", a: "Oui." }] });
    const baseBefore = JSON.stringify(frozenBase);
    const overlayBefore = JSON.stringify(overlay);
    const merged = mergeStrings(frozenBase, overlay);
    expect(JSON.stringify(frozenBase)).toBe(baseBefore);
    expect(JSON.stringify(overlay)).toBe(overlayBefore);
    // The merged tree is its own: writing to a branch it built leaves the base alone.
    expect(merged.money).not.toBe(frozenBase.money);
    expect(merged).not.toBe(frozenBase);
  });

  it("shares the branches the overlay does not touch, and builds only the ones it does", () => {
    const merged = mergeStrings(base, { money: { mrr: "Revenu du mois" } });
    expect(merged.slideTitles).toBe(base.slideTitles);
    expect(merged.faq).toBe(base.faq);
    expect(merged.money).not.toBe(base.money);
  });

  it("ignores a key the base lacks rather than growing the tree (the type forbids it, a test holds it)", () => {
    const stray = { money: { mrr: "Revenu", nowhere: "x" }, elsewhere: "y" } as unknown as DeepPartial<typeof base>;
    const merged = mergeStrings(base, stray);
    expect("elsewhere" in merged).toBe(false);
    expect("nowhere" in merged.money).toBe(false);
    expect(merged.money.mrr).toBe("Revenu");
  });
});
