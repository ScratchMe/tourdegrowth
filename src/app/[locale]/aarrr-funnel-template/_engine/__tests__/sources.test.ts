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
    expect(moneyUnit("EUR", "fr")).toMatchObject({ suffix: "€" });
    expect(moneyUnit("GBP", "en").prefix).toBe("£");
    expect(moneyUnit("EUR", "en").suffix).toBeUndefined();
    expect(moneyUnit("EUR", "fr").prefix).toBeUndefined();
  });

  it("names the unit in words for a screen reader, in the page's language", () => {
    expect(moneyUnit("EUR", "en").unitName).toMatch(/euros/i);
    expect(moneyUnit("EUR", "fr").unitName).toMatch(/euros/i);
    expect(percentUnit("en").unitName).toMatch(/^per ?cent$/);
    expect(percentUnit("fr").unitName).toBe("pour cent");
    expect(wordUnit("jours")).toEqual({ suffix: "jours", unitName: "jours" });
  });

  it("writes « 30 % » with its no-break space in French, and 30% in English", () => {
    expect(percentUnit("fr").suffix).toBe("\u00a0%");
    expect(percentUnit("en").suffix).toBe("%");
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
