import { describe, expect, it } from "vitest";
import type { Translatable } from "@/lib/i18n/translatable";
import { REVENUE_COPY_TEMPLATES, resolveLevelCopy, type RevenueCopy } from "@/lib/game/copy";
import { REVENUE_DARK_IDS, REVENUE_HONEST_IDS, REVENUE_LEVEL } from "@/lib/game/levels/revenue";
import { ACQUISITION_CONTENT } from "../game/acquisition";
import { ACTIVATION_CONTENT } from "../game/activation";
import { GAME_META, REVENUE_INTRO, RETENTION_INTRO } from "../game/meta";
import { REFERRAL_CONTENT } from "../game/referral";
import { RETENTION_CONTENT } from "../game/retention";
import { REVENUE_CONTENT } from "../game/revenue";
import {
  CAPITALISED,
  DOMAIN,
  EN_COMMA,
  FR_POINT,
  judgementIn,
  placeholders,
  sorted,
  templatePatternFor,
  templateProblems,
  walk,
} from "./game-copy-checks";

/**
 * GAME-BRIEF.md §7.1, série C — the content of the revenue level « Comment
 * vous gagnez de l'argent » (§20, `docs/game/revenue.md`), under level 1's
 * rules (`game-copy-checks.ts`), as levels 2 to 4 are.
 *
 * Three things differ from level 2, all by the spec (§20.12). C1 cites an
 * article of the Consumer Code or of the Internal Security Code (a loot box is
 * a question of lottery law, not of consumer law alone). C14, « a transaction
 * pénale is not a fine », is replaced by a rule that reads both ways: the
 * inspection ends in TWO procedures of the DGCCRF, a criminal settlement with
 * the prosecutor's agreement and an administrative fine, and the copy tells
 * them as two. And C13 holds only what the copy says to itself: its other
 * half, the amounts against the constants of the phone (`MONTHLY_EUR`…), is
 * `game-fit-phone.test.ts` (REV-2), which cannot exist before the phone does.
 *
 * Non-vacuity (2026-10-05, A24.REV-1), each sabotage applied then undone, and
 * how many tests of this file (and of `game-hub.test.ts`,
 * `copy-typography.test.ts` where said) fall: a plain space inside « 1 600 »,
 * 2 (C12 twice); a plain space before « ? » in the checkout question, 1
 * (`copy-typography.test.ts`); a brand slipped into a case (Instagram), 1
 * (C6); a brand in a card's pitch (Tinder), 1 (C6, outside the cases);
 * « Tinder » gone from both cases, 1 (the stale whitelist); « Paris » gone
 * from both cases of SFAM, 1 (the stale entry); « transaction pénale » reduced
 * to « transaction » in `events.control`, 1; « parquet » changed to
 * « procureur », 1; the stamp « Contrôle » changed to « Amende », 1;
 * « l'amende est tombée » changed in the ending, 1; a law with no article, 1
 * (C1); « 59,99 » turned into « 59,98 » on the silent renewal, 3 (C13);
 * « 1 200 » turned into « 1 300 » in the odd packs, 3 (C12 and C13 twice); a
 * checkout answer the survey no longer quotes, 1; an order with an initial
 * capital, 1; `cleanMiss` no longer a win, 1; `nextLevel` copied rather than
 * shared, 1; the fine's amount written out in `events.control`, 2; the
 * `{amount}` of the pill gone from both languages, 2; « 6 € » turned into
 * « 7 € » in `boss.t4Hit`, 1 (C4); a percentage in a card's pitch, 2 (C3 and
 * the chest's 300); a decimal comma in the English `offerBase`, 4 (C10, C13
 * three times); « Flixo » in a hand string, 1; « pas une sanction » gone from
 * the Star Stable case, 1; « ordonnance » turned into « amende » in Epic
 * Games' case, 1; the intro without its « 200 000 », 1 and the English
 * description without its « €6 », 1 (C4 both); a title past 60 characters, 1
 * (`game-hub.test.ts`). None passed.
 */

const { leaves: LEAVES, bare: BARE } = walk(REVENUE_CONTENT);
const HONEST = [...REVENUE_HONEST_IDS] as string[];
const DARK = [...REVENUE_DARK_IDS] as string[];

/** The CEO asks for these five and no other (GAME-BRIEF §20.5). */
const ORDER_POOL = ["addon", "trial", "lootbox", "hiddensub", "renewal"];

/** U+00A0, written as a number so that no editor or tool can turn it into a plain space. */
const NBSP = String.fromCharCode(0xa0);

// ---------------------------------------------------------------------------
// C1, C2 — both languages, everywhere, and nothing forgotten.
// ---------------------------------------------------------------------------

