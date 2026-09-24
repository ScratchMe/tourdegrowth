"use client";

import { useState, type ReactNode } from "react";
import type { LevelCopy } from "@/lib/game/copy";
import type { PhoneItem } from "@/lib/game/view";
import styles from "./PhoneMock.module.css";

/**
 * A phone element's identity for the « what changed » flash: its kind plus
 * every flag that changes what it shows. Ticking `bury` turns the crumbs
 * into the long trail AND the button into a tiny link — both keys change,
 * both flash; the app bar does not.
 */
export function phoneItemKey(item: PhoneItem): string {
  switch (item.kind) {
    case "crumbs":
      return `crumbs:${item.buried}`;
    case "plan":
      return `plan:${item.annual}`;
    case "cancel":
      return `cancel:${item.variant}:${item.buried}`;
    case "retentionOffers":
      return `retentionOffers:${item.shamed}`;
    default:
      return item.kind;
  }
}

/** The keys of `next` that `prev` did not show — the elements a tick just changed. */
export function changedPhoneKeys(prev: readonly PhoneItem[], next: readonly PhoneItem[]): Set<string> {
  const before = new Set(prev.map(phoneItemKey));
  return new Set(next.map(phoneItemKey).filter((key) => !before.has(key)));
}

/** A template with one `{name}` slot, the value set in `render`. No match: the template as is. */
function withSlot(template: string, name: string, render: ReactNode): ReactNode {
  const at = template.indexOf(`{${name}}`);
  if (at < 0) return template;
  return (
    <>
      {template.slice(0, at)}
      {render}
      {template.slice(at + name.length + 2)}
    </>
  );
}

export interface PhoneMockProps {
  /** lib/game/view.ts `phoneView(level, phoneIds(state))` — the active cards AND the ticked ones. */
  items: readonly PhoneItem[];
  labels: LevelCopy["phone"];
  className?: string;
}

/**
 * Flixo's cancellation screen, as the subscribers see it (GAME-BRIEF §5.9):
 * a drawing, not an interface. Everything in it is TEXT — spans styled as
 * buttons, never `<button tabindex="-1">`: the prototype's fake controls
 * sat in the accessibility tree as buttons that did nothing (plan R14). It
 * is a `<figure>`, its visible caption saying what it shows.
 *
 * The screen is someone else's product, so its colours come from the
 * --app-* island (game.css), white inside the night. One rule holds even
 * here: the discreet « request cancellation » link is discreet by its size,
 * place and grey — 4.74:1 — never by being unreadable (plan R8).
 *
 * When a ticked card changes something on the screen, that element is
 * outlined for a moment in the night's selection amber — the colour of the
 * ticked card itself: this is what it did. CSS only, so reduced motion
 * turns it off with every other animation; the first render never flashes.
 */
export function PhoneMock({ items, labels, className }: PhoneMockProps) {
  // The previous screen kept in state and compared during render — React's
  // pattern for state derived from a prop change, with no effect and no ref
  // read. Compared by content, not by reference: the island rebuilds the
  // array on every render, and an unrelated re-render must not cut a flash
  // short by clearing its class mid-animation.
  const signature = items.map(phoneItemKey).join("|");
  const [previous, setPrevious] = useState({ signature, items });
  const [changed, setChanged] = useState<ReadonlySet<string>>(() => new Set());
  if (previous.signature !== signature) {
    setChanged(changedPhoneKeys(previous.items, items));
    setPrevious({ signature, items });
  }

  const flash = (item: PhoneItem) => (changed.has(phoneItemKey(item)) ? (styles.flash ?? "") : "");

  return (
    <figure className={[styles.phone, className ?? ""].filter(Boolean).join(" ")} data-testid="game-phone">
      <figcaption className={styles.caption}>{labels.caption}</figcaption>
      <div className={styles.bezel}>
        <div className={styles.screen}>
          {items.map((item) => (
            <PhoneElement key={phoneItemKey(item)} item={item} labels={labels} className={flash(item)} />
          ))}
        </div>
      </div>
    </figure>
  );
}

