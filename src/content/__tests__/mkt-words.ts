/**
 * The marketplace's word lists (engine spec §22.8.3 and §22.11.3, A23 MKT-5): which leaves of `ENGINE_COPY` a side's
 * overlay must rewrite, which words it must no longer hold, and which leaves it cannot rewrite. Not a test file
 * (vitest only collects `*.test.ts`): `engine-copy-marketplace.test.ts` reads it today, and the on-screen guard of
 * MKT-10 (`mkt-words-guard.test.ts` and `e2e/engine-marketplace.spec.ts`) reads the same lists, so the copy and what
 * is displayed can never disagree on what a SaaS word is. MKT-S adds `SERVICES_BANNED`, `MKT_SERVICES_EXCLUDED` and
 * `SERVICES_NAMED_EXCEPTIONS` (rule 5 of §22.8.3: the words of "produits" a services marketplace must no longer show).
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

/** Line 1's top-level keys that are not the marketplace's own `mkt` (the services rule reads these, and `mkt` too: it is written in "produits"). */
const LINE_1_KEYS: readonly string[] = ["hybrid", "total", "relays", "pipeline", "slgChain", "peloton", "faq", "meta", "page", "start", "tools", "role"];
/** Line 3's parts of a segment: the other motions' and the hybrid's keys (the `Mkt` part and the `mkt` prefix are the marketplace's own, below). */
const LINE_3_PARTS: readonly string[] = ["slg", "Slg", "plg", "Plg", "hybrid", "Hybrid", "link", "Link", "peloton", "Peloton", "Both"];

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
    excludes: (segments) => [...LINE_1_KEYS, "mkt"].includes(segments[0]!),
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
    excludes: (segments) => segments.some((s) => [...LINE_3_PARTS, "Mkt"].some((x) => s.includes(x)) || s.startsWith("mkt")),
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

/**
 * What the on-screen guard of MKT-10 (§22.11.3) holds a "services" marketplace to, derived from the lists above so the three
 * can never drift: « client » is the services word for the buyer (§22.8.4, acheteur → client), so the DEMAND side may say it
 * ("DEMAND_WORDS ne s'applique qu'en « produits »" for that word alone — every other word of the rule, and the acronyms, still
 * apply); the SUPPLY side keeps « client » in its rule, and the one sentence where it speaks of the other side's people is a named
 * phrase (`NAMED_PHRASES`); and the supply's own expressions are its "produits" ones with the services lexicon applied (vendeur →
 * prestataire, seller → provider), because « prestataire abonné » holds « abonné » exactly as « vendeur abonné » does.
 */
export const DEMAND_WORDS_SERVICES: WordRule = { ...DEMAND_WORDS, fr: new RegExp(DEMAND_WORDS.fr.source.replace("client|", ""), DEMAND_WORDS.fr.flags) };
export const SERVICES_SUPPLY_TARGETS = {
  fr: SUPPLY_TARGETS.fr.map((t) => t.replace("vendeur", "prestataire")),
  en: SUPPLY_TARGETS.en.map((t) => t.replace("seller", "provider")),
} as const;

/**
 * The phrases a side says on purpose that the rule would refuse, named one by one (§22.11.3, "exceptions nommées"; A23 MKT-10).
 * Each has the leaf that carries it and why it stays; the guard takes exactly these phrases out of that side's text and no word
 * more. Each is held by the guard's own test to still be in its leaf: an exception that stops being one must leave the list.
 *
 * - The SUPPLY's bare « abonné » (« Abonnés sous 60 jours », « garder un abonné », « conversion en abonné »), « leur MRR » and
 *   "their MRR" (the subscriptions' own, as the copy test names `money.arr`): the marketplace's own leaves (`mkt.*`, written for
 *   it, §22.8.5) use the noun for a seller who pays, which `SUPPLY_TARGETS` only retires in the two-word expressions « vendeur
 *   abonné ». The text is the specification's word for word; changing it is a copy decision for the bon à tirer A23.d (and would
 *   move `golden-mkt.json`).
 * - The English verb "paying back" on BOTH sides (the rule reads « paying » as a word of the SaaS's): the false positive the copy
 *   test names for `money.monthsLoss`, `money.monthsMaybe`, `slide.chartSummaryMaybe` and `terms.afterPayback.definition`.
 */
