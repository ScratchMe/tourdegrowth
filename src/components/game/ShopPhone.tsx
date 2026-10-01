"use client";

import type { AcquisitionPhoneCopy } from "@/lib/game/copy";
import type { ShopPhoneItem } from "@/lib/game/shop-phone";
import { usePhoneFlash } from "./phone-flash";
import frame from "./PhoneFrame.module.css";
import styles from "./ShopPhone.module.css";

/**
 * A shop phone element's identity for the « what changed » flash: its kind
 * plus every flag that changes what it shows. Ticking `anchor` strikes the
 * price through; ticking `allin` changes it AND the basket — both flash.
 */
export function shopItemKey(item: ShopPhoneItem): string {
  switch (item.kind) {
    case "results":
      return `results:${item.sponsored}:${item.compared}`;
    case "product":
      return `product:${item.photos}`;
    case "price":
      return `price:${item.anchor}:${item.allIn}`;
    case "rating":
      return `rating:${item.sorted}:${item.verified}`;
    case "pressure":
      return `pressure:${item.line}`;
    case "basket":
      return `basket:${item.deliveryIncluded}:${item.fees}`;
    default:
      return item.kind;
  }
}

export interface ShopPhoneProps {
  /** lib/game/shop-phone.ts `shopPhoneView(phoneIds(state))` — the active cards AND the ticked ones. */
  items: readonly ShopPhoneItem[];
  labels: AcquisitionPhoneCopy;
  className?: string;
}

/**
 * Pédalix's app, as a visitor goes through it — level 2's phone
 * (GAME-BRIEF §17.7): the search, the product page, the price, the rating,
 * the pressure, the basket. A drawing, like Flixo's phone (`PhoneMock`), in
 * the same frame (`PhoneFrame.module.css`): everything in it is TEXT, never
 * a control, and it is a `<figure>` whose caption says what it shows.
 *
 * Someone else's product, so its colours are the --app-* island and its own
 * brand green (--shop-brand). What a tick changes is outlined for a moment,
 * as on Flixo's phone (`usePhoneFlash`).
 */
export function ShopPhone({ items, labels, className }: ShopPhoneProps) {
  const changed = usePhoneFlash(items, shopItemKey);
  const flash = (item: ShopPhoneItem) => (changed(item) ? (frame.flash ?? "") : "");

  return (
    <figure className={[frame.phone, styles.shop, className ?? ""].filter(Boolean).join(" ")} data-testid="game-phone">
      <figcaption className={frame.caption}>{labels.caption}</figcaption>
      <div className={frame.bezel}>
        <div className={frame.screen}>
          {items.map((item) => (
            <ShopElement key={shopItemKey(item)} item={item} labels={labels} className={flash(item)} />
          ))}
        </div>
      </div>
    </figure>
  );
}

function ShopElement({ item, labels, className }: { item: ShopPhoneItem; labels: AcquisitionPhoneCopy; className: string }) {
  const cx = (...names: (string | undefined)[]) => [...names, className].filter(Boolean).join(" ");
  switch (item.kind) {
    case "appBar":
      return (
        <div className={cx(frame.appBar)}>
          <span className={frame.brand}>
            <span className={frame.dot} aria-hidden="true" />
            {labels.appName}
          </span>
          <span className={frame.time}>{labels.time}</span>
        </div>
      );
    case "video":
      return (
        <div className={cx(styles.video)} data-testid="game-shop-video">
          <span className={styles.play} aria-hidden="true" />
          <span className={styles.videoText}>
            <span className={styles.videoTitle}>{labels.video}</span>
            <span className={styles.videoBy}>{labels.videoBy}</span>
          </span>
        </div>
      );
    case "results":
      return (
        <div className={cx(styles.results)} data-testid="game-shop-results">
          <span className={styles.search}>{labels.search}</span>
          <span className={styles.result}>
            <span className={styles.thumb} aria-hidden="true" />
            <span className={styles.resultName}>{item.sponsored ? labels.resultSponsored : labels.resultTop}</span>
          </span>
          <span className={styles.meta}>{labels.resultMeta}</span>
          {item.compared ? <span className={styles.good}>{labels.compared}</span> : null}
        </div>
      );
    case "product":
      return (
        <div className={cx(styles.product)}>
          <span className={styles.photo} aria-hidden="true">
            <span className={styles.wheel} />
            <span className={styles.wheel} />
          </span>
          <span className={styles.productName}>{labels.product}</span>
          <span className={styles.meta}>{labels.productKind}</span>
          {item.photos ? <span className={styles.meta}>{labels.photos}</span> : null}
        </div>
      );
    case "price":
      return (
        <div className={cx(styles.priceRow)} data-testid="game-shop-price">
          {item.anchor ? <s className={styles.struck}>{labels.priceStruck}</s> : null}
          <span className={styles.price}>{item.allIn ? labels.priceAllIn : labels.price}</span>
          {/* The discount is the reference against the shelf price: shown only when that is the price on the page. */}
          {item.anchor && !item.allIn ? <span className={styles.discount}>{labels.discount}</span> : null}
        </div>
      );
    case "rating":
      return (
        <div className={cx(styles.rating)} data-testid="game-shop-rating">
          {item.sorted ? labels.ratingSorted : labels.rating}
          {item.verified ? <span className={styles.verified}> · {labels.verified}</span> : null}
        </div>
      );
    case "pressure":
      return (
        <div className={cx(styles.pressure)} data-testid={`game-shop-${item.line}`}>
          {labels[item.line]}
        </div>
      );
    case "delivery":
      return <div className={cx(styles.notice, styles.ok)}>{labels.delivery}</div>;
    case "guide":
      return <span className={cx(styles.guide)}>{labels.guide}</span>;
    case "basket":
      return (
        <div className={cx(styles.basket)} data-testid="game-shop-basket">
          <span className={styles.basketTitle}>{labels.basketTitle}</span>
          <span className={styles.basketLine}>{item.deliveryIncluded ? labels.basketDeliveryIncluded : labels.basketDelivery}</span>
          {item.fees ? <span className={styles.basketLine}>{labels.basketFees}</span> : null}
          <span className={styles.total}>{item.fees ? labels.totalWithFees : labels.total}</span>
        </div>
      );
    case "origin":
      return (
        <div className={cx(styles.modal)}>
          <span className={styles.modalTitle}>{labels.origin}</span>
          <span className={styles.answers}>
            {labels.originAnswers.map((answer) => (
              <span key={answer} className={styles.answer}>
                {answer}
              </span>
            ))}
          </span>
        </div>
      );
  }
}
