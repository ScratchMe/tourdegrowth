import { describe, expect, it } from "vitest";
import { resolveEngineProps } from "@/app/[locale]/aarrr-funnel-template/engine-props";
import { marketplaceStrings, mergeStrings, type MarketplaceLayers } from "@/lib/engine/strings";
import type { MktSide } from "@/lib/engine/types";
import { LOCALES } from "@/lib/i18n/locale";
import { resolveTree, type Translatable } from "@/lib/i18n/translatable";
import { ENGINE_COPY } from "../engine-copy";
import { ENGINE_COPY_MKT } from "../engine-copy-marketplace";
import { ENGINE_COPY_MKT_SERVICES } from "../engine-copy-mkt-services";
import { placeholdersOf } from "./engine-test-helpers";
import {
  DEMAND_WORDS,
  isUnder,
  MKT_EXCLUDED,
  MKT_OVERLAY_SKIPPED,
  MKT_SERVICES_EXCLUDED,
  SERVICES_BANNED,
  SERVICES_NAMED_EXCEPTIONS,
  servicesWordsHeld,
  SUPPLY_TARGETS,
  SUPPLY_WORDS,
  wordsHeld,
} from "./mkt-words";

/**
 * The marketplace's overlays on the engine's copy, in the words of "products" (engine spec §22.8, A23 MKT-5): points 1, 2,
 * 3 and 6 of §22.8.3 (point 4 is `engine-copy.test.ts`, which runs its contracts on the merged copies as well), and, in
 * the words of "services" (A23 MKT-S), point 5, the structure of the three "services" sheets (the orphans, the placeholders,
 * the whole leaves: point 3 again) and point 6 on them.
 *
 * A marketplace has two sides, and a leaf that says "client" or "MRR" is read by both: `ENGINE_COPY_MKT.demand` and
 * `.supply` rewrite it each its way (§22.8.2), `.common` holds the six leaves read in every set (C105). Two things could go
 * wrong silently, and neither is a type error: a SaaS word the overlay forgot (a seller's screen would call a paid seller a
 * « client »), and an overlay leaf that no longer matches a base leaf (a renamed key, a placeholder that moved). So the rule
 * of §22.8.3 is run on the base copy to LIST what each side must cover, and each overlay is read back against the base.
 *
 * Non-vacuity, measured on 2026-10-25 by sabotage, one at a time, each put back and its sha checked (tests that fall, among
 * this file, `engine-copy.test.ts`, `strings.test.ts`, `content-fan-in.test.ts`, `engine-boundary.test.ts` and
 * `engine-copy-consumer.test.ts`):
 * - a designated leaf deleted from the demand's sheet 2 (the coverage, and « no word left »), from the supply's 2; a leaf
 *   deleted from `common` 8 (both sides' coverage, the page, the neutral set); a supply-only leaf deleted from the supply's
 *   sheet 3; the supply's identity leaf (LTV:CAC) deleted 2;
 * - « client » left in a French demand rewrite 2, "MRR" left in an English supply one 1, « inscrit » left in a French supply
 *   one 2, « ARPA » left in `common` 2;
 * - a key the base lacks, added to `money` of a sheet, 4 (and TS2353 under `tsc`); a half leaf, TS2741 under `tsc`; a `mkt.*`
 *   leaf rewritten in a sheet 2; a common leaf also written by a side 2;
 * - `{gap}` dropped from an English rewrite 2; the supply's chain-break finding left on « Sur 100 inscrits » 2; the identity
 *   leaf's English changed 1;
 * - `MKT_OVERLAY_SKIPPED` naming a rewritten leaf 1, naming a leaf nobody designates 1;
 * - a `mkt.*` template that says « contre la demande » 1 and one that says "supply or demand" 1;
 * - exclusion line 8 switched off 6, line 7 switched off 4, line 1 without `mkt` 1, line 3 without the `mkt` prefix 5;
 * - an unbalanced `**` in a supply slide title: 1, in `engine-copy.test.ts` (the contracts of the copy run on the merged
 *   copy of each side);
 * - « they », never « it » (relance of 2026-10-25, measured the same way): « its cost » put back in the supply's
 *   `money.monthsLoss` 2; « It brings back » put back in the demand's `lever.worthOut` 3; a buyer called « it » in a leaf
 *   outside the 21 1; a legitimate « it » (`money.warnFloor`, the runway) taken off the list of things 1; a name on that list
 *   that no longer holds the word 1; the French of the supply's sign-up assumption back to « Le taux d'inscription
 *   s'applique » 1; « its cost is known » in the supply's `slide.chartSummaryNone` 2; the supply's
 *   `findings.unitEconLossMaybe` back to « it may not pay back what it costs » 2;
 * - `resolveEngineProps` handing `{}` for the marketplace's products 3 (two languages, and the neutral set); the content
 *   fan-in budget at 0: 1 (`content-fan-in.test.ts`);
 * - what no test here can see: `EngineWorkbench` reading `stringsFor("marketplace", offering, side)`. Vitest mounts no
 *   component, and no Playwright spec of this unit opens a marketplace (the barrier is closed until MKT-7b).
 *
 * MKT-S (the words of "services"), measured on 2026-10-26 the same way, on a copy of the sources outside the repository, with
 * the seven test files nearest (this one, `engine-catalog`, `engine-copy`, `engine-props`, `strings`, `content-fan-in` and
 * `engine-boundary`: 692 tests, green before each sabotage, the file put back and its sha compared after):
 * - a leaf deleted from the services demand sheet 2, from the supply's 2, from `common` 4; « acheteurs » put back in a French
 *   supply leaf 1, "buyer" in an English demand one 2;
 * - `clauseRepeat` deleted 2, put back to « passent » 1, `verbMkt.repeat` back to the "products" text 2;
 * - an English supply leaf without its `{gap}` 2 (the placeholders of this file and of the contracts of `engine-copy.test.ts`,
 *   which now run on the two services fusions); an unbalanced `**` in a supply slide title 1 (`engine-copy.test.ts`, on the
 *   services supply fusion alone);
 * - `io.unsupportedSetup` rewritten by `common` 2 (a first attempt, which wrote the leaf under a second `io` key that the
 *   later one overwrote, fell nothing: it had never applied, and was done again inside the one `io` block); the exception
 *   taken off the list 4;
 * - a `common` leaf also written by a side 1; a leaf of a side whose "products" text holds no word 1; "contre la demande" /
 *   "rather than demand" in a services leaf 2;
 * - `MKT_SERVICES_EXCLUDED` keeping the `mkt` key of line 1 4, keeping the `mkt` prefix of line 3 4; the English list without
 *   "sold" 1, the French one without « commande(s) » 1;
 * - the services sheets handed to the island empty 2; the services catalogue built from the "products" entries, or its
 *   figures only, 3 each (the point 5 on the page's props, both languages, and `engine-props.test.ts`); the services fan-in
 *   budget at 0: 1 (`content-fan-in.test.ts`).
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

const SIDES: readonly MktSide[] = ["demand", "supply"];
const BASE = leavesOf(ENGINE_COPY);
const BASE_BY_PATH = new Map(BASE.map((l) => [l.path, l]));
const LAYER = { common: leavesOf(ENGINE_COPY_MKT.common), demand: leavesOf(ENGINE_COPY_MKT.demand), supply: leavesOf(ENGINE_COPY_MKT.supply) };
const LAYER_BY_PATH = {
  common: new Map(LAYER.common.map((l) => [l.path, l])),
  demand: new Map(LAYER.demand.map((l) => [l.path, l])),
  supply: new Map(LAYER.supply.map((l) => [l.path, l])),
};

/** The six layers as `marketplaceStrings` takes them: the three of "products" and the three of "services". */
const LAYERS: MarketplaceLayers<unknown> = { products: ENGINE_COPY_MKT, services: ENGINE_COPY_MKT_SERVICES };
/** The same with "services" empty: what a services marketplace reads before its own words (the "products" fusions only). */
const PRODUCTS_ONLY: MarketplaceLayers<unknown> = { products: ENGINE_COPY_MKT, services: { common: {}, demand: {}, supply: {} } };
/** What a side's screens read (§22.8.1). Bilingual: a leaf is a whole { fr, en }, merged key by key. */
const MERGED = Object.fromEntries(SIDES.map((side) => [side, marketplaceStrings<unknown>(ENGINE_COPY, PRODUCTS_ONLY, "products", side) as typeof ENGINE_COPY])) as Record<MktSide, typeof ENGINE_COPY>;
const MERGED_BY_PATH = Object.fromEntries(SIDES.map((side) => [side, new Map(leavesOf(MERGED[side]).map((l) => [l.path, l]))])) as Record<MktSide, Map<string, Leaf>>;

