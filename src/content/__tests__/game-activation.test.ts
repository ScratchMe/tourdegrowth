import { describe, expect, it } from "vitest";
import type { Translatable } from "@/lib/i18n/translatable";
import { ACTIVATION_COPY_TEMPLATES, resolveLevelCopy, type ActivationCopy } from "@/lib/game/copy";
import { ACTIVATION_DARK_IDS, ACTIVATION_HONEST_IDS, ACTIVATION_LEVEL } from "@/lib/game/levels/activation";
import { ACQUISITION_CONTENT } from "../game/acquisition";
import { ACTIVATION_CONTENT } from "../game/activation";
import { ACTIVATION_INTRO, GAME_META, RETENTION_INTRO } from "../game/meta";
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
 * GAME-BRIEF.md §7.1, série C — the content of the activation level « Comment
 * ils comprennent ce que vous apportez » (§18, `docs/game/activation.md`), under
 * level 1's rules (`game-copy-checks.ts`), as level 2 is.
 *
 * Two things differ from level 2, both by the spec (§18.12). C1 has no single
 * article to cite: the CNIL's cookie rules, the GDPR, the Consumer Code and the
 * Digital Services Act each carry some of the tricks, so every `law` names one of
 * them. And C14, « a transaction pénale is not a fine », is replaced by its
 * mirror: here the inspection IS a fine, an administrative one imposed by the
 * CNIL's sanctions committee, and no « transaction » or « settlement » is told
 * for it (the FTC's agreement with Twitter, in a `cas`, is the one settlement).
 *
 * C13 holds only what the copy says to itself. Its other half, the clicks the
 * pill states against the constants of the phone, is `game-planner-phone.test.ts`
 * (ACT-2): those constants do not exist yet.
 *
 * Non-vacuity (2026-10-04, A24.ACT-1), each sabotage applied then undone, and
 * how many tests of this file fall: a plain space before « % » in a French
 * target, 2 (C4 and C12); the same in the intro's « 10 000 », 1 (C12); a brand
 * slipped into a case (Facebook), 1 (C6); « Harvard » gone from both `cas`, 1
 * (the stale entry); « transaction » in `events.control`, 2 (the control rule);
 * a `law` that names no text, 1 (C1); « Vingt » turned into « Trente minutes »
 * on the phone, 1 (C13); a phone line with 65 % in English only, 1 (C13); an
 * answer of the calls the survey no longer quotes, 1 (C13); an order with an
 * initial capital, 1; `cleanMiss` no longer a win, 1; `nextLevel` copied rather
 * than shared, 1; the intro without its 30 %, or the English description
 * without its 45 %, 1 each (C4). A title past 60 characters falls in
 * `game-hub.test.ts`, 1.
 */

const { leaves: LEAVES, bare: BARE } = walk(ACTIVATION_CONTENT);
const HONEST = [...ACTIVATION_HONEST_IDS] as string[];
const DARK = [...ACTIVATION_DARK_IDS] as string[];

/** The CEO asks for these five and no other (GAME-BRIEF §18.5). */
const ORDER_POOL = ["bundle", "banner", "phone", "prechecked", "partners"];

const NBSP = "\u00a0";

// ---------------------------------------------------------------------------
// C1, C2 — both languages, everywhere, and nothing forgotten.
// ---------------------------------------------------------------------------

describe("C2 · parity between the two languages", () => {
  it("walks a tree that actually has content — otherwise every check below proves nothing", () => {
    expect(LEAVES.length).toBeGreaterThan(250);
  });

  it("has no bare string: every leaf is a Translatable", () => {
    expect(BARE).toEqual([]);
  });

  it("is non-empty in French and in English at every leaf", () => {
    const empty = LEAVES.filter(({ value }) => !value.fr.trim() || !value.en.trim()).map(({ path }) => path);
    expect(empty).toEqual([]);
  });

  it("names every card of the level, and only those", () => {
    expect(sorted(Object.keys(ACTIVATION_CONTENT.cards))).toEqual(sorted([...HONEST, ...DARK]));
  });

  it("resolves to one language, keeping the shape, the arrays and the flags", () => {
    for (const locale of ["fr", "en"] as const) {
      const copy = resolveLevelCopy<ActivationCopy>(ACTIVATION_CONTENT, locale);
      expect(copy.cards.demo.name).toBe(ACTIVATION_CONTENT.cards.demo.name[locale]);
      expect(copy.boss.t1).toBe(ACTIVATION_CONTENT.boss.t1[locale]);
      expect(copy.cookies.hidden).toBe(ACTIVATION_CONTENT.cookies.hidden[locale]);
      expect(copy.months).toHaveLength(12);
      expect(copy.phone.callsAnswers).toHaveLength(3);
      expect(copy.endings.applause.win).toBe(true);
      expect(copy.endings.fine.win).toBe(false);
      expect(walk(copy).leaves).toEqual([]);
      expect(walk(copy).bare.length).toBe(LEAVES.length);
    }
  });

  it("keeps no second copy of the intro or of the zones — the page renders meta.ts and hub.ts (review R8)", () => {
    expect(Object.keys(ACTIVATION_CONTENT)).not.toContain("intro");
    expect(Object.keys(ACTIVATION_CONTENT)).not.toContain("zones");
  });

  it("has no phone or pill of another level: the clicks to cancel are Flixo's, the basket is Pédalix's", () => {
    expect(Object.keys(ACTIVATION_CONTENT)).not.toContain("clicks");
    expect(Object.keys(ACTIVATION_CONTENT)).not.toContain("basket");
    expect(Object.keys(ACTIVATION_CONTENT.effects)).not.toContain("extra");
    expect(Object.keys(ACTIVATION_CONTENT)).toContain("cookies");
  });
});

/** Some text from the list the spec names for C1 (§18.12). */
const cites = (text: string, sources: readonly string[]) => sources.some((source) => text.includes(source));
const LAW_FR = ["loi Informatique et Libertés", "RGPD", "Code de la consommation", "règlement européen sur les services numériques"];
const LAW_EN = ["Data Protection Act", "GDPR", "Consumer Code", "Digital Services Act"];

describe("C1 · every trick has its four catalogue fields", () => {
  it("covers the eight tricks exactly", () => {
    expect(sorted(Object.keys(ACTIVATION_CONTENT.patterns))).toEqual(sorted(DARK));
  });

  it("has official, law, cas and tell, non-empty, in both languages", () => {
    for (const [id, pattern] of Object.entries(ACTIVATION_CONTENT.patterns)) {
      for (const field of ["official", "law", "cas", "tell"] as const) {
        expect(pattern[field].fr.trim(), `${id}.${field} fr`).not.toBe("");
        expect(pattern[field].en.trim(), `${id}.${field} en`).not.toBe("");
      }
    }
  });

  it("names the text it rests on in every law: the Data Protection Act, the GDPR, the Consumer Code or the Digital Services Act", () => {
    for (const [id, pattern] of Object.entries(ACTIVATION_CONTENT.patterns)) {
      expect(cites(pattern.law.fr, LAW_FR), `${id} fr`).toBe(true);
      expect(cites(pattern.law.en, LAW_EN), `${id} en`).toBe(true);
    }
  });

  it("would catch a law that names none of them — the rule is not vacuous", () => {
    expect(cites("Aucune règle ne la nomme.", LAW_FR)).toBe(false);
    expect(cites("No rule names it.", LAW_EN)).toBe(false);
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
    for (const [id, card] of Object.entries(ACTIVATION_CONTENT.cards)) {
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
    for (const [key, value] of Object.entries(ACTIVATION_CONTENT.hand)) {
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
  const { boss } = ACTIVATION_CONTENT;
  const { targets, metric0 } = ACTIVATION_LEVEL.constants;

  it("agree with each other across both languages", () => {
    // The first quarter's target is written out in the T1 message, and again in T2's reproach.
    for (const text of [boss.t1]) {
      expect(text.fr).toContain(`32,3${NBSP}%`);
      expect(text.en).toContain("32.3%");
    }
    expect(boss.t2Miss.fr).toContain(`au lieu de 32,3${NBSP}%.`);
    expect(boss.t2Miss.en).toContain("instead of 32.3%.");
    // The board's target, 45 %, everywhere it is stated rather than templated.
    for (const text of [
      boss.t1,
      boss.t4Hit,
      boss.t4Miss,
      ACTIVATION_CONTENT.endings.cleanMiss.title,
      ACTIVATION_INTRO.lead,
      GAME_META.activation.description,
    ]) {
      expect(text.fr).toContain(`45${NBSP}%`);
      expect(text.en).toContain("45%");
    }
    // January's number, in the intro and on the share image.
    expect(ACTIVATION_INTRO.lead.fr).toContain(`30${NBSP}%`);
    expect(ACTIVATION_INTRO.lead.en).toContain("30%");
    expect(GAME_META.activation.shareImageAlt.fr).toContain(`30,0${NBSP}%`);
    expect(GAME_META.activation.shareImageAlt.en).toContain("30.0%");
  });

  it("match the model: strictly increasing, ending at 45 %, T1 the 32,3 % the CEO names, January at 30 %", () => {
    for (let i = 1; i < targets.length; i++) expect(targets[i]!).toBeGreaterThan(targets[i - 1]!);
    expect(targets[targets.length - 1]).toBe(0.45);
    // The T1 message is static text: if the model's first target moves, the CEO lies.
    expect(targets[0]).toBe(0.323);
    expect(metric0).toBe(0.3);
  });
});

describe("C5 · identifiers", () => {
  it("are unique across the two families", () => {
    expect(new Set([...HONEST, ...DARK]).size).toBe(HONEST.length + DARK.length);
  });

  it("keys the CEO's orders on tricks, exactly the five he asks for", () => {
    expect(sorted(Object.keys(ACTIVATION_CONTENT.orders))).toEqual(sorted(ORDER_POOL));
    for (const id of Object.keys(ACTIVATION_CONTENT.orders)) expect(DARK).toContain(id);
  });

  it("writes every order so that it slips into « Et ce trimestre, {order} » — no initial capital", () => {
    for (const order of Object.values(ACTIVATION_CONTENT.orders)) {
      for (const locale of ["fr", "en"] as const) expect(order[locale], `${order[locale]}`).toMatch(/^\p{Ll}/u);
    }
  });

  it("agrees with the model's orders, and the first-quarter tricks are tricks", () => {
    for (const id of ACTIVATION_LEVEL.honestOrder) expect(HONEST).toContain(id);
    for (const id of ACTIVATION_LEVEL.darkOrder) expect(DARK).toContain(id);
    for (const id of ACTIVATION_LEVEL.darkFirstQuarter) expect(DARK).toContain(id);
    expect(sorted(ACTIVATION_LEVEL.orderPool)).toEqual(sorted(Object.keys(ACTIVATION_CONTENT.orders)));
    for (const id of ACTIVATION_LEVEL.orderSchedule) if (id) expect(ORDER_POOL).toContain(id);
    expect(sorted(Object.keys(ACTIVATION_LEVEL.cards))).toEqual(sorted(Object.keys(ACTIVATION_CONTENT.cards)));
  });
});

// ---------------------------------------------------------------------------
// C6 — real brands, only in the catalogue's cases (brief §8.3, §18.9).
// ---------------------------------------------------------------------------

/**
 * The level's whitelist (GAME-BRIEF §18.9): Google, named by the Conseil d'État,
 * and Twitter, named by the FTC. The CNIL's own fines are told without the firm's
 * name (C77), so a new brand is a decision, not an edit.
 */
const BRANDS = ["Google", "Twitter"];
const BRAND_WORDS = new Set(BRANDS);

/**
 * Every other capitalised word a case may use: sentence openers, public bodies,
 * places, months — as the spec lists them, computed with `CAPITALISED` on its
 * sixteen `cas`. « OCDE », « Conseil d'État » and « Cour de justice de l'Union
 * européenne » are never whole tokens: `CAPITALISED` skips a word that follows an
 * apostrophe.
 */
const NOT_BRANDS = new Set([
  "En", "In", "Le", "Les", "Ce", "It", "Aux", "CNIL", "FTC", "OECD", "Conseil", "Council", "State", "France's",
  "États-Unis", "United", "States", "Cour", "Court", "Justice", "European", "Union", "Harvard", "Business", "School",
  "Progress", "December", "April", "May",
]);

describe("C6 · brands", () => {
  it("names in a case only whitelisted brands, public bodies and ordinary words", () => {
    const unknown: string[] = [];
    for (const [id, pattern] of Object.entries(ACTIVATION_CONTENT.patterns)) {
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
    const cases = Object.values(ACTIVATION_CONTENT.patterns).map((p) => `${p.cas.fr} ${p.cas.en}`).join(" ");
    for (const brand of BRANDS) expect(cases).toContain(brand);
  });

  it("lists as ordinary only words a case uses — a stale entry is a hole a brand could slip through", () => {
    const tokens = new Set(
      Object.values(ACTIVATION_CONTENT.patterns).flatMap((p) => [...(p.cas.fr.match(CAPITALISED) ?? []), ...(p.cas.en.match(CAPITALISED) ?? [])]),
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

  it("tells a settlement, a ruling and a recommendation as such, never as a fine (§18.9)", () => {
    const { phone, pixels, prechecked } = ACTIVATION_CONTENT.patterns;
    expect(phone.cas.fr).toContain("pour clore des poursuites");
    expect(phone.cas.en).toContain("to settle charges");
    expect(pixels.cas.fr).toContain("n'est pas une sanction");
    expect(pixels.cas.en).toContain("is not a sanction");
    expect(prechecked.cas.fr).toContain("a jugé");
    expect(prechecked.cas.en).toContain("ruled");
    for (const pattern of [phone, pixels, prechecked]) {
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
    expect(templated.length).toBeGreaterThan(30);
  });

  it("uses the same placeholders in French and in English", () => {
    const mismatched = templated
      .filter(({ value }) => placeholders(value.fr).join() !== placeholders(value.en).join())
      .map(({ path }) => path);
    expect(mismatched).toEqual([]);
  });

  it("puts a placeholder only where the contract declares one, and fills with exactly the declared names", () => {
    expect(templateProblems(LEAVES, ACTIVATION_COPY_TEMPLATES)).toEqual([]);
  });

  it("declares no template that the content does not have", () => {
    const paths = templated.map(({ path }) => path);
    const stale = Object.keys(ACTIVATION_COPY_TEMPLATES).filter(
      (pattern) => !paths.some((path) => templatePatternFor(ACTIVATION_COPY_TEMPLATES, path) === pattern),
    );
    expect(stale).toEqual([]);
  });

  it("gives the phone and the cookie pill none of their own: the clicks are written out, not filled", () => {
    expect(templated.filter(({ path }) => /^(phone|cookies)\./.test(path)).map(({ path }) => path)).toEqual([]);
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
    const intro = walk(ACTIVATION_INTRO).leaves.map((leaf) => ({ ...leaf, path: `intro.${leaf.path}` }));
    const meta = walk(GAME_META.activation).leaves.map((leaf) => ({ ...leaf, path: `meta.${leaf.path}` }));
    const offenders = [...LEAVES, ...intro, ...meta]
      .filter(({ value }) => PLAIN_SPACE_IN_NUMBER.test(value.fr))
      .map(({ path, value }) => `${path}: ${value.fr.match(PLAIN_SPACE_IN_NUMBER)![0]}`);
    expect(offenders).toEqual([]);
  });

  it("would catch one — the rule is not vacuous", () => {
    expect(PLAIN_SPACE_IN_NUMBER.test("10 000 inscriptions")).toBe(true);
    expect(PLAIN_SPACE_IN_NUMBER.test(`10${NBSP}000 inscriptions`)).toBe(false);
    expect(PLAIN_SPACE_IN_NUMBER.test("45 %")).toBe(true);
    expect(PLAIN_SPACE_IN_NUMBER.test(`45${NBSP}%`)).toBe(false);
    expect(PLAIN_SPACE_IN_NUMBER.test("Étape 1 sur 7")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// C13 — what the copy says to itself adds up (GAME-BRIEF §18.7). The clicks the
// pill states, against the constants of the phone, are ACT-2's test.
// ---------------------------------------------------------------------------

/** The numbers of a string, as written: « 64 % » and "64%" are both [64], « 08:12 » is [8, 12]. */
const numbers = (text: string) => (text.replace(/[\s,]/g, "").match(/\d+/g) ?? []).map(Number);

/** What the first pair of quotation marks holds: « … » in French, "…" in English. */
function firstQuote(text: string, locale: "fr" | "en"): string {
  const match = locale === "fr" ? text.match(/«\u00a0(.+?)\u00a0»/) : text.match(/"(.+?)"/);
  if (!match) throw new Error(`no quotation in « ${text} »`);
  return match[1]!;
}

describe("C13 · the phone's text and the cards agree", () => {
  const { phone, cards, events } = ACTIVATION_CONTENT;

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

  it("says the same twenty minutes on the card and on the phone, in both languages", () => {
    expect(cards.calls.pitch.fr.toLowerCase()).toContain("vingt minutes");
    expect(phone.calls.fr.toLowerCase()).toContain("vingt minutes");
    expect(cards.calls.pitch.en.toLowerCase()).toContain("twenty-minute");
    expect(phone.calls.en.toLowerCase()).toContain("twenty minutes");
  });

  it("numbers the checklist's steps as the card counts them: three", () => {
    for (const locale of ["fr", "en"] as const) {
      expect(numbers(phone.checklist[locale])).toEqual([1, 2, 3]);
    }
    expect(cards.checklist.pitch.fr).toContain("trois étapes");
    expect(cards.checklist.pitch.en).toContain("three-step");
  });

  it("cites the first two answers of the calls in the survey's event, word for word and in lower case", () => {
    const lower = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);
    for (const locale of ["fr", "en"] as const) {
      const answers = phone.callsAnswers.map((answer) => answer[locale]);
      expect(answers).toHaveLength(3);
      const quoted = locale === "fr" ? (a: string) => `«${NBSP}${lower(a)}${NBSP}»` : (a: string) => `"${lower(a)}"`;
      expect(events.surveyAnswers[locale], locale).toContain(quoted(answers[0]!));
      expect(events.surveyAnswers[locale], locale).toContain(quoted(answers[1]!));
    }
  });

  it("shows on the phone what the pitch quotes — the same words, button by button", () => {
    for (const locale of ["fr", "en"] as const) {
      // A pitch that quotes the phone's own line.
      expect(cards.partners.pitch[locale], "partners").toContain(phone.partners[locale]);
      expect(cards.partners.pitch[locale], "partners title").toContain(phone.signupTitle[locale]);
      expect(cards.refuse.pitch[locale], "refuse").toContain(phone.bannerRejectAll[locale]);
      expect(cards.refuse.pitch[locale], "refuse").toContain(phone.bannerAcceptAll[locale]);
      expect(cards.banner.pitch[locale], "banner").toContain(phone.bannerAcceptAll[locale]);
      expect(cards.banner.pitch[locale], "banner").toContain(phone.bannerCustomise[locale]);
      expect(cards.bundle.pitch[locale], "bundle").toContain(phone.permissionsAllow[locale]);
      // A phone line that carries the pitch's quotation.
      expect(phone.prechecked[locale], "prechecked").toContain(firstQuote(cards.prechecked.pitch[locale], locale));
      expect(phone.analysis[locale], "analysis").toContain(firstQuote(cards.analysis.pitch[locale], locale));
    }
  });
});

// ---------------------------------------------------------------------------
// The control rule — an administrative fine, never a settlement (GAME-BRIEF
// §18.3, C80). It replaces level 2's C14, and reads the other way round.
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
    const { events, news, endings } = ACTIVATION_CONTENT;
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
    expect(ACTIVATION_CONTENT.events.control.fr).toContain("formation restreinte");
    expect(ACTIVATION_CONTENT.events.control.en).toContain("sanctions committee");
  });

  it("would catch level 2's wording — the rule is not vacuous", () => {
    expect(/transaction/i.test(words(ACQUISITION_CONTENT.events.control.fr))).toBe(true);
    expect(/\bsettlement\b/i.test(words(ACQUISITION_CONTENT.events.control.en))).toBe(true);
    // And it keeps the one deliberate « to settle charges » (the FTC's case): the whole word is what it looks for.
    expect(/\bsettlement\b/i.test(ACTIVATION_CONTENT.patterns.phone.cas.en)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// What this level takes from level 1, it takes by reference.
// ---------------------------------------------------------------------------

describe("shared with level 1", () => {
  it("reuses level 1's own objects for what any year says, so a correction lands in both", () => {
    expect(ACTIVATION_CONTENT.months).toBe(RETENTION_CONTENT.months);
    expect(ACTIVATION_CONTENT.timeline).toBe(RETENTION_CONTENT.timeline);
    expect(ACTIVATION_CONTENT.bossLines).toBe(RETENTION_CONTENT.bossLines);
    expect(ACTIVATION_CONTENT.news).toBe(RETENTION_CONTENT.news);
    expect(ACTIVATION_CONTENT.playbook).toBe(RETENTION_CONTENT.playbook);
    expect(ACTIVATION_CONTENT.journal).toBe(RETENTION_CONTENT.journal);
    expect(ACTIVATION_CONTENT.footer).toBe(RETENTION_CONTENT.footer);
    expect(ACTIVATION_CONTENT.tourLoop).toBe(RETENTION_CONTENT.tourLoop);
    expect(ACTIVATION_CONTENT.nextLevel).toBe(RETENTION_CONTENT.nextLevel);
    expect(ACTIVATION_CONTENT.cards.present).toBe(RETENTION_CONTENT.cards.present);
    expect(ACTIVATION_CONTENT.cards.clean.name).toBe(RETENTION_CONTENT.cards.clean.name);
    expect(ACTIVATION_CONTENT.boss.t2Hit).toBe(RETENTION_CONTENT.boss.t2Hit);
    expect(ACTIVATION_CONTENT.boss.orderWrap).toBe(RETENTION_CONTENT.boss.orderWrap);
    expect(ACTIVATION_CONTENT.clippings.why.controlRemoved).toBe(RETENTION_CONTENT.clippings.why.controlRemoved);
    expect(ACTIVATION_CONTENT.december.trend).toBe(RETENTION_CONTENT.december.trend);
    expect(ACTIVATION_INTRO.steps).toBe(RETENTION_INTRO.steps);
    expect(ACTIVATION_INTRO.stepsTitle).toBe(RETENTION_INTRO.stepsTitle);
    expect(ACTIVATION_INTRO.glossaryLead).toBe(RETENTION_INTRO.glossaryLead);
  });

  it("writes its own endings' texts and keeps level 1's eyebrows; only the two it retitles are its own", () => {
    for (const id of Object.keys(ACTIVATION_CONTENT.endings) as (keyof typeof ACTIVATION_CONTENT.endings)[]) {
      expect(ACTIVATION_CONTENT.endings[id].eyebrow, id).toBe(RETENTION_CONTENT.endings[id].eyebrow);
      expect(ACTIVATION_CONTENT.endings[id].text, id).not.toBe(RETENTION_CONTENT.endings[id].text);
    }
    const retitled = Object.keys(ACTIVATION_CONTENT.endings).filter(
      (id) => ACTIVATION_CONTENT.endings[id as keyof typeof ACTIVATION_CONTENT.endings].title !== RETENTION_CONTENT.endings[id as keyof typeof ACTIVATION_CONTENT.endings].title,
    );
    expect(sorted(retitled)).toEqual(["cleanMiss", "labyrinth"]);
  });

  it("flags a win on the two endings where the board's number is met or the slope is clean — and on no other", () => {
    const wins = Object.entries(ACTIVATION_CONTENT.endings)
      .filter(([, ending]) => ending.win)
      .map(([id]) => id);
    expect(sorted(wins)).toEqual(["applause", "cleanMiss"]);
  });

  it("names its own company, never Flixo nor Pédalix", () => {
    const own = [...LEAVES, ...walk(ACTIVATION_INTRO).leaves, ...walk(GAME_META.activation).leaves];
    const others = own.filter(({ value }) => /Flixo|Pédalix/.test(value.fr) || /Flixo|Pédalix/.test(value.en)).map(({ path }) => path);
    expect(others).toEqual([]);
    // Non-vacuous: level 1's own tag names Flixo, and level 2's names Pédalix.
    expect(/Flixo/.test(RETENTION_CONTENT.visio.tag.fr)).toBe(true);
    expect(/Pédalix/.test(ACQUISITION_CONTENT.visio.tag.fr)).toBe(true);
    expect(ACTIVATION_CONTENT.visio.tag.fr).toContain("Quandi");
  });
});
