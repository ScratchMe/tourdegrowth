import { describe, expect, it } from "vitest";
import { ENGINE_CATALOG, ENGINE_DERIVED_CATALOG } from "../engine-catalog";
import { ENGINE_COPY } from "../engine-copy";
import { GLOSSARY } from "../glossary";
import { GLOSSARY_DEEP } from "../glossary-deep";
import { GLOSSARY_TERMS, type GlossaryTermId } from "../glossary-terms";
import {
  DERIVED_SHAPES,
  LTV_CAP_MONTHS,
  METRIC_SHAPES,
  TEXT_LIMITS,
  type Benchmark,
} from "@/lib/engine/catalog-shape";
import type { Translatable } from "@/lib/i18n/translatable";
import { LOCALES, type Locale } from "@/lib/i18n/locale";
import { fillTemplate, glyphOffenders, placeholdersOf } from "./engine-test-helpers";

/**
 * The growth engine's catalogue prose (engine spec §5, content PR P3).
 *
 * The shape ↔ prose id match, the closed-list labels and "a caveat next to
 * every reference" are pinned by `lib/engine/__tests__/catalog-shape.test.ts`
 * (P0). This file pins what the PROSE promises on top of that: that its
 * references never drift from the approved glossary, that everything a slide
 * can print stays inside the three fonts, that its placeholders are the five
 * the consumers fill, and that French never needs an elision a template
 * cannot make.
 */

const entries = Object.entries(ENGINE_CATALOG) as [keyof typeof ENGINE_CATALOG, (typeof ENGINE_CATALOG)[keyof typeof ENGINE_CATALOG]][];
const derived = Object.entries(ENGINE_DERIVED_CATALOG) as [
  keyof typeof ENGINE_DERIVED_CATALOG,
  (typeof ENGINE_DERIVED_CATALOG)[keyof typeof ENGINE_DERIVED_CATALOG],
][];

/** Every string on one language side of a tree of `{ fr, en }` pairs. */
function side(tree: unknown, locale: Locale, out: string[] = []): string[] {
  if (typeof tree === "string") return out;
  if (!tree || typeof tree !== "object") return out;
  const record = tree as Record<string, unknown>;
  if (typeof record.fr === "string" && typeof record.en === "string") {
    out.push(record[locale] as string);
    return out;
  }
  for (const child of Object.values(record)) side(child, locale, out);
  return out;
}

/**
 * The WHOLE approved glossary entry of a term, in one language: its popover
 * definition, its "In practice" text and its long page. A reference may be
 * restated anywhere in it; matching one field only would fail the day a
 * sentence moves between two sections without changing a word.
 */
function glossaryText(term: GlossaryTermId, locale: Locale): string {
  return [
    ...side(GLOSSARY_TERMS[term], locale),
    ...side(GLOSSARY[term], locale),
    ...side(GLOSSARY_DEEP[term], locale),
  ].join("\n");
}

/** A number as each language writes it: « 0,15 » in French, "0.15" in English. */
function written(n: number, locale: Locale): string {
  return locale === "fr" ? String(n).replace(".", ",") : String(n);
}

