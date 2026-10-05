"use client";

import type { ReferralPhoneCopy } from "@/lib/game/copy";
import type { SplitPhoneItem } from "@/lib/game/split-phone";
import { usePhoneFlash } from "./phone-flash";
import frame from "./PhoneFrame.module.css";
import styles from "./SplitPhone.module.css";

/**
 * A split phone element's identity for the « what changed » flash: its kind
 * plus every flag that changes what it shows. Ticking `fairbonus` turns the
 * offer `clear`; ticking `chosen` swaps the invitation line for the picked
 * contacts; ticking `fakeinvite` swaps Léa's message for the personalised one.
 */
export function splitItemKey(item: SplitPhoneItem): string {
  switch (item.kind) {
    case "bonus":
      return `bonus:${item.style}`;
    case "invite":
      return `invite:${item.preselected}:${item.chosen}:${item.groupLink}`;
    case "guestMessage":
      return `guestMessage:${item.personalised}`;
    case "noBook":
      return `noBook:${item.numbers}`;
    default:
      return item.kind;
  }
}

export interface SplitPhoneProps {
  /** lib/game/split-phone.ts `splitPhoneView(phoneIds(state))` — the active cards AND the ticked ones. */
  items: readonly SplitPhoneItem[];
  labels: ReferralPhoneCopy;
  className?: string;
}

/**
 * Partix's app, the invitation seen from both sides — the referral level's
 * phone (GAME-BRIEF §19.7): Thomas's screen when he invites, what Léa
 * receives, and the promise at the foot. A drawing, like the other levels'
 * phones, in the same frame (`PhoneFrame.module.css`): everything in it is
 * TEXT, never a control — a « button » is a styled `<span>` — and it is a
 * `<figure>` whose caption says what it shows.
 *
 * Someone else's product, so its colours are the --app-* island and its own
 * brand orange (--split-brand). What a tick changes is outlined for a moment,
 * as on the other phones (`usePhoneFlash`).
 */
export function SplitPhone({ items, labels, className }: SplitPhoneProps) {
  const changed = usePhoneFlash(items, splitItemKey);
  const flash = (item: SplitPhoneItem) => (changed(item) ? (frame.flash ?? "") : "");

  return (
    <figure className={[frame.phone, styles.split, className ?? ""].filter(Boolean).join(" ")} data-testid="game-phone">
      <figcaption className={frame.caption}>{labels.caption}</figcaption>
      <div className={frame.bezel}>
        <div className={frame.screen}>
          {items.map((item) => (
            <SplitElement key={splitItemKey(item)} item={item} labels={labels} className={flash(item)} />
          ))}
        </div>
      </div>
    </figure>
  );
}

function SplitElement({ item, labels, className }: { item: SplitPhoneItem; labels: ReferralPhoneCopy; className: string }) {
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
    case "group":
      return (
        <div className={cx(styles.group)} data-testid="game-split-group">
          {labels.group}
        </div>
      );
    case "continue":
      return (
        <div className={cx(styles.continue)} data-testid="game-split-continue">
          <span className={styles.expense}>{labels.continueExpense}</span>
          <span className={styles.button}>{labels.continueButton}</span>
          <span className={styles.fine}>{labels.continueFine}</span>
          <span className={styles.skip}>{labels.continueSkip}</span>
        </div>
      );
    case "bonus":
      return item.style === "clear" ? (
        <div className={cx(styles.card)} data-testid="game-split-bonus" data-style="clear">
          <span className={styles.offer}>{labels.bonusClear}</span>
          <span className={styles.small}>{labels.bonusClearTerms}</span>
        </div>
      ) : (
        <div className={cx(styles.loud)} data-testid="game-split-bonus" data-style="loud">
          <span className={styles.loudOffer}>{labels.bonusLoud}</span>
          <span className={styles.small}>{labels.bonusLoudFine}</span>
        </div>
      );
    case "locked":
      return (
        <div className={cx(styles.locked)} data-testid="game-split-locked">
          <span className={styles.padlock} aria-hidden="true" />
          <span>{labels.locked}</span>
        </div>
      );
    case "invite":
      return (
        <div className={cx(styles.invite)} data-testid="game-split-invite">
          <span className={styles.inviteTitle}>{labels.inviteTitle}</span>
          {item.chosen ? (
            <span className={styles.ticked}>{labels.inviteChosen}</span>
          ) : item.preselected ? (
            <span className={styles.ticked}>{labels.invitePreselected}</span>
          ) : (
            <span className={styles.line}>{labels.inviteBase}</span>
          )}
          {item.groupLink ? <span className={styles.link}>{labels.groupLink}</span> : null}
        </div>
      );
    case "autoSent":
      return (
        <div className={cx(styles.card)} data-testid="game-split-autoSent">
          <span className={styles.line}>{labels.autoSent}</span>
        </div>
      );
    case "review":
      return (
        <div className={cx(styles.card)} data-testid="game-split-review">
          <span className={styles.question}>{labels.reviewQuestion}</span>
          <span className={styles.answer}>{labels.reviewYes}</span>
          <span className={styles.answer}>{labels.reviewNo}</span>
        </div>
      );
    case "recap":
      return (
        <div className={cx(styles.card)} data-testid="game-split-recap">
          <span className={styles.line}>{labels.recap}</span>
        </div>
      );
    case "guestDivider":
      return (
        <div className={cx(styles.divider)} data-testid="game-split-guestDivider">
          {labels.guestDivider}
        </div>
      );
    case "guestMessage":
      return (
        <div className={cx(styles.bubble)} data-testid="game-split-guestMessage" data-personalised={item.personalised ? "true" : "false"}>
          {item.personalised ? labels.guestMessagePersonalised : labels.guestMessage}
        </div>
      );
    case "guestShadow":
      return (
        <div className={cx(styles.shadow)} data-testid="game-split-guestShadow">
          <span className={styles.avatar} aria-hidden="true" />
          <span>{labels.guestShadow}</span>
        </div>
      );
    case "guestPage":
      return (
        <span className={cx(styles.link)} data-testid="game-split-guestPage">
          {labels.guestPage}
        </span>
      );
    case "guestQuestion":
      return (
        <div className={cx(styles.card)} data-testid="game-split-guestQuestion">
          <span className={styles.question}>{labels.guestQuestion}</span>
          <ul className={styles.bullets}>
            {labels.guestAnswers.map((answer) => (
              <li key={answer}>{answer}</li>
            ))}
          </ul>
        </div>
      );
    case "noBook":
      return (
        <p className={cx(styles.noBook)} data-testid="game-split-noBook">
          {item.numbers ? `${labels.noBook} ${labels.noBookNumbers}` : labels.noBook}
        </p>
      );
  }
}