describe("C2 · parity between the two languages", () => {
  it("walks a tree that actually has content — otherwise every check below proves nothing", () => {
    expect(LEAVES.length).toBeGreaterThan(300);
  });

  it("has no bare string: every leaf is a Translatable", () => {
    expect(BARE).toEqual([]);
  });

  it("is non-empty in French and in English at every leaf", () => {
    const empty = LEAVES.filter(({ value }) => !value.fr.trim() || !value.en.trim()).map(({ path }) => path);
    expect(empty).toEqual([]);
  });

  it("names every card of the level, and only those", () => {
    expect(sorted(Object.keys(REVENUE_CONTENT.cards))).toEqual(sorted([...HONEST, ...DARK]));
  });

  it("resolves to one language, keeping the shape, the arrays and the flags", () => {
    for (const locale of ["fr", "en"] as const) {
      const copy = resolveLevelCopy<RevenueCopy>(REVENUE_CONTENT, locale);
      expect(copy.cards.fullprice.name).toBe(REVENUE_CONTENT.cards.fullprice.name[locale]);
      expect(copy.boss.t1).toBe(REVENUE_CONTENT.boss.t1[locale]);
      expect(copy.charge.amount).toBe(REVENUE_CONTENT.charge.amount[locale]);
      expect(copy.months).toHaveLength(12);
      expect(copy.phone.checkoutAnswers).toHaveLength(3);
      expect(copy.endings.applause.win).toBe(true);
      expect(copy.endings.fine.win).toBe(false);
      expect(walk(copy).leaves).toEqual([]);
      expect(walk(copy).bare.length).toBe(LEAVES.length);
    }
  });

  it("keeps no second copy of the intro or of the zones — the page renders meta.ts and hub.ts (review R8)", () => {
    expect(Object.keys(REVENUE_CONTENT)).not.toContain("intro");
    expect(Object.keys(REVENUE_CONTENT)).not.toContain("zones");
  });

  it("has no phone or pill of another level: the clicks to cancel are Flixo's, the basket Pédalix's, the cookies Quandi's, the messages Partix's", () => {
    for (const other of ["clicks", "basket", "cookies", "sent"]) expect(Object.keys(REVENUE_CONTENT)).not.toContain(other);
    expect(Object.keys(REVENUE_CONTENT.effects)).not.toContain("extra");
    expect(Object.keys(REVENUE_CONTENT)).toContain("charge");
  });
});

/**
 * The text each law names, as the spec writes the rule (§20.12): an article,
 * one or two, of the Consumer Code or of the Internal Security Code — a loot
 * box is a matter of lottery law (L322-1) before it is one of consumer law.
 */
const LAW_FR = /articles? L\d+-\d+(?:-\d+)?(?: et L\d+-\d+(?:-\d+)?)? du Code (?:de la consommation|de la sécurité intérieure)/;
const LAW_EN = /articles? L\d+-\d+(?:-\d+)?(?: and L\d+-\d+(?:-\d+)?)? of the (?:French )?(?:Consumer|Internal Security) Code/;

