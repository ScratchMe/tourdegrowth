import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { basketSentence, ACQUISITION_SIDE } from "@/app/[locale]/game/_island/sides";
import { BasketPill } from "@/components/game/BasketPill";
import { changedKeys } from "@/components/game/phone-flash";
import { ShopPhone, shopItemKey } from "@/components/game/ShopPhone";
import { ACQUISITION_CONTENT } from "@/content/game/acquisition";
import { resolveLevelCopy, type AcquisitionCopy } from "@/lib/game/copy";
import { formatEur } from "@/lib/game/format";
import { ACQUISITION_DARK_IDS, ACQUISITION_HONEST_IDS, type AcquisitionCardId } from "@/lib/game/levels/acquisition";
import { basketFor, DELIVERY_EUR, SERVICE_FEE_EUR, shopPhoneView } from "@/lib/game/shop-phone";
import { LOCALES } from "@/lib/i18n/locale";

/**
 * Level 2's phone — Pédalix's app, from the search to the basket
 * (GAME-BRIEF §17.7, CHANTIERS.md A12.e): what it shows for each card, what
 * a tick flashes, and the basket pill, the level's « N clics pour résilier ».
 */

const ALL = [...ACQUISITION_HONEST_IDS, ...ACQUISITION_DARK_IDS] as AcquisitionCardId[];
const kinds = (ids: AcquisitionCardId[]) => shopPhoneView(ids).map((item) => item.kind);
const copyOf = (locale: "fr" | "en") => resolveLevelCopy<AcquisitionCopy>(ACQUISITION_CONTENT, locale);

/** The text a static render shows, tags stripped until nothing changes. */
function text(html: string): string {
  let out = html;
  for (let prev = ""; prev !== out; ) {
    prev = out;
    out = out.replace(/<[^>]*>/g, "");
  }
  return out.replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/&quot;/g, '"');
}

