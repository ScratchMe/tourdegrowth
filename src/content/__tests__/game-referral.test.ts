import { describe, expect, it } from "vitest";
import type { Translatable } from "@/lib/i18n/translatable";
import { REFERRAL_COPY_TEMPLATES, resolveLevelCopy, type ReferralCopy } from "@/lib/game/copy";
import { REFERRAL_DARK_IDS, REFERRAL_HONEST_IDS, REFERRAL_LEVEL } from "@/lib/game/levels/referral";
import { ACQUISITION_CONTENT } from "../game/acquisition";
import { ACTIVATION_CONTENT } from "../game/activation";
import { GAME_META, REFERRAL_INTRO, RETENTION_INTRO } from "../game/meta";
import { REFERRAL_CONTENT } from "../game/referral";
import { RETENTION_CONTENT } from "../game/retention";
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
 * GAME-BRIEF.md §7.1, série C — the content of the referral level « S'ils vous
 * recommandent » (§19, `docs/game/referral.md`), under level 1's rules
 * (`game-copy-checks.ts`), as levels 2 and 3 are.
 *
 * Two things differ from level 2, both by the spec (§19.12). C1 has no single
 * article to cite: the GDPR, the Consumer Code, the Postal and Electronic
 * Communications Code and the App Store's rules each carry some of the tricks,
 * so every `law` names one of them. And C14, « a transaction pénale is not a
 * fine », is replaced by its mirror: here the inspection IS a fine, an
 * administrative one imposed by the CNIL's sanctions committee, and no
 * « transaction » or « settlement » is told for it (the agreements of Tagged
 * and LinkedIn, in two `cas`, are settlements: « to settle »).
 *
 * C13 holds only what the copy says to itself. Its other half, the 214 contacts
 * and the follow-ups against the constants of the phone (`CONTACTS`,
 * `MESSAGES_PER_CONTACT`), is `game-split-phone.test.ts` (REF-2): those
 * constants do not exist yet.
 *
 * Non-vacuity (2026-10-05, A24.REF-1), each sabotage applied then undone, and
 * how many tests of this file fall: a plain space inside « 1 284 € », 2 (C12 and
 * the group's total); a plain space before « ? » in the review question, 2 (the
 * quotations line, and `copy-typography.test.ts`); a brand slipped into a case
 * (Instagram), 1 (C6); « App Store » slipped into a case, 2 (C6 and the App
 * Store rule); « Meriton » gone from both `cas`, 1 (the whitelist is stale);
 * « Purdue » gone from both `cas`, 1 (the stale entry); « transaction » in
 * `events.control`, 1 (the control rule); a `law` that names no text, 1 (C1: a
 * first attempt, on `contacts`, passed, because that law also cites the App
 * Store; redone on `unlock`, which cites only that); « 214 » turned into « 215 »
 * on the invitation screen, 2 (C13); « 2 relances » turned into « 3 relances »
 * on the phone, 2 (C13); a guests' answer the survey no longer quotes, 1 (C13);
 * an order with an initial capital, 1; `cleanMiss` no longer a win, 1;
 * `nextLevel` copied rather than shared, 1; the intro without its 0,60, or the
 * English description without its 0.60, 1 each (C4); « 642 » in the pill's
 * suffix, 1; the pill's `{n}` gone from both languages, 3 (C8 twice, and the
 * totals); the fine's amount written out in `events.control`, 2 (C8 and the
 * amount); « passer » no longer quoted by the `bigshare` pitch, 1 (C13). A title
 * past 60 characters falls in `game-hub.test.ts`, 1.
 */

const { leaves: LEAVES, bare: BARE } = walk(REFERRAL_CONTENT);
const HONEST = [...REFERRAL_HONEST_IDS] as string[];
const DARK = [...REFERRAL_DARK_IDS] as string[];

/** The CEO asks for these five and no other (GAME-BRIEF §19.5). */
const ORDER_POOL = ["contacts", "autoinvite", "bigshare", "fakeinvite", "bonus"];

