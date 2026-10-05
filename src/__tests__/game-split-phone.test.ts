import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { REFERRAL_SIDE, sentSentence } from "@/app/[locale]/game/_island/sides";
import { changedKeys } from "@/components/game/phone-flash";
import { SentPill } from "@/components/game/SentPill";
import { SplitPhone, splitItemKey } from "@/components/game/SplitPhone";
import { REFERRAL_CONTENT } from "@/content/game/referral";
import { resolveLevelCopy, type ReferralCopy } from "@/lib/game/copy";
import { formatInt } from "@/lib/game/format";
import { REFERRAL_DARK_IDS, REFERRAL_HONEST_IDS, type ReferralCardId } from "@/lib/game/levels/referral";
import { CONTACTS, MESSAGES_PER_CONTACT, sentInYourName, splitPhoneView } from "@/lib/game/split-phone";
import { LOCALES, type Locale } from "@/lib/i18n/locale";

/**
 * The referral level's phone — Partix's app, the invitation seen from both
 * sides (GAME-BRIEF §19.7, CHANTIERS.md A24, REF-2): what it shows for each
 * card, what a tick flashes, and the pill of messages sent in Thomas's name,
 * the level's « N clics pour résilier ». Every row of the pill's table in
 * §19.7 is a case below, and C13's other half — the contacts and the
 * follow-ups the copy says, against the constants of the phone — lives here
 * because those constants only exist from this unit on.
 */

const ALL = [...REFERRAL_HONEST_IDS, ...REFERRAL_DARK_IDS] as ReferralCardId[];
const kinds = (ids: readonly string[]) => splitPhoneView(ids).map((item) => item.kind);
const copyOf = (locale: Locale) => resolveLevelCopy<ReferralCopy>(REFERRAL_CONTENT, locale);

/** `&amp;` is decoded last, so an escaped « &amp;quot; » stays « &quot; » rather than being unescaped twice (CodeQL js/double-escaping). */
const decode = (html: string) => html.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");

/** The text a static render shows, tags stripped until nothing changes. */
function text(html: string): string {
  let out = html;
  for (let prev = ""; prev !== out; ) {
    prev = out;
    out = out.replace(/<[^>]*>/g, "");
  }
  return decode(out);
}

/** Every text node of a render, whole: « Partix » is not found inside « Tu aimes Partix ? ». */
function nodes(html: string): string[] {
  return [...html.matchAll(/>([^<>]+)</g)].map((m) => decode(m[1]!));
}

function draw(ids: readonly string[], locale: Locale): string {
  return renderToStaticMarkup(createElement(SplitPhone, { items: splitPhoneView(ids), labels: copyOf(locale).phone }));
}

/**
 * The text nodes of one element of the drawing, by its test id: from its opening tag to its closing one. Every
 * element that has children is a `<div>` or a `<p>` holding only spans (and one `<ul>`), so the first `</div>` or
 * `</p>` after the tag is its own.
 */
function within(html: string, testId: string): string[] {
  const after = html.split(`data-testid="${testId}"`)[1];
  if (after === undefined) throw new Error(`${testId} is not drawn`);
  // The closing tag is cut off, so a `<` is put back for the last text node to end on.
  return nodes(`${after.split(/<\/div>|<\/p>/)[0]!}<`);
}

