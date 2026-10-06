import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { REVENUE_SIDE, chargeSentence } from "@/app/[locale]/game/_island/sides";
import { ChargePill } from "@/components/game/ChargePill";
import { FitPhone, fitItemKey } from "@/components/game/FitPhone";
import { changedKeys } from "@/components/game/phone-flash";
import { REVENUE_CONTENT } from "@/content/game/revenue";
import { resolveLevelCopy, type RevenueCopy } from "@/lib/game/copy";
import {
  ADDON_EUR,
  MONTHLY_EUR,
  MONTHLY_PERSONAL_EUR,
  YEARLY_EUR,
  fitPhoneView,
  trialCharge,
} from "@/lib/game/fit-phone";
import { formatEuros } from "@/lib/game/format";
import { REVENUE_DARK_IDS, REVENUE_HONEST_IDS, type RevenueCardId } from "@/lib/game/levels/revenue";
import { LOCALES, type Locale } from "@/lib/i18n/locale";

/**
 * The revenue level's phone — Gainix's app, from the plans screen to the gem
 * shop and the account's renewal line (GAME-BRIEF §20.7, CHANTIERS.md A24,
 * REV-2): what it shows for each card, what a tick flashes, and the pill of
 * what the end of the trial will charge, the level's « N clics pour résilier ».
 * Every row of the pill's table in §20.7 is a case below, and C13's other half
 * — the prices the copy says, against the constants of the phone — lives here
 * because those constants only exist from this unit on.
 */

const ALL = [...REVENUE_HONEST_IDS, ...REVENUE_DARK_IDS] as RevenueCardId[];
const kinds = (ids: readonly string[]) => fitPhoneView(ids).map((item) => item.kind);
const copyOf = (locale: Locale) => resolveLevelCopy<RevenueCopy>(REVENUE_CONTENT, locale);

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

/** Every text node of a render, whole: « Plans » is not found inside « Plans and prices ». */
function nodes(html: string): string[] {
  return [...html.matchAll(/>([^<>]+)</g)].map((m) => decode(m[1]!));
}

function draw(ids: readonly string[], locale: Locale): string {
  return renderToStaticMarkup(createElement(FitPhone, { items: fitPhoneView(ids), labels: copyOf(locale).phone }));
}

/**
 * The text nodes of one element of the drawing, by its test id: from its opening tag to its closing one. Every
 * element that has children is a `<div>` holding only spans (and one `<ul>`), so the first `</div>` after the tag is
 * its own.
 */
function within(html: string, testId: string): string[] {
  const after = html.split(`data-testid="${testId}"`)[1];
  if (after === undefined) throw new Error(`${testId} is not drawn`);
  // The closing tag is cut off, so a `<` is put back for the last text node to end on.
  return nodes(`${after.split(/<\/div>/)[0]!}<`);
}

