"use client";

import type { RevenuePhoneCopy } from "@/lib/game/copy";
import type { FitPhoneItem } from "@/lib/game/fit-phone";
import { usePhoneFlash } from "./phone-flash";
import frame from "./PhoneFrame.module.css";
import styles from "./FitPhone.module.css";

/**
 * A fit phone element's identity for the « what changed » flash: its kind plus
 * every flag that changes what it shows. Ticking `trial` turns the offer into
 * the 14-day one, `fullprice` adds the yearly total to it, `pricing` and
 * `addon` change the plans, `gems` and `roundpacks` the shop, `renewmail` and
 * `renewal` the renewal line.
 */
export function fitItemKey(item: FitPhoneItem): string {
  switch (item.kind) {
    case "offer":
      return `offer:${item.trial}:${item.fullPrice}`;
    case "plans":
      return `plans:${item.personal}:${item.addon}`;
    case "shop":
      return `shop:${item.odd}:${item.euros}`;
    case "renewal":
      return `renewal:${item.style}`;
    default:
      return item.kind;
  }
}

export interface FitPhoneProps {
  /** lib/game/fit-phone.ts `fitPhoneView(phoneIds(state))` — the active cards AND the ticked ones. */
  items: readonly FitPhoneItem[];
  labels: RevenuePhoneCopy;
  className?: string;
}

/**
 * Gainix's app, from the plans screen to the gem shop and the account's
 * renewal line — the revenue level's phone (GAME-BRIEF §20.7). A drawing, like
 * the other levels' phones, in the same frame (`PhoneFrame.module.css`):
 * everything in it is TEXT, never a control, and it is a `<figure>` whose
 * caption says what it shows. Nothing on it is in the alert colour: the pill
 * under it carries the problem.
 *
 * Someone else's product, so its colours are the --app-* island and its own
 * brand teal (--fit-brand). What a tick changes is outlined for a moment, as
 * on the other phones (`usePhoneFlash`).
 */
export function FitPhone({ items, labels, className }: FitPhoneProps) {
  const changed = usePhoneFlash(items, fitItemKey);
  const flash = (item: FitPhoneItem) => (changed(item) ? (frame.flash ?? "") : "");

  return (
    <figure className={[frame.phone, styles.fit, className ?? ""].filter(Boolean).join(" ")} data-testid="game-phone">
      <figcaption className={frame.caption}>{labels.caption}</figcaption>
      <div className={frame.bezel}>
        <div className={frame.screen}>
          {items.map((item) => (
            <FitElement key={fitItemKey(item)} item={item} labels={labels} className={flash(item)} />
          ))}
        </div>
      </div>
    </figure>
  );
}

function FitElement({ item, labels, className }: { item: FitPhoneItem; labels: RevenuePhoneCopy; className: string }) {
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
    case "offer":
      return (
        <div className={cx(styles.offer)} data-testid="game-fit-offer">
          {item.fullPrice ? <span className={styles.line}>{labels.fullPrice}</span> : null}
          {item.trial ? (
            <>
              <span className={styles.headline}>{labels.offerTrial}</span>
              <span className={styles.meta}>{labels.offerTrialSmall}</span>
            </>
          ) : (
            <span className={styles.headline}>{labels.offerBase}</span>
          )}
        </div>
      );
    case "plans":
      return (
        <div className={cx(styles.card)} data-testid="game-fit-plans">
          <span className={styles.title}>{labels.plansTitle}</span>
          <span className={styles.line}>{item.personal ? labels.monthlyPersonal : labels.monthly}</span>
          {item.addon ? <span className={styles.line}>{labels.addon}</span> : null}
        </div>
      );
    case "trialReminder":
      return (
        <div className={cx(styles.notice, styles.ok)} data-testid="game-fit-trialReminder">
          {labels.trialReminder}
        </div>
      );
    case "programme":
      return (
        <div className={cx(styles.stack)} data-testid="game-fit-programme">
          <span className={styles.line}>{labels.programme}</span>
          <span className={styles.meta}>{labels.programmeSmall}</span>
        </div>
      );
    case "coaching":
      return (
        <div className={cx(styles.line)} data-testid="game-fit-coaching">
          {labels.coaching}
        </div>
      );
    case "downgrade":
      return (
        <div className={cx(styles.line)} data-testid="game-fit-downgrade">
          {labels.downgrade}
        </div>
      );
    case "shop":
      return (
        <div className={cx(styles.stack)} data-testid="game-fit-shop">
          <span className={styles.title}>{labels.shopTitle}</span>
          <span className={styles.line}>{labels.shopItem}</span>
          <span className={styles.meta}>{item.odd ? labels.packsOdd : labels.packsRound}</span>
          {item.euros ? <span className={styles.good}>{labels.euros}</span> : null}
        </div>
      );
    case "chest":
      return (
        <div className={cx(styles.line)} data-testid="game-fit-chest">
          {labels.chest}
        </div>
      );
    case "express":
      return (
        <div className={cx(styles.line)} data-testid="game-fit-express">
          {labels.express}
        </div>
      );
    case "renewal":
      return item.style === "notice" ? (
        <div className={cx(styles.notice, styles.ok)} data-testid="game-fit-renewal" data-style="notice">
          {labels.renewalNotice}
        </div>
      ) : (
        <div className={cx(styles.meta)} data-testid="game-fit-renewal" data-style={item.style}>
          {item.style === "silent" ? labels.renewalSilent : labels.renewalPlain}
        </div>
      );
    case "checkoutQuestion":
      return (
        <div className={cx(styles.card)} data-testid="game-fit-checkoutQuestion">
          <span className={styles.question}>{labels.checkoutQuestion}</span>
          <ul className={styles.bullets}>
            {labels.checkoutAnswers.map((answer) => (
              <li key={answer}>{answer}</li>
            ))}
          </ul>
        </div>
      );
  }
}