describe("what the phone shows (§19.7)", () => {
  it("before any card: the app, the group, the invitation screen as it is, Léa's message — nothing else", () => {
    expect(splitPhoneView([])).toEqual([
      { kind: "appBar" },
      { kind: "group" },
      { kind: "invite", preselected: false, chosen: false, groupLink: false },
      { kind: "guestDivider" },
      { kind: "guestMessage", personalised: false },
    ]);
  });

  it("with every card, in the order the screen is read: Thomas's half, Léa's, the promise at the foot", () => {
    expect(kinds(ALL)).toEqual([
      "appBar", "group", "continue", "bonus", "locked", "invite", "autoSent", "review", "recap",
      "guestDivider", "guestMessage", "guestShadow", "guestPage", "guestQuestion", "noBook",
    ]);
    const items = splitPhoneView(ALL);
    // `fairbonus` wins over `bonus`; `chosen` cancels what `contacts` ticked; `shadow` keeps the numbers.
    expect(items.find((item) => item.kind === "bonus")).toEqual({ kind: "bonus", style: "clear" });
    expect(items.find((item) => item.kind === "invite")).toEqual({
      kind: "invite", preselected: false, chosen: true, groupLink: true,
    });
    expect(items.find((item) => item.kind === "guestMessage")).toEqual({ kind: "guestMessage", personalised: true });
    expect(items.find((item) => item.kind === "noBook")).toEqual({ kind: "noBook", numbers: false });
  });

  it("draws the offer `clear` with `fairbonus`, else `loud` with `bonus`, else nothing — `fairbonus` wins", () => {
    const bonus = (ids: string[]) => splitPhoneView(ids).find((item) => item.kind === "bonus");
    expect(bonus([])).toBeUndefined();
    expect(bonus(["bonus"])).toEqual({ kind: "bonus", style: "loud" });
    expect(bonus(["fairbonus"])).toEqual({ kind: "bonus", style: "clear" });
    expect(bonus(["bonus", "fairbonus"])).toEqual({ kind: "bonus", style: "clear" });
    expect(bonus(["fairbonus", "bonus"])).toEqual({ kind: "bonus", style: "clear" });
  });

  it("ticks every contact with `contacts`, unless `chosen` has them picked one by one", () => {
    const invite = (ids: string[]) => splitPhoneView(ids).find((item) => item.kind === "invite");
    expect(invite(["contacts"])).toEqual({ kind: "invite", preselected: true, chosen: false, groupLink: false });
    expect(invite(["chosen"])).toEqual({ kind: "invite", preselected: false, chosen: true, groupLink: false });
    // `chosen` cancels the preselection, whichever came first.
    expect(invite(["contacts", "chosen"])).toEqual({ kind: "invite", preselected: false, chosen: true, groupLink: false });
    expect(invite(["chosen", "contacts"])).toEqual({ kind: "invite", preselected: false, chosen: true, groupLink: false });
    expect(invite(["grouplink"])).toEqual({ kind: "invite", preselected: false, chosen: false, groupLink: true });
  });

  it("promises no address book with `nobook`, and its second sentence only while `shadow` keeps no numbers", () => {
    const promise = (ids: string[]) => splitPhoneView(ids).find((item) => item.kind === "noBook");
    expect(promise([])).toBeUndefined();
    expect(promise(["shadow"])).toBeUndefined();
    expect(promise(["nobook"])).toEqual({ kind: "noBook", numbers: true });
    expect(promise(["nobook", "shadow"])).toEqual({ kind: "noBook", numbers: false });
    expect(promise(["shadow", "nobook"])).toEqual({ kind: "noBook", numbers: false });
  });

  it("puts each card's element where §19.7 says, and Léa's message personalised with `fakeinvite`", () => {
    const has = (ids: string[], kind: string) => kinds(ids).includes(kind as never);
    expect(has(["bigshare"], "continue")).toBe(true);
    expect(has(["unlock"], "locked")).toBe(true);
    expect(has(["autoinvite"], "autoSent")).toBe(true);
    expect(has(["reviewgate"], "review")).toBe(true);
    expect(has(["recap"], "recap")).toBe(true);
    expect(has(["shadow"], "guestShadow")).toBe(true);
    expect(has(["guestpage"], "guestPage")).toBe(true);
    expect(has(["guests"], "guestQuestion")).toBe(true);
    const message = (ids: string[]) => splitPhoneView(ids).find((item) => item.kind === "guestMessage");
    expect(message([])).toEqual({ kind: "guestMessage", personalised: false });
    expect(message(["fakeinvite"])).toEqual({ kind: "guestMessage", personalised: true });
    // The order inside a half does not depend on the order the cards were ticked in.
    expect(kinds(["recap", "autoinvite", "unlock", "bigshare"])).toEqual(kinds(["bigshare", "unlock", "autoinvite", "recap"]));
  });

  it("gives every card a visible place on the phone, except the data review and the rollback", () => {
    const base = new Set(splitPhoneView([]).map(splitItemKey));
    const invisible = ALL.filter((id) => splitPhoneView([id]).every((item) => base.has(splitItemKey(item))));
    // `present` is a meeting; `clean` puts the phone back as it was (§19.7).
    expect(invisible.sort()).toEqual(["clean", "present"]);
  });

  it("keys every element uniquely, whatever is ticked", () => {
    for (const ids of [[], ALL, ["bonus", "fairbonus"], ["contacts", "chosen"], ["nobook", "shadow"], ["fakeinvite", "autoinvite"]]) {
      const keys = splitPhoneView(ids).map(splitItemKey);
      expect(new Set(keys).size, ids.join("+")).toBe(keys.length);
    }
  });

  it("keys the elements by their kind and every flag that changes what they show", () => {
    expect(splitItemKey({ kind: "bonus", style: "loud" })).toBe("bonus:loud");
    expect(splitItemKey({ kind: "bonus", style: "clear" })).toBe("bonus:clear");
    expect(splitItemKey({ kind: "invite", preselected: true, chosen: false, groupLink: true })).toBe("invite:true:false:true");
    expect(splitItemKey({ kind: "guestMessage", personalised: true })).toBe("guestMessage:true");
    expect(splitItemKey({ kind: "noBook", numbers: false })).toBe("noBook:false");
    expect(splitItemKey({ kind: "guestDivider" })).toBe("guestDivider");
  });

  it("flashes what a tick changed, and only that", () => {
    const flashed = (before: string[], after: string[]) =>
      [...changedKeys(splitPhoneView(before), splitPhoneView(after), splitItemKey)].sort();
    expect(flashed([], ["bonus"])).toEqual(["bonus:loud"]);
    expect(flashed([], ["fairbonus"])).toEqual(["bonus:clear"]);
    expect(flashed(["bonus"], ["bonus", "fairbonus"])).toEqual(["bonus:clear"]);
    expect(flashed([], ["autoinvite"])).toEqual(["autoSent"]);
    // The invitation screen changes whole: its key carries every flag.
    expect(flashed([], ["contacts"])).toEqual(["invite:true:false:false"]);
    expect(flashed(["contacts"], ["contacts", "chosen"])).toEqual(["invite:false:true:false"]);
    expect(flashed([], ["fakeinvite"])).toEqual(["guestMessage:true"]);
    expect(flashed(["nobook"], ["nobook", "shadow"])).toEqual(["guestShadow", "noBook:false"]);
    // Taking a card back shows what is there again, but flashes nothing that was already on screen.
    expect(flashed(["autoinvite"], [])).toEqual([]);
  });
});

