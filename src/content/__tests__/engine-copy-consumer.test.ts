import { describe, expect, it } from "vitest";
import { resolveEngineProps } from "@/app/[locale]/aarrr-funnel-template/engine-props";
import { mergeStrings } from "@/lib/engine/strings";
import { resolveTree, type Translatable } from "@/lib/i18n/translatable";
import { LOCALES } from "@/lib/i18n/locale";
import { ENGINE_COPY } from "../engine-copy";
import { ENGINE_COPY_CONSUMER } from "../engine-copy-consumer";
import { placeholdersOf } from "./engine-test-helpers";

/**
 * The consumer app's overlay on the engine's copy (engine spec §21.8, A22 APP-3).
 *
 * `ENGINE_COPY_CONSUMER` carries only the leaves whose words change when the engine is an app's. Two things could go
 * wrong silently, and neither is a type error: a SaaS word the overlay forgot to replace (a screen would call an
 * install a « client »), and an overlay leaf that no longer matches a base leaf (a renamed key, a placeholder that
 * moved). So the rule of §21.8.3 is run on the base copy to LIST what the overlay must cover, and the overlay is
 * read back against the base. The contracts the copy holds for every string (placeholders, slide glyphs, no
 * « tu » on a slide…) are `engine-copy.test.ts`, run on the merged tree as well.
 *
 * Non-vacuity, measured on 2026-10-05 by sabotage, one at a time, each put back and checked back (tests that fall):
 * - a designated leaf deleted from the overlay 2 (the coverage, and « no word left »); an agreement leaf of §21.8.4 a
 *   deleted 1; a key the base lacks, added to `money`, 4 (and TS2353 under `tsc`); a half leaf, TS2741 under `tsc`;
 * - « clients » left in a French rewrite 1, "MRR" left in an English one 1; `{gap}` dropped from an English rewrite 2 (here
 *   and in `engine-copy.test.ts`'s placeholders, on the merged copy); an overlay leaf equal to the base 2;
 * - `APP_OVERLAY_SKIPPED` naming a rewritten leaf 2, naming a leaf the rule does not designate 2;
 * - exclusion line 7 switched off 3, line 2 without `Plg` 2, line 3 pointed at no key 1 (its leaves hold no word of the
 *   rule, so only the « excludes something » test sees it). Line 1 without `faq`: **0** — the FAQ holds no word of the
 *   rule, so that exclusion is not load-bearing today; it stays because the spec lists it (the FAQ is the page's, and
 *   APP-11 adds the app's sentence to it). `hybrid`, `meta` and `pipeline` are in the same case;
 * - `resolveEngineProps` handing `{}` for the overlay 2 (one per language);
 * - what no test here can see: `EngineWorkbench` reading `stringsFor(engineType)`. Vitest mounts no component, and no
 *   Playwright spec of this unit opens an app; the wiring was looked at in a build (JOURNAL.md), and APP-7 and APP-11 give
 *   it a spec.
 */

type Leaf = { segments: string[]; path: string; copy: Translatable };

/** Every `{ fr, en }` leaf under `node`. The path is dotted for display; the segments are what a rule reads (some keys hold a dot). */
function leavesOf(node: unknown, segments: string[] = []): Leaf[] {
  if (!node || typeof node !== "object") return [];
  const record = node as Record<string, unknown>;
  if (typeof record.fr === "string" && typeof record.en === "string") {
    return [{ segments, path: segments.join("."), copy: record as unknown as Translatable }];
  }
  return Object.entries(record).flatMap(([key, child]) => leavesOf(child, [...segments, key]));
}

const BASE = leavesOf(ENGINE_COPY);
const OVERLAY = leavesOf(ENGINE_COPY_CONSUMER);
const BASE_BY_PATH = new Map(BASE.map((l) => [l.path, l]));
const OVERLAY_BY_PATH = new Map(OVERLAY.map((l) => [l.path, l]));

