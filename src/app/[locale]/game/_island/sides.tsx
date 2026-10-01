import type { ReactNode } from "react";
import { BasketPill } from "@/components/game/BasketPill";
import { ClickPill } from "@/components/game/ClickPill";
import { PhoneMock } from "@/components/game/PhoneMock";
import { ShopPhone } from "@/components/game/ShopPhone";
import type { AcquisitionCopy, RetentionCopy } from "@/lib/game/copy";
import { fill, formatEur, formatInt } from "@/lib/game/format";
import { RETENTION_LEVEL, type RetentionCardId } from "@/lib/game/levels/retention";
import { basketFor, shopPhoneView, type Basket } from "@/lib/game/shop-phone";
import type { LevelSlug } from "@/lib/game/types";
import { clicksFor, clicksOverLaw, phoneView } from "@/lib/game/view";
import type { Locale } from "@/lib/i18n/locale";

/**
 * What only one level has: its phone, and the pill under it — Flixo's
 * cancellation screen and its clicks, Pédalix's path to the basket and what
 * the basket adds (GAME-BRIEF §5.9, §17.7). The island is the same for every
 * level (`island-view.ts`); each level brings this, and nothing else of its
 * own but its copy and its formats (CHANTIERS.md A12.d).
 *
 * Both the phone and the pill reflect the cards in production AND the ones
 * ticked but not yet played (`ids`), so a tick shows its effect at once.
 */
export interface IslandSide<C> {
  /** The phone and its pill, beside the desk's slot. The pill is silent there: the island speaks once, in its own region. */
  render(args: { ids: readonly string[]; copy: C; locale: Locale }): ReactNode;
  /** The pill's short form, for the action bar: the same words, and whether they read as a legal problem. */
  pill(args: { ids: readonly string[]; copy: C; locale: Locale }): { text: string; alert: boolean };
  /**
   * What the one live region says when a ticked or unticked card changes the
   * pill (plan E5) — the pill's own words, never a paraphrase — and `null`
   * when it did not: most honest cards leave it where it was, and a sentence
   * repeated at every tick stops being heard.
   */
  announce(args: { before: readonly string[]; after: readonly string[]; copy: C; locale: Locale }): string | null;
}

/** The copy each playable level hands its island: its whole copy but the footer, which the page renders. */
export interface IslandCopies {
  retention: Omit<RetentionCopy, "footer">;
}

// --------------------------------------------------------------- level 1 ---

type RetentionSideCopy = Pick<RetentionCopy, "phone" | "clicks">;

function retentionIds(ids: readonly string[]): RetentionCardId[] {
  return ids.filter((id): id is RetentionCardId => id in RETENTION_LEVEL.cards);
}

/**
 * The pill's whole sentence, as the one live region says it: the figure AND,
 * past the legal path, why it is a problem — the same words the pill shows.
 */
export function clicksSentence(copy: RetentionSideCopy, locale: Locale, clicks: number | "phone"): string {
  if (clicks === "phone") return `${copy.clicks.infinite} · ${copy.clicks.phoneSuffix}`;
  const count = fill(copy.clicks.count, { n: formatInt(locale, clicks) });
  return clicksOverLaw(clicks) ? `${count} · ${copy.clicks.lawSuffix}` : count;
}

/** The pill's abbreviated form for the action bar. */
export function clicksLabel(copy: RetentionSideCopy, locale: Locale, clicks: number | "phone"): { text: string; alert: boolean } {
  return {
    text: clicks === "phone" ? copy.clicks.infinite : fill(copy.clicks.count, { n: formatInt(locale, clicks) }),
    alert: clicksOverLaw(clicks),
  };
}

export const RETENTION_SIDE: IslandSide<RetentionSideCopy> = {
  render: ({ ids, copy }) => {
    const own = retentionIds(ids);
    const clicks = clicksFor(RETENTION_LEVEL, own);
    return (
      <>
        <PhoneMock items={phoneView(RETENTION_LEVEL, own)} labels={copy.phone} />
        <ClickPill clicks={clicks} overLaw={clicksOverLaw(clicks)} labels={copy.clicks} announce={false} />
      </>
    );
  },
  pill: ({ ids, copy, locale }) => clicksLabel(copy, locale, clicksFor(RETENTION_LEVEL, retentionIds(ids))),
  announce: ({ before, after, copy, locale }) => {
    const was = clicksFor(RETENTION_LEVEL, retentionIds(before));
    const now = clicksFor(RETENTION_LEVEL, retentionIds(after));
    return now === was ? null : clicksSentence(copy, locale, now);
  },
};

// --------------------------------------------------------------- level 2 ---

type AcquisitionSideCopy = Pick<AcquisitionCopy, "phone" | "basket">;

/**
 * The basket pill's whole sentence: what the basket adds and, with a service
 * fee outside the price, why it is a problem — the same words the pill shows.
 */
export function basketSentence(copy: AcquisitionSideCopy, locale: Locale, basket: Basket): string {
  const figure = basket.extra > 0 ? fill(copy.basket.extra, { amount: formatEur(locale, basket.extra) }) : copy.basket.none;
  return basket.fees ? `${figure} · ${copy.basket.feesSuffix}` : figure;
}

/**
 * Pédalix's phone and its basket pill (GAME-BRIEF §17.7). Not in
 * `ISLAND_SIDES` yet: level 2 is still a `DraftLevelSlug`, with no page and no
 * save key, until A12.f wires it.
 */
export const ACQUISITION_SIDE: IslandSide<AcquisitionSideCopy> = {
  render: ({ ids, copy, locale }) => {
    const basket = basketFor(ids);
    return (
      <>
        <ShopPhone items={shopPhoneView(ids)} labels={copy.phone} />
        <BasketPill
          amount={formatEur(locale, basket.extra)}
          extra={basket.extra > 0}
          fees={basket.fees}
          labels={copy.basket}
          announce={false}
        />
      </>
    );
  },
  pill: ({ ids, copy, locale }) => {
    const basket = basketFor(ids);
    return {
      text: basket.extra > 0 ? fill(copy.basket.extra, { amount: formatEur(locale, basket.extra) }) : copy.basket.none,
      alert: basket.fees,
    };
  },
  announce: ({ before, after, copy, locale }) => {
    const was = basketFor(before);
    const now = basketFor(after);
    return now.extra === was.extra && now.fees === was.fees ? null : basketSentence(copy, locale, now);
  },
};

/** Each playable level's side, keyed by its slug: a level added to `LevelSlug` does not compile without one. */
export const ISLAND_SIDES: { [S in LevelSlug]: IslandSide<IslandCopies[S]> } = {
  retention: RETENTION_SIDE,
};
