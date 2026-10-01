import { describe, expect, it } from "vitest";
import { ENGINE_COPY } from "../engine-copy";
import { ALL_DERIVED_SHAPES, ALL_METRIC_SHAPES, CANDIDATE_IDS, SLG_CANDIDATE_IDS } from "@/lib/engine/catalog-shape";
import { hybridTrapOf } from "@/lib/engine/phrases";
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
    expect(Object.keys(ENGINE_COPY.subject).sort()).toEqual([...CANDIDATE_IDS, ...SLG_CANDIDATE_IDS].sort());
    for (const phrase of Object.values(ENGINE_COPY.subject))
      for (const l of LOCALES) expect(phrase[l], phrase[l]).toMatch(/^[a-zà-ÿ]/);
  });

  it("offers a static fill for each of the catalogue's six placeholders, month slots bracketed as blanks", () => {
    const v = ENGINE_COPY.visual;
    for (const slot of [v.staticCohort, v.staticMonth, v.staticPeriod]) for (const l of LOCALES) expect(slot[l]).toMatch(/^\[.+\]$/);
    for (const slot of [v.staticEvent, v.staticWindow, v.staticVariant]) for (const l of LOCALES) expect(slot[l].trim()).not.toBe("");
  });

  it("names the activation event as a whole noun phrase, the user's words quoted inside it", () => {
    for (const l of LOCALES) {
      expect(placeholdersOf(ENGINE_COPY.event.named[l])).toEqual(["name"]);
      expect(placeholdersOf(ENGINE_COPY.event.unnamed[l])).toEqual([]);
    }
    // French guillemets hug their content with a no-break space, never a plain one.
    expect(ENGINE_COPY.event.named.fr).toMatch(/«\u00a0\{name\}\u00a0»/);
  });

  it("gives every input a derived number can lack an article-ful phrase (« Il manque la marge brute »)", () => {
    const inputs = [...new Set(ALL_DERIVED_SHAPES.flatMap((d) => d.inputs))].sort();
    expect(Object.keys(ENGINE_COPY.unitInput).sort()).toEqual(inputs);
    for (const phrase of Object.values(ENGINE_COPY.unitInput)) expect(phrase.fr).toMatch(/^(le |la |les |l['’])/);
  });

  it("asks six FAQ questions, each answered in both languages — the sixth for a sales team (§18.7 E0)", () => {
    expect(ENGINE_COPY.faq).toHaveLength(6);
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
    pelotonComplete: ["activated", "d30", "paid"],
    pelotonGap: ["clauses", "stages"],
    pelotonGapOne: ["clauses", "stages"],
    pelotonTailBreak: ["clauses", "stages"],
    pelotonTailBreakOne: ["clauses", "stages"],
    pelotonEmpty: [],
    leakClearMrrNew: ["amount", "stage", "target"],
    leakClearMrrRetained: ["amount", "stage", "target"],
    leakClearCustomers: ["n", "stage", "target"],
    leakClearCustomersOne: ["n", "stage", "target"],
    leakClearKept: ["n", "stage", "target"],
    leakClearKeptOne: ["n", "stage", "target"],
    leakClearPerHundred: ["n", "stage", "target"],
    leakClearPerHundredOne: ["n", "stage", "target"],
    leakClearUnpriced: ["stage", "target", "value"],
    leakShared: ["list", "n"],
    leakNotEnoughBelow: ["side", "stage"],
    leakLevel: [],
    visibility: ["documented", "k", "repair"],
    visibilityOne: ["documented", "repair"],
    visibilityAllDocumented: ["N"],
    unitEconomics: ["m", "x"],
    unitEconomicsUnknown: ["input"],
    mirror: ["k", "m"],
    ask: ["goal", "what"],
    askPlain: ["what"],
    askMeasureFirst: ["cost", "metric"],
    annex: ["i", "n"],
    whatIfLever: ["from", "gain", "stage", "to"],
    whatIfLeverPlain: ["from", "stage", "to"],
    scenario: ["gain", "n"],
    scenarioPlain: ["n"],
    // Sales-assisted and the hybrid (A7.3.c S2, §18.8.2).
    total: ["plg", "slg", "total"],
    totalUnknown: ["motion"],
    totalUnknownBoth: [],
    slgPelotonComplete: ["r1", "r2", "r3"],
    slgPelotonGap: ["clauses", "stages"],
    slgPelotonGapOne: ["clauses", "stages"],
    slgPelotonTailBreak: ["clauses", "stages"],
    slgPelotonTailBreakOne: ["clauses", "stages"],
    slgPelotonEmpty: ["base"],
    slgLeakClearCustomers: ["n", "stage", "target"],
    slgLeakClearCustomersOne: ["n", "stage", "target"],
    slgLeakClearKept: ["n", "stage", "target"],
    slgLeakClearKeptOne: ["n", "stage", "target"],
    slgLeakClearPerHundred: ["stage", "target", "worth"],
    unitEconomicsBoth: ["plg", "slg"],
    unitEconomicsOneSidePlg: ["input", "m"],
    unitEconomicsOneSideSlg: ["input", "m"],
    unitEconomicsNoneMargins: [],
    unitEconomicsNoneDifferent: ["plg", "slg"],
    evolution: ["leak", "month", "n"],
    evolutionOne: ["leak", "month", "n"],
    evolutionStill: ["leak", "month"],
    evolutionApart: ["before", "now"],
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
      activated: "18 atteignent la première valeur", d30: "9 à 12 sont encore là à J30", paid: "6 à 9 paient",
      side: "peut-être au-dessus de la cible", documented: "11 chiffres sur 15",
      goal: "taux d'activation de 18 % à 25 % d'ici T2 2027",
      clauses: "18 atteignent la première valeur et 6 à 9 paient",
      stages: "la rétention à J30 et la conversion en payant",
      stage: "la part des inscrits recommandés",
      target: "20 % (cible de l'équipe)",
      amount: "~12 000 à 18 000 €", n: "12", list: "le taux d'inscription, l'activation et la rétention à J30",
      N: "15", k: "4", repair: "entre une réunion et un trimestre", m: "14 à 19 mois", x: "2,5 à 3,1 fois",
      input: "la marge brute", what: "80 000 € et deux personnes pendant un trimestre",
      metric: "Taux d'activation", current: "18 %", horizon: "T2 2027", cost: "un sprint",
      from: "6 à 9 %", to: "12 %", gain: "~12 000 à 18 000 €", i: "1", value: "4,5 à 6,5 %",
      total: "~228 000 à 241 000 €", plg: "~116 000 à 123 000 €", slg: "~112 000 à 118 000 €", motion: "du libre-service",
      r1: "Sur 100 MQL, 12 à 15 deviennent une opportunité", r2: "sur 100 opportunités conclues, 22 à 26 sont signées",
      r3: "sur 100 nouveaux clients, 55 à 60 sont en production à 90 jours", base: "MQL",
      worth: "3 opportunités de plus pour 100 leads", known: "libre-service", other: "assisté",
      month: "juillet 2026", leak: "\u00a0; l'activation reste la fuite", before: "juillet 2026", now: "août 2026",
    },
    en: {
      activated: "18 reach first value", d30: "9–12 are still active at day 30", paid: "6–9 pay",
      side: "possibly above the target", documented: "13 of 17 numbers",
      goal: "activation rate from 18% to 25% by Q2 2027",
      clauses: "18 reach first value and 6–9 pay",
      stages: "day-30 retention and paid conversion",
      stage: "the referred share of sign-ups",
      target: "20% (team target)",
      amount: "~€12,000–18,000", n: "12", list: "the sign-up rate, activation and day-30 retention",
      N: "15", k: "4", repair: "between a meeting and a quarter", m: "14–19 months", x: "2.5–3.1×",
      input: "gross margin", what: "€80,000 and two people for a quarter",
      metric: "Activation rate", current: "18%", horizon: "Q2 2027", cost: "a sprint",
      from: "6–9%", to: "12%", gain: "~€12,000–18,000", i: "1", value: "4.5–6.5%",
      total: "~€228,000–241,000", plg: "~€116,000–123,000", slg: "~€112,000–118,000", motion: "self-serve",
      r1: "Out of 100 MQLs, 12–15 become an opportunity", r2: "out of 100 closed opportunities, 22–26 are signed",
      r3: "out of 100 new customers, 55–60 are live within 90 days", base: "MQLs",
      worth: "3 more opportunities per 100 leads", known: "self-serve", other: "sales-assisted",
      month: "July 2026", leak: "; activation is still the leak", before: "July 2026", now: "August 2026",
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
    // A number's name too (A14 T5): « Expansion mensuelle », « Opportunités recommandées »…
    const offenders = ALL.filter(([, t]) => /\b(de|du|d['’])\s?\{(month|cohort|next|name|other)\}/.test(t.fr)).map(
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
    "side", "worth", "event", "unitInput", "source", "slgChain", "relays", "total", "hybrid", "pipeline",
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
      ...under("slideTitles", "slide", "notes", "side", "worth", "unitInput", "relays", "total", "hybrid.motionName", "hybrid.twoSegments"),
      // A14 T3.2: the three pipeline keys the relays' slide and its notes print (the board's own say « ton »).
      ...under("pipeline.coverage", "pipeline.coverageBelowSlide", "pipeline.previousNote"),
      ...under("peloton").filter(([p]) => /clause|unmeasured/.test(p)),
      ...under("whatIf").filter(([p]) => !/title|slider/.test(p)),
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
      ...under("sheet.save", "sheet.haveIt", "sheet.canEstimate", "sheet.willAsk", "sheet.cantFind"),
      ...under("page.cta", "page.tourFirst", "setup.startSteps", "setup.startBoard", "setup.tourLink"),
      ...under("steps.skipToSlg", "steps.skipToWhatIf", "sheet.companyWide"),
      ...under("engines.open", "engines.new", "engines.delete", "engines.deleteConfirm", "io.addApply", "io.mergeApply"),
      ...under("table.download", "table.read", "table.apply", "table.applyOne", "table.cancel"),
    ];
    expect(buttons.length).toBeGreaterThan(20);
    const long = buttons.flatMap(([p, t]) =>
      LOCALES.filter((l) => fillTemplate(t[l], { n: "12" }).length > 40).map((l) => `${p}.${l}: ${t[l]}`),
    );
    expect(long).toEqual([]);
  });
});

describe("an optional field", () => {
  /**
   * C29 (Antoine, 2026-09-30): « facultatif » is drawn by Field's `optional`
   * prop, quieter than the label, and never written inside a label at the
   * label's weight. Non-vacuity: the copy before C29 carried it in four
   * labels (companyLabel, definitionNote, target, repairComment).
   */
  it("says so with Field's `optional` word, never inside its label", () => {
    const inLabel = ALL.filter(([, v]) => /\((facultatif|optional)\)/i.test(v.fr) || /\((facultatif|optional)\)/i.test(v.en)).map(([p]) => p);
    expect(inLabel).toEqual([]);
    expect(ENGINE_COPY.workbench.optional).toEqual({ fr: "facultatif", en: "optional" });
  });
});

/**
 * « Deux moteurs, un total », never one against the other (engine spec
 * §18.6.4, A7.3.c S2). Non-vacuity, measured on 2026-10-01 by sabotage: see
 * the S2 entry of JOURNAL.md.
 */
describe("the hybrid never compares, and always reads self-serve first", () => {
  /** What the spec sweeps: the hybrid's own words, the total, and the slide titles that hold both motions. */
  const HYBRID = [
    ...under("hybrid", "total"),
    ...under("slideTitles").filter(([p]) => /^slideTitles\.(total|unitEconomics(Both|OneSide|None))/.test(p)),
  ];
  /** The fixed sentence says what the hybrid refuses: its negation is the one « contre » / "against" allowed. */
  const ALLOWED = ["chacune se lit contre ses cibles, pas contre l'autre", "each is read against its own targets, not against the other"];
  const COMPARATIVE: Record<Locale, RegExp> = {
    fr: /\b(vs|versus)\b|contre|face à|plus rentable|mieux|meilleur|moins bien|fois plus/i,
    en: /\b(vs|versus|better|worse|than|against)\b/i,
  };

  it("has hybrid strings to sweep — otherwise the next test proves nothing", () => {
    expect(HYBRID.length).toBeGreaterThanOrEqual(25);
  });

  it("holds no comparative: no « vs », « contre », « plus rentable », « mieux », \"than\", \"against\"…", () => {
    const offenders = HYBRID.flatMap(([p, t]) =>
      LOCALES.flatMap((l) => {
        const text = ALLOWED.reduce((acc, ok) => acc.split(ok).join(""), t[l].replace(/ /g, " "));
        return COMPARATIVE[l].test(text) ? [`${p}.${l}: ${t[l]}`] : [];
      }),
    );
    expect(offenders).toEqual([]);
  });

  it("names self-serve before sales-assisted in every string that holds both, in both languages", () => {
    const both = ALL.filter(([, t]) => placeholdersOf(t.en).includes("plg") && placeholdersOf(t.en).includes("slg"));
    expect(both.length).toBeGreaterThanOrEqual(4);
    const misordered = both.flatMap(([p, t]) => LOCALES.filter((l) => t[l].indexOf("{plg}") > t[l].indexOf("{slg}")).map((l) => `${p}.${l}`));
    expect(misordered).toEqual([]);
    // The words too, where the two are named side by side: slides, their notes, the hybrid's own words. (A
    // sentence about one motion — « l'assisté commence vide… ton libre-service ne change pas » — is no list.)
    const words: Record<Locale, [string, string]> = { fr: ["libre-service", "assisté"], en: ["self-serve", "sales-assisted"] };
    const sideBySide = under("slideTitles", "slide", "notes", "hybrid");
    expect(sideBySide.filter(([, t]) => t.fr.includes("libre-service") && t.fr.includes("assisté")).length).toBeGreaterThanOrEqual(4);
    const wordOrder = sideBySide.flatMap(([p, t]) =>
      LOCALES.filter((l) => {
        const [first, second] = words[l];
        const a = t[l].toLowerCase().indexOf(first);
        const b = t[l].toLowerCase().indexOf(second);
        return a >= 0 && b >= 0 && b < a;
      }).map((l) => `${p}.${l}: ${t[l]}`),
    );
    expect(wordOrder).toEqual([]);
  });

  it("shows the five hybrid-only traps in the hybrid, and none with one motion (C25 Q3)", () => {
    const hybrid = { plg: true, slg: true };
    const shown = ALL_METRIC_SHAPES.filter((s) => hybridTrapOf(s.id, hybrid) !== null).map((s) => s.id);
    expect(shown.sort()).toEqual(["ret.logo-churn", "rev.arpa", "rev.contraction", "rev.expansion", "rev.paid-conversion"]);
    for (const motions of [{ plg: true, slg: false }, { plg: false, slg: true }])
      expect(ALL_METRIC_SHAPES.filter((s) => hybridTrapOf(s.id, motions) !== null).map((s) => s.id), JSON.stringify(motions)).toEqual([]);
    for (const id of shown) expect(ENGINE_COPY.sheet.hybridTrap[hybridTrapOf(id, hybrid)!].fr).toBeTruthy();
  });
});