/** The base with the overlay on top, still bilingual: a leaf of the overlay is a whole { fr, en }, merged key by key. */
const MERGED = mergeStrings<unknown>(ENGINE_COPY, ENGINE_COPY_CONSUMER) as typeof ENGINE_COPY;
const MERGED_BY_PATH = new Map(leavesOf(MERGED).map((l) => [l.path, l]));

// ---------------------------------------------------------------------------------------------------- the rule (§21.8.3)

const isUnder = (path: string, branch: string) => path === branch || path.startsWith(`${branch}.`);
const underAny = (path: string, branches: readonly string[]) => branches.some((b) => isUnder(path, b));

interface ExclusionLine {
  /** The line of §21.8.3 "Les chemins exclus", 1 to 7 */
  line: number;
  /** What an app never shows, or shows in the words of another key */
  excludes: (segments: readonly string[], path: string) => boolean;
}

/**
 * What an app never displays, line for line and in the order of §21.8.3 (« Les chemins exclus »). A leaf is excluded as
 * soon as ONE line designates it. A branch named below excludes everything under it.
 */
export const APP_EXCLUDED: readonly ExclusionLine[] = [
  {
    // 1. The top-level keys: the hybrid and the assisted motion's, the page and its metadata, the start card (it carries
    // its keys by type), the tools' and the roles' names (a job's name, « Customer Success », stays as it is).
    line: 1,
    excludes: (segments) => ["hybrid", "total", "relays", "pipeline", "slgChain", "faq", "meta", "page", "start", "tools", "role"].includes(segments[0]!),
  },
  {
    // 2. A path segment that holds `slg`, `Slg`, `hybrid`, `Hybrid`, `link`, `Link`, `Plg` or `Both`, or starts with `mkt`
    // (the marketplace, §22). Not lower-case `plg`: `slide.plgLeakAssumption`, the self-serve leak's foot, prints for an app.
    line: 2,
    excludes: (segments) => segments.some((s) => ["slg", "Slg", "hybrid", "Hybrid", "link", "Link", "Plg", "Both"].some((x) => s.includes(x)) || s.startsWith("mkt")),
  },
  {
    // 3. A segment that is exactly one of these (the start card's « Assisté » and « Les deux » entries).
    line: 3,
    excludes: (segments) => segments.some((s) => ["sa", "saNote", "saTyped", "both", "bothNote", "bothTyped"].includes(s)),
  },
  {
    // 4. The setup of the other types, the path and everything below it.
    line: 4,
    excludes: (_, path) =>
      underAny(path, [
        "setup.types", "setup.typeLater", "setup.motions", "setup.motionsRequired", "setup.motionPlg", "setup.motionSlg", "setup.companyLabel",
        "settings.motionLast", "workbench.modelShort",
        "example.bannerTitle", "example.company", "example.bannerBody", "example.liveEvent", "example.lossCause", "example.pqlThreshold",
      ]),
  },
  {
    // 5. What only the hybrid and the assisted motion print.
    line: 5,
    excludes: (_, path) =>
      underAny(path, [
        "slideTitles.total", "slideTitles.totalUnknown", "slideTitles.unitEconomicsNoneDifferent", "slideTitles.unitEconomicsNoneMargins", "slideTitles.unitEconomicsSides",
        "notes.cycleLong", "notes.whoCountsWhere", "notes.whyNotCompare", "notes.selfServeFeeds", "notes.selfServeLever",
        "findings.base", "sanity.cacVariantsDiffer", "scenario.kpiWon", "scenario.won",
        "slide.unitSideLoss", "slide.unitSideUnknown",
        "worth.customersQuarter", "worth.customersQuarterOne", "worth.lessThanOneQuarter",
      ]),
  },
  {
    // 6. What the SaaS's cash and lifetime print and an app does not (D10, D11): the cash tied up, the lifetime, the
    // billed and floor wordings, `slide.unitAssume` and `slide.unitAssumeOutpaced` (an app prints `slide.unitAssumeApp`),
    // and every `slide.chart*` but `slide.chartCost` (an app's chart is `InstallPaybackChart`).
    line: 6,
    excludes: (_, path) =>
      path.startsWith("money.assume") ||
      (path.startsWith("money.line") && !isUnder(path, "money.lineApp")) ||
      (path.startsWith("money.months") && !path.startsWith("money.monthsApp")) ||
      underAny(path, ["money.slgAnnual", "money.tied"]) ||
      path.startsWith("scenario.assumeCash") ||
      underAny(path, ["scenario.assumeLtv", "scenario.assumeLtvSlg", "scenario.rowCash", "scenario.rowAfter"]) ||
      ["slide.unitFloor", "slide.unitBilled", "slide.unitCompanyWide", "slide.unitLost"].some((p) => path.startsWith(p)) ||
      underAny(path, ["slide.unitNotAllBack", "slide.unitMayNotAllBack", "slide.unitLeavesBefore", "slide.unitMayLeaveBefore", "slide.unitAssume", "slide.unitAssumeOutpaced"]) ||
      (path.startsWith("slide.chart") && path !== "slide.chartCost") ||
      underAny(path, ["slide.unitRatioReference", "slide.unitReference", "slide.unitBothReference", "terms.cashTied", "terms.afterPayback"]),
  },
  {
    // 7. What an app never triggers: the reconciliation reads `acq.cac`, which an app does not have (§21.5.5).
    line: 7,
    excludes: (_, path) => underAny(path, ["findings.reconcile", "findings.reconcileOne", "sanity.reconcileGap", "sanity.reconcileGapOne"]),
  },
];