describe("the pill of messages sent in Thomas's name (§19.7)", () => {
  // The four rows of the table: cards in production or ticked → the count, and whether the pill is coral.
  const TABLE: { ids: string[]; messages: number; alert: boolean }[] = [
    { ids: [], messages: 0, alert: false },
    { ids: ["fakeinvite"], messages: 214, alert: true },
    { ids: ["autoinvite"], messages: 642, alert: true },
    { ids: ["autoinvite", "fakeinvite"], messages: 856, alert: true },
  ];
  const SENTENCES: Record<Locale, { none: string; some: (n: number) => string }> = {
    fr: {
      none: "0 message envoyé au nom de Thomas",
      some: (n) => `${n} messages envoyés au nom de Thomas · des messages qu'il n'a pas écrits`,
    },
    en: {
      none: "0 messages sent in Thomas's name",
      some: (n) => `${n} messages sent in Thomas's name · messages he didn't write`,
    },
  };

  it("counts what `autoinvite` and `fakeinvite` send in Thomas's name, and alerts as soon as anything went out", () => {
    for (const row of TABLE) {
      expect(sentInYourName(row.ids), row.ids.join("+") || "none").toEqual({ messages: row.messages, alert: row.alert });
    }
    expect(CONTACTS).toBe(214);
    expect(MESSAGES_PER_CONTACT).toBe(3);
    // Order does not matter, and other cards change nothing: `chosen` and `nobook` do not switch an automation off.
    expect(sentInYourName(["fakeinvite", "autoinvite"])).toEqual({ messages: 856, alert: true });
    const others = ALL.filter((id) => id !== "autoinvite" && id !== "fakeinvite");
    expect(sentInYourName(others)).toEqual({ messages: 0, alert: false });
    expect(sentInYourName([...others, "autoinvite"])).toEqual({ messages: 642, alert: true });
    expect(sentInYourName([...others, "fakeinvite"])).toEqual({ messages: 214, alert: true });
    expect(sentInYourName(ALL)).toEqual({ messages: 856, alert: true });
    expect(sentInYourName(["autoinvite", "chosen", "nobook"])).toEqual({ messages: 642, alert: true });
  });

  for (const locale of LOCALES) {
    it(`${locale}: each row of the table says its sentence, the same one in the pill, the island and the action bar`, () => {
      const copy = copyOf(locale);
      for (const row of TABLE) {
        const label = row.ids.join("+") || "none";
        const r = sentInYourName(row.ids);
        const html = renderToStaticMarkup(
          createElement(SentPill, { count: formatInt(locale, r.messages), alert: r.alert, labels: copy.sent, announce: false }),
        );
        const expected = row.alert ? SENTENCES[locale].some(row.messages) : SENTENCES[locale].none;
        expect(text(html), label).toBe(expected);
        expect(sentSentence(copy, locale, r), label).toBe(expected);
        expect(html, label).toContain('data-testid="game-sent"');
        expect(html, label).toContain(`data-alert="${row.alert}"`);
        // The action bar's short form carries no suffix, and the alert says the rest.
        const pill = REFERRAL_SIDE.pill({ ids: row.ids, copy, locale });
        expect(pill.alert, label).toBe(row.alert);
        expect(pill.text, label).toBe(row.alert ? SENTENCES[locale].some(row.messages).split(" · ")[0] : SENTENCES[locale].none);
        expect(expected.startsWith(pill.text), label).toBe(true);
      }
    });
  }

  for (const locale of LOCALES) {
    it(`${locale}: C13 — the contacts and the follow-ups the copy says are the constants of the phone`, () => {
      const { phone } = copyOf(locale);
      const contacts = formatInt(locale, CONTACTS);
      expect(phone.invitePreselected).toContain(contacts);
      expect(phone.autoSent).toContain(contacts);
      // « 2 relances » / « 2 follow-ups »: one invitation, then the other messages of the three each contact gets.
      const unit = locale === "fr" ? "relances" : "follow-ups";
      expect(phone.autoSent).toMatch(new RegExp(`\\b${MESSAGES_PER_CONTACT - 1}\\s+${unit}\\b`));
      // The one count each line states about the address book.
      expect(phone.invitePreselected.match(/\d+/g)).toEqual([contacts]);
      expect(phone.autoSent.match(/\d+/g)).toEqual([contacts, String(MESSAGES_PER_CONTACT - 1)]);
      // The pill's counts are computed, never written: no sentence of the copy states 642 or 856.
      expect(JSON.stringify(copyOf(locale))).not.toMatch(/\b(642|856)\b/);
    });
  }

  it("is coral only once something went out, and emphasises the count while the sentence stays whole", () => {
    const copy = copyOf("en");
    const pill = (count: string, alert: boolean) =>
      renderToStaticMarkup(createElement(SentPill, { count, alert, labels: copy.sent, announce: false }));
    const alerted = pill("856", true);
    expect(alerted).toMatch(/<b class="[^"]*">856<\/b>/);
    expect(text(alerted)).toBe(`856 messages sent in Thomas's name · ${copy.sent.suffix}`);
    expect(alerted).toMatch(/class="[^"]*_over_/);
    const quiet = pill("0", false);
    expect(quiet).not.toContain("<b");
    expect(quiet).not.toMatch(/_over_/);
    expect(text(quiet)).toBe(copy.sent.none);
  });

  it("announces a tick only when it changed the count", () => {
    const copy = copyOf("fr");
    const announce = (before: string[], after: string[]) => REFERRAL_SIDE.announce({ before, after, copy, locale: "fr" });
    const now = (ids: string[]) => sentSentence(copy, "fr", sentInYourName(ids));
    expect(announce([], ["guests"])).toBeNull();
    // `chosen` and `nobook` leave the count where it was: nothing to say.
    expect(announce([], ["chosen"])).toBeNull();
    expect(announce(["autoinvite"], ["autoinvite", "nobook"])).toBeNull();
    expect(announce([], ["fakeinvite"])).toBe(now(["fakeinvite"]));
    expect(announce(["fakeinvite"], ["fakeinvite", "autoinvite"])).toBe(now(["autoinvite", "fakeinvite"]));
    // Taking the last automatic message back brings the quiet sentence.
    expect(announce(["fakeinvite"], [])).toBe(copy.sent.none);
    expect(announce(["fakeinvite"], ["fakeinvite", "recap"])).toBeNull();
  });

  it("speaks for itself by default, and not inside the island", () => {
    const copy = copyOf("fr");
    const pill = (announce?: boolean) =>
      renderToStaticMarkup(createElement(SentPill, { count: "214", alert: true, labels: copy.sent, announce }));
    expect(pill()).toContain('aria-live="polite"');
    expect(pill(false)).not.toContain("aria-live");
    const side = renderToStaticMarkup(REFERRAL_SIDE.render({ ids: ["fakeinvite"], copy, locale: "fr" }));
    expect(side).toContain('data-testid="game-phone"');
    expect(side).toContain('data-testid="game-sent"');
    expect(side).not.toContain("aria-live");
  });
});