export interface NamedPhrase {
  /** The leaf's dotted path in `ENGINE_COPY`, or in the side's sheet of the marketplace's overlay (`ENGINE_COPY_MKT[layer]`) when `layer` says so. */
  path: string;
  layer?: "demand" | "supply" | "common";
  /** The vocabulary the phrase belongs to, when only one: the leaf is then read in that vocabulary's overlay (`ENGINE_COPY_MKT_SERVICES`). Absent: both. */
  offering?: "products" | "services";
  locale: "fr" | "en";
  phrase: string;
  sides: readonly ("demand" | "supply")[];
  why: string;
}
export const NAMED_PHRASES: readonly NamedPhrase[] = [
  { path: "mkt.funnel.paid", locale: "fr", phrase: "Abonnés sous", sides: ["supply"], why: "the supply funnel's third column (« Abonnés sous 60 jours »), §22.8.5 funnel table, word for word: the paid sellers, out of the same 100 sign-ups" },
  { path: "mkt.assumption.supply-priced-by-subscriptions", locale: "fr", phrase: "garder un abonné", sides: ["supply"], why: "§22.8.5 d, word for word: « convertir un vendeur, garder un abonné » — a paid seller, the subscription being all the supply is priced by" },
  { path: "mkt.assumption.supply-priced-by-subscriptions", locale: "en", phrase: "keeping a subscriber", sides: ["supply"], why: "§22.8.5 d, word for word: \"converting a seller, keeping a subscriber\" — a paid seller, the subscription being all the supply is priced by" },
  { path: "mkt.money.sellerCostExplained", locale: "fr", phrase: "conversion en abonné", sides: ["supply"], why: "§22.8.5 k, word for word: « {conv} de conversion en abonné » — the supply's own name for the number, as « conversion en abonné » is the word of `settings.firstSalePaidReset`" },
  { path: "money.arr", layer: "supply", locale: "fr", phrase: "leur MRR", sides: ["supply"], why: "§22.8.5 c, word for word: « ARR des abonnements, leur MRR × 12 » — the bare MRR is the subscriptions' own (the copy test names the same exception)" },
  { path: "money.arr", layer: "supply", locale: "en", phrase: "their MRR", sides: ["supply"], why: "§22.8.5 c, word for word: \"Subscription ARR, their MRR × 12\" — the bare MRR is the subscriptions' own (the copy test names the same exception)" },
  { path: "scenario.intro", layer: "supply", offering: "services", locale: "fr", phrase: "Les leviers des clients sont de leur côté", sides: ["supply"], why: "the supply's « Et si » panel, in « services »: « clients » is the services word for the buyers (§22.8.4), whose levers are on the other side — the sentence names the other side's people, as « acheteurs » does in « produits »" },
  { path: "terms.afterPayback.definition", locale: "en", phrase: "paying back", sides: ["demand", "supply"], why: "the English verb, not a customer who pays: \"before paying back\", §22.8.5 c word for word (the copy test names the same false positive on four leaves)" },
];

/** The expressions the guard takes out of a SIDE's text before looking for the rule's words: the lexicon's targets for the vocabulary (supply only), and the named phrases. */
export function targetsFor(side: "demand" | "supply", locale: "fr" | "en", offering: "products" | "services"): string[] {
  const lexicon = side === "supply" ? (offering === "services" ? SERVICES_SUPPLY_TARGETS : SUPPLY_TARGETS)[locale] : [];
  return [...lexicon, ...NAMED_PHRASES.filter((p) => p.locale === locale && p.sides.includes(side) && (p.offering === undefined || p.offering === offering)).map((p) => p.phrase)];
}

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

// ------------------------------------------------------------------------------------------------ "services" (MKT-S, §22.8.3 point 5)

