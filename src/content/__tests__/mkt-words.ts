/**
 * The marketplace's word lists (engine spec §22.8.3 and §22.11.3, A23 MKT-5): which leaves of `ENGINE_COPY` a side's
 * overlay must rewrite, which words it must no longer hold, and which leaves it cannot rewrite. Not a test file
 * (vitest only collects `*.test.ts`): `engine-copy-marketplace.test.ts` reads it today, and the on-screen guard of
 * MKT-10 (`mkt-words-guard.test.ts` and `e2e/engine-marketplace.spec.ts`) reads the same lists, so the copy and what
 * is displayed can never disagree on what a SaaS word is. MKT-S adds `SERVICES_BANNED` and `MKT_SERVICES_EXCLUDED`.
 *
 * A leaf is a `{ fr, en }` pair of `ENGINE_COPY`. Its path is dotted for display, and its SEGMENTS are what a rule
 * reads, because some keys hold a dot themselves (`subject["mkt.buy.first-order"]`, `leverSubject["app.ret.active-retention"]`).
 */

/** One line of §22.8.3 "Les chemins exclus": what a marketplace never shows, or shows in the words of another key. */
export interface ExclusionLine {
  /** The line of §22.8.3, 1 to 8 */
  line: number;
  excludes: (segments: readonly string[], path: string) => boolean;
}

/** A path is `branch` itself or something below it. */
export const isUnder = (path: string, branch: string): boolean => path === branch || path.startsWith(`${branch}.`);
export const underAny = (path: string, branches: readonly string[]): boolean => branches.some((branch) => isUnder(path, branch));

/**
 * The leaves the consumer app prints and the SaaS does not: the new keys of §21.8.4 b, one by one (§22.8.3, line 8).
 * A marketplace shows none of them, whatever words they hold. Paths are dotted; a key that holds a dot is written as the
 * tree has it (`leverSubject.app.ret.active-retention`).
 */
const APP_ONLY_LEAVES: readonly string[] = [
  // APP-1, APP-2
  "tools.revenuecat", "tools.appsflyer", "tools.adjust", "io.sharedCount.appActives", "setup.toolFamily.mobile",
  // APP-4, APP-5
  "leverSubject.app.ret.active-retention", "leverSubject.app.rev.purchases-per-active", "leverSubject.app.rev.ads-per-active", "leverSubject.app.rev.commission",
  "scenario.assumption.actives-follow-d30", "scenario.assumption.per-active-all-actives", "scenario.assumption.commission-margin-only",
  "scenario.assumption.same-spend-installs", "scenario.assumption.install-months", "scenario.assumption.usage-twelve-months",
  "subject.app.ret.active-retention",
  // APP-6
  "sanity.commissionHigh",
  // APP-7
  "start.legendTypes", "start.ssTyped", "start.saTyped", "start.bothTyped", "start.app", "start.appNote", "start.appEarnsLegend",
  "start.appEarns.subscriptions", "start.appEarns.purchases", "start.appEarns.ads", "start.appEarnsNone", "start.defaultsApp",
  "setup.appSells", "setup.appEarnsLegend", "setup.typeFixed", "settings.streamLast", "setup.companyLabelApp",
  "settings.streamSubject.subscriptions", "settings.streamSubject.purchases", "settings.streamSubject.ads",
  "settings.streamOffNone", "settings.streamOffOne", "settings.streamOff", "settings.streamOnOne", "settings.streamOn",
  "workbench.modelShort.app",
  // APP-8
  "appStreams.eyebrow", "appStreams.titlePurchases", "appStreams.titleAds", "appStreams.titleBoth", "appStreams.subscriptions", "appStreams.total",
  "appStreams.usagePurchases", "appStreams.usageAds", "appStreams.usageBoth", "appStreams.newPerMonth", "appStreams.in12Months",
  "money.monthsApp", "money.monthsAppBeyond", "scenario.missingActives", "money.lineApp", "scenario.rowValue12", "scenario.assumeLtvApp",
  // APP-9
  "slide.installChartPaysBack", "slide.installChartLoss", "slide.installChartSummaryHealthy", "slide.installChartSummaryLoss",
  "slideTitles.pelotonCompleteTwo", "slideTitles.whatIfLeverMargin",
  "whatIf.todayActives", "whatIf.thenActives", "whatIf.thenActivesOne", "whatIf.timesActives", "whatIf.todayActivesFlow", "whatIf.todayActivesFlowOne",
  "whatIf.timesActivesFlow", "whatIf.usageThenFlow", "whatIf.usageThenReferral", "whatIf.sumApp", "whatIf.annualApp",
  "whatIf.lessThanOneActive", "whatIf.lessThanOneActiveKept", "worth.lessThanOneActive", "worth.lessThanOneActiveKept",
  "slide.unitValue12", "slide.unitAssumeApp", "scenario.kpiValue12",
  // APP-10, APP-11
  "example.bannerTitleApp", "example.companyApp", "example.eventApp", "example.channelApp", "example.churnCauseApp", "example.bannerBodyApp",
  "faqTypeNote.consumerApp",
];