function PhoneElement({ item, labels, className }: { item: PhoneItem; labels: LevelCopy["phone"]; className: string }) {
  const cx = (...names: (string | undefined)[]) => [...names, className].filter(Boolean).join(" ");
  switch (item.kind) {
    case "appBar":
      return (
        <div className={cx(styles.appBar)}>
          <span className={styles.brand}>
            <span className={styles.dot} aria-hidden="true" />
            {labels.appName}
          </span>
          <span className={styles.time}>{labels.time}</span>
        </div>
      );
    case "streakPush":
      return (
        <div className={cx(styles.push)}>
          <span className={styles.pushIcon} aria-hidden="true" />
          {labels.streakPush}
        </div>
      );
    case "crumbs":
      return <div className={cx(styles.crumbs)}>{item.buried ? labels.crumbsBuried : labels.crumbs}</div>;
    case "plan":
      return (
        <div className={cx(styles.planCard)}>
          <span className={styles.planName}>
            {labels.appName} {item.annual ? labels.planAnnual : labels.plan}
          </span>
          <span className={styles.planPrice}>{item.annual ? labels.priceAnnual : labels.price}</span>
        </div>
      );
    case "socialProof":
      return (
        <div className={cx(styles.social)}>
          <span className={styles.avatars} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          {labels.social}
        </div>
      );
    case "reminder":
      return <div className={cx(styles.notice, styles.ok)}>{labels.reminder}</div>;
    case "cancel":
      return <CancelElement item={item} labels={labels} className={className} />;
    case "pauseOffer":
      return (
        <Modal className={className} title={labels.pauseOffer}>
          <span className={styles.stay}>{labels.pauseAccept}</span>
          <span className={styles.no}>{labels.pauseDecline}</span>
        </Modal>
      );
    case "retentionOffers":
      return (
        <div className={cx(styles.modalStack)}>
          {labels.cascadeOffers.map((offer) => (
            <Modal key={offer} title={offer}>
              <span className={styles.stay}>{labels.stay}</span>
              <span className={styles.no}>{item.shamed ? labels.declineShamed : labels.decline}</span>
            </Modal>
          ))}
        </div>
      );
    case "areYouSure":
      return (
        <Modal className={className} title={labels.confirm}>
          <span className={styles.stay}>{labels.stay}</span>
          <span className={styles.no}>{labels.declineShamed}</span>
        </Modal>
      );
    case "exitSurvey":
      return (
        <Modal className={className} title={labels.survey}>
          {labels.surveyAnswers.map((answer) => (
            <span key={answer} className={styles.no}>
              {answer}
            </span>
          ))}
        </Modal>
      );
    case "noticePeriod":
      return <div className={cx(styles.notice, styles.warn, styles.bottom)}>{labels.notice}</div>;
    case "effectiveToday":
      return <div className={cx(styles.notice, styles.ok, styles.bottom)}>{labels.threeClicks}</div>;
  }
}

/** One way out — and the phone wins over everything: there is no button to style once you have to call. */
function CancelElement({
  item,
  labels,
  className,
}: {
  item: Extract<PhoneItem, { kind: "cancel" }>;
  labels: LevelCopy["phone"];
  className: string;
}) {
  const cx = (...names: (string | undefined)[]) => [...names, className].filter(Boolean).join(" ");
  switch (item.variant) {
    case "phone":
      return (
        <div className={cx(styles.callBox)}>
          {withSlot(labels.call, "number", <span className={styles.number}>{labels.number}</span>)}
        </div>
      );
    case "pauseFirst":
      return (
        <div className={cx(styles.stack)}>
          <span className={[styles.appButton, styles.brandButton].join(" ")}>{labels.pauseButton}</span>
          <span className={styles.tinyLink}>{item.buried ? labels.cancelLinkBuried : labels.cancelLink}</span>
        </div>
      );
    case "buriedLink":
      return <span className={cx(styles.tinyLink)}>{labels.cancelLinkBuried}</span>;
    case "button":
      return <span className={cx(styles.appButton, styles.dangerButton)}>{labels.cancelButton}</span>;
  }
}

function Modal({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={[styles.modal, className ?? ""].filter(Boolean).join(" ")}>
      <span className={styles.modalTitle}>{title}</span>
      <span className={styles.modalRow}>{children}</span>
    </div>
  );
}