const isExcluded = (leaf: Leaf) => MKT_EXCLUDED.some(({ excludes }) => excludes(leaf.segments, leaf.path));
const KEPT = BASE.filter((l) => !isExcluded(l));

/** The leaves §22.8.3 designates for each side: outside the excluded paths, a word of the side's rule in one language at least. */
const DESIGNATED: Record<MktSide, Leaf[]> = {
  demand: KEPT.filter((l) => wordsHeld(l.copy, DEMAND_WORDS).length > 0),
  supply: KEPT.filter((l) => wordsHeld(l.copy, SUPPLY_WORDS).length > 0),
};

/**
 * The six leaves of `products.common` (§22.8.5 c bis, C105): read in every set of a marketplace, the neutral one included,
 * so they are written for both sides at once and neither side's sheet repeats them.
 */
const COMMON: readonly string[] = [
  "setup.referenceMonthHint", "setup.cohortHint", "settings.windowHint", "settings.runwayHint", "terms.cohort.definition", "terms.window.definition",
];

/**
 * §22.8.5 c, the second table (the brief 10's) included: the leaves both sides write word for word, whether the rule
 * designates them or not. A leaf of the table that the rule does not designate is not stray in an overlay.
 */
const TABLE_C_BOTH: readonly string[] = [
  "slideTitles.leakClearMrrNew", "slideTitles.leakClearMrrRetained", "slideTitles.leakClearCustomers", "slideTitles.leakClearCustomersOne",
  "slideTitles.leakClearKept", "slideTitles.leakClearKeptOne", "slideTitles.whatIfLever", "slideTitles.scenario",
  "slideTitles.unitEconomics", "slideTitles.unitEconomicsUnknown", "slideTitles.unitEconomicsLoss",
  "money.mrr", "money.arr", "money.worthTitle", "whatIf.times", "whatIf.timesFlow",
  "sanity.reconcileGap", "sanity.reconcileGapOne", "findings.reconcile", "findings.reconcileOne",
  "scenario.assumption.same-spend", "scenario.assumption.twelve-months", "scenario.assumeLtv",
  // The brief 10's: the diagnosis' header names the side, a marketplace has no expansion nor monthly billing, each stream its margin.
  "diagnosis.clear", "diagnosis.shared", "diagnosis.level", "diagnosis.notEnough",
  "money.noMarginNote", "scenario.intro", "scenario.assumeCash", "terms.cashTied.definition", "terms.afterPayback.definition",
  "slide.unitFloor", "slide.unitAssume",
];
/** What only the supply writes in §22.8.5 c: the demand does not designate « CAC » (it keeps the SaaS's). */
const TABLE_C_SUPPLY: readonly string[] = ["scenario.kpiCac", "scenario.kpiPayback"];

/** The `mkt.*` leaves of §22.8.5 b, the first of the marketplace's own words. */
const MKT_OWN = BASE.filter((l) => l.segments[0] === "mkt");

// ------------------------------------------------------------------------------------------------ the rule (§22.8.3)

