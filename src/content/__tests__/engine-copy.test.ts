import { describe, expect, it } from "vitest";
import { ENGINE_COPY } from "../engine-copy";
import { CANDIDATE_IDS } from "@/lib/engine/catalog-shape";
import type { SlideTitleKey } from "@/lib/engine/types";
import { PILLARS } from "@/lib/scoring/pillars";
import type { Translatable } from "@/lib/i18n/translatable";
import { LOCALES, type Locale } from "@/lib/i18n/locale";
import { fillTemplate, glyphOffenders, placeholdersOf } from "./engine-test-helpers";

/**
 * The growth engine's interface copy (engine spec §14, content PR P3).
 *
 * Templates are filled on the client with values `lib/engine/format.ts` has
 * already formatted, by code written in other PRs (P1 computes, P6 builds the
 * slides). So what this file pins is the CONTRACT between the copy and that
 * code — the same placeholders in both languages, the exact set each slide
 * title receives — plus the rules a template alone must keep: glyphs a slide
 * can print, the red accent, French that never needs an elision it can't
 * make, and a voice that never speaks to the reader on a slide their
 * leadership meeting will read.
 */

type Pair = [path: string, value: Translatable];

/** Every `{ fr, en }` leaf under `node`, with its dotted path. */
function pairs(node: unknown, path = ""): Pair[] {
  if (!node || typeof node !== "object") return [];
  const record = node as Record<string, unknown>;
  if (typeof record.fr === "string" && typeof record.en === "string") return [[path, record as unknown as Translatable]];
  return Object.entries(record).flatMap(([k, v]) => pairs(v, path ? `${path}.${k}` : k));
}

const ALL = pairs(ENGINE_COPY);
const under = (...prefixes: string[]) => ALL.filter(([p]) => prefixes.some((x) => p === x || p.startsWith(`${x}.`)));

describe("keys the code reads by id", () => {
  it("names the five stages, untranslated, « Retention » without an accent (copy review §2)", () => {
    expect(Object.keys(ENGINE_COPY.stages).sort()).toEqual([...PILLARS].sort());
    for (const [, name] of Object.entries(ENGINE_COPY.stages)) expect(name.fr).toBe(name.en);
    expect(ENGINE_COPY.stages.retention.fr).toBe("Retention");
  });

  it("gives every candidate a subject phrase, lower-case, since no template starts a sentence with it", () => {
    expect(Object.keys(ENGINE_COPY.subject).sort()).toEqual([...CANDIDATE_IDS].sort());
    for (const phrase of Object.values(ENGINE_COPY.subject))
      for (const l of LOCALES) expect(phrase[l], phrase[l]).toMatch(/^[a-zà-ÿ]/);
  });

  it("offers a static fill for each of the catalogue's five placeholders", () => {
    expect(Object.keys(ENGINE_COPY.page.catalogueFill).sort()).toEqual(["cohort", "event", "month", "n", "variant"]);
  });

  it("asks five FAQ questions, each answered in both languages", () => {
    expect(ENGINE_COPY.faq).toHaveLength(5);
    for (const { q, a } of ENGINE_COPY.faq) for (const l of LOCALES) expect(q[l].trim() && a[l].trim()).toBeTruthy();
  });
});

