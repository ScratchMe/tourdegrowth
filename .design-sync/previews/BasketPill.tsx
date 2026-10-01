import { BasketPill, NightSurface } from "tour-de-growth";

/*
 * "+€29 in the basket", under Pédalix's phone — level 2's "N clicks to
 * cancel": what the basket adds to the price the product page showed. A
 * measurable fact, never a judgement. With a service fee outside the
 * displayed price, the pill says WHY it is a problem in words; the red only
 * repeats them. The game decides every prop (`basketFor` in
 * lib/game/shop-phone.ts); `amount` comes already formatted with its
 * currency. Drawn with ClickPill's own styles: one object, two levels.
 */

const EN = {
  extra: "+{amount} in the basket",
  none: "€0 more than shown",
  feesSuffix: "mandatory fees outside the displayed price",
};

const FR = {
  extra: "+{amount} au panier",
  none: "0 € de plus qu'annoncé",
  feesSuffix: "des frais obligatoires hors du prix affiché",
};

const col = { padding: 20, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12 } as const;

/** The delivery added at the end, nothing added, and the delivery plus a service fee — the three things the pill can say. */
export const States = () => (
  <NightSurface as="div" style={col}>
    <BasketPill amount="€29" extra fees={false} labels={EN} />
    <BasketPill amount="€0" extra={false} fees={false} labels={EN} />
    <BasketPill amount="€48" extra fees labels={EN} />
  </NightSurface>
);

/** French runs longer; on a phone the pill wraps rather than overflowing the sticky bar. */
export const French = () => (
  <NightSurface as="div" style={{ ...col, maxWidth: 300 }}>
    <BasketPill amount="29 €" extra fees={false} labels={FR} />
    <BasketPill amount="0 €" extra={false} fees={false} labels={FR} />
    <BasketPill amount="48 €" extra fees labels={FR} />
  </NightSurface>
);

/** `sm` — the same words, smaller type, for the sticky action bar on a phone. */
export const Small = () => (
  <NightSurface as="div" style={col}>
    <BasketPill size="sm" amount="€29" extra fees={false} labels={EN} />
    <BasketPill size="sm" amount="€48" extra fees labels={EN} />
  </NightSurface>
);