/**
 * What a marketplace never displays, line for line and in the order of §22.8.3 "Les chemins exclus" (the app's
 * `APP_EXCLUDED`, plus the marketplace's own). A leaf is excluded as soon as ONE line designates it. A branch named
 * below excludes everything under it.
 */
export const MKT_EXCLUDED: readonly ExclusionLine[] = [
  {
    // 1. The top-level keys a marketplace does not show: the hybrid's and the assisted motion's, the funnel of the SaaS
    // (`peloton`: a marketplace's has its own, `mkt.funnel`), the page and its metadata, the start card (it carries its
    // keys by type), the tools' and the roles' names (a job's name, « Customer Success », stays as it is); and `mkt`,
    // written for it.
    line: 1,
    excludes: (segments) => ["hybrid", "total", "relays", "pipeline", "slgChain", "peloton", "faq", "meta", "page", "start", "tools", "role", "mkt"].includes(segments[0]!),
  },
  {
    // 2. In `subject`, `leverSubject` and `unitInput`, every entry whose key does not start with `mkt`: those are the
    // phrases of the SaaS's and the app's numbers; the marketplace's have their own key (§22.8.5).
    line: 2,
    excludes: (segments) => ["subject", "leverSubject", "unitInput"].includes(segments[0]!) && !segments[1]!.startsWith("mkt"),
  },
  {
    // 3. A segment that holds `slg`, `Slg`, `plg`, `Plg`, `hybrid`, `Hybrid`, `link`, `Link`, `peloton`, `Peloton`, `Both`
    // or `Mkt`, or starts with `mkt` (the leaves written for the marketplace: `io.sharedCount.mkt*`, `subject["mkt.…"]`,
    // `sanity.mkt*`, `slideTitles.mkt*`, `example.bannerTitleMkt`, `findings.verbMkt`…).
    line: 3,
    excludes: (segments) =>
      segments.some((s) => ["slg", "Slg", "plg", "Plg", "hybrid", "Hybrid", "link", "Link", "peloton", "Peloton", "Both", "Mkt"].some((x) => s.includes(x)) || s.startsWith("mkt")),
  },
  {
    // 4. A segment that is exactly one of these (the start card's entries by type).
    line: 4,
    excludes: (segments) => segments.some((s) => ["sa", "saNote", "saTyped", "both", "bothNote", "bothTyped", "app", "appNote"].includes(s)),
  },
  {
    // 5. The setup of the other types, the path and everything below it.
    line: 5,
    excludes: (_, path) =>
      underAny(path, [
        "setup.types", "setup.typeLater", "setup.motions", "setup.motionsRequired", "setup.companyLabel",
        "settings.motionLast", "workbench.modelShort",
        "example.bannerTitle", "example.bannerBody", "example.company", "example.liveEvent", "example.lossCause", "example.pqlThreshold",
        "slideTitles.total", "slideTitles.totalUnknown",
      ]),
  },
  {
    // 6. What only the hybrid and the assisted motion print, the seven the app excludes too included.
    line: 6,
    excludes: (_, path) =>
      underAny(path, [
        "slideTitles.unitEconomicsNoneMargins", "slideTitles.unitEconomicsNoneDifferent", "slideTitles.unitEconomicsSides",
        "notes.whoCountsWhere", "notes.cycleLong", "notes.whyNotCompare", "notes.selfServeFeeds", "notes.selfServeLever",
        "findings.base", "sanity.cacVariantsDiffer",
        "scenario.kpiWon", "scenario.won", "worth.customersQuarter", "worth.customersQuarterOne", "worth.lessThanOneQuarter",
        "slide.unitSideLoss", "slide.unitSideUnknown",
      ]),
  },
  {
    // 7. What only the SaaS prints: the GRR and the NRR (a marketplace has none), the SaaS's funnel assumptions, the
    // reference lines (no benchmark, D12), the company-wide margin, the funnel checks of the SaaS (the marketplace's are
    // `sanity.mkt*`), the paid window of the SaaS (the marketplace has its own four warnings, §22.8.5 a), and the
    // subscriptions' MRR counts that the NRR and the GRR read.
    line: 7,
    excludes: (_, path) =>
      underAny(path, [
        "scenario.kpiNrr", "scenario.kpiGrr", "scenario.kpiNrr12", "slide.unitRetention", "slide.unitRetentionUnknown", "slide.unitRetentionMissing",
        "scenario.assumption.activation-drives-downstream", "scenario.assumption.d30-drives-paying", "scenario.assumption.arpa-new-customers",
        "scenario.assumption.churn-as-revenue", "scenario.assumption.expansion-unknown", "scenario.assumption.contraction-unknown",
        "slide.leakAssumption", "slide.unitReference", "slide.unitRatioReference", "slide.unitBothReference",
        "sanity.paidGtRetained", "sanity.retainedGtActivated", "settings.paidReset", "io.sharedCount.mrrEnd", "io.sharedCount.mrrStart",
      ]) || path.startsWith("slide.unitCompanyWide"),
  },
  {
    // 8. What only the consumer app prints: the new keys of §21.8.4 b, one by one.
    line: 8,
    excludes: (_, path) => APP_ONLY_LEAVES.includes(path),
  },
];