/** A word in the Unicode sense (§22.8.3, point 5): the letter before or after makes it part of another word, accents included (`\b` would read « é » as a separator). */
const UNICODE_WHOLE = (words: string) => new RegExp(`(^|[^\\p{L}])(${words})(?!\\p{L})`, "iu");

/**
 * §22.8.3's list of the words of "produits", point 5, as written there (whole words, case ignored): the buyers' and the
 * sellers' (« acheteur », « vendeur »), the order's and the sale's (« commande », « vente », « vend »), the listing's and the
 * basket's, the purchase's.
 */
const LISTED = {
  fr: ["acheteurs?", "vendeurs?", "commandes?", "commander", "annonces?", "panier", "ventes?", "vend", "vendent", "vendue?s?", "achats?"],
  en: ["buyers?", "sellers?", "orders?", "ordered", "listings?", "sales?", "sell", "sells", "sold", "purchases?", "basket", "buy", "buys"],
};

/**
 * The forms the lexicon of §22.8.4 rewrites that §22.8.3's list does not name — the infinitive, the other persons, the
 * participles, the plural basket (added after the review of MKT-S, 2026-10-26: the list is narrower than the lexicon). Each one
 * is named, with the sentence it would betray; a form that only made absurd false alarms would have been left out.
 */
const LEXICON_FORMS = {
  fr: [
    "vendre", // « vendre » (to sell) is « être réservé »
    "acheter", // « acheter » is « réserver »
    "achète", // « achète » (he buys), « achètent » (they buy): the same verb, rewritten the same way
    "achètent",
    "achetée?s?", // « acheté », « achetée », « achetés », « achetées » (bought)
    "commandent", // « commandent » (they order), as « commande » (he orders) is already listed
    "commandée?s?", // « commandé », « commandée », « commandés », « commandées » (ordered)
    "paniers", // the plural of « panier », which the list names in the singular
  ],
  en: [
    "selling", // "selling" (the gerund of "sell")
    "bought", // "bought" (the past of "buy")
    "buying", // "buying"
    "ordering", // "ordering" (the gerund of "order")
    "purchased", // "purchased" (the past of "purchase")
    "purchasing", // "purchasing"
    "baskets", // the plural of "basket"
  ],
};

/**
 * The words of "produits" a services marketplace must no longer print (§22.8.3, point 5): the list of §22.8.3 and the forms of
 * the lexicon it leaves out (`LEXICON_FORMS`). Read in every leaf of the services fusions that no exclusion line covers, in every
 * text of the services catalogue, and by the on-screen guard of MKT-10 (§22.11.3).
 */
export const SERVICES_BANNED: { fr: RegExp; en: RegExp } = {
  fr: UNICODE_WHOLE([...LISTED.fr, ...LEXICON_FORMS.fr].join("|")),
  en: UNICODE_WHOLE([...LISTED.en, ...LEXICON_FORMS.en].join("|")),
};

/** The banned words a text holds in one language, as written (empty: none). */
export function servicesWordsHeld(text: string, locale: "fr" | "en"): string[] {
  const rule = SERVICES_BANNED[locale];
  const found: string[] = [];
  let rest = text;
  for (let m = rule.exec(rest); m; m = rule.exec(rest)) {
    found.push(m[2]!);
    rest = rest.slice(m.index + m[0].length);
  }
  return found;
}

/**
 * What the services rule does not read: `MKT_EXCLUDED` WITHOUT the lines that aim at the leaves written for the marketplace
 * (§22.8.3, point 5) — the `mkt` key of line 1, the `Mkt` part and the `mkt` prefix of line 3 — because those are written in
 * "produits" and the services words must rewrite them. Lines 2 (the SaaS's and the app's phrases of the numbers), 4 to 8 are
 * as they are. Built from the same constants as `MKT_EXCLUDED`, so the two cannot drift.
 */
