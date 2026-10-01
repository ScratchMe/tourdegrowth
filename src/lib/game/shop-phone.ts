/**
 * Level 2's phone — Pédalix's app, from the search to the basket
 * (GAME-BRIEF §17.7, `docs/game/niveau-2.md`): what it shows, as typed items,
 * and what the basket adds to the price the product page announced. Pure,
 * like `view.ts`, which keeps level 1's phone; the words are copy
 * (`AcquisitionPhoneCopy`), the drawing is `components/game/ShopPhone`.
 *
 * Like level 1's, the phone reflects the cards in production AND the ones
 * ticked but not yet played, so a tick shows what it changes at once.
 *
 * Relative imports only — see model.ts.
 */
import type { AcquisitionCardId } from "./levels/acquisition";

export type ShopPhoneItem =
  | { kind: "appBar" }
  /** `native`: a creator's video, shown with no mention that it is paid. */
  | { kind: "video" }
  /** The top result: a partner brand's model unlabelled (`sponsored`), a comparison line (`compare`). */
  | { kind: "results"; sponsored: boolean; compared: boolean }
  /** The product page: its photo, and the full set with `specs`. */
  | { kind: "product"; photos: boolean }
  /** The price: struck through over a reference (`anchor`), or delivered (`allin`). */
  | { kind: "price"; anchor: boolean; allIn: boolean }
  /** The rating: sorted (`reviews`), with its verified count (`verified`). */
  | { kind: "rating"; sorted: boolean; verified: boolean }
  /** One line of pressure per card: the timer, the stock, the watchers. */
  | { kind: "pressure"; line: "countdown" | "stock" | "watchers" }
  /** `delivery`: the date and the cost, on the product page. */
  | { kind: "delivery" }
  /** `guides`: a link to the frame-size guide. */
  | { kind: "guide" }
  /** The basket: delivery already in the price (`allin`), a service fee added (`teaser`). */
  | { kind: "basket"; deliveryIncluded: boolean; fees: boolean }
  /** `origin`: the question after the first order. */
  | { kind: "origin" };

type Aid = AcquisitionCardId;

const PRESSURE: readonly ("countdown" | "stock" | "watchers")[] = ["countdown", "stock", "watchers"];

/** Top to bottom, the way a visitor scrolls: §17.7. */
export function shopPhoneView(ids: readonly string[]): ShopPhoneItem[] {
  const has = (id: Aid) => ids.includes(id);
  const items: ShopPhoneItem[] = [{ kind: "appBar" }];
  if (has("native")) items.push({ kind: "video" });
  items.push({ kind: "results", sponsored: has("sponsored"), compared: has("compare") });
  items.push({ kind: "product", photos: has("specs") });
  items.push({ kind: "price", anchor: has("anchor"), allIn: has("allin") });
  items.push({ kind: "rating", sorted: has("reviews"), verified: has("verified") });
  for (const line of PRESSURE) if (has(line)) items.push({ kind: "pressure", line });
  if (has("delivery")) items.push({ kind: "delivery" });
  if (has("guides")) items.push({ kind: "guide" });
  items.push({ kind: "basket", deliveryIncluded: has("allin"), fees: has("teaser") });
  if (has("origin")) items.push({ kind: "origin" });
  return items;
}

/** Delivery of the bike on the phone, in euros — the copy's « 29 € » (C13 holds the two together). */
export const DELIVERY_EUR = 29;
/** `teaser`'s service fee — the copy's « 19 € ». */
export const SERVICE_FEE_EUR = 19;

export interface Basket {
  /** What the basket adds to the price the product page showed, in euros. */
  extra: number;
  /** Mandatory fees outside the displayed price: the one case the pill calls a legal problem. */
  fees: boolean;
}

/**
 * The pill under the phone (§17.7) — level 2's « N clics pour résilier »:
 * a measurable fact the law frames. Delivery added at the basket is lawful
 * when it is announced (arrêté du 3 décembre 1987), so it counts as « more
 * than shown » until `delivery` or `allin` shows it on the page; a service
 * fee left out of the price is an omission (L121-3), and only that turns the
 * pill coral.
 */
export function basketFor(ids: readonly string[]): Basket {
  const has = (id: Aid) => ids.includes(id);
  const announced = has("delivery") || has("allin");
  const fees = has("teaser");
  return { extra: (announced ? 0 : DELIVERY_EUR) + (fees ? SERVICE_FEE_EUR : 0), fees };
}