describe("the rule of §22.8.3 and its list of excluded paths", () => {
  it("designates a hundred leaves for each side — otherwise every test below proves nothing", () => {
    expect(BASE.length).toBeGreaterThan(1000);
    // « 103 pour la demande, 128 pour l'offre » when MKT-R measured it, on 2026-10-18 and without the ten leaves that line 7
    // was given since; 93 and 118 today. An order of magnitude, not a criterion. The supply's rule holds the demand's.
    expect(DESIGNATED.demand.length).toBeGreaterThan(80);
    expect(DESIGNATED.demand.length).toBeLessThan(150);
    expect(DESIGNATED.supply.length).toBeGreaterThan(100);
    expect(DESIGNATED.supply.length).toBeLessThan(180);
    const demand = new Set(DESIGNATED.demand.map((l) => l.path));
    expect(DESIGNATED.supply.filter((l) => !demand.has(l.path)).length, "the leaves only the supply designates").toBeGreaterThan(15);
    expect(DESIGNATED.demand.every((l) => DESIGNATED.supply.includes(l))).toBe(true);
  });

  it("has eight exclusion lines, each of which excludes at least one leaf of the copy today", () => {
    expect(MKT_EXCLUDED.map((e) => e.line)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    for (const { line, excludes } of MKT_EXCLUDED) {
      expect(BASE.filter((l) => excludes(l.segments, l.path)).length, `exclusion line ${line} excludes nothing: dead, or its keys were renamed`).toBeGreaterThan(0);
    }
  });

  it("excludes the marketplace's own leaves by both of the lines that say so (line 1 for `mkt`, line 3 for a key that starts with `mkt`)", () => {
    const own = BASE.filter((l) => l.segments[0] === "mkt");
    expect(own.length).toBeGreaterThan(50);
    expect(own.every((l) => MKT_EXCLUDED[0]!.excludes(l.segments, l.path))).toBe(true);
    const keyed = BASE.filter((l) => l.segments.some((s) => s.startsWith("mkt")) && l.segments[0] !== "mkt");
    expect(keyed.map((l) => l.path)).toContain("subject.mkt.buy.first-order");
    expect(keyed.map((l) => l.path)).toContain("io.sharedCount.mktOrders");
    expect(keyed.every((l) => MKT_EXCLUDED[2]!.excludes(l.segments, l.path))).toBe(true);
    // A SaaS entry of `subject` is excluded (line 2), a marketplace's is not.
    expect(MKT_EXCLUDED[1]!.excludes(["subject", "ret.d30"], "subject.ret.d30")).toBe(true);
    expect(MKT_EXCLUDED[1]!.excludes(["subject", "mkt.buy.first-order"], "subject.mkt.buy.first-order")).toBe(false);
  });

  it("holds out of line 8 nothing a marketplace shows: it lists leaves that exist, once each", () => {
    // The rule sweeps `ENGINE_COPY`, so a leaf of the consumer app's list that the base no longer has would be silent.
    const line8 = BASE.filter((l) => MKT_EXCLUDED[7]!.excludes(l.segments, l.path));
    expect(line8.length).toBeGreaterThan(80);
    expect(line8.map((l) => l.path)).toContain("scenario.assumeLtvApp");
    expect(line8.map((l) => l.path)).toContain("faqTypeNote.consumerApp");
  });

  it("reads acronyms as whole words with their case, and the words of the rule without regard to it", () => {
    expect(wordsHeld({ fr: "le MRR", en: "x" }, DEMAND_WORDS)).toEqual(["fr"]);
    expect(wordsHeld({ fr: "x", en: "the CAC payback" }, DEMAND_WORDS)).toEqual([]);
    expect(wordsHeld({ fr: "x", en: "the CAC payback" }, SUPPLY_WORDS)).toEqual(["en"]);
    expect(wordsHeld({ fr: "ARRÊTER la ARRIVÉE", en: "carry on, macro" }, SUPPLY_WORDS)).toEqual([]);
    expect(wordsHeld({ fr: "x", en: "Customers" }, DEMAND_WORDS)).toEqual(["en"]);
    // « inscrit » and « visiteur » are the supply's words only: the demand keeps them (the sign-ups are the buyers').
    expect(wordsHeld({ fr: "Visiteurs inscrits", en: "x" }, DEMAND_WORDS)).toEqual([]);
    expect(wordsHeld({ fr: "Visiteurs inscrits", en: "x" }, SUPPLY_WORDS)).toEqual(["fr"]);
    expect(wordsHeld({ fr: "x", en: "sign-ups, signed up, sign up, visitors" }, SUPPLY_WORDS)).toEqual(["en"]);
    // The placeholders are out: `{cac}` and `{arpa}` are not the words.
    expect(wordsHeld({ fr: "coûte {cac}, {arpa}", en: "costs {cac}, {arpa}" }, SUPPLY_WORDS)).toEqual([]);
    // The supply's own expressions hold a word and are not a leftover.
    expect(wordsHeld({ fr: "vendeurs inscrits, LTV:CAC", en: "seller sign-ups, LTV:CAC" }, SUPPLY_WORDS, SUPPLY_TARGETS)).toEqual([]);
    expect(wordsHeld({ fr: "MRR des abonnements", en: "Subscription MRR" }, SUPPLY_WORDS, SUPPLY_TARGETS)).toEqual([]);
  });
});

// ------------------------------------------------------------------------------------------------ the coverage (point 1)

describe("the overlays cover what the rule designates (§22.8.3, point 1)", () => {
  for (const side of SIDES) {
    it(`has, for the ${side}, a leaf at the same path for each designated leaf — in its own sheet or in \`common\`, outside the skipped`, () => {
      const missing = DESIGNATED[side]
        .filter((l) => !LAYER_BY_PATH[side].has(l.path) && !LAYER_BY_PATH.common.has(l.path) && !MKT_OVERLAY_SKIPPED[side].includes(l.path))
        .map((l) => `${l.path}: ${l.copy.fr} / ${l.copy.en}`);
      expect(missing, `${missing.length} designated leaves are missing from ENGINE_COPY_MKT.${side}:\n${missing.join("\n")}`).toEqual([]);
    });
  }

  it("holds, in `common`, exactly the six leaves of §22.8.5 c bis — and neither side repeats one", () => {
    expect(LAYER.common.map((l) => l.path).sort()).toEqual([...COMMON].sort());
    for (const path of COMMON) {
      expect(BASE_BY_PATH.has(path), `${path} is not in ENGINE_COPY`).toBe(true);
      for (const side of SIDES) expect(LAYER_BY_PATH[side].has(path), `${path} is in common AND in ${side}: the side would overrule C105`).toBe(false);
    }
  });

  it("has every leaf §22.8.5 c gives word for word, the second table included, in the sheets it names", () => {
    for (const side of SIDES) {
      const missing = TABLE_C_BOTH.filter((p) => !LAYER_BY_PATH[side].has(p));
      expect(missing, `missing from ENGINE_COPY_MKT.${side}:\n${missing.join("\n")}`).toEqual([]);
    }
    expect(TABLE_C_SUPPLY.filter((p) => !LAYER_BY_PATH.supply.has(p))).toEqual([]);
    // The demand rule does not designate « CAC »: the demand keeps the SaaS's two KPI labels.
    expect(TABLE_C_SUPPLY.filter((p) => LAYER_BY_PATH.demand.has(p))).toEqual([]);
    expect(new Set([...TABLE_C_BOTH, ...TABLE_C_SUPPLY]).size).toBe(TABLE_C_BOTH.length + TABLE_C_SUPPLY.length);
  });

  it("skips only leaves a rule still designates, that the side does not rewrite, and that it says why it skips", () => {
    // Written by a later unit: absent from the base until then, designated by the rule once there (MKT-6, §22.8.5 a). The day it
    // is written this test says so, and the name leaves this list.
    const NOT_WRITTEN_YET = ["settings.firstSalePaidReset"];
    for (const side of SIDES) {
      const skipped = MKT_OVERLAY_SKIPPED[side];
      expect(new Set(skipped).size).toBe(skipped.length);
      for (const path of skipped) {
        if (NOT_WRITTEN_YET.includes(path)) {
          expect(BASE_BY_PATH.has(path), `${path} now exists: MKT-6 wrote it — take it off NOT_WRITTEN_YET, and check the rule designates it`).toBe(false);
          continue;
        }
        // The supply's rule holds the demand's: a leaf skipped on the demand side that only the supply designates is the
        // table's own wording (§22.8.3: `referral-on-top`), and stays harmless.
        expect(DESIGNATED.supply.some((l) => l.path === path), `${path} is no longer designated by the rule: take it off the list`).toBe(true);
        expect(LAYER_BY_PATH[side].has(path), `${path} is rewritten for the ${side}: take it off the list`).toBe(false);
        expect(LAYER_BY_PATH.common.has(path), `${path} is in common: it is rewritten, take it off the list`).toBe(false);
      }
    }
    // The two sides skip alike what the SaaS's verb « paying back » trips; the table's other lines are each side's own.
    for (const path of ["scenario.leavesFirst", "slide.unitLeavesBefore", "slide.unitMayLeaveBefore", "settings.firstSalePaidReset"]) {
      expect(MKT_OVERLAY_SKIPPED.demand).toContain(path);
      expect(MKT_OVERLAY_SKIPPED.supply).toContain(path);
    }
    expect(MKT_OVERLAY_SKIPPED.demand).toContain("terms.arr.definition");
    expect(MKT_OVERLAY_SKIPPED.supply).not.toContain("terms.arr.definition");
  });

  it("rewrites nothing the rule does not designate but §22.8.5 c and c bis — no stray leaf in an overlay", () => {
    for (const side of SIDES) {
      const designated = new Set(DESIGNATED[side].map((l) => l.path));
      const stray = LAYER[side].filter((l) => !designated.has(l.path) && !TABLE_C_BOTH.includes(l.path) && !TABLE_C_SUPPLY.includes(l.path)).map((l) => l.path);
      // Written in both languages, one of which the rule does not read: a leaf the other side designates is not stray for the supply.
      expect(stray, `${side}: not designated and not in §22.8.5 c`).toEqual([]);
    }
  });
});

// ------------------------------------------------------------------------------------------------ the words (point 2)

describe("each side's merged copy no longer speaks the SaaS (§22.8.3, point 2)", () => {
  /**
   * The exceptions, one by one, each with its reason: leaves that keep a word of the rule on purpose, per side and per
   * language. A leaf not listed holds none. The test below holds each listed leaf to EXACTLY the languages named: an
   * exception that stops being one must leave the list.
   */
  const PAYING_BACK = "the English verb « paying back » (the rule reads « paying » as a word of the SaaS's): the French of this leaf says « client », so it is rewritten, and its English keeps the verb — the same false positive as `scenario.leavesFirst`, which the table of §22.8.3 skips because it has no other trigger";
  const EXCEPTIONS: Record<MktSide, Record<string, { langs: ("fr" | "en")[]; why: string }>> = {
    demand: {
      // `common` is written for both sides at once (C105): « vendeur abonné » is the sellers' word, wanted next to the buyers'.
      "settings.runwayHint": { langs: ["fr"], why: "common (C105): « un acheteur ou un vendeur abonné » names both sides" },
      "money.monthsLoss": { langs: ["en"], why: PAYING_BACK },
      "money.monthsMaybe": { langs: ["en"], why: PAYING_BACK },
      "slide.chartSummaryMaybe": { langs: ["en"], why: PAYING_BACK },
      "terms.afterPayback.definition": { langs: ["en"], why: `${PAYING_BACK}; and the text is §22.8.5 c's, word for word ("before paying back")` },
    },
    supply: {
      // `common` again: « inscrit », « visiteurs », "signed up" are wanted where a leaf follows both sides' traffic and sign-ups.
      "setup.referenceMonthHint": { langs: ["fr", "en"], why: "common (C105): « Visiteurs, inscriptions… des deux côtés » names the buyers' and the sellers' traffic" },
      "setup.cohortHint": { langs: ["fr", "en"], why: "common (C105): « les vendeurs inscrits en {cohort} : ceux inscrits en {next} », and the English verb \"who signed up\" has no entry in the lexicon" },
      "terms.cohort.definition": { langs: ["en"], why: "common (C105): \"who signed up in one month\" — the English verb has no entry in the lexicon (the French noun is a target)" },
      "terms.window.definition": { langs: ["fr", "en"], why: "common (C105): « un inscrit » / \"a sign-up\" is a person who signed up, buyer or seller" },
      // §22.8.5 c gives the supply's text for `money.arr` word for word, and it says « leur MRR » / "their MRR".
      "money.arr": { langs: ["fr", "en"], why: "§22.8.5 c, word for word: « ARR des abonnements, leur MRR × 12 » — the bare MRR is the subscriptions' own" },
      "money.monthsLoss": { langs: ["en"], why: PAYING_BACK },
      "money.monthsMaybe": { langs: ["en"], why: PAYING_BACK },
      "slide.chartSummaryMaybe": { langs: ["en"], why: PAYING_BACK },
      "terms.afterPayback.definition": { langs: ["en"], why: `${PAYING_BACK}; and the text is §22.8.5 c's, word for word ("before paying back")` },
    },
  };
  const RULE = { demand: DEMAND_WORDS, supply: SUPPLY_WORDS };
  const TARGETS = { demand: { fr: [] as readonly string[], en: [] as readonly string[] }, supply: SUPPLY_TARGETS };

  for (const side of SIDES) {
    it(`holds no word of the rule in any leaf designated for the ${side}, either language — outside its named exceptions`, () => {
      const offenders = DESIGNATED[side]
        .filter((l) => !MKT_OVERLAY_SKIPPED[side].includes(l.path))
        .flatMap((l) => {
          const merged = MERGED_BY_PATH[side].get(l.path)!;
          const allowed = EXCEPTIONS[side][l.path]?.langs ?? [];
          return wordsHeld(merged.copy, RULE[side], TARGETS[side])
            .filter((lang) => !allowed.includes(lang))
            .map((lang) => `${l.path}.${lang}: ${merged.copy[lang]}`);
        });
      expect(offenders).toEqual([]);
    });

    it(`keeps every exception of the ${side} honest: the leaf holds the words it is allowed, and only those — and is designated`, () => {
      for (const [path, { langs }] of Object.entries(EXCEPTIONS[side])) {
        expect(DESIGNATED[side].some((l) => l.path === path), `${path} is no longer designated: take it off the exceptions`).toBe(true);
        expect(wordsHeld(MERGED_BY_PATH[side].get(path)!.copy, RULE[side], TARGETS[side]), path).toEqual(langs);
      }
    });
  }

  it("leaves the six leaves of `common` clean of the demand's words but for the sellers' « vendeur abonné » — and of the supply's but for the four named", () => {
    const supplyHolders = COMMON.filter((p) => wordsHeld(MERGED_BY_PATH.supply.get(p)!.copy, SUPPLY_WORDS, SUPPLY_TARGETS).length > 0);
    expect(supplyHolders.sort()).toEqual(["setup.cohortHint", "setup.referenceMonthHint", "terms.cohort.definition", "terms.window.definition"]);
    const demandHolders = COMMON.filter((p) => wordsHeld(MERGED_BY_PATH.demand.get(p)!.copy, DEMAND_WORDS).length > 0);
    expect(demandHolders).toEqual(["settings.runwayHint"]);
  });

  it("changes every leaf it carries, in one language at least — except the supply's identity leaf the lexicon keeps (LTV:CAC)", () => {
    const KEPT_AS_IS = ["scenario.rowLtvCac"];
    for (const layer of ["common", "demand", "supply"] as const) {
      const unchanged = LAYER[layer].filter((l) => {
        const base = BASE_BY_PATH.get(l.path)!;
        return base.copy.fr === l.copy.fr && base.copy.en === l.copy.en && !KEPT_AS_IS.includes(l.path);
      });
      expect(unchanged.map((l) => l.path), `${layer}: a leaf equal to the base is a no-op`).toEqual([]);
    }
    // « LTV, payback et LTV:CAC gardent leur nom » (§22.8.2): the supply carries the leaf as it is, so the coverage finds it.
    expect(LAYER_BY_PATH.supply.get("scenario.rowLtvCac")!.copy).toEqual(BASE_BY_PATH.get("scenario.rowLtvCac")!.copy);
    expect(LAYER_BY_PATH.demand.has("scenario.rowLtvCac")).toBe(false);
  });

  it("says the side in the words of §22.8.2, on the leaves that carry the lexicon", () => {
    const text = (side: MktSide, path: string, lang: "fr" | "en") => MERGED_BY_PATH[side].get(path)!.copy[lang];
    expect(text("demand", "money.worthTitle", "fr")).toBe("Ce que vaut un nouvel acheteur");
    expect(text("supply", "money.worthTitle", "fr")).toBe("Ce que vaut un nouveau vendeur abonné");
    expect(text("demand", "scenario.signups", "fr")).toBe(BASE_BY_PATH.get("scenario.signups")!.copy.fr);
    expect(text("supply", "scenario.signups", "fr")).toBe("Vendeurs inscrits");
    expect(text("supply", "scenario.signups", "en")).toBe("Seller sign-ups");
    expect(text("supply", "scenario.visitors", "en")).toBe("Seller page visitors");
    // The finding that names the funnel column a chain breaks on (MKT-4, `sentences.ts`): the supply's columns are counted on seller sign-ups (§22.8.5 j).
    expect(text("supply", "findings.chainBreak", "fr")).toBe("Sur 100 vendeurs inscrits, on ne sait pas dire combien {verb}.");
    expect(text("supply", "findings.chainBreak", "en")).toBe("Out of 100 seller sign-ups, we can't say how many {verb}.");
    expect(text("demand", "findings.chainBreak", "fr")).toBe("Sur 100 inscrits, on ne sait pas dire combien {verb}.");
    // The neutral set keeps what neither side rewrites.
    expect(MERGED_BY_PATH.demand.get("board.smallCohort")!.copy).toEqual(BASE_BY_PATH.get("board.smallCohort")!.copy);
  });
});

// ------------------------------------------------------------------------------------------------ « they », never « it »

/**
 * A buyer or a paid seller is a person: §22.8.5 c writes "their cost" and "what they cost" for them (`unitEconomics`,
 * `terms.afterPayback.definition`, `settings.runwayHint`), and a leaf of an overlay that contradicts those is corrected on
 * them. The SaaS's base says « it » of a customer, and the lexicon does not touch the rest of a sentence (§22.8.2): so the
 * leaves it rewrote from « it » were put in the plural neutral by hand (the relance of 2026-10-25), and this holds them there.
 */
describe("a buyer or a paid seller is « they », never « it » (§22.8.5 c)", () => {
  /** The leaves of each side the lexicon rewrote from a SaaS « it »: 21 of them, on both sides. */
  const THEY_LEAVES: readonly string[] = [
    "lever.worthOut", "lever.worthMaybe", "lever.worthStill", "lever.worthStillMany",
    "money.healthy", "money.noCac", "money.monthsLoss", "money.monthsMaybe",
    "money.warnRunway", "money.warnRunwayMaybe", "money.warnFloor", "money.warnFloorMaybe",
    "slide.unitWarnRunway", "slide.unitWarnRunwayMaybe", "slide.unitWarnFloor", "slide.unitWarnFloorMaybe",
    "slide.chartSummaryLoss", "slide.chartSummaryHealthy", "slide.chartSummaryMaybe", "slide.chartSummaryNone",
    "findings.unitEconLossMaybe",
  ];

  /**
   * Where « it » and « its » stay in an English sheet, one by one: the word is a thing, never the buyer or the seller.
   * A leaf not listed holds none. The test below holds each listed leaf to still holding the word.
   */
  const IT_IS_A_THING: Record<string, string> = {
    "terms.window.definition": "\"Change it in Settings\": the window",
    "settings.windowHint": "\"for it to count\": the action the window bounds",
    "money.noMarginNote": "\"Without it\", \"stands in for it\": the margin",
    "money.lineLoss": "\"it does not all come back\": the acquisition cost",
    "money.lineMaybe": "\"it all comes back\": the acquisition cost",
    "money.lineHealthy": "\"It all comes back\": the acquisition cost",
    "money.warnFloor": "\"against it\": the runway",
    "money.warnFloorMaybe": "\"against it\": the runway",
    "scenario.assumeCash": "\"which slows it\": the return of the spend",
    "scenario.aloneTitle": "\"on its own\": the lever",
    "terms.sharedCount.definition": "\"it changes\", \"its own base\": a count, a number",
    "terms.arr.definition": "\"It isn't guaranteed revenue\": the ARR",
  };

  const IT = /\b(it|its)\b/i;
  /** What the coordinator asked to see gone, in the form it was written. */
  const ITS_COST = /\bits cost\b/;
  const IT_BRINGS = /\bIt brings\b/;
  const english = (layer: "common" | "demand" | "supply") => LAYER[layer].map((l) => ({ path: l.path, en: l.copy.en }));

  it("sees what it looks for: each pattern trips on the wording it forbids, and not on « their cost »", () => {
    expect(ITS_COST.test("paying back its cost would take")).toBe(true);
    expect(ITS_COST.test("paying back their cost would take")).toBe(false);
    expect(IT_BRINGS.test("A new buyer: no longer a loss. It brings back")).toBe(true);
    expect(IT_BRINGS.test("They bring back")).toBe(false);
    expect(IT.test("what it costs")).toBe(true);
    expect(IT.test("Only used to warn you when a buyer takes longer to pay back their cost.")).toBe(false);
    // « It » in a word is not the pronoun: "item", "gravity".
    expect(IT.test("one item of the list")).toBe(false);
  });

  for (const side of SIDES) {
    it(`says « they » or « their » on each of the ${THEY_LEAVES.length} leaves of the ${side} the lexicon rewrote from « it »`, () => {
      expect(new Set(THEY_LEAVES).size).toBe(THEY_LEAVES.length);
      const sheet = new Map(english(side).map((l) => [l.path, l.en]));
      const missing = THEY_LEAVES.filter((p) => !sheet.has(p));
      expect(missing, `${side}: not in the sheet`).toEqual([]);
      const stillIt = THEY_LEAVES.filter((p) => !/\b(they|their)\b/i.test(sheet.get(p)!)).map((p) => `${p}: ${sheet.get(p)}`);
      expect(stillIt).toEqual([]);
    });
  }

  it("holds neither « its cost » nor « It brings » in the demand's or the supply's English", () => {
    const offenders = (["demand", "supply"] as const).flatMap((layer) =>
      english(layer).filter((l) => ITS_COST.test(l.en) || IT_BRINGS.test(l.en)).map((l) => `${layer}.${l.path}: ${l.en}`),
    );
    expect(offenders).toEqual([]);
  });

  it("leaves « it » and « its » only where the word is a thing, in any of the three sheets", () => {
    const offenders = (["common", "demand", "supply"] as const).flatMap((layer) =>
      english(layer).filter((l) => IT.test(l.en) && !(l.path in IT_IS_A_THING)).map((l) => `${layer}.${l.path}: ${l.en}`),
    );
    expect(offenders).toEqual([]);
    // And every name on the list still holds the word, in at least one sheet: an exception that stopped being one leaves it.
    const held = new Set((["common", "demand", "supply"] as const).flatMap((layer) => english(layer).filter((l) => IT.test(l.en)).map((l) => l.path)));
    expect(Object.keys(IT_IS_A_THING).filter((p) => !held.has(p))).toEqual([]);
  });

  it("keeps the French of the supply's sign-up assumption in step with its English: the sellers' sign-up rate", () => {
    const text = (path: string, lang: "fr" | "en") => LAYER_BY_PATH.supply.get(path)!.copy[lang];
    expect(text("scenario.assumption.signup-same-visitors", "fr")).toBe("Le taux d'inscription des vendeurs s'applique aux mêmes visiteurs de la page vendeurs qu'aujourd'hui.");
    expect(text("scenario.assumption.signup-same-visitors", "en")).toBe("The seller sign-up rate applies to the same seller page visitors as today.");
  });
});

// ------------------------------------------------------------------------------------------------ no orphan (point 3)

describe("no orphan key (§22.8.3, point 3)", () => {
  for (const layer of ["common", "demand", "supply"] as const) {
    it(`has every ${layer} leaf in the base, at the same path`, () => {
      expect(LAYER[layer].length).toBeGreaterThan(layer === "common" ? 5 : 90);
      expect(LAYER[layer].filter((l) => !BASE_BY_PATH.has(l.path)).map((l) => l.path)).toEqual([]);
    });

    it(`carries, on each ${layer} leaf and in each language, the placeholders of the leaf it replaces`, () => {
      const mismatched = LAYER[layer].flatMap((l) => {
        const base = BASE_BY_PATH.get(l.path)!;
        return LOCALES.flatMap((lang) => {
          const mine = placeholdersOf(l.copy[lang]).join();
          const theirs = placeholdersOf(base.copy[lang]).join();
          return mine === theirs ? [] : [`${l.path}.${lang}: [${mine}] against the base's [${theirs}]`];
        });
      });
      expect(mismatched).toEqual([]);
    });

    it(`is made of whole { fr, en } leaves and branches, and of nothing else — no bare string, no half leaf (${layer})`, () => {
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
      })(ENGINE_COPY_MKT[layer], []);
      expect(bare).toEqual([]);
    });
  }

  it("agrees with the base on the placeholders of the marketplace's own sheets, and on their count", () => {
    // §22.8.5 b: 58 leaves, side (8), funnel (34), money (6), total (10) — and the six rules of `mkt.assumption` already there.
    const own = MKT_OWN.filter((l) => l.segments[1] !== "assumption");
    expect(own.length).toBe(58);
    const counts = Object.fromEntries(["side", "funnel", "money", "total"].map((group) => [group, own.filter((l) => l.segments[1] === group).length]));
    expect(counts).toEqual({ side: 8, funnel: 34, money: 6, total: 10 });
    const mismatched = own.filter((l) => placeholdersOf(l.copy.fr).join() !== placeholdersOf(l.copy.en).join()).map((l) => l.path);
    expect(mismatched).toEqual([]);
  });

  it("does not rewrite a `mkt.*` leaf in an overlay: the marketplace's own words are written once, with the words of \"products\"", () => {
    for (const layer of ["common", "demand", "supply"] as const) expect(LAYER[layer].filter((l) => l.segments[0] === "mkt").map((l) => l.path)).toEqual([]);
  });
});