/** A side's rule: the words that betray the SaaS in one language. Acronyms are whole words, matched with their case. */
export interface WordRule {
  fr: RegExp;
  en: RegExp;
  acronyms: RegExp;
}

/** A word in the sense of the rule: letters and digits around it make it part of another word (« ARRÊT » is not « ARR »). */
const WHOLE = (words: string) => new RegExp(`(?<![\\p{L}\\p{N}_])(${words})(?![\\p{L}\\p{N}_])`, "u");

/**
 * The words of the two sides (§22.8.3, first designation): a leaf holding one is rewritten by BOTH overlays. The demand
 * side's rule is these, and nothing more (its lexicon holds no expression that contains one).
 */
export const DEMAND_WORDS: WordRule = {
  fr: /client|abonné|payant|SaaS/i,
  en: /customer|subscriber|paying|SaaS/i,
  acronyms: WHOLE("MRR|ARR|ARPA"),
};

/** The words only the supply side's rule adds (§22.8.3, second designation): a leaf holding one is rewritten by `supply`. */
const SUPPLY_ONLY_WORDS: WordRule = {
  fr: /inscrit|visiteur/i,
  en: /sign-up|signup|signed up|sign up|visitor/i,
  acronyms: WHOLE("CAC"),
};

/** The supply side's rule: the words of both sides, and its own. */
export const SUPPLY_WORDS: WordRule = {
  fr: new RegExp(`${DEMAND_WORDS.fr.source}|${SUPPLY_ONLY_WORDS.fr.source}`, "i"),
  en: new RegExp(`${DEMAND_WORDS.en.source}|${SUPPLY_ONLY_WORDS.en.source}`, "i"),
  acronyms: WHOLE("MRR|ARR|ARPA|CAC"),
};

