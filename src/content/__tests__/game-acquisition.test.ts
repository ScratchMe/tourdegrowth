import { describe, expect, it } from "vitest";
import { ACQUISITION_COPY_TEMPLATES, resolveLevelCopy, type AcquisitionCopy } from "@/lib/game/copy";
import { ACQUISITION_DARK_IDS, ACQUISITION_HONEST_IDS, ACQUISITION_LEVEL } from "@/lib/game/levels/acquisition";
import { ACQUISITION_CONTENT } from "../game/acquisition";
import { ACQUISITION_INTRO, RETENTION_INTRO } from "../game/meta";
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
 * GAME-BRIEF.md §7.1, série C — the content of level 2 « Comment les gens
 * vous trouvent » (§17), under level 1's rules (`game-copy-checks.ts`).
 *
 * There is no C11 here: level 2 has no prototype whose French it must keep.
 * In its place, C12 holds the typography the repo's guard does not see (the
 * no-break spaces of numbers), C13 the arithmetic the phone states, and C14
 * the one legal word the level must never get wrong: a transaction pénale is
 * not a fine.
 */

const { leaves: LEAVES, bare: BARE } = walk(ACQUISITION_CONTENT);
const HONEST = [...ACQUISITION_HONEST_IDS] as string[];
const DARK = [...ACQUISITION_DARK_IDS] as string[];

/** The CEO asks for these five and no other (GAME-BRIEF §17.5). */
const ORDER_POOL = ["stock", "anchor", "reviews", "countdown", "teaser"];

const NBSP = " ";

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
    expect(sorted(Object.keys(ACQUISITION_CONTENT.cards))).toEqual(sorted([...HONEST, ...DARK]));
  });

  it("resolves to one language, keeping the shape, the arrays and the flags", () => {
    for (const locale of ["fr", "en"] as const) {
      const copy = resolveLevelCopy<AcquisitionCopy>(ACQUISITION_CONTENT, locale);
      expect(copy.cards.delivery.name).toBe(ACQUISITION_CONTENT.cards.delivery.name[locale]);
      expect(copy.boss.t1).toBe(ACQUISITION_CONTENT.boss.t1[locale]);
      expect(copy.months).toHaveLength(12);
      expect(copy.phone.originAnswers).toHaveLength(3);
      expect(copy.endings.applause.win).toBe(true);
      expect(copy.endings.fine.win).toBe(false);
      expect(walk(copy).leaves).toEqual([]);
      expect(walk(copy).bare.length).toBe(LEAVES.length);
    }
  });

  it("keeps no second copy of the intro or of the zones — the page renders meta.ts and hub.ts (review R8)", () => {
    expect(Object.keys(ACQUISITION_CONTENT)).not.toContain("intro");
    expect(Object.keys(ACQUISITION_CONTENT)).not.toContain("zones");
  });

  it("has no phone or pill of level 1's: the clicks to cancel are Flixo's", () => {
    expect(Object.keys(ACQUISITION_CONTENT)).not.toContain("clicks");
    expect(Object.keys(ACQUISITION_CONTENT.effects)).not.toContain("extra");
  });
});

describe("C1 · every trick has its four catalogue fields", () => {
  it("covers the eight tricks exactly", () => {
    expect(sorted(Object.keys(ACQUISITION_CONTENT.patterns))).toEqual(sorted(DARK));
  });

  it("has official, law, cas and tell, non-empty, in both languages", () => {
    for (const [id, pattern] of Object.entries(ACQUISITION_CONTENT.patterns)) {
      for (const field of ["official", "law", "cas", "tell"] as const) {
        expect(pattern[field].fr.trim(), `${id}.${field} fr`).not.toBe("");
        expect(pattern[field].en.trim(), `${id}.${field} en`).not.toBe("");
      }
    }
  });

  it("cites an article of the Code de la consommation in every law", () => {
    for (const [id, pattern] of Object.entries(ACQUISITION_CONTENT.patterns)) {
      expect(pattern.law.fr, id).toMatch(/article L\d+-\d+(?:-\d+)? du Code de la consommation/);
      expect(pattern.law.en, id).toMatch(/article L\d+-\d+(?:-\d+)? of the Consumer Code/);
    }
  });
});

// ---------------------------------------------------------------------------
// C3, C9 — the cards describe, they never judge (brief §5.5).
// ---------------------------------------------------------------------------