// ------------------------------------------------------------------------------------------------ never one against the other (point 6)

describe("never « offre contre demande » (§22.8.3, point 6, D14)", () => {
  /** What §22.8.3 lists, in the form the hybrid's guard has (`engine-copy.test.ts`): `vs` as a word, the rest as phrases. */
  const AGAINST: Record<"fr" | "en", RegExp> = {
    fr: /(?<![\p{L}\p{N}])vs(?![\p{L}\p{N}])|contre l['’]offre|contre la demande|plutôt que|plus que la demande|plus que l['’]offre|offre ou demande|demande ou offre/iu,
    en: /(?<![\p{L}\p{N}])(vs|versus)(?![\p{L}\p{N}])|rather than|more than supply|more than demand|supply or demand|demand or supply/iu,
  };

  /** The marketplace's own leaves, the three sheets', and every slide title whose key starts with `mkt` (the titles are MKT-7b's and MKT-8's). */
  const SWEPT: Leaf[] = [
    ...MKT_OWN,
    ...LAYER.common,
    ...LAYER.demand,
    ...LAYER.supply,
    ...BASE.filter((l) => isUnder(l.path, "slideTitles") && l.segments[1]!.startsWith("mkt")),
  ];

  it("sweeps a hundred leaves — otherwise the next test proves nothing", () => {
    expect(SWEPT.length).toBeGreaterThan(250);
  });

  it("sees what it looks for: each phrase of the list trips the guard, in the language it is written in", () => {
    for (const phrase of ["l'offre vs la demande", "plutôt que la demande", "contre l'offre", "contre la demande", "plus que la demande", "plus que l'offre", "offre ou demande", "demande ou offre"]) {
      expect(AGAINST.fr.test(phrase), phrase).toBe(true);
    }
    for (const phrase of ["supply vs demand", "supply versus demand", "rather than demand", "more than supply", "more than demand", "supply or demand", "demand or supply"]) {
      expect(AGAINST.en.test(phrase), phrase).toBe(true);
    }
    // And it does not trip on the words alone, nor on a letter run that holds `vs`.
    expect(AGAINST.fr.test("La demande : les acheteurs, l'offre : les vendeurs")).toBe(false);
    expect(AGAINST.en.test("Demand: the buyers. Supply: the sellers. Canvas")).toBe(false);
  });

  it("holds no comparison of the two sides in any of them, either language", () => {
    const offenders = SWEPT.flatMap((l) => LOCALES.flatMap((lang) => (AGAINST[lang].test(l.copy[lang]) ? [`${l.path}.${lang}: ${l.copy[lang]}`] : [])));
    expect(offenders).toEqual([]);
  });
});