describe("what the phone shows (§17.7)", () => {
  it("before any card: the app, the result, the product, its price and rating, the basket — nothing else", () => {
    expect(kinds([])).toEqual(["appBar", "results", "product", "price", "rating", "basket"]);
  });

  it("with every card, in the order a visitor scrolls", () => {
    expect(kinds(ALL)).toEqual([
      "appBar", "video", "results", "product", "price", "rating",
      "pressure", "pressure", "pressure", "delivery", "guide", "basket", "origin",
    ]);
  });

  it("gives every card a visible place on the phone, except the data review", () => {
    const base = new Set(shopPhoneView([]).map(shopItemKey));
    const invisible = ALL.filter((id) => shopPhoneView([id]).every((item) => base.has(shopItemKey(item))));
    // The data review is a meeting; the rollback puts the phone back as it was.
    expect(invisible.sort()).toEqual(["clean", "present"]);
  });

  it("keys every element uniquely, whatever is ticked", () => {
    for (const ids of [[], ALL, ["anchor", "allin"], ["stock", "countdown", "watchers"]] as AcquisitionCardId[][]) {
      const keys = shopPhoneView(ids).map(shopItemKey);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  it("flashes what a tick changed, and only that", () => {
    expect([...changedKeys(shopPhoneView([]), shopPhoneView(["anchor"]), shopItemKey)]).toEqual(["price:true:false"]);
    // The delivered price changes the price AND the basket: both flash.
    expect([...changedKeys(shopPhoneView([]), shopPhoneView(["allin"]), shopItemKey)].sort()).toEqual([
      "basket:true:false",
      "price:false:true",
    ]);
    expect(changedKeys(shopPhoneView(["stock"]), shopPhoneView([]), shopItemKey).size).toBe(0);
  });
});

describe("the basket pill (§17.7)", () => {
  it("adds the delivery until the page announces it, and the service fee whenever the price leaves it out", () => {
    expect(basketFor([])).toEqual({ extra: DELIVERY_EUR, fees: false });
    expect(basketFor(["delivery"])).toEqual({ extra: 0, fees: false });
    expect(basketFor(["allin"])).toEqual({ extra: 0, fees: false });
    expect(basketFor(["teaser"])).toEqual({ extra: DELIVERY_EUR + SERVICE_FEE_EUR, fees: true });
    expect(basketFor(["delivery", "teaser"])).toEqual({ extra: SERVICE_FEE_EUR, fees: true });
  });

  it("uses the amounts the phone itself prints — the basket lines and the pill cannot disagree", () => {
    for (const locale of LOCALES) {
      const phone = copyOf(locale).phone;
      expect(phone.basketDelivery).toContain(formatEur(locale, DELIVERY_EUR));
      expect(phone.basketFees).toContain(formatEur(locale, SERVICE_FEE_EUR));
      expect(phone.delivery).toContain(formatEur(locale, DELIVERY_EUR));
    }
  });

  for (const locale of LOCALES) {
    it(`${locale}: the island says exactly the sentence the pill shows`, () => {
      const copy = copyOf(locale);
      for (const ids of [[], ["delivery"], ["teaser"], ["delivery", "teaser"]] as AcquisitionCardId[][]) {
        const basket = basketFor(ids);
        const html = renderToStaticMarkup(
          createElement(BasketPill, {
            amount: formatEur(locale, basket.extra),
            extra: basket.extra > 0,
            fees: basket.fees,
            labels: copy.basket,
            announce: false,
          }),
        );
        expect(basketSentence(copy, locale, basket), ids.join("+")).toBe(text(html));
      }
      // The fee is the one case that reads as a legal problem, and says why.
      expect(ACQUISITION_SIDE.pill({ ids: ["teaser"], copy, locale }).alert).toBe(true);
      expect(ACQUISITION_SIDE.pill({ ids: [], copy, locale }).alert).toBe(false);
      expect(basketSentence(copy, locale, basketFor(["teaser"]))).toContain(copy.basket.feesSuffix);
      expect(basketSentence(copy, locale, basketFor(["allin"]))).toBe(copy.basket.none);
    });
  }

  it("announces a tick only when it changed the basket", () => {
    const copy = copyOf("fr");
    expect(ACQUISITION_SIDE.announce({ before: [], after: ["stock"], copy, locale: "fr" })).toBeNull();
    expect(ACQUISITION_SIDE.announce({ before: [], after: ["delivery"], copy, locale: "fr" })).toBe(copy.basket.none);
  });

  it("speaks for itself by default, and not inside the island", () => {
    const copy = copyOf("fr");
    const pill = (announce?: boolean) =>
      renderToStaticMarkup(createElement(BasketPill, { amount: "29 €", extra: true, fees: false, labels: copy.basket, announce }));
    expect(pill()).toContain('aria-live="polite"');
    expect(pill(false)).not.toContain("aria-live");
  });
});

describe("the drawing", () => {
  for (const locale of LOCALES) {
    it(`${locale}: every card's line is on the phone when the card is, and the phone has no control`, () => {
      const copy = copyOf(locale);
      const html = renderToStaticMarkup(createElement(ShopPhone, { items: shopPhoneView(ALL), labels: copy.phone }));
      const shown = text(html);
      for (const key of ["video", "videoBy", "compared", "photos", "priceStruck", "priceAllIn", "ratingSorted", "verified",
        "countdown", "stock", "watchers", "delivery", "guide", "basketDeliveryIncluded", "basketFees", "totalWithFees", "origin"] as const) {
        expect(shown, key).toContain(copy.phone[key]);
      }
      for (const answer of copy.phone.originAnswers) expect(shown).toContain(answer);
      // A drawing, never an interface (plan R14).
      expect(html).not.toMatch(/<(button|a|input|select)\b/);
      expect(html).toContain("<figure");
      expect(html).toContain("<figcaption");
    });
  }

  it("shows the reference discount only against the shelf price, never beside a delivered price", () => {
    const copy = copyOf("fr");
    const draw = (ids: AcquisitionCardId[]) =>
      text(renderToStaticMarkup(createElement(ShopPhone, { items: shopPhoneView(ids), labels: copy.phone })));
    expect(draw(["anchor"])).toContain(copy.phone.discount);
    expect(draw(["anchor", "allin"])).not.toContain(copy.phone.discount);
    // The partner's model takes the top result, unlabelled; the shop's own bike is still the product page below.
    const results = (ids: AcquisitionCardId[]) =>
      text(renderToStaticMarkup(createElement(ShopPhone, { items: shopPhoneView(ids), labels: copy.phone })).split('data-testid="game-shop-results"')[1]!.split("</div>")[0]!);
    expect(results(["sponsored"])).toContain(copy.phone.resultSponsored);
    expect(results(["sponsored"])).not.toContain(copy.phone.resultTop);
    expect(results([])).toContain(copy.phone.resultTop);
  });
});