describe("C1 · every trick has its four catalogue fields", () => {
  it("covers the eight tricks exactly", () => {
    expect(sorted(Object.keys(REVENUE_CONTENT.patterns))).toEqual(sorted(DARK));
  });

  it("has official, law, cas and tell, non-empty, in both languages", () => {
    for (const [id, pattern] of Object.entries(REVENUE_CONTENT.patterns)) {
      for (const field of ["official", "law", "cas", "tell"] as const) {
        expect(pattern[field].fr.trim(), `${id}.${field} fr`).not.toBe("");
        expect(pattern[field].en.trim(), `${id}.${field} en`).not.toBe("");
      }
    }
  });

  it("cites an article of the Consumer Code or of the Internal Security Code in every law", () => {
    for (const [id, pattern] of Object.entries(REVENUE_CONTENT.patterns)) {
      expect(pattern.law.fr, `${id} fr`).toMatch(LAW_FR);
      expect(pattern.law.en, `${id} en`).toMatch(LAW_EN);
    }
  });

  it("would catch a law that cites no article, or a code of the wrong kind — the rule is not vacuous", () => {
    expect(LAW_FR.test("Aucune règle ne l'interdit.")).toBe(false);
    expect(LAW_FR.test("Le RGPD, article 6, l'interdit.")).toBe(false);
    expect(LAW_FR.test("L'article L121-17 du Code du travail l'interdit.")).toBe(false);
    expect(LAW_EN.test("No rule bans it.")).toBe(false);
    expect(LAW_EN.test("Article L121-17 of the Labour Code bans it.")).toBe(false);
    // The two plurals of the spec, and the lottery law of the loot box.
    expect(LAW_FR.test("(articles L121-2 et L121-3 du Code de la consommation)")).toBe(true);
    expect(LAW_EN.test("(articles L121-2 and L121-3 of the Consumer Code)")).toBe(true);
    expect(LAW_FR.test("(article L322-1 du Code de la sécurité intérieure)")).toBe(true);
    expect(LAW_EN.test("(article L322-1 of the French Internal Security Code)")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// C3, C9 — the cards describe, they never judge (brief §5.5).
// ---------------------------------------------------------------------------

describe("C3 · no card shows an effect", () => {
  it("names and pitches carry no percentage, no signed number, no forbidden word, in either language", () => {
    const offenders: string[] = [];
    for (const [id, card] of Object.entries(REVENUE_CONTENT.cards)) {
      for (const field of ["name", "pitch"] as const) {
        for (const locale of ["fr", "en"] as const) {
          const why = judgementIn(card[field][locale], locale);
          if (why) offenders.push(`${id}.${field} ${locale}: ${why}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe("C9 · the hand's hints and the order badge are held to the same rule", () => {
  it("never announces what a card does before the quarter is played", () => {
    const offenders: string[] = [];
    for (const [key, value] of Object.entries(REVENUE_CONTENT.hand)) {
      for (const locale of ["fr", "en"] as const) {
        const why = judgementIn(value[locale], locale);
        if (why) offenders.push(`hand.${key} ${locale}: ${why}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// C4, C5 — the numbers the copy states, the ids it keys on.
// ---------------------------------------------------------------------------

describe("C4 · the targets the copy states", () => {
  const { boss } = REVENUE_CONTENT;
  const { targets, metric0 } = REVENUE_LEVEL.constants;

  it("agree with each other across both languages", () => {
    // The first quarter's target is written out in the T1 message, and again in T2's reproach.
    expect(boss.t1.fr).toContain(`4,30${NBSP}€`);
    expect(boss.t1.en).toContain("€4.30");
    expect(boss.t2Miss.fr).toContain(`au lieu de 4,30${NBSP}€.`);
    expect(boss.t2Miss.en).toContain("instead of €4.30.");
    // The board's target, 6 €, everywhere it is stated rather than templated.
    for (const text of [
      boss.t1,
      boss.t4Hit,
      boss.t4Miss,
      REVENUE_CONTENT.endings.cleanMiss.title,
      REVENUE_INTRO.lead,
      GAME_META.revenue.description,
    ]) {
      expect(text.fr).toContain(`6${NBSP}€`);
      expect(text.en).toContain("€6");
    }
    // January's number and the size of the base, in the intro; January's number again on the share image.
    expect(REVENUE_INTRO.lead.fr).toContain(`4${NBSP}€`);
    expect(REVENUE_INTRO.lead.en).toContain("€4");
    expect(REVENUE_INTRO.lead.fr).toContain(`200${NBSP}000`);
    expect(REVENUE_INTRO.lead.en).toContain("200,000");
    expect(GAME_META.revenue.shareImageAlt.fr).toContain(`4,00${NBSP}€`);
    expect(GAME_META.revenue.shareImageAlt.en).toContain("€4.00");
  });

  it("match the model: strictly increasing, ending at 6, T1 the 4,30 the CEO names, January at 4", () => {
    expect(targets).toHaveLength(4);
    for (let i = 1; i < targets.length; i++) expect(targets[i]!).toBeGreaterThan(targets[i - 1]!);
    expect(targets[3]).toBe(6);
    // The T1 message is static text: if the model's first target moves, the CEO lies.
    expect(targets[0]).toBe(4.3);
    expect(metric0).toBe(4);
  });
});

describe("C5 · identifiers", () => {
  it("are unique across the two families", () => {
    expect(new Set([...HONEST, ...DARK]).size).toBe(HONEST.length + DARK.length);
  });

  it("keys the CEO's orders on tricks, exactly the five he asks for", () => {
    expect(sorted(Object.keys(REVENUE_CONTENT.orders))).toEqual(sorted(ORDER_POOL));
    for (const id of Object.keys(REVENUE_CONTENT.orders)) expect(DARK).toContain(id);
  });

  it("writes every order so that it slips into « Et ce trimestre, {order} » — no initial capital", () => {
    for (const order of Object.values(REVENUE_CONTENT.orders)) {
      for (const locale of ["fr", "en"] as const) expect(order[locale], `${order[locale]}`).toMatch(/^\p{Ll}/u);
    }
  });

  it("agrees with the model's orders, and the first-quarter tricks are tricks", () => {
    for (const id of REVENUE_LEVEL.honestOrder) expect(HONEST).toContain(id);
    for (const id of REVENUE_LEVEL.darkOrder) expect(DARK).toContain(id);
    for (const id of REVENUE_LEVEL.darkFirstQuarter) expect(DARK).toContain(id);
    expect(sorted(REVENUE_LEVEL.orderPool)).toEqual(sorted(Object.keys(REVENUE_CONTENT.orders)));
    for (const id of REVENUE_LEVEL.orderSchedule) if (id) expect(ORDER_POOL).toContain(id);
    expect(sorted(Object.keys(REVENUE_LEVEL.cards))).toEqual(sorted(Object.keys(REVENUE_CONTENT.cards)));
  });
});

// ---------------------------------------------------------------------------
// C6 — real brands, only in the catalogue's cases (brief §8.3, §20.9).
// ---------------------------------------------------------------------------

/**
 * The level's whitelist (GAME-BRIEF §20.9): the companies its eight cases name,
 * « ebookers.com » being the one domain. The institutions (the Court of Justice
 * of the European Union, the FTC, the DGCCRF, the European Commission…) are
 * ordinary words of the test below, not brands.
 */
const BRANDS = ["ebookers.com", "Genshin Impact", "SFAM", "Tinder", "Instacart", "Epic Games", "Fortnite", "ABCmouse", "Star Stable"];
/** The words of the brands, and their possessives (« Fortnite's » in an English case). */
const BRAND_WORDS = new Set(BRANDS.flatMap((b) => b.split(" ")).flatMap((w) => [w, `${w}'s`]));

/**
 * Every other capitalised word a case may use: sentence openers, public bodies,
 * places, months — as the spec lists them, computed with `CAPITALISED` on its
 * sixteen `cas`.
 */
const NOT_BRANDS = new Set([
  "En", "Cour", "In", "Court", "Justice", "European", "Union", "FTC", "L'accord", "January", "FTC's", "The", "DGCCRF", "Paris",
  "France's", "Commission", "Ce", "March", "These", "Aux", "États-Unis", "United", "States", "December", "C'est", "It",
]);

describe("C6 · brands", () => {
  it("names in a case only whitelisted brands, public bodies and ordinary words", () => {
    const unknown: string[] = [];
    for (const [id, pattern] of Object.entries(REVENUE_CONTENT.patterns)) {
      for (const locale of ["fr", "en"] as const) {
        const text = pattern.cas[locale];
        for (const token of text.match(CAPITALISED) ?? []) {
          if (!BRANDS.includes(token) && !BRAND_WORDS.has(token) && !NOT_BRANDS.has(token)) unknown.push(`${id} ${locale}: ${token}`);
        }
        // The one domain on this level's whitelist is « ebookers.com »: any other a case writes is a brand slipping in.
        for (const domain of text.match(DOMAIN) ?? []) if (!BRANDS.includes(domain)) unknown.push(`${id} ${locale}: ${domain}`);
      }
    }
    expect(unknown).toEqual([]);
  });

  it("cites every whitelisted brand at least once — or the whitelist is stale", () => {
    const cases = Object.values(REVENUE_CONTENT.patterns).map((p) => `${p.cas.fr} ${p.cas.en}`).join(" ");
    for (const brand of BRANDS) expect(cases).toContain(brand);
  });

  it("lists as ordinary only words a case uses — a stale entry is a hole a brand could slip through", () => {
    const tokens = new Set(
      Object.values(REVENUE_CONTENT.patterns).flatMap((p) => [...(p.cas.fr.match(CAPITALISED) ?? []), ...(p.cas.en.match(CAPITALISED) ?? [])]),
    );
    expect([...NOT_BRANDS].filter((word) => !tokens.has(word))).toEqual([]);
  });

  it("keeps real brands out of the game itself: cards, phone, events, CEO", () => {
    const outside = LEAVES.filter(({ path }) => !/^patterns\.[^.]+\.cas$/.test(path));
    const leaks = outside.flatMap(({ path, value }) =>
      BRANDS.filter((brand) => value.fr.includes(brand) || value.en.includes(brand)).map((brand) => `${path}: ${brand}`),
    );
    expect(leaks).toEqual([]);
  });

  it("tells each case for what it is: a commitment, a procedure, a settlement, an order, a ruling — and never a fine or a conviction (§20.9)", () => {
    const { addon, hiddensub, pricing, lootbox, trial, express, renewal, gems } = REVENUE_CONTENT.patterns;
    // Tinder's undertaking to the Commission, and the procedure against Star Stable: neither is a sanction.
    expect(pricing.cas.fr).toContain("s'est engagé");
    expect(pricing.cas.en).toMatch(/committed/);
    expect(pricing.cas.fr).toContain("pas une sanction");
    expect(pricing.cas.en).toContain("not a sanction");
    expect(gems.cas.fr).toContain("pas une sanction");
    expect(gems.cas.en).toContain("not a sanction");
    expect(gems.cas.fr).toContain("procédure");
    expect(gems.cas.en).toContain("procedure");
    // SFAM's transaction with the prosecutor's agreement.
    expect(hiddensub.cas.fr).toContain("transaction");
    expect(hiddensub.cas.en).toContain("settlement");
    // The FTC's agreements to close its actions: « pour clore », "to settle".
    for (const pattern of [lootbox, trial, renewal]) {
      expect(pattern.cas.fr).toContain("pour clore");
      expect(pattern.cas.en).toContain("to settle");
    }
    // Epic Games: an order, with refunds.
    expect(express.cas.fr).toContain("ordonnance");
    expect(express.cas.en).toContain("order");
    // The Court of Justice's ruling.
    expect(addon.cas.fr).toContain("a jugé");
    expect(addon.cas.en).toContain("ruled");
    // No case is a fine or a conviction, in either language.
    for (const [id, pattern] of Object.entries(REVENUE_CONTENT.patterns)) {
      expect(pattern.cas.fr, `${id} fr`).not.toMatch(/amende|condamn/);
      expect(pattern.cas.en, `${id} en`).not.toMatch(/\bfine[ds]?\b|convicted/);
    }
  });
});

// ---------------------------------------------------------------------------
// C8 — the placeholders are a contract with the island.
// ---------------------------------------------------------------------------

describe("C8 · templates", () => {
  const templated = LEAVES.filter(({ value }) => value.fr.includes("{") || value.en.includes("{"));

  it("finds the templates — otherwise the checks below prove nothing", () => {
    expect(templated.length).toBeGreaterThan(40);
  });

  it("uses the same placeholders in French and in English", () => {
    const mismatched = templated
      .filter(({ value }) => placeholders(value.fr).join() !== placeholders(value.en).join())
      .map(({ path }) => path);
    expect(mismatched).toEqual([]);
  });

  it("puts a placeholder only where the contract declares one, and fills with exactly the declared names", () => {
    expect(templateProblems(LEAVES, REVENUE_COPY_TEMPLATES)).toEqual([]);
  });

  it("declares no template that the content does not have", () => {
    const paths = templated.map(({ path }) => path);
    const stale = Object.keys(REVENUE_COPY_TEMPLATES).filter(
      (pattern) => !paths.some((path) => templatePatternFor(REVENUE_COPY_TEMPLATES, path) === pattern),
    );
    expect(stale).toEqual([]);
  });

  it("gives the phone none of its own, and the pill exactly one: the amount", () => {
    expect(templated.filter(({ path }) => /^phone\./.test(path)).map(({ path }) => path)).toEqual([]);
    expect(templated.filter(({ path }) => /^charge\./.test(path)).map(({ path }) => path)).toEqual(["charge.amount"]);
    expect(REVENUE_COPY_TEMPLATES["charge.amount"]).toEqual(["amount"]);
  });
});

// ---------------------------------------------------------------------------
// C10, C12 — numbers written the way each language writes them.
// ---------------------------------------------------------------------------

describe("C10 · decimal separators", () => {
  it("has no decimal point in French and no decimal comma in English", () => {
    const offenders = LEAVES.flatMap(({ path, value }) => [
      ...(FR_POINT.test(value.fr) ? [`${path} fr`] : []),
      ...(EN_COMMA.test(value.en) ? [`${path} en`] : []),
    ]);
    expect(offenders).toEqual([]);
  });
});

/** A plain space inside a digit group, or before %, € or ★ — where a French line must not break. */
const PLAIN_SPACE_IN_NUMBER = /\d \d{3}(?!\d)| [%€★]/;

describe("C12 · French numbers do not break", () => {
  it("has a no-break space in digit groups and before %, € and ★, in every French string of the level, its intro and its metadata", () => {
    const intro = walk(REVENUE_INTRO).leaves.map((leaf) => ({ ...leaf, path: `intro.${leaf.path}` }));
    const meta = walk(GAME_META.revenue).leaves.map((leaf) => ({ ...leaf, path: `meta.${leaf.path}` }));
    const offenders = [...LEAVES, ...intro, ...meta]
      .filter(({ value }) => PLAIN_SPACE_IN_NUMBER.test(value.fr))
      .map(({ path, value }) => `${path}: ${value.fr.match(PLAIN_SPACE_IN_NUMBER)![0]}`);
    expect(offenders).toEqual([]);
  });

  it("would catch one — the rule is not vacuous", () => {
    expect(PLAIN_SPACE_IN_NUMBER.test("1 600 gemmes")).toBe(true);
    expect(PLAIN_SPACE_IN_NUMBER.test(`1${NBSP}600 gemmes`)).toBe(false);
    expect(PLAIN_SPACE_IN_NUMBER.test("7,99 €")).toBe(true);
    expect(PLAIN_SPACE_IN_NUMBER.test(`7,99${NBSP}€`)).toBe(false);
    expect(PLAIN_SPACE_IN_NUMBER.test("14 jours gratuits")).toBe(false);
  });

  it("writes the level's own digit groups with a no-break space: the packs of gems, and the size of the base", () => {
    const { phone } = REVENUE_CONTENT;
    expect(phone.packsRound.fr).toContain(`1${NBSP}600`);
    expect(phone.packsRound.en).toContain("1,600");
    expect(phone.packsOdd.fr).toContain(`1${NBSP}200`);
    expect(phone.packsOdd.fr).toContain(`2${NBSP}600`);
    expect(phone.packsOdd.en).toContain("1,200");
    expect(phone.packsOdd.en).toContain("2,600");
    expect(REVENUE_CONTENT.cards.gems.pitch.fr).toContain(`1${NBSP}200`);
    expect(REVENUE_CONTENT.cards.gems.pitch.fr).toContain(`2${NBSP}600`);
  });
});

// ---------------------------------------------------------------------------
// C13 — what the copy says to itself adds up (GAME-BRIEF §20.7). The amounts
// against the constants of the phone (`MONTHLY_EUR`, `YEARLY_EUR`…) are REV-2's
// test: those constants do not exist yet.
// ---------------------------------------------------------------------------

/** The amounts in euros of a string, as written: « 59,99 € » and "€59.99" are both 59.99. Gives the reader the spec's two expressions (§20.7). */
const FR_AMOUNT = new RegExp(`(\\d+(?:[${NBSP} ]\\d{3})*),(\\d{2})[${NBSP} ]€`, "g");
const EN_AMOUNT = /€(\d+(?:,\d{3})*)\.(\d{2})/g;

function amounts(text: string, locale: "fr" | "en"): number[] {
  const pattern = locale === "fr" ? FR_AMOUNT : EN_AMOUNT;
  return [...text.matchAll(pattern)].map((m) => Number(`${m[1]!.replace(new RegExp(`[${NBSP} ,]`, "g"), "")}.${m[2]}`));
}

/** Every number of a string, decimals and digit groups read the way each language writes them: « 1 600 » and "1,600" are both 1600. */
function numbersIn(text: string, locale: "fr" | "en"): number[] {
  const pattern =
    locale === "fr" ? new RegExp(`\\d+(?:[${NBSP} ]\\d{3})*(?:,\\d+)?`, "g") : /\d+(?:,\d{3})*(?:\.\d+)?/g;
  return (text.match(pattern) ?? []).map((raw) => {
    const digits = locale === "fr" ? raw.replace(new RegExp(`[${NBSP} ]`, "g"), "").replace(",", ".") : raw.replace(/,/g, "");
    return Number(digits);
  });
}

/** What the first pair of quotation marks holds: « … » in French, "…" in English. */
function firstQuote(text: string, locale: "fr" | "en"): string {
  const match = locale === "fr" ? text.match(new RegExp(`«${NBSP}(.+?)${NBSP}»`)) : text.match(/"(.+?)"/);
  if (!match) throw new Error(`no quotation in « ${text} »`);
  return match[1]!;
}

describe("C13 · the phone's text and the cards agree", () => {
  const { phone, cards, orders, hand, events } = REVENUE_CONTENT;
  const AMOUNT_KEYS = [
    "offerBase", "offerTrialSmall", "fullPrice", "monthly", "monthlyPersonal", "addon", "programme", "programmeSmall", "coaching",
    "downgrade", "euros", "renewalSilent",
  ] as const;

  it("reads the amounts of both languages: the reader finds one in every line that has one", () => {
    expect(amounts("Mensuel : 7,99 € par mois", "fr")).toEqual([7.99]);
    expect(amounts(`Annuel : 59,99${NBSP}€ par an, soit 5,00${NBSP}€ par mois`, "fr")).toEqual([59.99, 5]);
    expect(amounts("Yearly: €59.99 a year, that's €5.00 a month", "en")).toEqual([59.99, 5]);
    expect(amounts(`Un total de 1${NBSP}284,50${NBSP}€`, "fr")).toEqual([1284.5]);
    expect(amounts("A total of €1,284.50", "en")).toEqual([1284.5]);
  });

  it("states the same amounts in French and in English on every line that carries one", () => {
    for (const key of AMOUNT_KEYS) {
      const fr = amounts(phone[key].fr, "fr");
      expect(fr.length, `${key} states no amount`).toBeGreaterThan(0);
      expect(fr, key).toEqual(amounts(phone[key].en, "en"));
    }
  });

  it("states the same numbers in both languages, on every line of the phone", () => {
    const lines: [string, Translatable][] = [];
    for (const [key, value] of Object.entries(phone)) {
      if (Array.isArray(value)) value.forEach((item: Translatable, i) => lines.push([`${key}.${i}`, item]));
      else lines.push([key, value as Translatable]);
    }
    expect(lines.length).toBeGreaterThan(25);
    const offenders = lines
      .filter(([, value]) => numbersIn(value.fr, "fr").join() !== numbersIn(value.en, "en").join())
      .map(([key]) => key);
    expect(offenders).toEqual([]);
  });

  it("says 59,99 € the same way on the yearly plan's four lines: the trial's small print, the full price, the silent renewal and the card", () => {
    for (const locale of ["fr", "en"] as const) {
      expect(amounts(phone.offerTrialSmall[locale], locale), `offerTrialSmall ${locale}`).toEqual([59.99]);
      expect(amounts(phone.fullPrice[locale], locale)[0], `fullPrice ${locale}`).toBe(59.99);
      expect(amounts(phone.renewalSilent[locale], locale), `renewalSilent ${locale}`).toEqual([59.99]);
      expect(amounts(cards.trial.pitch[locale], locale), `cards.trial ${locale}`).toEqual([59.99]);
    }
  });

  it("says 7,99 € on the base offer, on the monthly plan and where nothing is in production yet", () => {
    for (const locale of ["fr", "en"] as const) {
      for (const text of [phone.offerBase, phone.monthly, hand.productionEmpty]) expect(amounts(text[locale], locale), text[locale]).toEqual([7.99]);
    }
  });

  it("says 9,99 € on the programme, under it, on its card and in the CEO's order", () => {
    for (const locale of ["fr", "en"] as const) {
      for (const text of [phone.programme, phone.programmeSmall, cards.hiddensub.pitch, orders.hiddensub]) {
        expect(amounts(text[locale], locale).filter((amount) => amount === 9.99).length, text[locale]).toBeGreaterThan(0);
      }
    }
    // « 9,99 € » then « puis 9,99 € par mois »: the card tells the same two lines as the phone, in its own two quotations.
    expect(amounts(cards.hiddensub.pitch.fr, "fr")).toEqual([9.99, 9.99]);
    expect(amounts(cards.hiddensub.pitch.en, "en")).toEqual([9.99, 9.99]);
  });

  it("says 2,99 € on the add-on's line and on its card", () => {
    for (const locale of ["fr", "en"] as const) {
      expect(amounts(phone.addon[locale], locale), `phone ${locale}`).toEqual([2.99]);
      expect(amounts(cards.addon.pitch[locale], locale), `card ${locale}`).toEqual([2.99]);
    }
  });

  it("gives the monthly equivalent of the yearly price: the second amount is the first over twelve, to the cent", () => {
    for (const locale of ["fr", "en"] as const) {
      const [yearly, monthly] = amounts(phone.fullPrice[locale], locale);
      expect(monthly, locale).toBe(Math.round((yearly! / 12) * 100) / 100);
      expect(monthly).toBe(5);
    }
  });

  it("makes the outfit's 800 gems a pack of the round shop and of no other: the round packs say 800, the odd ones do not", () => {
    for (const locale of ["fr", "en"] as const) {
      expect(numbersIn(phone.shopItem[locale], locale), `shopItem ${locale}`).toEqual([800]);
      expect(numbersIn(phone.packsRound[locale], locale), `packsRound ${locale}`).toContain(800);
      expect(numbersIn(phone.packsOdd[locale], locale), `packsOdd ${locale}`).not.toContain(800);
    }
  });

  it("makes the packs of the card the packs of the odd shop, and the outfit its card's 800", () => {
    for (const locale of ["fr", "en"] as const) {
      const odd = numbersIn(phone.packsOdd[locale], locale);
      expect(odd, `packsOdd ${locale}`).toEqual([500, 1200, 2600]);
      expect(numbersIn(cards.gems.pitch[locale], locale), `cards.gems ${locale}`).toEqual([...odd, 800]);
    }
  });

  it("counts 300 gems on the chest and on its card", () => {
    for (const locale of ["fr", "en"] as const) {
      expect(numbersIn(phone.chest[locale], locale), `chest ${locale}`).toEqual([300]);
      expect(numbersIn(cards.lootbox.pitch[locale], locale), `cards.lootbox ${locale}`).toEqual([300]);
    }
  });

  it("cites the first two answers of the checkout question in the survey's event, word for word and in lower case", () => {
    const lower = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);
    for (const locale of ["fr", "en"] as const) {
      const answers = phone.checkoutAnswers.map((answer) => answer[locale]);
      expect(answers).toHaveLength(3);
      const quoted = locale === "fr" ? (a: string) => `«${NBSP}${lower(a)}${NBSP}»` : (a: string) => `"${lower(a)}"`;
      expect(events.surveyAnswers[locale], locale).toContain(quoted(answers[0]!));
      expect(events.surveyAnswers[locale], locale).toContain(quoted(answers[1]!));
    }
  });

  it("asks on the card the question the phone's survey is about: « Qu'est-ce qui t'a arrêté ? » is the checkout's", () => {
    // The card quotes the question; the phone's line says it in its own words, and the three answers are the phone's.
    expect(firstQuote(cards.checkout.pitch.fr, "fr")).toBe(`Qu'est-ce qui t'a arrêté${NBSP}?`);
    expect(firstQuote(cards.checkout.pitch.en, "en")).toBe("What held you back?");
  });

  it("keeps the fine's amount out of the copy: the model owns it, the copy says {fine} (§20.3, C89)", () => {
    expect(REVENUE_LEVEL.constants.control.fine).toBe(375_000);
    const offenders = LEAVES.filter(({ value }) => /375[\s,.]?000/.test(value.fr) || /375[\s,.]?000/.test(value.en)).map(({ path }) => path);
    expect(offenders).toEqual([]);
    expect(REVENUE_CONTENT.events.control.fr).toContain("{fine}");
    expect(REVENUE_CONTENT.news.stamps.fine.fr).toContain("{fine}");
  });
});

// ---------------------------------------------------------------------------
// The control rule — two procedures of the DGCCRF, never one told as the other
// (GAME-BRIEF §20.3, C89). It replaces level 2's C14, and reads both ways.
// ---------------------------------------------------------------------------

describe("the inspection ends in two procedures: a criminal settlement and an administrative fine", () => {
  /** `{fine}` is the engine's name for the amount, not a word the player reads. */
  const words = (text: string) => text.replace(/\{fine\}/g, "");

  it("tells both where the inspection lands: the event says the settlement and the fine, with the prosecutor", () => {
    const { control } = REVENUE_CONTENT.events;
    expect(words(control.fr)).toMatch(/transaction pénale/);
    expect(words(control.fr)).toMatch(/amende administrative/);
    expect(control.fr).toContain("parquet");
    expect(words(control.en)).toMatch(/settlement/);
    expect(words(control.en)).toMatch(/administrative fine/);
    expect(control.en).toContain("prosecutor");
  });

  it("stamps the news « Contrôle » / « Inspection »: « Sanctions » would file a settlement among the sanctions (§21.5)", () => {
    const { fine } = REVENUE_CONTENT.news.stamps;
    expect(words(fine.fr)).toContain("Contrôle");
    expect(words(fine.en)).toContain("Inspection");
    for (const locale of ["fr", "en"] as const) expect(words(fine[locale])).not.toMatch(/Sanction|Amende|Fined|Settlement|Transaction/);
  });

  it("names the settlement and the fine in December's ending: the transaction signed, the fine landed", () => {
    const { text } = REVENUE_CONTENT.endings.fine;
    expect(words(text.fr)).toMatch(/transaction/);
    expect(words(text.fr)).toMatch(/amende/);
    expect(words(text.en)).toMatch(/settlement/);
    expect(words(text.en)).toMatch(/\bfine\b/);
  });

  it("would catch level 1's and level 2's wording — the rule is not vacuous", () => {
    // Level 1's inspection is a fine only; level 2's a settlement only. Neither tells both.
    expect(/transaction pénale/.test(words(RETENTION_CONTENT.events.control.fr))).toBe(false);
    expect(/amende administrative/.test(words(ACQUISITION_CONTENT.events.control.fr))).toBe(false);
    expect(/settlement/.test(words(RETENTION_CONTENT.events.control.en))).toBe(false);
    expect(/administrative fine/.test(words(ACQUISITION_CONTENT.events.control.en))).toBe(false);
    expect(/Contrôle/.test(RETENTION_CONTENT.news.stamps.fine.fr)).toBe(false);
    expect(/Contrôle/.test(ACQUISITION_CONTENT.news.stamps.fine.fr)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// What this level takes from level 1, it takes by reference.
// ---------------------------------------------------------------------------

describe("shared with level 1", () => {
  it("reuses level 1's own objects for what any year says, so a correction lands in both", () => {
    expect(REVENUE_CONTENT.months).toBe(RETENTION_CONTENT.months);
    expect(REVENUE_CONTENT.timeline).toBe(RETENTION_CONTENT.timeline);
    expect(REVENUE_CONTENT.bossLines).toBe(RETENTION_CONTENT.bossLines);
    expect(REVENUE_CONTENT.playbook).toBe(RETENTION_CONTENT.playbook);
    expect(REVENUE_CONTENT.journal).toBe(RETENTION_CONTENT.journal);
    expect(REVENUE_CONTENT.footer).toBe(RETENTION_CONTENT.footer);
    expect(REVENUE_CONTENT.tourLoop).toBe(RETENTION_CONTENT.tourLoop);
    expect(REVENUE_CONTENT.nextLevel).toBe(RETENTION_CONTENT.nextLevel);
    expect(REVENUE_CONTENT.cards.present).toBe(RETENTION_CONTENT.cards.present);
    expect(REVENUE_CONTENT.cards.clean.name).toBe(RETENTION_CONTENT.cards.clean.name);
    expect(REVENUE_CONTENT.boss.t2Hit).toBe(RETENTION_CONTENT.boss.t2Hit);
    expect(REVENUE_CONTENT.boss.orderWrap).toBe(RETENTION_CONTENT.boss.orderWrap);
    expect(REVENUE_CONTENT.december.trend).toBe(RETENTION_CONTENT.december.trend);
    expect(REVENUE_INTRO.steps).toBe(RETENTION_INTRO.steps);
    expect(REVENUE_INTRO.stepsTitle).toBe(RETENTION_INTRO.stepsTitle);
    expect(REVENUE_INTRO.glossaryLead).toBe(RETENTION_INTRO.glossaryLead);
  });

  it("shares the DGCCRF with level 1: its radar, its reports and the « why » of an inspection are level 1's own objects", () => {
    expect(REVENUE_CONTENT.dashboard.radar).toBe(RETENTION_CONTENT.dashboard.radar);
    expect(REVENUE_CONTENT.december.cells.radar).toBe(RETENTION_CONTENT.december.cells.radar);
    expect(REVENUE_CONTENT.events.reports).toBe(RETENTION_CONTENT.events.reports);
    expect(REVENUE_CONTENT.clippings.control.masthead).toBe(RETENTION_CONTENT.clippings.control.masthead);
    expect(REVENUE_CONTENT.clippings.reports.masthead).toBe(RETENTION_CONTENT.clippings.reports.masthead);
    expect(REVENUE_CONTENT.clippings.why).toBe(RETENTION_CONTENT.clippings.why);
  });

  it("takes level 1's news for all but the stamp of the inspection, which is its own", () => {
    expect(REVENUE_CONTENT.news).not.toBe(RETENTION_CONTENT.news);
    expect(REVENUE_CONTENT.news.labels).toBe(RETENTION_CONTENT.news.labels);
    expect(REVENUE_CONTENT.news.stamps.reports).toBe(RETENTION_CONTENT.news.stamps.reports);
    expect(REVENUE_CONTENT.news.stamps.viral).toBe(RETENTION_CONTENT.news.stamps.viral);
    expect(REVENUE_CONTENT.news.stamps.press).toBe(RETENTION_CONTENT.news.stamps.press);
    expect(REVENUE_CONTENT.news.stamps.fine).not.toBe(RETENTION_CONTENT.news.stamps.fine);
  });

  it("writes its own endings' texts and keeps level 1's eyebrows; only the two it retitles are its own", () => {
    for (const id of Object.keys(REVENUE_CONTENT.endings) as (keyof typeof REVENUE_CONTENT.endings)[]) {
      expect(REVENUE_CONTENT.endings[id].eyebrow, id).toBe(RETENTION_CONTENT.endings[id].eyebrow);
      expect(REVENUE_CONTENT.endings[id].text, id).not.toBe(RETENTION_CONTENT.endings[id].text);
    }
    const retitled = Object.keys(REVENUE_CONTENT.endings).filter(
      (id) => REVENUE_CONTENT.endings[id as keyof typeof REVENUE_CONTENT.endings].title !== RETENTION_CONTENT.endings[id as keyof typeof REVENUE_CONTENT.endings].title,
    );
    expect(sorted(retitled)).toEqual(["cleanMiss", "labyrinth"]);
  });

  it("flags a win on the two endings where the board's number is met or the slope is clean — and on no other", () => {
    const wins = Object.entries(REVENUE_CONTENT.endings)
      .filter(([, ending]) => ending.win)
      .map(([id]) => id);
    expect(sorted(wins)).toEqual(["applause", "cleanMiss"]);
    for (const id of ["firedClean", "firedDark", "fine", "labyrinth", "repentant"] as const) expect(REVENUE_CONTENT.endings[id].win, id).toBe(false);
  });

  it("names its own company, never Flixo, Pédalix, Quandi nor Partix", () => {
    const own = [...LEAVES, ...walk(REVENUE_INTRO).leaves, ...walk(GAME_META.revenue).leaves];
    const others = own
      .filter(({ value }) => /Flixo|Pédalix|Quandi|Partix/.test(value.fr) || /Flixo|Pédalix|Quandi|Partix/.test(value.en))
      .map(({ path }) => path);
    expect(others).toEqual([]);
    // Non-vacuous: level 1's own tag names Flixo, level 2's Pédalix, level 3's Quandi and level 4's Partix.
    expect(/Flixo/.test(RETENTION_CONTENT.visio.tag.fr)).toBe(true);
    expect(/Pédalix/.test(ACQUISITION_CONTENT.visio.tag.fr)).toBe(true);
    expect(/Quandi/.test(ACTIVATION_CONTENT.visio.tag.fr)).toBe(true);
    expect(/Partix/.test(REFERRAL_CONTENT.visio.tag.fr)).toBe(true);
    expect(REVENUE_CONTENT.visio.tag.fr).toContain("Gainix");
    expect(REVENUE_CONTENT.visio.tag.en).toContain("Gainix");
  });
});