// ------------------------------------------------------------------------------------------------ the words of "services" (point 5)

/** The three sheets of "services", as leaves. */
const SERVICES_LAYER = {
  common: leavesOf(ENGINE_COPY_MKT_SERVICES.common),
  demand: leavesOf(ENGINE_COPY_MKT_SERVICES.demand),
  supply: leavesOf(ENGINE_COPY_MKT_SERVICES.supply),
};
const SERVICES_LAYER_BY_PATH = {
  common: new Map(SERVICES_LAYER.common.map((l) => [l.path, l])),
  demand: new Map(SERVICES_LAYER.demand.map((l) => [l.path, l])),
  supply: new Map(SERVICES_LAYER.supply.map((l) => [l.path, l])),
};
/** What a set of a marketplace reads, in the words of one offering: `side` null is the neutral set (the bar, the list, the total, the setup card). */
const readSet = (offering: "products" | "services", side: MktSide | null) => leavesOf(marketplaceStrings<unknown>(ENGINE_COPY, LAYERS, offering, side));
const SERVICES_SETS: readonly (readonly [string, MktSide | null])[] = [["the demand's", "demand"], ["the supply's", "supply"], ["the neutral", null]];
const servicesExcluded = (leaf: Leaf) => MKT_SERVICES_EXCLUDED.some(({ excludes }) => excludes(leaf.segments, leaf.path));
const productWords = (copy: Translatable) => LOCALES.flatMap((lang) => servicesWordsHeld(copy[lang], lang).map((word) => `${lang}: ${word}`));