const isExcluded = (leaf: Leaf) => APP_EXCLUDED.some(({ excludes }) => excludes(leaf.segments, leaf.path));

/** Whole words, case-sensitive: an acronym of the SaaS. Unicode-aware, so « ARRÊT » is not « ARR ». */
const ACRONYMS = /(?<![\p{L}\p{N}_])(ARPA|MRR|ARR|CAC|LTV)(?![\p{L}\p{N}_])/u;
const FRENCH_WORDS = /inscrit|inscription|client|payant|SaaS|visiteur|payback/i;
const ENGLISH_WORDS = /sign-up|signup|signed up|sign up|customer|paying|SaaS|visitor/i;

/** The lexicon's target expressions that hold one of the words: they are the words the app SAYS (§21.8.2). */
const TARGETS = {
  fr: ["visiteurs de la fiche", "abonné payant", "abonnés payants"],
  en: ["store page visitors", "paying subscriber", "paying subscribers"],
};

/** The text a rule reads: its `{…}` placeholders out (`{cac}` and `{arpa}` are not the words), and, with `targets`, the target expressions out. */
function readable(text: string, locale: "fr" | "en", targets: boolean): string {
  let out = text.replace(/\{[^}]*\}/g, "");
  if (targets) for (const t of TARGETS[locale]) out = out.replace(new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), "");
  return out;
}

/** Which languages of a leaf hold a word of the rule. */
function holdsWord(copy: Translatable, targets: boolean): ("fr" | "en")[] {
  const fr = readable(copy.fr, "fr", targets);
  const en = readable(copy.en, "en", targets);
  return [...(FRENCH_WORDS.test(fr) || ACRONYMS.test(fr) ? (["fr"] as const) : []), ...(ENGLISH_WORDS.test(en) || ACRONYMS.test(en) ? (["en"] as const) : [])];
}

/** The leaves §21.8.3 designates: outside the excluded paths, a SaaS word in one language at least. */
const DESIGNATED = BASE.filter((l) => !isExcluded(l) && holdsWord(l.copy, false).length > 0);

/**
 * The designated leaves the lexicon cannot rewrite without changing the sense (§21.8.3): the app shows the SaaS wording
 * there until Antoine rules, and the session names each in the unit's report. One line of comment each says why.
 */