export const MKT_SERVICES_EXCLUDED: readonly ExclusionLine[] = MKT_EXCLUDED.map((entry) => {
  if (entry.line === 1) return { line: 1, excludes: (segments: readonly string[]) => LINE_1_KEYS.includes(segments[0]!) };
  // A segment that starts with `mkt` is the marketplace's own, whatever it holds: `slideTitles.mktTotalUnknownBoth` (§22.8.5 e, A23 MKT-7b) holds « Both »,
  // the hybrid's marker, and must still be read by the services rule.
  if (entry.line === 3) return { line: 3, excludes: (segments: readonly string[]) => segments.some((s) => !s.startsWith("mkt") && LINE_3_PARTS.some((x) => s.includes(x))) };
  return entry;
});

/**
 * The leaves that keep a word of `SERVICES_BANNED` on purpose, each with its reason (§22.8.3, point 5: « exception nommée dès
 * MKT-S »). A path here is read by the services rule as clean; the test holds each to still existing and still holding the word,
 * so an exception that stops being one must leave the list.
 */
export const SERVICES_NAMED_EXCEPTIONS: Readonly<Record<string, string>> = {
  "io.unsupportedSetup": "« comment l'entreprise vend » is shown when a file does not say its type, so before anyone knows whether it is a services marketplace: no overlay can reach it",
  // The next two are the SaaS's own wording, inherited, and wrong for EVERY marketplace, « produits » included: « les façons de
  // vendre cochées » names the SaaS's ticked motions (self-serve, sales-assisted), which a marketplace does not have. Not rewritten
  // here: what a marketplace should say is a copy decision for the bon à tirer (`docs/engine/a23d-a-regarder.md`).
  "io.mergeRefused.motions": "the SaaS's « les façons de vendre cochées » (ticked motions), wrong for any marketplace, products included; left as written until the bon à tirer decides (docs/engine/a23d-a-regarder.md)",
  "table.reasons.hidden": "the SaaS's « ce chiffre n'est pas dans les façons de vendre cochées » (ticked motions), wrong for any marketplace, products included; left as written until the bon à tirer decides (docs/engine/a23d-a-regarder.md)",
};

// ------------------------------------------------------------------------------------------------ the on-screen guard (MKT-10, §22.11.3)

/**
 * Which family of words a text is held to: a demand-side text, a supply-side text, a slide of neither side (the total, the
 * appendix…: never « SaaS », and, in "products", neither « client » nor « customer »), or any text of the tool (`anywhere`: never
 * « SaaS » — a number's screen, the settings, the bar read as a whole).
 */
export type Kind = "demand" | "supply" | "common" | "anywhere";

/** The vocabulary of a marketplace (`setup.offering`). */
export type Offering = "products" | "services";

/**
 * The words a text holds that its kind refuses (§22.11.3), as the rule reads them. Empty: none. THE guard of MKT-10, one function for
 * the deck (`mkt-words-guard.test.ts`) and the browser (`e2e/engine-marketplace.spec.ts`): a text on a screen and a line of the
 * export are held to the same lists. `locale` is the language of the text.
 */
export function refusedIn(text: string, locale: "fr" | "en", kind: Kind, offering: Offering): string[] {
  const found: string[] = [];
  const held = (rule: WordRule, targets: readonly string[] = []): string[] => {
    const readableText = readable(text, locale, targets);
    return [...(readableText.match(new RegExp(rule[locale].source, `${rule[locale].flags.replace("g", "")}g`)) ?? []), ...(readableText.match(new RegExp(rule.acronyms.source, "gu")) ?? [])];
  };
  if (kind === "demand") found.push(...held(offering === "services" ? DEMAND_WORDS_SERVICES : DEMAND_WORDS, targetsFor("demand", locale, offering)));
  if (kind === "supply") found.push(...held(SUPPLY_WORDS, targetsFor("supply", locale, offering)));
  if (kind === "common" || kind === "anywhere") found.push(...(readable(text, locale).match(/SaaS/gi) ?? []));
  if (kind === "common" && offering === "products") found.push(...(readable(text, locale).match(locale === "fr" ? /client/gi : /customer/gi) ?? []));
  if (offering === "services") found.push(...servicesWordsHeld(text, locale));
  return found;
}