describe("what the phone shows (§20.7)", () => {
  it("before any card: the app, the base offer, the plans as they are, the shop with round packs, the plain renewal — nothing else", () => {
    expect(fitPhoneView([])).toEqual([
      { kind: "appBar" },
      { kind: "offer", trial: false, fullPrice: false },
      { kind: "plans", personal: false, addon: false },
      { kind: "shop", odd: false, euros: false },
      { kind: "renewal", style: "plain" },
    ]);
  });

  it("with every card, in the order the screen is read: offer, plans, what the cards add, shop, account", () => {
    expect(kinds(ALL)).toEqual([
      "appBar", "offer", "plans", "trialReminder", "programme", "coaching", "downgrade", "shop", "chest", "express",
      "renewal", "checkoutQuestion",
    ]);
    const items = fitPhoneView(ALL);
    // `roundpacks` wins over `gems`; `renewmail` over `renewal`; `pricing` and `addon` both show on the plans.
    expect(items.find((item) => item.kind === "shop")).toEqual({ kind: "shop", odd: false, euros: true });
    expect(items.find((item) => item.kind === "renewal")).toEqual({ kind: "renewal", style: "notice" });
    expect(items.find((item) => item.kind === "plans")).toEqual({ kind: "plans", personal: true, addon: true });
    expect(items.find((item) => item.kind === "offer")).toEqual({ kind: "offer", trial: true, fullPrice: true });
  });

  it("shows odd packs with `gems`, and the euro price with `roundpacks`, which wins over `gems` in whatever order", () => {
    const shop = (ids: string[]) => fitPhoneView(ids).find((item) => item.kind === "shop");
    expect(shop([])).toEqual({ kind: "shop", odd: false, euros: false });
    expect(shop(["gems"])).toEqual({ kind: "shop", odd: true, euros: false });
    expect(shop(["roundpacks"])).toEqual({ kind: "shop", odd: false, euros: true });
    expect(shop(["gems", "roundpacks"])).toEqual({ kind: "shop", odd: false, euros: true });
    expect(shop(["roundpacks", "gems"])).toEqual({ kind: "shop", odd: false, euros: true });
  });

  it("draws one renewal line: the notice with `renewmail`, else the silent one with `renewal`, else the plain one", () => {
    const style = (ids: string[]) => fitPhoneView(ids).find((item) => item.kind === "renewal");
    expect(style([])).toEqual({ kind: "renewal", style: "plain" });
    expect(style(["renewal"])).toEqual({ kind: "renewal", style: "silent" });
    expect(style(["renewmail"])).toEqual({ kind: "renewal", style: "notice" });
    expect(style(["renewal", "renewmail"])).toEqual({ kind: "renewal", style: "notice" });
    expect(style(["renewmail", "renewal"])).toEqual({ kind: "renewal", style: "notice" });
    expect(kinds(["renewal", "renewmail"]).filter((kind) => kind === "renewal")).toHaveLength(1);
  });

  it("puts each card's element where §20.7 says, and the offer and the plans on the flags of theirs", () => {
    const has = (ids: string[], kind: string) => kinds(ids).includes(kind as never);
    expect(has(["trialmail"], "trialReminder")).toBe(true);
    expect(has(["hiddensub"], "programme")).toBe(true);
    expect(has(["programs"], "coaching")).toBe(true);
    expect(has(["downgrade"], "downgrade")).toBe(true);
    expect(has(["lootbox"], "chest")).toBe(true);
    expect(has(["express"], "express")).toBe(true);
    expect(has(["checkout"], "checkoutQuestion")).toBe(true);
    const offer = (ids: string[]) => fitPhoneView(ids).find((item) => item.kind === "offer");
    expect(offer(["trial"])).toEqual({ kind: "offer", trial: true, fullPrice: false });
    expect(offer(["fullprice"])).toEqual({ kind: "offer", trial: false, fullPrice: true });
    expect(offer(["trial", "fullprice"])).toEqual({ kind: "offer", trial: true, fullPrice: true });
    const plans = (ids: string[]) => fitPhoneView(ids).find((item) => item.kind === "plans");
    expect(plans(["pricing"])).toEqual({ kind: "plans", personal: true, addon: false });
    expect(plans(["addon"])).toEqual({ kind: "plans", personal: false, addon: true });
    // The order inside the screen does not depend on the order the cards were ticked in.
    expect(kinds(["checkout", "express", "lootbox", "trialmail"])).toEqual(kinds(["trialmail", "lootbox", "express", "checkout"]));
  });

  it("gives every card a visible place on the phone, except the data review and the rollback", () => {
    const base = new Set(fitPhoneView([]).map(fitItemKey));
    const invisible = ALL.filter((id) => fitPhoneView([id]).every((item) => base.has(fitItemKey(item))));
    // `present` is a meeting; `clean` puts the phone back as it was (§20.7).
    expect(invisible.sort()).toEqual(["clean", "present"]);
  });

  it("keys every element uniquely, whatever is ticked", () => {
    for (const ids of [[], ALL, ["gems", "roundpacks"], ["renewal", "renewmail"], ["trial", "fullprice"], ["pricing", "addon"]]) {
      const keys = fitPhoneView(ids).map(fitItemKey);
      expect(new Set(keys).size, ids.join("+")).toBe(keys.length);
    }
  });

  it("keys the elements by their kind and every flag that changes what they show", () => {
    expect(fitItemKey({ kind: "offer", trial: true, fullPrice: false })).toBe("offer:true:false");
    expect(fitItemKey({ kind: "plans", personal: false, addon: true })).toBe("plans:false:true");
    expect(fitItemKey({ kind: "shop", odd: true, euros: false })).toBe("shop:true:false");
    expect(fitItemKey({ kind: "renewal", style: "silent" })).toBe("renewal:silent");
    expect(fitItemKey({ kind: "chest" })).toBe("chest");
    expect(fitItemKey({ kind: "appBar" })).toBe("appBar");
  });

  it("flashes what a tick changed, and only that", () => {
    const flashed = (before: string[], after: string[]) =>
      [...changedKeys(fitPhoneView(before), fitPhoneView(after), fitItemKey)].sort();
    expect(flashed([], ["trial"])).toEqual(["offer:true:false"]);
    expect(flashed([], ["fullprice"])).toEqual(["offer:false:true"]);
    expect(flashed(["trial"], ["trial", "fullprice"])).toEqual(["offer:true:true"]);
    expect(flashed([], ["addon"])).toEqual(["plans:false:true"]);
    expect(flashed(["addon"], ["addon", "pricing"])).toEqual(["plans:true:true"]);
    expect(flashed([], ["lootbox"])).toEqual(["chest"]);
    expect(flashed([], ["gems"])).toEqual(["shop:true:false"]);
    expect(flashed(["gems"], ["gems", "roundpacks"])).toEqual(["shop:false:true"]);
    expect(flashed([], ["renewal"])).toEqual(["renewal:silent"]);
    expect(flashed(["renewal"], ["renewal", "renewmail"])).toEqual(["renewal:notice"]);
    // Taking a card back shows what is there again, but flashes nothing that was already on screen.
    expect(flashed(["lootbox"], [])).toEqual([]);
  });
});