export const APP_OVERLAY_SKIPPED: readonly string[] = [
  // False positive of the rule, not a SaaS word: the English « paying back » is the verb, and the French « part {n} avant » holds none.
  "scenario.leavesFirst",
  // « qui s'inscrivent » / "who sign up" is a verb, which the lexicon has no entry for: « s'installer » means to settle and « installer » takes an object (« l'app »), which would add a word.
  "scenario.assumption.referral-on-top",
  // The lexicon turns MRR into « revenu », all of an app's revenue; this shared count is the subscriptions' MRR only (what NRR and GRR read).
  "io.sharedCount.mrrEnd",
  // Same as mrrEnd: the subscriptions' MRR at the start of the month.
  "io.sharedCount.mrrStart",
  // The lexicon changes the sense: « more subscribers lower the cost per install » is false (subscribers are not in it), and an app never prints this assumption (it has `same-spend-installs`, §21.5.3).
  "scenario.assumption.same-spend",
];

/**
 * The leaves §21.8.4 a gives word for word, in its order, the agreement leaves (« Activées ») after the main table. A
 * path is dotted; a key that holds a dot (`ret.d30`) is written as the tree has it.
 */
const TABLE_A: readonly string[] = [
  "money.mrr", "money.arr", "money.worthTitle", "money.healthy", "money.noLtv", "money.noCac", "money.noMarginNote",
  "money.warnRunway", "money.warnRunwayMaybe", "money.warnFloor", "money.warnFloorMaybe",
  "findings.unitEconLoss", "findings.unitEconLossMaybe",
  "slideTitles.unitEconomics", "slideTitles.unitEconomicsUnknown", "slideTitles.unitEconomicsLoss",
  "slideTitles.leakClearMrrNew", "slideTitles.leakClearMrrRetained", "slideTitles.leakClearCustomers", "slideTitles.leakClearCustomersOne",
  "slideTitles.leakClearKept", "slideTitles.leakClearKeptOne", "slideTitles.leakClearPerHundred",
  "slideTitles.pelotonComplete", "slideTitles.whatIfLever", "slideTitles.scenario",
  "whatIf.times", "whatIf.todayFlow", "whatIf.todayFlowOne", "whatIf.todayPerHundred", "whatIf.todayPerHundredOne", "whatIf.timesFlow",
  "whatIf.todayChurn", "whatIf.thenChurn", "whatIf.thenChurnOne", "whatIf.timesChurn", "whatIf.lessThanOne",
  "scenario.kpiMrr12", "scenario.kpiNewMrr", "scenario.kpiNrr", "scenario.kpiGrr", "scenario.kpiCac", "scenario.kpiLtv", "scenario.kpiPayback",
  "scenario.figuresCustomer", "scenario.rowLtvCac", "scenario.rowGap", "scenario.aloneTitle",
  "scenario.assumption.churn-as-revenue", "scenario.assumption.arpa-new-customers", "scenario.assumption.twelve-months",
  "lever.arr12", "lever.curveSummary", "lever.worthOut", "lever.worthMaybe", "lever.worthStill",
  "slide.chartCost",
  "peloton.upstream", "peloton.signups", "board.pelotonTitle",
  "slide.unitRetention", "slide.plgLeakAssumption.ret.d30", "slide.plgLeakAssumption.ref.referred-share",
  // The agreement leaves: « une installation » is feminine, « un inscrit » was masculine.
  "peloton.activated", "peloton.d30", "peloton.paid", "peloton.legendReferred", "peloton.unmeasured.paid",
  "scenario.activated", "scenario.d30", "scenario.paying", "scenario.referred", "scenario.assumption.activation-drives-downstream",
  "subject.rev.paid-conversion", "leverSubject.rev.paid-conversion", "settings.paidReset",
];

// ---------------------------------------------------------------------------------------------------- the tests