describe("C3 · no card shows an effect", () => {
  it("names and pitches carry no percentage, no signed number, no forbidden word, in either language", () => {
    const offenders: string[] = [];
    for (const [id, card] of Object.entries(ACQUISITION_CONTENT.cards)) {
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
    for (const [key, value] of Object.entries(ACQUISITION_CONTENT.hand)) {
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
  const { boss } = ACQUISITION_CONTENT;
  const { targets, metric0 } = ACQUISITION_LEVEL.constants;

  it("agree with each other across both languages", () => {
    // The first quarter's target is written out in the T1 message, and again in T2's reproach.
    expect(boss.t1.fr).toContain(`2${NBSP}150`);
    expect(boss.t1.en).toContain("2,150");
    expect(boss.t2Miss.fr).toContain(`au lieu de 2${NBSP}150.`);
    expect(boss.t2Miss.en).toContain("instead of 2,150.");
    // The board's target, 3 000, everywhere it is stated rather than templated.
    for (const text of [boss.t1, boss.t4Hit, boss.t4Miss, ACQUISITION_INTRO.lead, ACQUISITION_CONTENT.endings.cleanMiss.title]) {
      expect(text.fr).toContain(`3${NBSP}000`);
      expect(text.en).toContain("3,000");
    }
    // January's number, in the intro and on the share image.
    expect(ACQUISITION_INTRO.lead.fr).toContain(`2${NBSP}000`);
    expect(ACQUISITION_INTRO.lead.en).toContain("2,000");
  });

  it("match the model: strictly increasing, ending at 3 000, T1 the 2 150 the CEO names, January at 2 000", () => {
    for (let i = 1; i < targets.length; i++) expect(targets[i]!).toBeGreaterThan(targets[i - 1]!);
    expect(targets[targets.length - 1]).toBe(3_000);
    // The T1 message is static text: if the model's first target moves, the CEO lies.
    expect(targets[0]).toBe(2_150);
    expect(metric0).toBe(2_000);
  });
});

describe("C5 · identifiers", () => {
  it("are unique across the two families", () => {
    expect(new Set([...HONEST, ...DARK]).size).toBe(HONEST.length + DARK.length);
  });

  it("keys the CEO's orders on tricks, exactly the five he asks for", () => {
    expect(sorted(Object.keys(ACQUISITION_CONTENT.orders))).toEqual(sorted(ORDER_POOL));
    for (const id of Object.keys(ACQUISITION_CONTENT.orders)) expect(DARK).toContain(id);
  });

  it("agrees with the model's orders, and the first-quarter tricks are tricks", () => {
    for (const id of ACQUISITION_LEVEL.honestOrder) expect(HONEST).toContain(id);
    for (const id of ACQUISITION_LEVEL.darkOrder) expect(DARK).toContain(id);
    for (const id of ACQUISITION_LEVEL.darkFirstQuarter) expect(DARK).toContain(id);
    expect(sorted(ACQUISITION_LEVEL.orderPool)).toEqual(sorted(Object.keys(ACQUISITION_CONTENT.orders)));
    for (const id of ACQUISITION_LEVEL.orderSchedule) if (id) expect(ORDER_POOL).toContain(id);
    expect(sorted(Object.keys(ACQUISITION_LEVEL.cards))).toEqual(sorted(Object.keys(ACQUISITION_CONTENT.cards)));
  });
});

// ---------------------------------------------------------------------------
// C6 — real brands, only in the catalogue's cases (brief §8.3, §17.9).
// ---------------------------------------------------------------------------

/** The level's whitelist (GAME-BRIEF §17.9, kept by Antoine on 2026-10-01, C30 Q4). A new brand is a decision, not an edit. */
const BRANDS = ["Booking.com", "Expedia", "Temu", "Shein", "Fashion Nova"];
const BRAND_WORDS = new Set(BRANDS.flatMap((brand) => brand.split(" ")));

/** Every other capitalised word a case may use: sentence openers, public bodies, places, months. */
const NOT_BRANDS = new Set([
  "Aux", "En", "États-Unis", "FTC", "DGCCRF", "Commission", "Paris", "Une", "La", "A",
  "In", "The", "European", "United", "States", "November", "UK", "France's",
]);

describe("C6 · brands", () => {
  it("names in a case only whitelisted brands, public bodies and ordinary words", () => {
    const unknown: string[] = [];
    for (const [id, pattern] of Object.entries(ACQUISITION_CONTENT.patterns)) {
      for (const locale of ["fr", "en"] as const) {
        const text = pattern.cas[locale];
        for (const token of text.match(CAPITALISED) ?? []) {
          if (!BRANDS.includes(token) && !BRAND_WORDS.has(token) && !NOT_BRANDS.has(token)) unknown.push(`${id} ${locale}: ${token}`);
        }
        for (const domain of text.match(DOMAIN) ?? []) {
          if (!BRANDS.some((brand) => brand.toLowerCase().endsWith(domain))) unknown.push(`${id} ${locale}: ${domain}`);
        }
      }
    }
    expect(unknown).toEqual([]);
  });

  it("cites every whitelisted brand at least once — or the whitelist is stale", () => {
    const cases = Object.values(ACQUISITION_CONTENT.patterns).map((p) => `${p.cas.fr} ${p.cas.en}`).join(" ");
    for (const brand of BRANDS) expect(cases).toContain(brand);
  });

  it("keeps real brands out of the game itself: cards, phone, events, CEO", () => {
    const outside = LEAVES.filter(({ path }) => !/^patterns\.[^.]+\.cas$/.test(path));
    const leaks = outside.flatMap(({ path, value }) =>
      BRANDS.filter((brand) => value.fr.includes(brand) || value.en.includes(brand)).map((brand) => `${path}: ${brand}`),
    );
    expect(leaks).toEqual([]);
  });

  it("tells a commitment or a notification as such, never as a sanction (C30 Q4)", () => {
    const { stock, countdown, watchers, teaser, sponsored } = ACQUISITION_CONTENT.patterns;
    for (const commitment of [stock, watchers, teaser, sponsored]) {
      expect(commitment.cas.fr).toMatch(/engagé/);
      expect(commitment.cas.en).toMatch(/committed/);
    }
    expect(countdown.cas.fr).toContain("ce n'est pas une sanction");
    expect(countdown.cas.en).toContain("it is not a sanction");
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
    expect(templateProblems(LEAVES, ACQUISITION_COPY_TEMPLATES)).toEqual([]);
  });

  it("declares no template that the content does not have", () => {
    const paths = templated.map(({ path }) => path);
    const stale = Object.keys(ACQUISITION_COPY_TEMPLATES).filter(
      (pattern) => !paths.some((path) => templatePatternFor(ACQUISITION_COPY_TEMPLATES, path) === pattern),
    );
    expect(stale).toEqual([]);
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
  it("has a no-break space in digit groups and before %, € and ★, in every French string of the level and its intro", () => {
    const intro = walk(ACQUISITION_INTRO).leaves.map((leaf) => ({ ...leaf, path: `intro.${leaf.path}` }));
    const offenders = [...LEAVES, ...intro]
      .filter(({ value }) => PLAIN_SPACE_IN_NUMBER.test(value.fr))
      .map(({ path, value }) => `${path}: ${value.fr.match(PLAIN_SPACE_IN_NUMBER)![0]}`);
    expect(offenders).toEqual([]);
  });

  it("would catch one — the rule is not vacuous", () => {
    expect(PLAIN_SPACE_IN_NUMBER.test("1 290 €")).toBe(true);
    expect(PLAIN_SPACE_IN_NUMBER.test(`1${NBSP}290${NBSP}€`)).toBe(false);
    expect(PLAIN_SPACE_IN_NUMBER.test("12 personnes")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// C13 — what the phone says adds up (GAME-BRIEF §17.7).
// ---------------------------------------------------------------------------

/** The first amount of a string, in whole units: « 1 319 € livré » → 1319, "€1,319 delivered" → 1319. */
function amount(text: string): number {
  const match = text.match(/\d[\d ,]*/);
  if (!match) throw new Error(`no amount in « ${text} »`);
  return Number(match[0].replace(/[ ,]/g, ""));
}

describe("C13 · the phone's arithmetic", () => {
  for (const locale of ["fr", "en"] as const) {
    const phone = resolveLevelCopy<AcquisitionCopy>(ACQUISITION_CONTENT, locale).phone;
    const price = amount(phone.price);
    const delivery = amount(phone.basketDelivery);
    const fees = amount(phone.basketFees);

    it(`adds up in ${locale}: the delivered price, the totals and the discount`, () => {
      expect(amount(phone.delivery.split("·")[1]!)).toBe(delivery);
      expect(amount(phone.priceAllIn)).toBe(price + delivery);
      expect(amount(phone.total)).toBe(price + delivery);
      expect(amount(phone.totalWithFees)).toBe(price + delivery + fees);
      const struck = amount(phone.priceStruck);
      expect(amount(phone.discount)).toBe(Math.round(((struck - price) / struck) * 100));
    });
  }

  /**
   * « Avis mis en avant » holds the reviews under four stars back: the note
   * goes up and the count goes DOWN. The spec's first draft had sorting turn
   * 38 reviews into 1 204, and « dont 31 vérifiés » under 29 (copy review of
   * A12.c) — a phone that contradicts its card.
   */
  it("shows sorted reviews as fewer and better, and never more verified reviews than reviews", () => {
    const { rating, ratingSorted, verified } = ACQUISITION_CONTENT.phone;
    for (const locale of ["fr", "en"] as const) {
      const note = (text: string) => Number(text.match(/^(\d)[,.](\d)/)!.slice(1).join("."));
      const count = (text: string) => Number(text.match(/(\d[\d ,]*) (?:avis|reviews)/)![1]!.replace(/[ ,]/g, ""));
      expect(note(ratingSorted[locale])).toBeGreaterThan(note(rating[locale]));
      expect(count(ratingSorted[locale])).toBeLessThan(count(rating[locale]));
      expect(amount(verified[locale])).toBeLessThanOrEqual(count(ratingSorted[locale]));
    }
  });

  it("states the same amounts in both languages", () => {
    for (const key of ["price", "priceStruck", "priceAllIn", "basketDelivery", "basketFees", "total", "totalWithFees"] as const) {
      expect(amount(ACQUISITION_CONTENT.phone[key].fr), key).toBe(amount(ACQUISITION_CONTENT.phone[key].en));
    }
  });
});

// ---------------------------------------------------------------------------
// C14 — a transaction pénale is not a fine (GAME-BRIEF §17.3, C30 Q3).
// ---------------------------------------------------------------------------

describe("C14 · the inspection ends in a criminal settlement", () => {
  /** `{fine}` is the engine's name for the amount, not a word the player reads. */
  const words = (text: string) => text.replace(/\{fine\}/g, "");

  it("never says « amende » or fine, anywhere in the level", () => {
    const offenders = LEAVES.filter(
      ({ value }) => /amende/i.test(words(value.fr)) || /\bfine[ds]?\b/i.test(words(value.en)),
    ).map(({ path }) => path);
    expect(offenders).toEqual([]);
  });

  it("names the settlement where the inspection lands: the event, its stamp, December", () => {
    const { events, news, endings } = ACQUISITION_CONTENT;
    for (const text of [events.control, news.stamps.fine, endings.fine.text]) {
      expect(text.fr).toMatch(/[Tt]ransaction/);
      expect(text.en).toMatch(/[Ss]ettlement/);
    }
    expect(events.control.fr).toContain("parquet");
    expect(events.control.en).toContain("prosecutor");
  });

  it("would catch level 1's wording — the rule is not vacuous", () => {
    expect(/amende/i.test(words(RETENTION_CONTENT.events.control.fr))).toBe(true);
    expect(/\bfine[ds]?\b/i.test(words(RETENTION_CONTENT.events.control.en))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// What level 2 takes from level 1, it takes by reference.
// ---------------------------------------------------------------------------

describe("shared with level 1", () => {
  it("reuses level 1's own objects for what any year says, so a correction lands in both", () => {
    expect(ACQUISITION_CONTENT.months).toBe(RETENTION_CONTENT.months);
    expect(ACQUISITION_CONTENT.timeline).toBe(RETENTION_CONTENT.timeline);
    expect(ACQUISITION_CONTENT.bossLines).toBe(RETENTION_CONTENT.bossLines);
    expect(ACQUISITION_CONTENT.playbook).toBe(RETENTION_CONTENT.playbook);
    expect(ACQUISITION_CONTENT.footer).toBe(RETENTION_CONTENT.footer);
    expect(ACQUISITION_INTRO.steps).toBe(RETENTION_INTRO.steps);
  });

  it("names its own shop, never Flixo", () => {
    const flixo = [...LEAVES, ...walk(ACQUISITION_INTRO).leaves.filter(({ path }) => path !== "lead")]
      .filter(({ value }) => /Flixo/.test(value.fr) || /Flixo/.test(value.en))
      .map(({ path }) => path);
    expect(flixo).toEqual([]);
  });
});