describe("the pill of what the trial's end charges (§20.7)", () => {
  // The nine rows of the table: cards in production or ticked → the charge, and whether the pill is coral.
  const TABLE: { ids: string[]; amount: number; silent: boolean; addon: boolean; alert: boolean }[] = [
    { ids: [], amount: 7.99, silent: false, addon: false, alert: false },
    { ids: ["pricing"], amount: 8.49, silent: false, addon: false, alert: false },
    { ids: ["trial"], amount: 59.99, silent: true, addon: false, alert: true },
    { ids: ["trial", "pricing"], amount: 59.99, silent: true, addon: false, alert: true },
    { ids: ["trial", "trialmail"], amount: 59.99, silent: false, addon: false, alert: false },
    { ids: ["addon"], amount: 10.98, silent: false, addon: true, alert: true },
    { ids: ["pricing", "addon"], amount: 11.48, silent: false, addon: true, alert: true },
    { ids: ["trial", "addon"], amount: 62.98, silent: true, addon: true, alert: true },
    { ids: ["trial", "trialmail", "addon"], amount: 62.98, silent: false, addon: true, alert: true },
  ];
  const SENTENCES: Record<Locale, string[]> = {
    fr: [
      "Prélevé à la fin de l'essai\u00a0: 7,99\u00a0€",
      "Prélevé à la fin de l'essai\u00a0: 8,49\u00a0€",
      "Prélevé à la fin de l'essai\u00a0: 59,99\u00a0€ · sans rappel avant le prélèvement",
      "Prélevé à la fin de l'essai\u00a0: 59,99\u00a0€ · sans rappel avant le prélèvement",
      "Prélevé à la fin de l'essai\u00a0: 59,99\u00a0€",
      "Prélevé à la fin de l'essai\u00a0: 10,98\u00a0€ · dont une option cochée d'avance",
      "Prélevé à la fin de l'essai\u00a0: 11,48\u00a0€ · dont une option cochée d'avance",
      "Prélevé à la fin de l'essai\u00a0: 62,98\u00a0€ · sans rappel avant le prélèvement · dont une option cochée d'avance",
      "Prélevé à la fin de l'essai\u00a0: 62,98\u00a0€ · dont une option cochée d'avance",
    ],
    en: [
      "Charged when the trial ends: €7.99",
      "Charged when the trial ends: €8.49",
      "Charged when the trial ends: €59.99 · with no reminder before the charge",
      "Charged when the trial ends: €59.99 · with no reminder before the charge",
      "Charged when the trial ends: €59.99",
      "Charged when the trial ends: €10.98 · including an add-on ticked in advance",
      "Charged when the trial ends: €11.48 · including an add-on ticked in advance",
      "Charged when the trial ends: €62.98 · with no reminder before the charge · including an add-on ticked in advance",
      "Charged when the trial ends: €62.98 · including an add-on ticked in advance",
    ],
  };

  it("charges the monthly price, or the yearly one with `trial` (which ignores `pricing`), plus the add-on, and alerts on a silent trial or an add-on", () => {
    expect(MONTHLY_EUR).toBe(7.99);
    expect(MONTHLY_PERSONAL_EUR).toBe(8.49);
    expect(YEARLY_EUR).toBe(59.99);
    expect(ADDON_EUR).toBe(2.99);
    for (const row of TABLE) {
      const c = trialCharge(row.ids);
      expect(c, row.ids.join("+")).toEqual({ amount: row.amount, silent: row.silent, addon: row.addon });
      expect(c.silent || c.addon, row.ids.join("+")).toBe(row.alert);
    }
    // The sums are rounded to the cent, never left to floating point.
    expect(String(trialCharge(["trial", "addon"]).amount)).toBe("62.98");
    expect(String(trialCharge(["pricing", "addon"]).amount)).toBe("11.48");
    // Order does not matter.
    expect(trialCharge(["addon", "trialmail", "trial"])).toEqual(trialCharge(["trial", "trialmail", "addon"]));
  });

  it("`roundpacks`, `gems` and every other card leave the charge where it was; `trialmail` only matters with `trial`", () => {
    const others = ALL.filter((id) => !["trial", "pricing", "addon", "trialmail"].includes(id));
    expect(trialCharge(others)).toEqual({ amount: 7.99, silent: false, addon: false });
    expect(trialCharge(["trialmail"])).toEqual({ amount: 7.99, silent: false, addon: false });
    expect(trialCharge([...others, "trial"])).toEqual({ amount: 59.99, silent: true, addon: false });
    expect(trialCharge(ALL)).toEqual({ amount: 62.98, silent: false, addon: true });
  });

  for (const locale of LOCALES) {
    it(`${locale}: each row of the table says its sentence, the same one in the pill, the island and the action bar`, () => {
      const copy = copyOf(locale);
      TABLE.forEach((row, i) => {
        const label = row.ids.join("+") || "none";
        const c = trialCharge(row.ids);
        const html = renderToStaticMarkup(
          createElement(ChargePill, {
            amount: formatEuros(locale, c.amount),
            silent: c.silent,
            addon: c.addon,
            labels: copy.charge,
            announce: false,
          }),
        );
        const expected = SENTENCES[locale][i]!;
        expect(text(html), label).toBe(expected);
        expect(chargeSentence(copy, locale, c), label).toBe(expected);
        expect(html, label).toContain('data-testid="game-charge"');
        expect(html, label).toContain(`data-silent="${row.silent}"`);
        expect(html, label).toContain(`data-addon="${row.addon}"`);
        expect(html.includes("_over_"), label).toBe(row.alert);
        // The action bar's short form carries no suffix, and the alert says the rest.
        const pill = REVENUE_SIDE.pill({ ids: row.ids, copy, locale });
        expect(pill.alert, label).toBe(row.alert);
        expect(pill.text, label).toBe(expected.split(" · ")[0]);
        expect(expected.startsWith(pill.text), label).toBe(true);
      });
    });
  }

  it("is coral as soon as the charge is silent or carries an add-on, and emphasises the amount while the sentence stays whole", () => {
    const copy = copyOf("en");
    const pill = (silent: boolean, addon: boolean) =>
      renderToStaticMarkup(createElement(ChargePill, { amount: "€59.99", silent, addon, labels: copy.charge, announce: false }));
    const quiet = pill(false, false);
    expect(quiet).not.toMatch(/_over_/);
    expect(quiet).toMatch(/<b class="[^"]*">€59\.99<\/b>/);
    expect(text(quiet)).toBe("Charged when the trial ends: €59.99");
    for (const [silent, addon] of [[true, false], [false, true], [true, true]] as const) {
      const html = pill(silent, addon);
      expect(html, `${silent}/${addon}`).toMatch(/class="[^"]*_over_/);
      expect(html.includes(copy.charge.silentSuffix), `${silent}/${addon}`).toBe(silent);
      expect(html.includes(copy.charge.addonSuffix), `${silent}/${addon}`).toBe(addon);
    }
    // The suffixes follow the amount in a fixed order: the silent one, then the add-on's.
    expect(text(pill(true, true))).toBe(
      `Charged when the trial ends: €59.99 · ${copy.charge.silentSuffix} · ${copy.charge.addonSuffix}`,
    );
  });

  it("announces a tick only when it changed the charge", () => {
    const copy = copyOf("fr");
    const announce = (before: string[], after: string[]) => REVENUE_SIDE.announce({ before, after, copy, locale: "fr" });
    const now = (ids: string[]) => chargeSentence(copy, "fr", trialCharge(ids));
    // Most cards leave the charge where it was: nothing to say.
    expect(announce([], ["lootbox"])).toBeNull();
    expect(announce([], ["roundpacks"])).toBeNull();
    expect(announce([], ["trialmail"])).toBeNull();
    expect(announce(["trial"], ["trial", "pricing"])).toBeNull();
    expect(announce(["trial"], ["trial", "fullprice"])).toBeNull();
    expect(announce([], ["pricing"])).toBe(now(["pricing"]));
    expect(announce([], ["addon"])).toBe(now(["addon"]));
    expect(announce([], ["trial"])).toBe(now(["trial"]));
    // The reminder changes what is said about a trial that was silent, with no change of amount.
    expect(announce(["trial"], ["trial", "trialmail"])).toBe(now(["trial", "trialmail"]));
    expect(announce(["trial", "trialmail"], ["trial"])).toBe(now(["trial"]));
    // Taking the last extra back brings the quiet sentence.
    expect(announce(["addon"], [])).toBe(copy.charge.amount.replace("{amount}", formatEuros("fr", MONTHLY_EUR)));
  });

  it("speaks for itself by default, and not inside the island", () => {
    const copy = copyOf("fr");
    const pill = (announce?: boolean) =>
      renderToStaticMarkup(
        createElement(ChargePill, { amount: formatEuros("fr", 59.99), silent: true, addon: false, labels: copy.charge, announce }),
      );
    expect(pill()).toContain('aria-live="polite"');
    expect(pill(false)).not.toContain("aria-live");
    const side = renderToStaticMarkup(REVENUE_SIDE.render({ ids: ["trial"], copy, locale: "fr" }));
    expect(side).toContain('data-testid="game-phone"');
    expect(side).toContain('data-testid="game-charge"');
    expect(side).not.toContain("aria-live");
  });

  for (const locale of LOCALES) {
    it(`${locale}: C13 — the prices the copy says are the constants of the phone`, () => {
      const { phone } = copyOf(locale);
      const eur = (n: number) => formatEuros(locale, n);
      expect(phone.offerBase).toContain(eur(MONTHLY_EUR));
      expect(phone.monthly).toContain(eur(MONTHLY_EUR));
      expect(phone.monthlyPersonal).toContain(eur(MONTHLY_PERSONAL_EUR));
      expect(phone.offerTrialSmall).toContain(eur(YEARLY_EUR));
      expect(phone.fullPrice).toContain(eur(YEARLY_EUR));
      expect(phone.renewalSilent).toContain(eur(YEARLY_EUR));
      expect(phone.addon).toContain(eur(ADDON_EUR));
      // The price of the outfit (`euros`) is bound to no constant of the pill: it is not a charge.
      expect(phone.euros).toContain(eur(7.99));
      // The pill's amounts are computed, never written: no sentence of the copy states what the pill adds up to.
      expect(JSON.stringify(copyOf(locale))).not.toMatch(/\b(10[,.]98|11[,.]48|62[,.]98)\b/);
    });
  }
});