describe("a services marketplace no longer speaks « produits » (§22.8.3, point 5, §22.8.4)", () => {
  it("sees what it looks for: each word of the list trips it in its language, whole and with its case ignored — and not the letters around it", () => {
    for (const word of ["acheteur", "acheteurs", "vendeur", "vendeurs", "commande", "commandes", "commander", "annonce", "annonces", "panier", "vente", "ventes", "vend", "vendent", "vendu", "vendue", "vendus", "vendues", "achat", "achats"]) {
      expect(servicesWordsHeld(`le ${word} ici`, "fr"), word).toEqual([word]);
      expect(servicesWordsHeld(`LE ${word.toUpperCase()}.`, "fr"), word).toEqual([word.toUpperCase()]);
    }
    for (const word of ["buyer", "buyers", "seller", "sellers", "order", "orders", "ordered", "listing", "listings", "sale", "sales", "sell", "sells", "sold", "purchase", "purchases", "basket", "buy", "buys"]) {
      expect(servicesWordsHeld(`the ${word} here`, "en"), word).toEqual([word]);
    }
    // An apostrophe and a hyphen are not letters: « l'acheteur », « cinq-vendeurs » hold the word. A letter on either side makes another word.
    expect(servicesWordsHeld("l'acheteur et le vendeur-conseil", "fr")).toEqual(["acheteur", "vendeur"]);
    expect(servicesWordsHeld("un invendu, un commandement, la vendeuse, les acheteuses, la ventilation, une venteuse", "fr")).toEqual([]);
    expect(servicesWordsHeld("a reseller, an overorder, in order to sell? no: the seller's", "en")).toEqual(["order", "sell", "seller"]);
    // The words of services, and the two French infinitives the lexicon names but §22.8.3's list does not.
    expect(servicesWordsHeld("clients, prestataires, réservations, profils, réserver, montant de la réservation reçue", "fr")).toEqual([]);
    expect(servicesWordsHeld("clients, providers, bookings, profiles, to book, booking received", "en")).toEqual([]);
    expect(servicesWordsHeld("vendre ou acheter", "fr")).toEqual([]);
    // « é » is a letter: a « \b » would have read « évendu » as the word « vendu ».
    expect(SERVICES_BANNED.fr.test("évendu")).toBe(false);
  });

  it("excludes exactly what `MKT_EXCLUDED` does, but the leaves written for the marketplace — the `mkt` key, the `Mkt` part and the `mkt` prefix", () => {
    const own = BASE.filter((l) => l.segments[0] === "mkt" || l.segments.some((x) => x.includes("Mkt") || x.startsWith("mkt")));
    expect(own.length).toBeGreaterThan(80);
    // Excluded for the words of "products" (they are written in them), read for the words of "services".
    expect(own.filter((l) => !isExcluded(l)).length).toBe(0);
    expect(own.filter((l) => servicesExcluded(l) && !MKT_EXCLUDED.slice(3).some(({ excludes }) => excludes(l.segments, l.path)) && !MKT_EXCLUDED[1]!.excludes(l.segments, l.path)).map((l) => l.path)).toEqual([]);
    // Every other leaf is read as before: the two lists agree outside `own`.
    const disagree = BASE.filter((l) => !own.includes(l) && isExcluded(l) !== servicesExcluded(l)).map((l) => l.path);
    expect(disagree).toEqual([]);
    // The two lines it changes, line for line: 1 and 3 (the others are the very entries of `MKT_EXCLUDED`).
    expect(MKT_SERVICES_EXCLUDED.map((e) => e.line)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(MKT_SERVICES_EXCLUDED.filter((e, i) => e !== MKT_EXCLUDED[i]).map((e) => e.line)).toEqual([1, 3]);
  });

  for (const [name, side] of SERVICES_SETS) {
    it(`reads a lot, and finds a lot in « produits » — ${name} set: otherwise the next test proves nothing`, () => {
      const read = readSet("services", side).filter((l) => !servicesExcluded(l));
      expect(read.length).toBeGreaterThan(900);
      // The same rule on the words of « produits »: the buyers' and the sellers' words are there to find.
      const found = readSet("products", side).filter((l) => !servicesExcluded(l) && productWords(l.copy).length > 0);
      expect(found.length).toBeGreaterThan(side === null ? 70 : side === "demand" ? 140 : 160);
    });

    it(`holds no word of « produits » in any leaf it reads, either language — ${name} set, outside the named exception`, () => {
      const offenders = readSet("services", side)
        .filter((l) => !servicesExcluded(l) && !(l.path in SERVICES_NAMED_EXCEPTIONS))
        .flatMap((l) => (productWords(l.copy).length > 0 ? [`${l.path}: ${productWords(l.copy).join(", ")} — ${l.copy.fr} / ${l.copy.en}`] : []));
      expect(offenders).toEqual([]);
    });
  }

  it("names its exception one by one: `io.unsupportedSetup`, in the base, rewritten by no sheet, and still holding the word", () => {
    expect(Object.keys(SERVICES_NAMED_EXCEPTIONS)).toEqual(["io.unsupportedSetup"]);
    for (const path of Object.keys(SERVICES_NAMED_EXCEPTIONS)) {
      const base = BASE_BY_PATH.get(path);
      expect(base, `${path} is not in ENGINE_COPY any more: take it off the list`).toBeDefined();
      expect(productWords(base!.copy), `${path} holds no word of the rule any more: take it off the list`).not.toEqual([]);
      for (const layer of ["common", "demand", "supply"] as const) expect(SERVICES_LAYER_BY_PATH[layer].has(path), `${path} is rewritten by the ${layer} sheet: it is no exception`).toBe(false);
      // The reason is written, and it says why no overlay could reach the leaf.
      expect(SERVICES_NAMED_EXCEPTIONS[path]!.length).toBeGreaterThan(40);
    }
  });

  it.each(LOCALES)("holds no word of « produits » in any text of the services catalogue — a name, a formula, a trap, a request, a place to look, a variant (%s)", (locale) => {
    const props = resolveEngineProps(locale);
    /** Every string a screen can print from a catalogue, with its path (the ids, the glossary link and the sources are not prose). */
    const texts = (node: unknown, path: string, out: { path: string; text: string }[] = []) => {
      if (typeof node === "string") out.push({ path, text: node });
      else if (Array.isArray(node)) node.forEach((child, i) => texts(child, `${path}.${i}`, out));
      else if (node && typeof node === "object") {
        for (const [key, child] of Object.entries(node)) if (!["id", "glossaryHref", "source"].includes(key)) texts(child, `${path}.${key}`, out);
      }
      return out;
    };
    const catalog = props.typeCatalogs["marketplace-services"];
    const all = [...catalog.metrics.flatMap((m) => texts(m, m.id)), ...catalog.derived.flatMap((d) => texts(d, d.id))];
    expect(all.length).toBeGreaterThan(250);
    expect(all.filter(({ text }) => servicesWordsHeld(text, locale).length > 0).map(({ path, text }) => `${path}: ${text}`)).toEqual([]);
    // Not blind: the same walk, on the catalogue of « produits », finds the words in a hundred and more of them.
    const products = props.typeCatalogs.marketplace;
    const before = [...products.metrics.flatMap((m) => texts(m, m.id)), ...products.derived.flatMap((d) => texts(d, d.id))];
    expect(before.filter(({ text }) => servicesWordsHeld(text, locale).length > 0).length).toBeGreaterThan(100);
  });

  it("writes the words of §22.8.4 on the leaves that carry them: clients, prestataires, réservations, reçue", () => {
    const text = (side: MktSide | null, path: string, lang: "fr" | "en") => readSet("services", side).find((l) => l.path === path)!.copy[lang];
    expect(text("demand", "money.worthTitle", "fr")).toBe("Ce que vaut un nouveau client");
    expect(text("demand", "money.worthTitle", "en")).toBe("What one new client is worth");
    expect(text("supply", "money.worthTitle", "fr")).toBe("Ce que vaut un nouveau prestataire abonné");
    expect(text("supply", "scenario.signups", "fr")).toBe("Prestataires inscrits");
    expect(text("supply", "scenario.visitors", "fr")).toBe("Visiteurs de la page prestataires");
    expect(text("supply", "scenario.visitors", "en")).toBe("Provider page visitors");
    expect(text("supply", "findings.chainBreak", "en")).toBe("Out of 100 provider sign-ups, we can't say how many {verb}.");
    // The marketplace's own leaves, written once for the neutral set and read first by each side.
    expect(text(null, "mkt.side.buy", "fr")).toBe("Clients");
    expect(text(null, "mkt.side.sell", "fr")).toBe("Prestataires");
    expect(text(null, "mkt.side.supplyTitle", "en")).toBe("Supply: the providers");
    // §22.8.4's own example: « {a} reçoivent une première réservation ».
    expect(text(null, "mkt.funnel.clauseFirstSale", "fr")).toBe("{a} reçoivent une première réservation");
    expect(text(null, "mkt.funnel.clauseFirstSaleOne", "fr")).toBe("{a} reçoit une première réservation");
    expect(text(null, "mkt.funnel.clauseFirstSale", "en")).toBe("{a} receive a first booking");
    expect(text(null, "mkt.funnel.firstSale", "fr").replace(/ /g, " ")).toBe("Première réservation reçue sous {n} jours");
    expect(text(null, "mkt.funnel.unmeasured.firstSale", "fr")).toBe("la première réservation reçue");
    expect(text(null, "findings.verbMkt.firstSale", "fr")).toBe("reçoivent une première réservation");
    // « un panier » of the levers' sentence reads « un montant de la réservation » (§22.8.4: « panier seul »).
    expect(text(null, "mkt.assumption.money-levers-all-buyers", "fr")).toContain("un montant de la réservation");
    expect(text(null, "leverSubject.mkt.rev.aov", "fr")).toBe("le montant moyen d'une réservation");
    // « vendre », « vend » : être réservé, reçoit une réservation.
    expect(text(null, "terms.window.definition", "fr")).toContain("être réservé en 60");
    expect(text(null, "terms.window.definition", "en")).toContain("get booked within 60");
  });

  it("says the first order and the second with the same verb: « font une première réservation » and « en font une deuxième » (the lexicon's « passer une commande »)", () => {
    // `clauseRepeat` and `verbMkt.repeat` hold no word of the rule (« en passent une deuxième »), yet « passer une commande » is
    // « faire une réservation » (§22.8.4): left alone, a funnel line would say « font une première réservation et en passent une deuxième ».
    const text = (path: string, lang: "fr" | "en") => readSet("services", null).find((l) => l.path === path)!.copy[lang];
    expect(text("mkt.funnel.clauseFirst", "fr")).toBe("{a} font une première réservation");
    expect(text("mkt.funnel.clauseRepeat", "fr")).toBe("{r} en font une deuxième");
    expect(text("mkt.funnel.clauseFirstOne", "fr")).toBe("{a} fait une première réservation");
    expect(text("mkt.funnel.clauseRepeatOne", "fr")).toBe("{r} en fait une deuxième");
    expect(text("findings.verbMkt.first", "fr")).toBe("font une première réservation");
    expect(text("findings.verbMkt.repeat", "fr")).toBe("en font une deuxième");
    expect(text("mkt.funnel.clauseFirst", "en")).toBe("{a} make a first booking");
    expect(text("mkt.funnel.clauseRepeat", "en")).toBe("{r} make a second one");
    expect(text("findings.verbMkt.repeat", "en")).toBe("make a second one");
    // None of the six says « passer » or "place" any more.
    for (const path of ["mkt.funnel.clauseFirst", "mkt.funnel.clauseFirstOne", "mkt.funnel.clauseRepeat", "mkt.funnel.clauseRepeatOne", "findings.verbMkt.first", "findings.verbMkt.repeat"]) {
      expect(text(path, "fr"), path).not.toMatch(/\bpass/);
      expect(text(path, "en"), path).not.toMatch(/\bplace/);
    }
  });

  it("leaves the named exception, and what the setup card reads before a type is known, as « produits » wrote it", () => {
    for (const side of [...SIDES, null] as const) {
      const set = new Map(readSet("services", side).map((l) => [l.path, l]));
      expect(set.get("io.unsupportedSetup")!.copy).toEqual(BASE_BY_PATH.get("io.unsupportedSetup")!.copy);
    }
    // `start.*` is excluded (the card names both vocabularies and never goes through the services words).
    for (const side of [...SIDES, null] as const) {
      const set = new Map(readSet("services", side).map((l) => [l.path, l]));
      for (const l of BASE.filter((x) => x.segments[0] === "start")) expect(set.get(l.path)!.copy, l.path).toEqual(l.copy);
    }
  });
});

describe("the sheets of \"services\" keep to the structure of the copy (§22.8.3, point 3 on them)", () => {
  /** What a leaf of each sheet replaces: the text of the same path in the "products" set the sheet lies on — the neutral set for `common`, the side's for the others. */
  const BEFORE = {
    common: new Map(readSet("products", null).map((l) => [l.path, l])),
    demand: new Map(readSet("products", "demand").map((l) => [l.path, l])),
    supply: new Map(readSet("products", "supply").map((l) => [l.path, l])),
  };

  for (const layer of ["common", "demand", "supply"] as const) {
    it(`has every ${layer} leaf in the base, at the same path`, () => {
      expect(SERVICES_LAYER[layer].length).toBeGreaterThan(70);
      expect(SERVICES_LAYER[layer].filter((l) => !BASE_BY_PATH.has(l.path)).map((l) => l.path)).toEqual([]);
    });

    it(`carries, on each ${layer} leaf and in each language, the placeholders of the leaf it replaces`, () => {
      const mismatched = SERVICES_LAYER[layer].flatMap((l) => {
        const base = BASE_BY_PATH.get(l.path)!;
        return LOCALES.flatMap((lang) => {
          const mine = placeholdersOf(l.copy[lang]).join();
          const theirs = placeholdersOf(base.copy[lang]).join();
          return mine === theirs ? [] : [`${l.path}.${lang}: [${mine}] against the base's [${theirs}]`];
        });
      });
      expect(mismatched).toEqual([]);
    });

    it(`is made of whole { fr, en } leaves and branches, and of nothing else — no bare string, no half leaf (${layer})`, () => {
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
      })(ENGINE_COPY_MKT_SERVICES[layer], []);
      expect(bare).toEqual([]);
    });

    it(`changes every ${layer} leaf, in one language at least, from the "products" text it lies on — a leaf equal to it is a no-op`, () => {
      const unchanged = SERVICES_LAYER[layer].filter((l) => {
        const before = BEFORE[layer].get(l.path)!;
        return before.copy.fr === l.copy.fr && before.copy.en === l.copy.en;
      });
      expect(unchanged.map((l) => l.path)).toEqual([]);
    });
  }

  it("writes a leaf once: none is in `common` and in a side's sheet, and none is written alike by both sides (it would be `common`'s)", () => {
    for (const side of SIDES) {
      const both = SERVICES_LAYER[side].filter((l) => SERVICES_LAYER_BY_PATH.common.has(l.path)).map((l) => l.path);
      expect(both, `in common AND in ${side}: the side would overrule it`).toEqual([]);
    }
    const alike = SERVICES_LAYER.demand.filter((l) => {
      const other = SERVICES_LAYER_BY_PATH.supply.get(l.path);
      return other && other.copy.fr === l.copy.fr && other.copy.en === l.copy.en;
    });
    expect(alike.map((l) => l.path), "written alike by both sides: it is common's (§22.8.4)").toEqual([]);
  });

  it("rewrites, for a side, only a leaf its \"products\" sheet or the base holds a word of « produits » in — never a leaf the rule does not read for that side", () => {
    for (const side of SIDES) {
      const stray = SERVICES_LAYER[side].filter((l) => productWords(BEFORE[side].get(l.path)!.copy).length === 0).map((l) => l.path);
      expect(stray, `${side}: no word of « produits » in the leaf it replaces`).toEqual([]);
    }
    // `common` also carries the verbs of the order the rule does not hold (« en passent une deuxième »): named, three leaves.
    const verbs = SERVICES_LAYER.common.filter((l) => productWords(BEFORE.common.get(l.path)!.copy).length === 0).map((l) => l.path);
    expect(verbs.sort()).toEqual(["findings.verbMkt.repeat", "mkt.funnel.clauseRepeat", "mkt.funnel.clauseRepeatOne"]);
  });

  it("never sets the two sides against each other, in the sheets of \"services\" either (§22.8.3, point 6, D14)", () => {
    const AGAINST: Record<"fr" | "en", RegExp> = {
      fr: /(?<![\p{L}\p{N}])vs(?![\p{L}\p{N}])|contre l['’]offre|contre la demande|plutôt que|plus que la demande|plus que l['’]offre|offre ou demande|demande ou offre/iu,
      en: /(?<![\p{L}\p{N}])(vs|versus)(?![\p{L}\p{N}])|rather than|more than supply|more than demand|supply or demand|demand or supply/iu,
    };
    const swept = [...SERVICES_LAYER.common, ...SERVICES_LAYER.demand, ...SERVICES_LAYER.supply];
    expect(swept.length).toBeGreaterThan(240);
    const offenders = swept.flatMap((l) => LOCALES.flatMap((lang) => (AGAINST[lang].test(l.copy[lang]) ? [`${l.path}.${lang}: ${l.copy[lang]}`] : [])));
    expect(offenders).toEqual([]);
  });
});