describe("placeholders", () => {
  it("has strings to check — otherwise every test below proves nothing", () => {
    expect(ALL.length).toBeGreaterThan(300);
  });

  it("carries the same placeholders in both languages, everywhere", () => {
    const mismatched = ALL.filter(([, t]) => placeholdersOf(t.fr).join() !== placeholdersOf(t.en).join()).map(
      ([p, t]) => `${p}: fr [${placeholdersOf(t.fr)}] en [${placeholdersOf(t.en)}]`,
    );
    expect(mismatched).toEqual([]);
  });

  it("never asks a singular form (`xOne`) for a value its general form does not take", () => {
    const strays: string[] = [];
    // `whatIf.lessThanOne` ends in "One" but is not a singular form: only keys with a general sibling are pairs.
    const singulars = ALL.flatMap(([path, one]) => {
      const general = path.endsWith("One") ? ALL.find(([p]) => p === path.slice(0, -"One".length)) : undefined;
      return general ? [[path, one, general[1]] as const] : [];
    });
    expect(singulars.length).toBeGreaterThanOrEqual(10);
    for (const [path, one, general] of singulars)
      for (const p of placeholdersOf(one.en)) if (!placeholdersOf(general.en).includes(p)) strays.push(`${path}: {${p}}`);
    expect(strays).toEqual([]);
  });

  /**
   * The values the slide builder provides for each title (engine spec §9.3).
   * Exact sets, not subsets: a title that stops using a value the deck
   * computes is as much a contract change as one that needs a new value.
   */
  const TITLE_CONTRACT: Record<SlideTitleKey, string[]> = {
    pelotonComplete: ["a", "p", "r"],
    pelotonGap: ["clauses", "stages"],
    pelotonGapOne: ["clauses", "stages"],
    pelotonTailBreak: ["clauses", "stages"],
    pelotonTailBreakOne: ["clauses", "stages"],
    pelotonEmpty: [],
    leakClearMrrNew: ["amount", "stage", "target"],
    leakClearMrrRetained: ["amount", "stage", "target"],
    leakClearCustomers: ["n", "stage", "target"],
    leakClearPerHundred: ["n", "stage", "target"],
    leakShared: ["list", "n"],
    leakNotEnoughBelow: ["stage"],
    leakLevel: [],
    visibility: ["N", "k", "n", "repair"],
    visibilityOne: ["N", "n", "repair"],
    visibilityAllDocumented: ["N"],
    unitEconomics: ["m", "x"],
    unitEconomicsUnknown: ["input"],
    mirror: ["k", "m"],
    ask: ["current", "horizon", "metric", "target", "what"],
    askMeasureFirst: ["cost", "metric"],
    annex: [],
  };

  it("gives each slide title exactly the values the slide builder provides (§9.3)", () => {
    const titles = ENGINE_COPY.slideTitles as Record<SlideTitleKey, Translatable>;
    expect(Object.keys(titles).sort()).toEqual(Object.keys(TITLE_CONTRACT).sort());
    for (const key of Object.keys(TITLE_CONTRACT) as SlideTitleKey[])
      for (const l of LOCALES) expect(placeholdersOf(titles[key][l]), `${key}.${l}`).toEqual([...TITLE_CONTRACT[key]].sort());
  });

  /** Plausible worst cases, formatted as `format.ts` would, in each language. */
  const SAMPLE: Record<Locale, Record<string, string>> = {
    fr: {
      a: "18", r: "9 à 12", p: "6 à 9",
      clauses: "18 atteignent la première valeur et 6 à 9 paient",
      stages: "la rétention à J30 et la conversion en payant",
      stage: "la part des inscrits recommandés",
      target: "20 % (bas de l'ordre de grandeur couramment cité)",
      amount: "~12 000 à 18 000 €", n: "12", list: "le taux d'inscription, l'activation et la rétention à J30",
      N: "15", k: "4", repair: "entre une réunion et un trimestre", m: "14 à 19 mois", x: "2,5 à 3,1 fois",
      input: "la marge brute", what: "80 000 € et deux personnes pendant un trimestre",
      metric: "Taux d'activation", current: "18 %", horizon: "T2 2027", cost: "un sprint",
    },
    en: {
      a: "18", r: "9–12", p: "6–9",
      clauses: "18 reach first value and 6–9 pay",
      stages: "day-30 retention and paid conversion",
      stage: "the referred share of sign-ups",
      target: "20% (low end of the commonly cited range)",
      amount: "~€12,000–18,000", n: "12", list: "the sign-up rate, activation and day-30 retention",
      N: "15", k: "4", repair: "between a meeting and a quarter", m: "14–19 months", x: "2.5–3.1×",
      input: "gross margin", what: "€80,000 and two people for a quarter",
      metric: "Activation rate", current: "18%", horizon: "Q2 2027", cost: "a sprint",
    },
  };

  it.each(LOCALES)("fills every slide title completely, and none runs past 200 characters (%s)", (locale) => {
    for (const [key, t] of Object.entries(ENGINE_COPY.slideTitles)) {
      const filled = fillTemplate(t[locale], SAMPLE[locale]).replace(/\*\*/g, "");
      expect(filled, key).not.toMatch(/[{}]/);
      expect(filled.length, `${key}: ${filled}`).toBeLessThanOrEqual(200);
    }
  });

  it("never writes « de {month} » in French — a month may start with a vowel, and a template cannot elide", () => {
    const offenders = ALL.filter(([, t]) => /\b(de|du|d['’])\s?\{(month|cohort|next)\}/.test(t.fr)).map(
      ([p, t]) => `${p}: ${t.fr}`,
    );
    expect(offenders).toEqual([]);
  });
});

describe("the slides", () => {
  it("marks the red accent with balanced `**`, two spans at most, and only in slide titles", () => {
    for (const [path, t] of ALL) {
      for (const l of LOCALES) {
        const marks = t[l].match(/\*\*/g)?.length ?? 0;
        if (!path.startsWith("slideTitles.")) {
          expect(marks, `${path}.${l}`).toBe(0);
          continue;
        }
        expect(marks % 2, `${path}.${l} is unbalanced`).toBe(0);
        expect(marks / 2, `${path}.${l}`).toBeLessThanOrEqual(2);
      }
    }
  });

  /** Every section a slide, its notes or its text export can print (§9.1-§9.4). */
  const SLIDE_REACHABLE = [
    "slideTitles", "slide", "notes", "findings", "peloton", "whatIf", "diagnosis", "mirror", "subject", "stages",
    "units", "grammar", "tools", "role", "repair", "cause", "status", "basis", "ask",
  ];

  it("stays inside the three fonts: no arrow, no ≈, no U+2212, no superscript (§10.4)", () => {
    const offenders = under(...SLIDE_REACHABLE).flatMap(([p, t]) =>
      LOCALES.flatMap((l) => glyphOffenders(t[l]).map((ch) => `${p}.${l}: ${ch}`)),
    );
    expect(offenders).toEqual([]);
  });

  it("never uses the narrow no-break space or « ≈ » anywhere, screen included", () => {
    const offenders = ALL.filter(([, t]) => LOCALES.some((l) => /[ ≈]/.test(t[l]))).map(([p]) => p);
    expect(offenders).toEqual([]);
  });

  /**
   * On screen the page says « tu ». A slide is presented by the reader to
   * their leadership meeting: it says « nous » / « on », and never « ta
   * cible » — whose target would that be, read out in the room?
   */
  it("never addresses the reader on a slide", () => {
    const onSlide = [
      ...under("slideTitles", "slide", "notes"),
      ...under("peloton").filter(([p]) => /clause|unmeasured/.test(p)),
      ...under("whatIf").filter(([p]) => !/title|slider|multiplication|notForecast/.test(p)),
    ];
    const offenders = onSlide.flatMap(([p, t]) => [
      // Letter boundaries, not \b: « coûte » must not read as « te » after a non-ASCII « û ».
      ...(/(?<!\p{L})(tu|te|toi|ton|ta|tes)(?!\p{L})/iu.test(t.fr) ? [`${p}.fr: ${t.fr}`] : []),
      ...(/\b(you|your)\b/i.test(t.en) ? [`${p}.en: ${t.en}`] : []),
    ]);
    expect(onSlide.length).toBeGreaterThan(40);
    expect(offenders).toEqual([]);
  });
});

describe("words", () => {
  it("never calls the engine a « diagnostic » — the word belongs to the Tour", () => {
    expect(ALL.filter(([, t]) => LOCALES.some((l) => /diagnos/i.test(t[l]))).map(([p]) => p)).toEqual([]);
  });

  it("says « étape », never « pilier », and never « goulot » / \"bottleneck\"", () => {
    const offenders = ALL.filter(([, t]) => /pilier|goulot/i.test(t.fr) || /pillar|bottleneck/i.test(t.en)).map(([p]) => p);
    expect(offenders).toEqual([]);
  });

  it("says « slides » in French, never « deck »", () => {
    expect(ALL.filter(([, t]) => /\bdeck\b/i.test(t.fr)).map(([p]) => p)).toEqual([]);
  });

  it("writes « Deep dive » as the product's proper noun wherever it names it", () => {
    const offenders = ALL.filter(([, t]) => LOCALES.some((l) => /deep[- ]?dive/i.test(t[l]) && !/Deep dive/.test(t[l]))).map(
      ([p]) => p,
    );
    expect(offenders).toEqual([]);
  });

  it("leaves no string empty, and the two languages are not one sentence left untranslated", () => {
    for (const [p, t] of ALL) for (const l of LOCALES) expect(t[l], `${p}.${l}`).not.toBe("");
    // Tool names, stage names and the domain are legitimately identical; a sentence isn't.
    const same = ALL.filter(([p, t]) => !p.startsWith("tools.") && t.fr === t.en && /[a-z]{4,}\s+[a-z]{4,}/i.test(t.fr)).map(
      ([p]) => p,
    );
    expect(same).toEqual([]);
  });
});

describe("lengths", () => {
  it("keeps the page's title and description inside what a results page shows", () => {
    for (const l of LOCALES) {
      expect(ENGINE_COPY.meta.title[l].length).toBeLessThanOrEqual(60);
      const d = ENGINE_COPY.meta.description[l].length;
      expect(d).toBeGreaterThanOrEqual(70);
      expect(d).toBeLessThanOrEqual(160);
    }
  });

  it("keeps each FAQ answer to a paragraph", () => {
    for (const { a } of ENGINE_COPY.faq) for (const l of LOCALES) expect(a[l].length, a[l]).toBeLessThanOrEqual(400);
  });

  it("keeps button labels short enough for one line on a phone", () => {
    const buttons: Pair[] = [
      ...under("actions", "collect.fill", "resume.continue", "erase.confirm", "io.replace", "io.cancel"),
      ...under("request.copy", "request.copyGroup", "request.copied", "request.remind"),
      ...under("deck.png", "deck.pngHd", "deck.copyImage", "deck.pdf", "deck.copyText", "deck.textCopied"),
      ...under("sheet.save", "sheet.close", "sheet.haveIt", "sheet.canEstimate", "sheet.willAsk", "sheet.cantFind"),
      ...under("page.cta", "page.tourFirst", "setup.start", "setup.tourLink"),
    ];
    expect(buttons.length).toBeGreaterThan(20);
    const long = buttons.flatMap(([p, t]) =>
      LOCALES.filter((l) => fillTemplate(t[l], { n: "12" }).length > 40).map((l) => `${p}.${l}: ${t[l]}`),
    );
    expect(long).toEqual([]);
  });
});