const NBSP = "\u00a0";

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
    expect(sorted(Object.keys(REFERRAL_CONTENT.cards))).toEqual(sorted([...HONEST, ...DARK]));
  });

  it("resolves to one language, keeping the shape, the arrays and the flags", () => {
    for (const locale of ["fr", "en"] as const) {
      const copy = resolveLevelCopy<ReferralCopy>(REFERRAL_CONTENT, locale);
      expect(copy.cards.fairbonus.name).toBe(REFERRAL_CONTENT.cards.fairbonus.name[locale]);
      expect(copy.boss.t1).toBe(REFERRAL_CONTENT.boss.t1[locale]);
      expect(copy.sent.none).toBe(REFERRAL_CONTENT.sent.none[locale]);
      expect(copy.months).toHaveLength(12);
      expect(copy.phone.guestAnswers).toHaveLength(3);
      expect(copy.endings.applause.win).toBe(true);
      expect(copy.endings.fine.win).toBe(false);
      expect(walk(copy).leaves).toEqual([]);
      expect(walk(copy).bare.length).toBe(LEAVES.length);
    }
  });

  it("keeps no second copy of the intro or of the zones — the page renders meta.ts and hub.ts (review R8)", () => {
    expect(Object.keys(REFERRAL_CONTENT)).not.toContain("intro");
    expect(Object.keys(REFERRAL_CONTENT)).not.toContain("zones");
  });

  it("has no phone or pill of another level: the clicks to cancel are Flixo's, the basket Pédalix's, the cookies Quandi's", () => {
    for (const other of ["clicks", "basket", "cookies"]) expect(Object.keys(REFERRAL_CONTENT)).not.toContain(other);
    expect(Object.keys(REFERRAL_CONTENT.effects)).not.toContain("extra");
    expect(Object.keys(REFERRAL_CONTENT)).toContain("sent");
  });
});

/** Some text from the list the spec names for C1 (§19.12). */
const cites = (text: string, sources: readonly string[]) => sources.some((source) => text.includes(source));
const LAW_FR = ["RGPD", "Code de la consommation", "Code des postes et des communications électroniques", "App Store"];
const LAW_EN = ["GDPR", "Consumer Code", "Postal and Electronic Communications Code", "App Store"];