describe("the drawing", () => {
  for (const locale of LOCALES) {
    it(`${locale}: with every card ticked, every line is on the phone, and the phone has no control`, () => {
      const copy = copyOf(locale);
      const html = draw(ALL, locale);
      const shown = nodes(html);
      for (const key of [
        "caption", "appName", "time", "offerTrial", "offerTrialSmall", "fullPrice", "plansTitle", "monthlyPersonal",
        "addon", "trialReminder", "programme", "programmeSmall", "coaching", "downgrade", "shopTitle", "shopItem",
        "packsRound", "euros", "chest", "express", "renewalNotice", "checkoutQuestion",
      ] as const) {
        expect(shown, key).toContain(copy.phone[key]);
      }
      for (const answer of copy.phone.checkoutAnswers) expect(shown).toContain(answer);
      // A drawing, never an interface (plan R14, E9).
      expect(html).not.toMatch(/<(button|a|input|select|textarea)\b/);
      expect(html).toContain("<figure");
      expect(html).toContain("<figcaption");
      expect(html).toContain('data-testid="game-phone"');
    });

    it(`${locale}: what cannot be seen with every card ticked`, () => {
      const copy = copyOf(locale);
      const shown = nodes(draw(ALL, locale));
      // `trial` replaces the base offer, `pricing` the monthly price, `roundpacks` the odd packs (`gems` loses to it),
      // and the notice stands for the plain and the silent renewal lines.
      for (const key of ["offerBase", "monthly", "packsOdd", "renewalPlain", "renewalSilent"] as const) {
        expect(shown, key).not.toContain(copy.phone[key]);
      }
    });
  }

  it("gives every element but the app bar its test id, `game-fit-<kind>`", () => {
    const html = draw(ALL, "fr");
    for (const item of fitPhoneView(ALL)) {
      if (item.kind === "appBar") continue;
      expect(html, item.kind).toContain(`data-testid="game-fit-${item.kind}"`);
    }
    expect(html.match(/data-testid="game-fit-/g)).toHaveLength(fitPhoneView(ALL).length - 1);
  });

  it("draws the offer: the yearly total first when `fullprice` is there, then the base offer, or the trial with its small print", () => {
    const copy = copyOf("fr").phone;
    expect(within(draw([], "fr"), "game-fit-offer")).toEqual([copy.offerBase]);
    expect(within(draw(["fullprice"], "fr"), "game-fit-offer")).toEqual([copy.fullPrice, copy.offerBase]);
    expect(within(draw(["trial"], "fr"), "game-fit-offer")).toEqual([copy.offerTrial, copy.offerTrialSmall]);
    expect(within(draw(["trial", "fullprice"], "fr"), "game-fit-offer")).toEqual([
      copy.fullPrice, copy.offerTrial, copy.offerTrialSmall,
    ]);
  });

  it("draws the plans: their title, the monthly price (the personal one with `pricing`), then the add-on ticked under it", () => {
    const copy = copyOf("en").phone;
    const plans = (ids: string[]) => within(draw(ids, "en"), "game-fit-plans");
    expect(plans([])).toEqual([copy.plansTitle, copy.monthly]);
    expect(plans(["pricing"])).toEqual([copy.plansTitle, copy.monthlyPersonal]);
    expect(plans(["addon"])).toEqual([copy.plansTitle, copy.monthly, copy.addon]);
    expect(plans(["pricing", "addon"])).toEqual([copy.plansTitle, copy.monthlyPersonal, copy.addon]);
    expect(copy.addon.startsWith("\u2611")).toBe(true);
  });

  it("draws the programme with its small print under it, and the shop with its title, the outfit, the packs and the euro price", () => {
    const copy = copyOf("fr").phone;
    expect(within(draw(["hiddensub"], "fr"), "game-fit-programme")).toEqual([copy.programme, copy.programmeSmall]);
    const shop = (ids: string[]) => within(draw(ids, "fr"), "game-fit-shop");
    expect(shop([])).toEqual([copy.shopTitle, copy.shopItem, copy.packsRound]);
    expect(shop(["gems"])).toEqual([copy.shopTitle, copy.shopItem, copy.packsOdd]);
    // `roundpacks` adds only the euro line: without `gems` the shop already shows the round packs.
    expect(shop(["roundpacks"])).toEqual([copy.shopTitle, copy.shopItem, copy.packsRound, copy.euros]);
    expect(shop(["gems", "roundpacks"])).toEqual([copy.shopTitle, copy.shopItem, copy.packsRound, copy.euros]);
  });

  it("draws exactly one of the three renewal lines, and the notice marked as such", () => {
    const copy = copyOf("en").phone;
    const renewal = (ids: string[]) => within(draw(ids, "en"), "game-fit-renewal");
    expect(renewal([])).toEqual([copy.renewalPlain]);
    expect(renewal(["renewal"])).toEqual([copy.renewalSilent]);
    expect(renewal(["renewmail"])).toEqual([copy.renewalNotice]);
    expect(renewal(["renewal", "renewmail"])).toEqual([copy.renewalNotice]);
    for (const [ids, style] of [[[], "plain"], [["renewal"], "silent"], [["renewmail"], "notice"]] as const) {
      expect(draw(ids, "en"), style).toContain(`data-style="${style}"`);
    }
  });

  it("draws the checkout question with its three answers as bullets", () => {
    const copy = copyOf("fr").phone;
    const html = draw(["checkout"], "fr");
    expect(html).toMatch(/<ul[^>]*>(<li>[^<]+<\/li>){3}<\/ul>/);
    expect(within(html, "game-fit-checkoutQuestion")).toEqual([copy.checkoutQuestion, ...copy.checkoutAnswers]);
  });

  it("draws the reminder, the coaching, the downgrade, the chest and the express line with their one string each", () => {
    const copy = copyOf("fr").phone;
    expect(within(draw(["trialmail"], "fr"), "game-fit-trialReminder")).toEqual([copy.trialReminder]);
    expect(within(draw(["programs"], "fr"), "game-fit-coaching")).toEqual([copy.coaching]);
    expect(within(draw(["downgrade"], "fr"), "game-fit-downgrade")).toEqual([copy.downgrade]);
    expect(within(draw(["lootbox"], "fr"), "game-fit-chest")).toEqual([copy.chest]);
    expect(within(draw(["express"], "fr"), "game-fit-express")).toEqual([copy.express]);
  });

  it("draws the app bar once, with the app's name and the time", () => {
    const copy = copyOf("fr").phone;
    const shown = nodes(draw(ALL, "fr"));
    expect(shown.filter((node) => node === copy.appName)).toHaveLength(1);
    expect(shown.filter((node) => node === copy.time)).toHaveLength(1);
  });
});