describe("the drawing", () => {
  for (const locale of LOCALES) {
    it(`${locale}: with every card ticked, every line is on the phone, and the phone has no control`, () => {
      const copy = copyOf(locale);
      const html = draw(ALL, locale);
      const shown = nodes(html);
      for (const key of [
        "caption", "appName", "time", "group", "continueExpense", "continueButton", "continueFine", "continueSkip",
        "bonusClear", "bonusClearTerms", "locked", "inviteTitle", "inviteChosen", "groupLink", "autoSent",
        "reviewQuestion", "reviewYes", "reviewNo", "recap", "guestDivider", "guestMessagePersonalised", "guestShadow",
        "guestPage", "guestQuestion", "noBook",
      ] as const) {
        expect(shown, key).toContain(copy.phone[key]);
      }
      for (const answer of copy.phone.guestAnswers) expect(shown).toContain(answer);
      // A drawing, never an interface (plan R14, E9).
      expect(html).not.toMatch(/<(button|a|input|select|textarea)\b/);
      expect(html).toContain("<figure");
      expect(html).toContain("<figcaption");
      expect(html).toContain('data-testid="game-phone"');
    });

    it(`${locale}: what cannot be seen with every card ticked`, () => {
      const copy = copyOf(locale);
      const shown = nodes(draw(ALL, locale));
      // `fairbonus` replaces the loud offer, `chosen` the base and the preselected lines, `fakeinvite` Léa's plain
      // message, `shadow` the promise's second sentence.
      for (const key of ["bonusLoud", "bonusLoudFine", "inviteBase", "invitePreselected", "guestMessage", "noBookNumbers"] as const) {
        expect(shown, key).not.toContain(copy.phone[key]);
      }
    });
  }

  it("gives every element but the app bar its test id, `game-split-<kind>`", () => {
    const html = draw(ALL, "fr");
    for (const item of splitPhoneView(ALL)) {
      if (item.kind === "appBar") continue;
      expect(html, item.kind).toContain(`data-testid="game-split-${item.kind}"`);
    }
    expect(html.match(/data-testid="game-split-/g)).toHaveLength(splitPhoneView(ALL).length - 1);
  });

  it("draws the app bar once, on Thomas's half: Léa's has none", () => {
    const copy = copyOf("fr").phone;
    const shown = nodes(draw(ALL, "fr"));
    expect(shown.filter((node) => node === copy.appName)).toHaveLength(1);
    expect(shown.filter((node) => node === copy.time)).toHaveLength(1);
    expect(shown.indexOf(copy.appName)).toBeLessThan(shown.indexOf(copy.guestDivider));
  });

  it("draws the continue screen as the card puts it in production: the expense, the big button, the reason, the grey link", () => {
    const copy = copyOf("fr").phone;
    expect(within(draw(["bigshare"], "fr"), "game-split-continue")).toEqual([
      copy.continueExpense, copy.continueButton, copy.continueFine, copy.continueSkip,
    ]);
  });

  it("draws each offer with its own words: loud with its mention, clear with its terms", () => {
    const copy = copyOf("fr").phone;
    const loud = draw(["bonus"], "fr");
    expect(loud).toContain('data-style="loud"');
    expect(within(loud, "game-split-bonus")).toEqual([copy.bonusLoud, copy.bonusLoudFine]);
    const clear = draw(["fairbonus"], "fr");
    expect(clear).toContain('data-style="clear"');
    expect(within(clear, "game-split-bonus")).toEqual([copy.bonusClear, copy.bonusClearTerms]);
    // Both cards: the clear offer wins, and the loud one is not drawn at all.
    const both = nodes(draw(["bonus", "fairbonus"], "fr"));
    expect(both).toContain(copy.bonusClear);
    expect(both).not.toContain(copy.bonusLoud);
  });

  it("draws one of the three invitation lines, never two, and the group link after it", () => {
    const copy = copyOf("en").phone;
    const invite = (ids: string[]) => within(draw(ids, "en"), "game-split-invite");
    expect(invite([])).toEqual([copy.inviteTitle, copy.inviteBase]);
    expect(invite(["contacts"])).toEqual([copy.inviteTitle, copy.invitePreselected]);
    expect(invite(["chosen"])).toEqual([copy.inviteTitle, copy.inviteChosen]);
    expect(invite(["contacts", "chosen"])).toEqual([copy.inviteTitle, copy.inviteChosen]);
    expect(invite(["grouplink"])).toEqual([copy.inviteTitle, copy.inviteBase, copy.groupLink]);
    expect(invite(["contacts", "grouplink"])).toEqual([copy.inviteTitle, copy.invitePreselected, copy.groupLink]);
  });

  it("draws the review prompt as a question and its two ways, and the guests' question with its three answers as bullets", () => {
    const copy = copyOf("fr").phone;
    expect(within(draw(["reviewgate"], "fr"), "game-split-review")).toEqual([copy.reviewQuestion, copy.reviewYes, copy.reviewNo]);
    const html = draw(["guests"], "fr");
    expect(html).toMatch(/<ul[^>]*>(<li>[^<]+<\/li>){3}<\/ul>/);
    expect(within(html, "game-split-guestQuestion")).toEqual([copy.guestQuestion, ...copy.guestAnswers]);
  });

  it("replaces Léa's message with the personalised one, and draws it with no sender and no time", () => {
    const copy = copyOf("fr").phone;
    const plain = draw([], "fr");
    expect(plain).toContain('data-personalised="false"');
    expect(within(plain, "game-split-guestMessage")).toEqual([copy.guestMessage]);
    const personalised = draw(["fakeinvite"], "fr");
    expect(personalised).toContain('data-personalised="true"');
    expect(within(personalised, "game-split-guestMessage")).toEqual([copy.guestMessagePersonalised]);
    expect(nodes(personalised)).not.toContain(copy.guestMessage);
  });

  it("draws the promise at the foot on one line, its second sentence only without `shadow`", () => {
    const copy = copyOf("en").phone;
    const foot = (ids: string[]) => within(draw(ids, "en"), "game-split-noBook");
    expect(foot(["nobook"])).toEqual([`${copy.noBook} ${copy.noBookNumbers}`]);
    expect(foot(["nobook", "shadow"])).toEqual([copy.noBook]);
    // It closes the screen, after Léa's half and whatever she is shown.
    expect(kinds(["nobook", "guests", "guestpage", "shadow"]).at(-1)).toBe("noBook");
  });

  it("draws the padlock in CSS: the locked line carries its one string and nothing else", () => {
    const copy = copyOf("fr").phone;
    expect(within(draw(["unlock"], "fr"), "game-split-locked")).toEqual([copy.locked]);
    expect(draw(["unlock"], "fr")).toContain('aria-hidden="true"');
  });
});
