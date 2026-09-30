import { describe, expect, it } from "vitest";
import { METRIC_SHAPES } from "@/lib/engine/catalog-shape";
import { EN } from "@/lib/engine/__tests__/props";
import { moneyUnit, percentUnit, sourceOptions, wordUnit } from "../sources";

/**
 * Where a NumberField's unit goes, by language (design system extension 04,
 * NumberField's table): the sign inside the box, before the figure in
 * English and after it in French, and a word for screen readers — the sign
 * itself is hidden from them.
 */
describe("units", () => {
  it("puts the currency sign where the language writes it", () => {
    expect(moneyUnit("EUR", "en")).toMatchObject({ prefix: "€" });
    expect(moneyUnit("EUR", "fr")).toMatchObject({ suffix: "\u00a0€" });
    expect(moneyUnit("GBP", "en").prefix).toBe("£");
    expect(moneyUnit("EUR", "en").suffix).toBeUndefined();
    expect(moneyUnit("EUR", "fr").prefix).toBeUndefined();
  });

  /**
   * C28 (Antoine, 2026-09-30): the box adds no space between a figure and
   * its unit, so the unit string carries the one its language writes —
   * "€500" and "140%" in English, « 26 000 € » and « 20 % » with a no-break
   * space in French, "CHF 500" where Intl writes one. Non-vacuity: the
   * earlier moneyUnit returned a bare "€" in French and fails the second line.
   */
  it("carries the space its language writes between the figure and the sign, and no other", () => {
    expect(moneyUnit("EUR", "en").prefix).toBe("€");
    expect(moneyUnit("EUR", "fr").suffix).toBe("\u00a0€");
    expect(moneyUnit("CHF", "en").prefix).toBe("CHF\u00a0");
    expect(moneyUnit("CHF", "fr").suffix).toBe("\u00a0CHF");
    expect(percentUnit("en").suffix).toBe("%");
    expect(percentUnit("fr").suffix).toBe("\u00a0%");
    expect(wordUnit({ one: "jour", other: "jours" }, "fr", 3).suffix).toBe("\u00a0jours");
  });

  it("names the unit in words for a screen reader, in the page's language", () => {
    expect(moneyUnit("EUR", "en").unitName).toMatch(/euros/i);
    expect(moneyUnit("EUR", "fr").unitName).toMatch(/euros/i);
    expect(percentUnit("en").unitName).toMatch(/^per ?cent$/);
    expect(percentUnit("fr").unitName).toBe("pour cent");
    expect(wordUnit({ one: "jour", other: "jours" }, "fr", 3)).toEqual({ suffix: "\u00a0jours", unitName: "jours" });
  });

  /** A11.1: the engine's example estimates a duration from 1 to 3, and the low bound read « 1 jours ». */
  it("puts a duration's word in the number's grammatical number, as each language counts", () => {
    const fr = { one: "jour", other: "jours" };
    const en = { one: "day", other: "days" };
    expect(wordUnit(fr, "fr", 1).unitName).toBe("jour");
    expect(wordUnit(fr, "fr", 1.5).unitName).toBe("jour");
    expect(wordUnit(fr, "fr", 2).unitName).toBe("jours");
    expect(wordUnit(en, "en", 1).unitName).toBe("day");
    expect(wordUnit(en, "en", 0).unitName).toBe("days");
    expect(wordUnit(en, "en", 2).unitName).toBe("days");
    // An empty box is not one of anything.
    expect(wordUnit(en, "en", null).unitName).toBe("days");
  });
});

describe("the source list", () => {
  it("offers the usual tools first, then a person and « other », then every other tool under a heading", () => {
    const strings = EN.strings;
    const shape = METRIC_SHAPES.find((s) => s.id === "act.rate")!;
    const list = sourceOptions(shape, strings);
    const flat = list.filter((item) => "value" in item).map((item) => ("value" in item ? item.value : ""));
    expect(flat.slice(0, shape.sources.length)).toEqual(shape.sources.map((tool) => `tool:${tool}`));
    expect(flat.slice(shape.sources.length)).toEqual(["person", "other"]);
    const group = list.find((item) => "options" in item);
    expect(group && "options" in group ? group.options.length : 0).toBeGreaterThan(0);
  });
});