describe("C1 · every trick has its four catalogue fields", () => {
  it("covers the eight tricks exactly", () => {
    expect(sorted(Object.keys(REFERRAL_CONTENT.patterns))).toEqual(sorted(DARK));
  });

  it("has official, law, cas and tell, non-empty, in both languages", () => {
    for (const [id, pattern] of Object.entries(REFERRAL_CONTENT.patterns)) {
      for (const field of ["official", "law", "cas", "tell"] as const) {
        expect(pattern[field].fr.trim(), `${id}.${field} fr`).not.toBe("");
        expect(pattern[field].en.trim(), `${id}.${field} en`).not.toBe("");
      }
    }
  });

  it("names the text it rests on in every law: the GDPR, the Consumer Code, the Postal and Electronic Communications Code or the App Store's rules", () => {
    for (const [id, pattern] of Object.entries(REFERRAL_CONTENT.patterns)) {
      expect(cites(pattern.law.fr, LAW_FR), `${id} fr`).toBe(true);
      expect(cites(pattern.law.en, LAW_EN), `${id} en`).toBe(true);
    }
  });

  it("would catch a law that names none of them — the rule is not vacuous", () => {
    expect(cites("Aucune règle ne l'interdit.", LAW_FR)).toBe(false);
    expect(cites("No rule bans it.", LAW_EN)).toBe(false);
    // Level 2's laws cite the Consumer Code only: they pass this rule, level 1's DGCCRF-only cases would not.
    expect(cites(ACQUISITION_CONTENT.patterns.stock.law.fr, LAW_FR)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// C3, C9 — the cards describe, they never judge (brief §5.5).
// ---------------------------------------------------------------------------

describe("C3 · no card shows an effect", () => {
  it("names and pitches carry no percentage, no signed number, no forbidden word, in either language", () => {
    const offenders: string[] = [];
    for (const [id, card] of Object.entries(REFERRAL_CONTENT.cards)) {
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
    for (const [key, value] of Object.entries(REFERRAL_CONTENT.hand)) {
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
  const { boss } = REFERRAL_CONTENT;
  const { targets, metric0 } = REFERRAL_LEVEL.constants;

  it("agree with each other across both languages", () => {
    // The first quarter's target is written out in the T1 message, and again in T2's reproach.
    expect(boss.t1.fr).toContain("0,43");
    expect(boss.t1.en).toContain("0.43");
    expect(boss.t2Miss.fr).toContain("au lieu de 0,43.");
    expect(boss.t2Miss.en).toContain("instead of 0.43.");
    // The board's target, 0,60, everywhere it is stated rather than templated.
    for (const text of [
      boss.t1,
      boss.t4Hit,
      boss.t4Miss,
      REFERRAL_CONTENT.endings.cleanMiss.title,
      REFERRAL_INTRO.lead,
      GAME_META.referral.description,
    ]) {
      expect(text.fr).toContain("0,60");
      expect(text.en).toContain("0.60");
    }
    // January's number, in the intro and on the share image.
    expect(REFERRAL_INTRO.lead.fr).toContain("0,40");
    expect(REFERRAL_INTRO.lead.en).toContain("0.40");
    expect(GAME_META.referral.shareImageAlt.fr).toContain("0,40");
    expect(GAME_META.referral.shareImageAlt.en).toContain("0.40");
  });

  it("match the model: strictly increasing, ending at 0,60, T1 the 0,43 the CEO names, January at 0,40", () => {
    expect(targets).toHaveLength(4);
    for (let i = 1; i < targets.length; i++) expect(targets[i]!).toBeGreaterThan(targets[i - 1]!);
    expect(targets[3]).toBe(0.6);
    // The T1 message is static text: if the model's first target moves, the CEO lies.
    expect(targets[0]).toBe(0.43);
    expect(metric0).toBe(0.4);
  });
});

describe("C5 · identifiers", () => {
  it("are unique across the two families", () => {
    expect(new Set([...HONEST, ...DARK]).size).toBe(HONEST.length + DARK.length);
  });

  it("keys the CEO's orders on tricks, exactly the five he asks for", () => {
    expect(sorted(Object.keys(REFERRAL_CONTENT.orders))).toEqual(sorted(ORDER_POOL));
    for (const id of Object.keys(REFERRAL_CONTENT.orders)) expect(DARK).toContain(id);
  });

  it("writes every order so that it slips into « Et ce trimestre, {order} » — no initial capital", () => {
    for (const order of Object.values(REFERRAL_CONTENT.orders)) {
      for (const locale of ["fr", "en"] as const) expect(order[locale], `${order[locale]}`).toMatch(/^\p{Ll}/u);
    }
  });

  it("agrees with the model's orders, and the first-quarter tricks are tricks", () => {
    for (const id of REFERRAL_LEVEL.honestOrder) expect(HONEST).toContain(id);
    for (const id of REFERRAL_LEVEL.darkOrder) expect(DARK).toContain(id);
    for (const id of REFERRAL_LEVEL.darkFirstQuarter) expect(DARK).toContain(id);
    expect(sorted(REFERRAL_LEVEL.orderPool)).toEqual(sorted(Object.keys(REFERRAL_CONTENT.orders)));
    for (const id of REFERRAL_LEVEL.orderSchedule) if (id) expect(ORDER_POOL).toContain(id);
    expect(sorted(Object.keys(REFERRAL_LEVEL.cards))).toEqual(sorted(Object.keys(REFERRAL_CONTENT.cards)));
  });
});

// ---------------------------------------------------------------------------
// C6 — real brands, only in the catalogue's cases (brief §8.3, §19.9).
// ---------------------------------------------------------------------------

/**
 * The level's whitelist (GAME-BRIEF §19.9): the companies its eight cases name.
 * The CNIL's own fines are told without the firm's name (C77), so a new brand
 * is a decision, not an edit. « App Store » is in the laws, not in the `cas`.
 */
const BRANDS = ["Clubhouse", "Tagged", "FarmVille", "Facebook", "LinkedIn", "WhatsApp", "Beer52", "Meriton"];
/** `CAPITALISED` cuts « Beer52 » at the digits and keeps the possessive of « Facebook's ». */
const BRAND_WORDS = new Set([...BRANDS.flatMap((b) => [b, `${b}'s`]), "Beer"]);

/**
 * Every other capitalised word a case may use: sentence openers, public bodies,
 * places, months — as the spec lists them, computed with `CAPITALISED` on its
 * sixteen `cas`. « Cour fédérale de justice », « CNIL » and the universities are
 * the ordinary words of a public body; « États-Unis » keeps its hyphen.
 */
const NOT_BRANDS = new Set([
  "A", "Australian", "Aux", "CNIL", "Cour", "Court", "En", "Federal", "Find", "Germany's", "In", "Ireland's", "Italy's",
  "Justice", "May", "New", "Purdue", "State's", "States", "Trouver", "UK's", "United", "University", "York", "États-Unis",
]);

describe("C6 · brands", () => {
  it("names in a case only whitelisted brands, public bodies and ordinary words", () => {
    const unknown: string[] = [];
    for (const [id, pattern] of Object.entries(REFERRAL_CONTENT.patterns)) {
      for (const locale of ["fr", "en"] as const) {
        const text = pattern.cas[locale];
        for (const token of text.match(CAPITALISED) ?? []) {
          if (!BRANDS.includes(token) && !BRAND_WORDS.has(token) && !NOT_BRANDS.has(token)) unknown.push(`${id} ${locale}: ${token}`);
        }
        // No domain on this level's whitelist: any one a case writes is a brand slipping in.
        for (const domain of text.match(DOMAIN) ?? []) unknown.push(`${id} ${locale}: ${domain}`);
      }
    }
    expect(unknown).toEqual([]);
  });

  it("cites every whitelisted brand at least once — or the whitelist is stale", () => {
    const cases = Object.values(REFERRAL_CONTENT.patterns).map((p) => `${p.cas.fr} ${p.cas.en}`).join(" ");
    for (const brand of BRANDS) expect(cases).toContain(brand);
  });

  it("lists as ordinary only words a case uses — a stale entry is a hole a brand could slip through", () => {
    const tokens = new Set(
      Object.values(REFERRAL_CONTENT.patterns).flatMap((p) => [...(p.cas.fr.match(CAPITALISED) ?? []), ...(p.cas.en.match(CAPITALISED) ?? [])]),
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

  it("keeps « App Store » in the laws, never in a case (§19.9)", () => {
    const inCases = Object.entries(REFERRAL_CONTENT.patterns).filter(
      ([, p]) => p.cas.fr.includes("App Store") || p.cas.en.includes("App Store"),
    );
    expect(inCases.map(([id]) => id)).toEqual([]);
    expect(Object.values(REFERRAL_CONTENT.patterns).some((p) => p.law.fr.includes("App Store") && p.law.en.includes("App Store"))).toBe(true);
  });

  it("tells each case for what it is: a settlement, an injunction, a ruling, a contested decision — never a fine it was not (§19.9)", () => {
    const { fakeinvite, autoinvite, shadow, unlock, bonus } = REFERRAL_CONTENT.patterns;
    expect(fakeinvite.cas.fr).toContain("sans reconnaître sa responsabilité");
    expect(fakeinvite.cas.en).toContain("without admitting liability");
    expect(autoinvite.cas.fr).toContain("pour clore une action collective");
    expect(autoinvite.cas.en).toContain("to settle a class action");
    expect(shadow.cas.fr).toContain("conteste la décision en justice");
    expect(shadow.cas.en).toContain("is challenging the decision in court");
    // The settlements, the injunction, the research and the self-regulator's ruling carry no fine.
    for (const pattern of [fakeinvite, autoinvite, unlock, bonus]) {
      expect(pattern.cas.fr).not.toMatch(/amende/);
      expect(pattern.cas.en).not.toMatch(/\bfined?\b/);
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
    expect(templateProblems(LEAVES, REFERRAL_COPY_TEMPLATES)).toEqual([]);
  });

  it("declares no template that the content does not have", () => {
    const paths = templated.map(({ path }) => path);
    const stale = Object.keys(REFERRAL_COPY_TEMPLATES).filter(
      (pattern) => !paths.some((path) => templatePatternFor(REFERRAL_COPY_TEMPLATES, path) === pattern),
    );
    expect(stale).toEqual([]);
  });

  it("gives the phone none of its own, and the pill exactly one: the count of messages", () => {
    expect(templated.filter(({ path }) => /^phone\./.test(path)).map(({ path }) => path)).toEqual([]);
    expect(templated.filter(({ path }) => /^sent\./.test(path)).map(({ path }) => path)).toEqual(["sent.some"]);
    expect(REFERRAL_COPY_TEMPLATES["sent.some"]).toEqual(["n"]);
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
    const intro = walk(REFERRAL_INTRO).leaves.map((leaf) => ({ ...leaf, path: `intro.${leaf.path}` }));
    const meta = walk(GAME_META.referral).leaves.map((leaf) => ({ ...leaf, path: `meta.${leaf.path}` }));
    const offenders = [...LEAVES, ...intro, ...meta]
      .filter(({ value }) => PLAIN_SPACE_IN_NUMBER.test(value.fr))
      .map(({ path, value }) => `${path}: ${value.fr.match(PLAIN_SPACE_IN_NUMBER)![0]}`);
    expect(offenders).toEqual([]);
  });

  it("would catch one — the rule is not vacuous", () => {
    expect(PLAIN_SPACE_IN_NUMBER.test("1 284 €")).toBe(true);
    expect(PLAIN_SPACE_IN_NUMBER.test(`1${NBSP}284${NBSP}€`)).toBe(false);
    expect(PLAIN_SPACE_IN_NUMBER.test("10 €")).toBe(true);
    expect(PLAIN_SPACE_IN_NUMBER.test(`10${NBSP}€`)).toBe(false);
    expect(PLAIN_SPACE_IN_NUMBER.test("214 contacts sélectionnés")).toBe(false);
  });

  it("writes the group's total on the phone, the level's own digit group, with a no-break space", () => {
    expect(REFERRAL_CONTENT.phone.group.fr).toContain(`1${NBSP}284${NBSP}€`);
    expect(REFERRAL_CONTENT.phone.group.en).toContain("€1,284");
  });
});

// ---------------------------------------------------------------------------
// C13 — what the copy says to itself adds up (GAME-BRIEF §19.7). The 214 contacts
// and the follow-ups against the constants of the phone are REF-2's test.
// ---------------------------------------------------------------------------

/** The numbers of a string, as written: « 1 284 € » and "€1,284" are both [1284], « 19:30 » is [19, 30]. */
const numbers = (text: string) => (text.replace(/[\s,]/g, "").match(/\d+/g) ?? []).map(Number);

/** What the first pair of quotation marks holds: « … » in French, "…" in English. */
function firstQuote(text: string, locale: "fr" | "en"): string {
  const match = locale === "fr" ? text.match(/«\u00a0(.+?)\u00a0»/) : text.match(/"(.+?)"/);
  if (!match) throw new Error(`no quotation in « ${text} »`);
  return match[1]!;
}

/** Every quotation of a string, in order. */
function quotes(text: string, locale: "fr" | "en"): string[] {
  const pattern = locale === "fr" ? /«\u00a0(.+?)\u00a0»/g : /"(.+?)"/g;
  return [...text.matchAll(pattern)].map((m) => m[1]!);
}

describe("C13 · the phone's text and the cards agree", () => {
  const { phone, cards, events } = REFERRAL_CONTENT;

  it("states the same numbers in both languages, on every line of the phone", () => {
    const lines: [string, Translatable][] = [];
    for (const [key, value] of Object.entries(phone)) {
      if (Array.isArray(value)) value.forEach((item: Translatable, i) => lines.push([`${key}.${i}`, item]));
      else lines.push([key, value as Translatable]);
    }
    expect(lines.length).toBeGreaterThan(30);
    const offenders = lines.filter(([, value]) => numbers(value.fr).join() !== numbers(value.en).join()).map(([key]) => key);
    expect(offenders).toEqual([]);
  });

  it("says 214 contacts on the invitation screen and in what went out on its own, in both languages", () => {
    for (const locale of ["fr", "en"] as const) {
      expect(phone.invitePreselected[locale], `invitePreselected ${locale}`).toContain("214");
      expect(phone.autoSent[locale], `autoSent ${locale}`).toContain("214");
    }
  });

  it("says the same two follow-ups on the card, in the CEO's order and on the phone, in both languages", () => {
    expect(phone.autoSent.fr).toContain("2 relances");
    expect(phone.autoSent.en).toContain("2 follow-ups");
    expect(cards.autoinvite.pitch.fr).toContain("deux relances");
    expect(cards.autoinvite.pitch.en).toContain("two follow-ups");
    expect(REFERRAL_CONTENT.orders.autoinvite.fr).toContain("deux relances");
    expect(REFERRAL_CONTENT.orders.autoinvite.en).toContain("two follow-ups");
  });

  it("writes no total the pill computes: 642 and 856 are in no sheet of the level, in either language", () => {
    const intro = walk(REFERRAL_INTRO).leaves;
    const meta = walk(GAME_META.referral).leaves;
    const offenders = [...LEAVES, ...intro, ...meta]
      .filter(({ value }) => /\b(642|856)\b/.test(value.fr) || /\b(642|856)\b/.test(value.en))
      .map(({ path }) => path);
    expect(offenders).toEqual([]);
    // The pill's own sentence is a template: the count arrives formatted, it is not written here.
    expect(REFERRAL_CONTENT.sent.some.fr).toContain("{n}");
    expect(REFERRAL_CONTENT.sent.some.en).toContain("{n}");
  });

  it("cites the first two answers of the guests in the survey's event, word for word and in lower case", () => {
    const lower = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);
    for (const locale of ["fr", "en"] as const) {
      const answers = phone.guestAnswers.map((answer) => answer[locale]);
      expect(answers).toHaveLength(3);
      const quoted = locale === "fr" ? (a: string) => `«${NBSP}${lower(a)}${NBSP}»` : (a: string) => `"${lower(a)}"`;
      expect(events.surveyAnswers[locale], locale).toContain(quoted(answers[0]!));
      expect(events.surveyAnswers[locale], locale).toContain(quoted(answers[1]!));
    }
  });

  it("shows on the phone what the pitch quotes — the same words, line by line", () => {
    for (const locale of ["fr", "en"] as const) {
      // « Continuer » and « passer »: the big button and the grey link.
      expect(quotes(cards.bigshare.pitch[locale], locale), "bigshare").toEqual([phone.continueButton[locale], phone.continueSkip[locale]]);
      // The loud offer, word for word.
      expect(firstQuote(cards.bonus.pitch[locale], locale), "bonus").toBe(phone.bonusLoud[locale]);
      // The question, then its two answers: the phone's lines open with the quoted words.
      const [question, yes, no] = quotes(cards.reviewgate.pitch[locale], locale);
      expect(question, "reviewgate question").toBe(phone.reviewQuestion[locale]);
      expect(phone.reviewYes[locale].startsWith(yes!), "reviewgate yes").toBe(true);
      expect(phone.reviewNo[locale].startsWith(no!), "reviewgate no").toBe(true);
      // « Thomas t'attend sur Partix »: Léa's personalised message opens with it.
      expect(phone.guestMessagePersonalised[locale].startsWith(firstQuote(cards.fakeinvite.pitch[locale], locale)), "fakeinvite").toBe(true);
    }
  });

  it("counts three friends on the card that unlocks and on the phone that shows it locked", () => {
    expect(cards.unlock.pitch.fr).toContain("trois amis");
    expect(cards.unlock.pitch.en).toContain("three friends");
    for (const locale of ["fr", "en"] as const) expect(numbers(phone.locked[locale]), locale).toEqual([3, 0, 3]);
  });

  it("writes the rival's referral offer as 5 €, wherever the year tells it", () => {
    for (const text of [REFERRAL_CONTENT.report.drivers.market, events.competitor, REFERRAL_CONTENT.clippings.competitor.headline]) {
      expect(text.fr).toContain(`5${NBSP}€`);
      expect(text.en).toContain("€5");
    }
  });

  it("writes Léa's question in the feminine: she is the one who reads it (§19.7)", () => {
    expect(phone.guestQuestion.fr).toContain("inscrite");
    expect(phone.guestQuestion.fr).toContain("retenue");
  });

  it("keeps the fine's amount out of the copy: the model owns it, the copy says {fine} (§19.3, C84)", () => {
    expect(REFERRAL_LEVEL.constants.control.fine).toBe(75_000);
    const offenders = LEAVES.filter(({ value }) => /75[\s,.]?000/.test(value.fr) || /75[\s,.]?000/.test(value.en)).map(({ path }) => path);
    expect(offenders).toEqual([]);
    expect(REFERRAL_CONTENT.events.control.fr).toContain("{fine}");
    expect(REFERRAL_CONTENT.news.stamps.fine.fr).toContain("{fine}");
  });
});

// ---------------------------------------------------------------------------
// The control rule — an administrative fine, never a settlement (GAME-BRIEF
// §19.3, C84). It replaces level 2's C14, and reads the other way round.
// ---------------------------------------------------------------------------

describe("the inspection ends in an administrative fine of the CNIL", () => {
  /** `{fine}` is the engine's name for the amount, not a word the player reads. */
  const words = (text: string) => text.replace(/\{fine\}/g, "");

  it("never says « transaction » or settlement, anywhere in the level", () => {
    const offenders = LEAVES.filter(({ value }) => /transaction/i.test(words(value.fr)) || /\bsettlement\b/i.test(words(value.en))).map(
      ({ path }) => path,
    );
    expect(offenders).toEqual([]);
  });

  it("names the fine where the inspection lands: the event, its stamp, December", () => {
    const { events, news, endings } = REFERRAL_CONTENT;
    expect(words(events.control.fr)).toMatch(/amende/);
    expect(words(events.control.en)).toMatch(/\bfine\b/);
    expect(events.control.fr).toContain("CNIL");
    expect(events.control.en).toContain("CNIL");
    expect(news.stamps.fine.fr).toMatch(/Amende/);
    expect(news.stamps.fine.en).toMatch(/Fined/);
    expect(words(endings.fine.text.fr)).toMatch(/amende/);
    expect(words(endings.fine.text.en)).toMatch(/\bfine\b/);
  });

  it("says who imposes it: the sanctions committee of the CNIL, in the event itself", () => {
    expect(REFERRAL_CONTENT.events.control.fr).toContain("formation restreinte");
    expect(REFERRAL_CONTENT.events.control.en).toContain("sanctions committee");
  });

  it("would catch level 2's wording — the rule is not vacuous", () => {
    expect(/transaction/i.test(words(ACQUISITION_CONTENT.events.control.fr))).toBe(true);
    expect(/\bsettlement\b/i.test(words(ACQUISITION_CONTENT.events.control.en))).toBe(true);
    // And it keeps the deliberate « to settle » of two cases (Tagged's and LinkedIn's agreements): the whole word is what it looks for.
    expect(/\bsettlement\b/i.test(REFERRAL_CONTENT.patterns.fakeinvite.cas.en)).toBe(false);
    expect(/\bsettlement\b/i.test(REFERRAL_CONTENT.patterns.autoinvite.cas.en)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// What this level takes from level 1, it takes by reference.
// ---------------------------------------------------------------------------

describe("shared with level 1", () => {
  it("reuses level 1's own objects for what any year says, so a correction lands in both", () => {
    expect(REFERRAL_CONTENT.months).toBe(RETENTION_CONTENT.months);
    expect(REFERRAL_CONTENT.timeline).toBe(RETENTION_CONTENT.timeline);
    expect(REFERRAL_CONTENT.bossLines).toBe(RETENTION_CONTENT.bossLines);
    expect(REFERRAL_CONTENT.news).toBe(RETENTION_CONTENT.news);
    expect(REFERRAL_CONTENT.playbook).toBe(RETENTION_CONTENT.playbook);
    expect(REFERRAL_CONTENT.journal).toBe(RETENTION_CONTENT.journal);
    expect(REFERRAL_CONTENT.footer).toBe(RETENTION_CONTENT.footer);
    expect(REFERRAL_CONTENT.tourLoop).toBe(RETENTION_CONTENT.tourLoop);
    expect(REFERRAL_CONTENT.nextLevel).toBe(RETENTION_CONTENT.nextLevel);
    expect(REFERRAL_CONTENT.cards.present).toBe(RETENTION_CONTENT.cards.present);
    expect(REFERRAL_CONTENT.cards.clean.name).toBe(RETENTION_CONTENT.cards.clean.name);
    expect(REFERRAL_CONTENT.boss.t2Hit).toBe(RETENTION_CONTENT.boss.t2Hit);
    expect(REFERRAL_CONTENT.boss.orderWrap).toBe(RETENTION_CONTENT.boss.orderWrap);
    expect(REFERRAL_CONTENT.clippings.why.controlRemoved).toBe(RETENTION_CONTENT.clippings.why.controlRemoved);
    expect(REFERRAL_CONTENT.december.trend).toBe(RETENTION_CONTENT.december.trend);
    expect(REFERRAL_INTRO.steps).toBe(RETENTION_INTRO.steps);
    expect(REFERRAL_INTRO.stepsTitle).toBe(RETENTION_INTRO.stepsTitle);
    expect(REFERRAL_INTRO.glossaryLead).toBe(RETENTION_INTRO.glossaryLead);
  });

  it("writes its own endings' texts and keeps level 1's eyebrows; only the two it retitles are its own", () => {
    for (const id of Object.keys(REFERRAL_CONTENT.endings) as (keyof typeof REFERRAL_CONTENT.endings)[]) {
      expect(REFERRAL_CONTENT.endings[id].eyebrow, id).toBe(RETENTION_CONTENT.endings[id].eyebrow);
      expect(REFERRAL_CONTENT.endings[id].text, id).not.toBe(RETENTION_CONTENT.endings[id].text);
    }
    const retitled = Object.keys(REFERRAL_CONTENT.endings).filter(
      (id) => REFERRAL_CONTENT.endings[id as keyof typeof REFERRAL_CONTENT.endings].title !== RETENTION_CONTENT.endings[id as keyof typeof REFERRAL_CONTENT.endings].title,
    );
    expect(sorted(retitled)).toEqual(["cleanMiss", "labyrinth"]);
  });

  it("flags a win on the two endings where the board's number is met or the slope is clean — and on no other", () => {
    const wins = Object.entries(REFERRAL_CONTENT.endings)
      .filter(([, ending]) => ending.win)
      .map(([id]) => id);
    expect(sorted(wins)).toEqual(["applause", "cleanMiss"]);
  });

  it("names its own company, never Flixo, Pédalix nor Quandi", () => {
    const own = [...LEAVES, ...walk(REFERRAL_INTRO).leaves, ...walk(GAME_META.referral).leaves];
    const others = own.filter(({ value }) => /Flixo|Pédalix|Quandi/.test(value.fr) || /Flixo|Pédalix|Quandi/.test(value.en)).map(({ path }) => path);
    expect(others).toEqual([]);
    // Non-vacuous: level 1's own tag names Flixo, level 2's Pédalix and level 3's Quandi.
    expect(/Flixo/.test(RETENTION_CONTENT.visio.tag.fr)).toBe(true);
    expect(/Pédalix/.test(ACQUISITION_CONTENT.visio.tag.fr)).toBe(true);
    expect(/Quandi/.test(ACTIVATION_CONTENT.visio.tag.fr)).toBe(true);
    expect(REFERRAL_CONTENT.visio.tag.fr).toContain("Partix");
  });
});