describe("the rule of §21.8.3 and its list of excluded paths", () => {
  it("designates a few score of leaves — otherwise every test below proves nothing", () => {
    expect(BASE.length).toBeGreaterThan(1000);
    // « 138 feuilles désignées » when the spec measured it, on 2026-10-04: an order of magnitude, not a criterion.
    expect(DESIGNATED.length).toBeGreaterThan(100);
    expect(DESIGNATED.length).toBeLessThan(200);
  });

  it("has seven exclusion lines, each of which excludes at least one leaf of the copy today", () => {
    expect(APP_EXCLUDED.map((e) => e.line)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    for (const { line, excludes } of APP_EXCLUDED) {
      expect(BASE.filter((l) => excludes(l.segments, l.path)).length, `exclusion line ${line} excludes nothing: dead, or its keys were renamed`).toBeGreaterThan(0);
    }
  });

  it("holds `slide.plgLeakAssumption` out of the exclusions: the self-serve leak's foot prints for an app", () => {
    const leak = BASE.filter((l) => isUnder(l.path, "slide.plgLeakAssumption"));
    expect(leak.length).toBeGreaterThanOrEqual(2);
    expect(leak.filter(isExcluded)).toEqual([]);
  });

  it("reads acronyms as whole words, case-sensitive, and the words of the rule without regard to case", () => {
    expect(holdsWord({ fr: "le MRR", en: "x" }, false)).toEqual(["fr"]);
    expect(holdsWord({ fr: "x", en: "the CAC payback" }, false)).toEqual(["en"]);
    expect(holdsWord({ fr: "ARRÊTER la ARRIVÉE", en: "carry on, macro" }, false)).toEqual([]);
    expect(holdsWord({ fr: "x", en: "Customers" }, false)).toEqual(["en"]);
    expect(holdsWord({ fr: "Visiteurs", en: "x" }, false)).toEqual(["fr"]);
    // « payback » is a word of the French rule only: the lexicon turns it into « remboursement », and English keeps "payback".
    expect(holdsWord({ fr: "au Payback", en: "x" }, false)).toEqual(["fr"]);
    expect(holdsWord({ fr: "x", en: "the payback" }, false)).toEqual([]);
    // The placeholders are out: `{cac}` and `{arpa}` are not the words.
    expect(holdsWord({ fr: "coûte {cac}, {arpa}, {ltv}", en: "costs {cac}, {arpa}, {ltv}" }, false)).toEqual([]);
    // The lexicon's own expressions hold a word and are not a leftover.
    expect(holdsWord({ fr: "visiteurs de la fiche", en: "paying subscribers" }, false)).toEqual(["fr", "en"]);
    expect(holdsWord({ fr: "Visiteurs de la fiche, abonnés payants", en: "Store page visitors, paying subscriber" }, true)).toEqual([]);
  });
});

describe("the overlay covers what the rule designates (§21.8.3, point 1)", () => {
  it("has a leaf, at the same path, for each designated leaf — outside APP_OVERLAY_SKIPPED", () => {
    const missing = DESIGNATED.filter((l) => !OVERLAY_BY_PATH.has(l.path) && !APP_OVERLAY_SKIPPED.includes(l.path)).map((l) => `${l.path}: ${l.copy.fr} / ${l.copy.en}`);
    expect(missing, `${missing.length} designated leaves are missing from ENGINE_COPY_CONSUMER:\n${missing.join("\n")}`).toEqual([]);
  });

  it("has every leaf §21.8.4 a gives, the agreement leaves included", () => {
    expect(new Set(TABLE_A).size).toBe(TABLE_A.length);
    const missing = TABLE_A.filter((p) => !OVERLAY_BY_PATH.has(p));
    expect(missing, `missing from ENGINE_COPY_CONSUMER:\n${missing.join("\n")}`).toEqual([]);
  });

  it("skips only leaves that are still designated, still unrewritten, and still said to be skipped for a reason", () => {
    expect(new Set(APP_OVERLAY_SKIPPED).size).toBe(APP_OVERLAY_SKIPPED.length);
    for (const path of APP_OVERLAY_SKIPPED) {
      expect(DESIGNATED.some((l) => l.path === path), `${path} is no longer designated by the rule: take it off the list`).toBe(true);
      expect(OVERLAY_BY_PATH.has(path), `${path} is rewritten: take it off the list`).toBe(false);
    }
  });

  it("rewrites nothing the rule does not designate but §21.8.4 a — no stray leaf in the overlay", () => {
    const designated = new Set(DESIGNATED.map((l) => l.path));
    const stray = OVERLAY.filter((l) => !designated.has(l.path) && !TABLE_A.includes(l.path)).map((l) => l.path);
    expect(stray).toEqual([]);
  });
});

describe("the merged copy no longer speaks the SaaS (§21.8.3, point 2)", () => {
  /** A leaf that keeps a word of the rule on purpose, one by one, each with the reason: none today. */
  const EXCEPTIONS: readonly string[] = [];

  it("holds no word of the rule in any designated leaf the overlay rewrites, either language", () => {
    const offenders = DESIGNATED.filter((l) => !APP_OVERLAY_SKIPPED.includes(l.path) && !EXCEPTIONS.includes(l.path)).flatMap((l) => {
      const merged = MERGED_BY_PATH.get(l.path)!;
      return holdsWord(merged.copy, true).map((lang) => `${l.path}.${lang}: ${merged.copy[lang]}`);
    });
    expect(offenders).toEqual([]);
  });

  it("changes every leaf it carries — an overlay leaf equal to the base is a no-op, and a leaf that was meant to say something", () => {
    const unchanged = OVERLAY.filter((l) => {
      const base = BASE_BY_PATH.get(l.path)!;
      return base.copy.fr === l.copy.fr && base.copy.en === l.copy.en;
    }).map((l) => l.path);
    expect(unchanged).toEqual([]);
  });

  it("keeps the SaaS wording on a skipped leaf — the merge adds nothing there", () => {
    for (const path of APP_OVERLAY_SKIPPED) expect(MERGED_BY_PATH.get(path)!.copy).toEqual(BASE_BY_PATH.get(path)!.copy);
  });
});

describe("no orphan key (§21.8.3, point 3)", () => {
  it("has every overlay leaf in the base, at the same path", () => {
    expect(OVERLAY.length).toBeGreaterThan(100);
    expect(OVERLAY.filter((l) => !BASE_BY_PATH.has(l.path)).map((l) => l.path)).toEqual([]);
  });

  it("carries, on each leaf and in each language, the placeholders of the leaf it replaces", () => {
    const mismatched = OVERLAY.flatMap((l) => {
      const base = BASE_BY_PATH.get(l.path)!;
      return LOCALES.flatMap((lang) => {
        const mine = placeholdersOf(l.copy[lang]).join();
        const theirs = placeholdersOf(base.copy[lang]).join();
        return mine === theirs ? [] : [`${l.path}.${lang}: [${mine}] against the base's [${theirs}]`];
      });
    });
    expect(mismatched).toEqual([]);
  });

  it("is made of whole { fr, en } leaves and branches, and of nothing else — no bare string, no half leaf", () => {
    const bare: string[] = [];
    (function walk(node: unknown, path: string[]) {
      if (typeof node === "string") bare.push(path.join("."));
      else if (node && typeof node === "object") {
        const record = node as Record<string, unknown>;
        if ("fr" in record || "en" in record) {
          if (typeof record.fr !== "string" || typeof record.en !== "string") bare.push(`${path.join(".")}: a leaf holds both languages`);
          return;
        }
        for (const [k, v] of Object.entries(record)) walk(v, [...path, k]);
      }
    })(ENGINE_COPY_CONSUMER, []);
    expect(bare).toEqual([]);
  });
});

describe("the page hands the island the overlay resolved (§21.8.1)", () => {
  it.each(LOCALES)("`typeStrings` is the overlay resolved to the page's language, and its merge is the merged copy resolved (%s)", (locale) => {
    const props = resolveEngineProps(locale);
    expect(props.typeStrings["consumer-app"]).toEqual(resolveTree(ENGINE_COPY_CONSUMER, locale));
    // Merging after resolving (what the island does) is resolving after merging: the same strings.
    expect(mergeStrings(props.strings, props.typeStrings["consumer-app"])).toEqual(resolveTree(MERGED, locale));
    // The overlay is a partial tree: it carries a small part of the copy, not a second copy of it.
    expect(JSON.stringify(props.typeStrings["consumer-app"]).length).toBeLessThan(JSON.stringify(props.strings).length / 3);
  });
});