// ------------------------------------------------------------------------------------------------ the page (§22.8.1)

describe("the page hands the island the overlays resolved (§22.8.1)", () => {
  it.each(LOCALES)("`typeStrings.marketplace` is the six sheets, the three of \"products\" and the three of \"services\", resolved to the page's language (%s)", (locale) => {
    const props = resolveEngineProps(locale);
    expect(props.typeStrings.marketplace.products).toEqual(resolveTree(ENGINE_COPY_MKT, locale));
    expect(props.typeStrings.marketplace.services).toEqual(resolveTree(ENGINE_COPY_MKT_SERVICES, locale));
    // The island merges after resolving: the same strings as resolving after merging, for each side and for the neutral set.
    for (const side of [...SIDES, null] as const) {
      const merged = marketplaceStrings(props.strings, props.typeStrings.marketplace, "products", side);
      const expected = side === null ? mergeStrings<unknown>(ENGINE_COPY, ENGINE_COPY_MKT.common) : MERGED[side];
      expect(merged).toEqual(resolveTree(expected, locale));
      // And in the words of "services": the same, with the three sheets of "services" laid on the "products" ones.
      expect(marketplaceStrings(props.strings, props.typeStrings.marketplace, "services", side)).toEqual(resolveTree(marketplaceStrings<unknown>(ENGINE_COPY, LAYERS, "services", side), locale));
    }
    // Each family of sheets is a partial tree: a small part of the copy, not a second copy of it (a quarter of the base each,
    // 22 989 and 24 602 characters against 93 339, in French on 2026-10-26; the six together are a little over half).
    for (const family of [props.typeStrings.marketplace.products, props.typeStrings.marketplace.services]) {
      expect(JSON.stringify(family).length).toBeLessThan(JSON.stringify(props.strings).length / 2);
    }
  });

  it("serves the neutral set only the common sheet: the setup card and the Settings read the six leaves of C105, no side's wording", () => {
    const props = resolveEngineProps("fr");
    const neutral = marketplaceStrings(props.strings, props.typeStrings.marketplace, "products", null);
    expect(neutral.setup.referenceMonthHint).toBe(resolveTree(ENGINE_COPY_MKT.common, "fr").setup!.referenceMonthHint);
    // A leaf only a side rewrites reads the SaaS's in the neutral set (the bar, the list and the total read nothing of it).
    expect(neutral.money.worthTitle).toBe(props.strings.money.worthTitle);
  });
});