/** Positions of `token` as a whole number — "5" must not match inside "15" or "0.5". */
function tokenPositions(text: string, token: string): number[] {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(?<![\\d.,])${escaped}(?![\\d]|[.,]\\d)`, "g");
  return [...text.matchAll(re)].map((m) => m.index);
}

/** The two bounds, lower first, close enough to be the same sentence. */
function restates(text: string, benchmark: Benchmark, locale: Locale): boolean {
  if (benchmark.lo === benchmark.hi) {
    // The only equal pair is LTV:CAC, which the glossary writes as a ratio.
    return tokenPositions(text, `${written(benchmark.lo, locale)}:1`).length > 0;
  }
  const los = tokenPositions(text, written(benchmark.lo, locale));
  const his = tokenPositions(text, written(benchmark.hi, locale));
  return los.some((lo) => his.some((hi) => hi > lo && hi - lo <= 120));
}

describe("references never drift from the approved glossary", () => {
  const withBenchmark = [
    ...METRIC_SHAPES.filter((s) => s.benchmark).map((s) => [s.id, s.benchmark!] as const),
    ...DERIVED_SHAPES.filter((s) => s.benchmark).map((s) => [s.id, s.benchmark!] as const),
  ];

  it("has references to check — otherwise the next test proves nothing", () => {
    expect(withBenchmark.length).toBeGreaterThanOrEqual(7);
  });

  it.each(LOCALES)("restates every range, lower bound first, in the linked term's text (%s)", (locale) => {
    const drifted = withBenchmark
      .filter(([, b]) => !restates(glossaryText(b.term, locale), b, locale))
      .map(([id, b]) => `${id}: ${written(b.lo, locale)}-${written(b.hi, locale)} not found in glossary "${b.term}"`);
    expect(drifted).toEqual([]);
  });

  it.each(LOCALES)("only quotes, in a caveat or a 'no reference' reason, figures the glossary already prints (%s)", (locale) => {
    const offenders: string[] = [];
    const check = (id: string, text: Translatable | undefined, terms: GlossaryTermId[]) => {
      if (!text) return;
      const source = terms.map((t) => glossaryText(t, locale)).join("\n");
      for (const n of text[locale].match(/\d+(?:[.,]\d+)?/g) ?? []) {
        if (tokenPositions(source, n).length === 0) offenders.push(`${id}: "${n}" is not in ${terms.join(", ")}`);
      }
    };
    for (const [id, entry] of entries) {
      const shape = METRIC_SHAPES.find((s) => s.id === id)!;
      const terms = [shape.glossary, ...(shape.benchmark ? [shape.benchmark.term] : [])];
      check(id, entry.benchmarkCaveat, terms);
      check(id, entry.noReferenceReason, terms);
    }
    for (const [id, entry] of derived) {
      const shape = DERIVED_SHAPES.find((s) => s.id === id)!;
      check(id, entry.caveat, [shape.glossary, ...(shape.benchmark ? [shape.benchmark.term] : [])]);
    }
    expect(offenders).toEqual([]);
  });

  it("writes the LTV cap with the constant the calculation uses", () => {
    const ltv = ENGINE_DERIVED_CATALOG["rev.ltv"];
    for (const locale of LOCALES) {
      expect(ltv.formula[locale]).toContain(String(LTV_CAP_MONTHS));
      expect(ltv.capNote?.[locale]).toContain(String(LTV_CAP_MONTHS));
      expect(ENGINE_COPY.slide.unitCap[locale]).toContain(String(LTV_CAP_MONTHS));
    }
  });
});

describe("placeholders", () => {
  /** What every consumer of the catalogue fills (`ResolvedMetric`, spec §4.4). */
  const FILLED = new Set(["month", "cohort", "n", "event", "variant"]);

  const allPairs = (): [string, Translatable][] => {
    const out: [string, Translatable][] = [];
    const walk = (node: unknown, path: string) => {
      if (!node || typeof node !== "object") return;
      const record = node as Record<string, unknown>;
      if (typeof record.fr === "string" && typeof record.en === "string") {
        out.push([path, record as unknown as Translatable]);
        return;
      }
      for (const [k, v] of Object.entries(record)) walk(v, path ? `${path}.${k}` : k);
    };
    walk(ENGINE_CATALOG, "");
    walk(ENGINE_DERIVED_CATALOG, "derived");
    return out;
  };

  it("uses only the five the consumers fill, plus {input} in the 'can't be computed' line", () => {
    const unknown = allPairs().flatMap(([path, t]) =>
      LOCALES.flatMap((l) =>
        placeholdersOf(t[l])
          .filter((p) => !FILLED.has(p) && !(p === "input" && path.endsWith(".uncomputable")))
          .map((p) => `${path}.${l}: {${p}}`),
      ),
    );
    expect(unknown).toEqual([]);
  });

  it("carries the same placeholders in both languages", () => {
    const mismatched = allPairs()
      .filter(([, t]) => placeholdersOf(t.fr).join() !== placeholdersOf(t.en).join())
      .map(([path]) => path);
    expect(mismatched).toEqual([]);
  });

  it("leaves no brace behind once the static page fills them (visual.static*)", () => {
    for (const locale of LOCALES) {
      const v = ENGINE_COPY.visual;
      // The same five slots `lib/engine/phrases.ts#staticCatalogueValues` fills on the static page.
      const values = {
        event: v.staticEvent[locale],
        n: v.staticWindow[locale],
        cohort: v.staticCohort[locale],
        month: v.staticMonth[locale],
        variant: v.staticVariant[locale],
      };
      for (const [path, t] of allPairs()) {
        if (path.endsWith(".uncomputable")) continue;
        expect(fillTemplate(t[locale], values), path).not.toMatch(/[{}]/);
      }
    }
  });

  it("never writes « de {month} » in French — a month may start with a vowel, and a template cannot elide", () => {
    const offenders = allPairs()
      .filter(([, t]) => /\b(de|du|d['’])\s?\{(month|cohort)\}/.test(t.fr))
      .map(([path, t]) => `${path}: ${t.fr}`);
    expect(offenders).toEqual([]);
  });
});

describe("what a slide can print (spec §10.4)", () => {
  /**
   * The fields that reach a slide: the annex prints name, formula and window;
   * the unit-economics slide the CAC variant; the leak slide's footer the
   * caveat; the visibility slide the not-applicable reasons. `where.path`
   * and `trap` are screen-only and may keep a "›".
   */
  const slideFields = (): [string, Translatable][] => {
    const out: [string, Translatable][] = [];
    for (const [id, e] of entries) {
      out.push([`${id}.name`, e.name], [`${id}.formula`, e.formula]);
      if (e.inputs) out.push([`${id}.inputs.numerator`, e.inputs.numerator], [`${id}.inputs.denominator`, e.inputs.denominator]);
      if (e.benchmarkCaveat) out.push([`${id}.benchmarkCaveat`, e.benchmarkCaveat]);
      if (e.noReferenceReason) out.push([`${id}.noReferenceReason`, e.noReferenceReason]);
      for (const key of ["variants", "naReasons", "choices"] as const)
        for (const item of e[key] ?? []) out.push([`${id}.${key}.${item.id}`, item.label]);
    }
    for (const [id, e] of derived) for (const [k, v] of Object.entries(e)) out.push([`${id}.${k}`, v as Translatable]);
    return out;
  };

  it("stays inside the three fonts: Latin-1 plus – — ’ « » … € · × ÷ ±, no arrow, no ≈, no U+2212", () => {
    const offenders = slideFields().flatMap(([path, t]) =>
      LOCALES.flatMap((l) => glyphOffenders(t[l]).map((ch) => `${path}.${l}: ${ch}`)),
    );
    expect(offenders).toEqual([]);
  });
});

describe("the prose itself", () => {
  it("is written in both languages, and the two are never the same sentence left untranslated", () => {
    const untranslated: string[] = [];
    for (const [id, e] of entries) {
      for (const [field, t] of [["oneLiner", e.oneLiner], ["trap", e.trap], ["request", e.request]] as const) {
        for (const l of LOCALES) expect(t[l].trim(), `${id}.${field}.${l}`).not.toBe("");
        if (t.fr === t.en) untranslated.push(`${id}.${field}`);
      }
    }
    expect(untranslated).toEqual([]);
  });

  it("names, for every place to look, a tool the shape lists as a source — or a role", () => {
    const strays: string[] = [];
    for (const [id, e] of entries) {
      const shape = METRIC_SHAPES.find((s) => s.id === id)!;
      for (const w of e.where) if (w.source.kind === "tool" && !shape.sources.includes(w.source.tool)) strays.push(`${id}: ${w.source.tool}`);
    }
    expect(strays).toEqual([]);
  });

  it("keeps each field short enough for where it is shown", () => {
    const too: string[] = [];
    const cap = (path: string, t: Translatable | undefined, max: number) => {
      if (!t) return;
      for (const l of LOCALES) if (t[l].length > max) too.push(`${path}.${l}: ${t[l].length} > ${max}`);
    };
    for (const [id, e] of entries) {
      cap(`${id}.name`, e.name, TEXT_LIMITS.label); // a stage row and an annex cell
      cap(`${id}.oneLiner`, e.oneLiner, 110);
      cap(`${id}.formula`, e.formula, 140);
      cap(`${id}.trap`, e.trap, 200);
      cap(`${id}.request`, e.request, 160); // one bullet of a copied message
      cap(`${id}.benchmarkCaveat`, e.benchmarkCaveat, 160); // the leak slide's footer
      cap(`${id}.noReferenceReason`, e.noReferenceReason, 160);
      if (e.inputs) {
        cap(`${id}.inputs.numerator`, e.inputs.numerator, 48);
        cap(`${id}.inputs.denominator`, e.inputs.denominator, 48);
      }
      for (const w of e.where) {
        cap(`${id}.where.label`, w.label, 60);
        cap(`${id}.where.path`, w.path, 180);
      }
      for (const key of ["variants", "naReasons", "choices"] as const)
        for (const item of e[key] ?? []) cap(`${id}.${key}.${item.id}`, item.label, TEXT_LIMITS.label);
    }
    expect(too).toEqual([]);
  });

  it("never calls the engine a « diagnostic », and says « étape », never « pilier »", () => {
    const offenders = [...side(ENGINE_CATALOG, "fr"), ...side(ENGINE_DERIVED_CATALOG, "fr")]
      .filter((s) => /diagnos|pilier/i.test(s))
      .concat([...side(ENGINE_CATALOG, "en"), ...side(ENGINE_DERIVED_CATALOG, "en")].filter((s) => /diagnos|pillar/i.test(s)));
    expect(offenders).toEqual([]);
  });
});