/**
 * The supply lexicon's target expressions, which hold a word of the rule and are the words the supply SAYS (§22.8.3,
 * point 2): they are taken out before the rule looks. The demand side has none.
 */
export const SUPPLY_TARGETS = {
  fr: ["vendeur abonné", "vendeurs abonnés", "vendeur inscrit", "vendeurs inscrits", "visiteurs de la page vendeurs", "MRR des abonnements", "ARR des abonnements", "LTV:CAC"],
  en: ["subscription MRR", "subscription ARR", "seller sign-up", "seller sign-ups", "seller page visitors", "LTV:CAC"],
} as const;

/** The text a rule reads: its `{…}` placeholders out (`{arpa}` and `{cac}` are not the words), and, with `targets`, those expressions out. */
export function readable(text: string, locale: "fr" | "en", targets: readonly string[] = []): string {
  let out = text.replace(/\{[^}]*\}/g, "");
  for (const target of targets) out = out.replace(new RegExp(target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), "");
  return out;
}

/** Which languages of a pair hold a word of `rule`, once its placeholders and `targets` are out of the text. */
export function wordsHeld(copy: { fr: string; en: string }, rule: WordRule, targets: { fr: readonly string[]; en: readonly string[] } = { fr: [], en: [] }): ("fr" | "en")[] {
  const fr = readable(copy.fr, "fr", targets.fr);
  const en = readable(copy.en, "en", targets.en);
  return [...(rule.fr.test(fr) || rule.acronyms.test(fr) ? (["fr"] as const) : []), ...(rule.en.test(en) || rule.acronyms.test(en) ? (["en"] as const) : [])];
}

/**
 * The designated leaves the side's lexicon cannot rewrite without changing the sense (§22.8.3): the side shows the
 * SaaS wording there until Antoine rules, and the unit's report names each. One line of comment each says why. A path
 * here is still designated, and still not rewritten by the side's overlay (the test holds both).
 */
export const MKT_OVERLAY_SKIPPED: { demand: readonly string[]; supply: readonly string[] } = {
  demand: [
    // False positive of the rule, not a SaaS word: the English « paying back » is the verb, and the French « part {n} avant » holds none (the app skips it too).
    "scenario.leavesFirst",
    // Same false positive: « part {n} avant d'avoir remboursé » / "leaves {n} before paying back".
    "slide.unitLeavesBefore",
    "slide.unitMayLeaveBefore",
    // « qui s'inscrivent » / "who sign up" is a verb, right for buyers; the supply has no referral lever, so it never prints it.
    "scenario.assumption.referral-on-top",
    // Never displayed on the demand side: its « ? » reads `mkt.terms.netRevenue` (§22.8.5 k). The supply rewrites it (the subscriptions' MRR).
    "terms.arr.definition",
    // Written for the marketplace (§22.8.5 a, MKT-6): « conversion en abonné » is already the supply's word, so neither overlay rewrites it. Not in MKT_EXCLUDED: rule 5 of §22.8.3 still rewrites it in the words of « services ».
    "settings.firstSalePaidReset",
  ],
  supply: [
    // False positive of the rule: the English « paying back » is the verb, and the French « part {n} avant » holds none.
    "scenario.leavesFirst",
    // Same false positive.
    "slide.unitLeavesBefore",
    "slide.unitMayLeaveBefore",
    // The supply side's own reason for the same leaf the demand side lists (MKT-5 added it to §22.8.3's table): the English
    // « who sign up » is a verb the lexicon has no entry for ("seller sign-up" is a noun), and the supply has no referral
    // lever, so it never prints this assumption.
    "scenario.assumption.referral-on-top",
    // Written for the marketplace (§22.8.5 a, MKT-6): « conversion en abonné » is already the supply's word.
    "settings.firstSalePaidReset",
  ],
};
