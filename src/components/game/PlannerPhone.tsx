"use client";

import type { ActivationPhoneCopy } from "@/lib/game/copy";
import type { PlannerPhoneItem } from "@/lib/game/planner-phone";
import { usePhoneFlash } from "./phone-flash";
import frame from "./PhoneFrame.module.css";
import styles from "./PlannerPhone.module.css";

/**
 * A planner phone element's identity for the « what changed » flash: its kind
 * plus every flag that changes what it shows. Ticking `refuse` turns the
 * banner `equal`; ticking `minimal` changes the sign-up form, and with
 * `phone` the number's line too — the form flashes, the app bar does not.
 */
export function plannerItemKey(item: PlannerPhoneItem): string {
  switch (item.kind) {
    case "banner":
      return `banner:${item.style}`;
    case "signup":
      return `signup:${item.minimal}:${item.phone}:${item.prechecked}:${item.partners}`;
    case "home":
      return `home:${item.checklist}:${item.importer}:${item.tour}`;
    default:
      return item.kind;
  }
}

export interface PlannerPhoneProps {
  /** lib/game/planner-phone.ts `plannerPhoneView(phoneIds(state))` — the active cards AND the ticked ones. */
  items: readonly PlannerPhoneItem[];
  labels: ActivationPhoneCopy;
  className?: string;
}

/**
 * Quandi's app, as a freelancer arrives on it — the activation level's phone
 * (GAME-BRIEF §18.7): the permissions sheet, the cookie banner, the sign-up
 * form, the first screen, and what follows by email and push. A drawing, like
 * the other levels' phones, in the same frame (`PhoneFrame.module.css`):
 * everything in it is TEXT, never a control — a « button » is a styled
 * `<span>` — and it is a `<figure>` whose caption says what it shows.
 *
 * Someone else's product, so its colours are the --app-* island and its own
 * brand violet (--planner-brand). What a tick changes is outlined for a
 * moment, as on the other phones (`usePhoneFlash`).
 */
export function PlannerPhone({ items, labels, className }: PlannerPhoneProps) {
  const changed = usePhoneFlash(items, plannerItemKey);
  const flash = (item: PlannerPhoneItem) => (changed(item) ? (frame.flash ?? "") : "");

  return (
    <figure className={[frame.phone, styles.planner, className ?? ""].filter(Boolean).join(" ")} data-testid="game-phone">
      <figcaption className={frame.caption}>{labels.caption}</figcaption>
      <div className={frame.bezel}>
        <div className={frame.screen}>
          {items.map((item) => (
            <PlannerElement key={plannerItemKey(item)} item={item} labels={labels} className={flash(item)} />
          ))}
        </div>
      </div>
    </figure>
  );
}

function PlannerElement({ item, labels, className }: { item: PlannerPhoneItem; labels: ActivationPhoneCopy; className: string }) {
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
    case "permissions":
      return (
        <div className={cx(styles.sheet)} data-testid="game-planner-permissions">
          <span className={styles.sheetText}>{labels.permissions}</span>
          <span className={styles.button}>{labels.permissionsAllow}</span>
        </div>
      );
    case "banner":
      return (
        <div className={cx(styles.banner)} data-testid="game-planner-banner" data-style={item.style}>
          <span className={styles.bannerText}>{item.style === "nudged" ? labels.bannerTextNudged : labels.bannerText}</span>
          <BannerButtons style={item.style} labels={labels} />
        </div>
      );
    case "demo":
      return (
        <span className={cx(styles.brandLink)} data-testid="game-planner-demo">
          {labels.demo}
        </span>
      );
    case "signup":
      return (
        <div className={cx(styles.signup)} data-testid="game-planner-signup" data-phone={item.phone}>
          <span className={styles.signupTitle}>{labels.signupTitle}</span>
          <span className={styles.field}>{item.minimal ? labels.fieldsMinimal : labels.fields}</span>
          {item.phone === "required" ? <span className={styles.field}>{labels.phoneRequired}</span> : null}
          {item.phone === "optional" ? <span className={styles.field}>{labels.phoneOptional}</span> : null}
          {item.prechecked ? <span className={styles.ticked}>{labels.prechecked}</span> : null}
          <span className={styles.button}>{labels.submit}</span>
          {item.partners ? <span className={styles.small}>{labels.partners}</span> : null}
        </div>
      );
    case "analysis":
      return (
        <div className={cx(styles.analysis)} data-testid="game-planner-analysis">
          <span>{labels.analysis}</span>
          <span className={styles.track} aria-hidden="true">
            <span className={styles.fill} />
          </span>
        </div>
      );
    case "home":
      return (
        <div className={cx(styles.home)} data-testid="game-planner-home">
          <span className={styles.homeEmpty}>{labels.homeEmpty}</span>
          <span className={styles.button}>{labels.homeCreate}</span>
          {item.tour ? <span className={styles.tip}>{labels.tour}</span> : null}
          {item.checklist ? (
            <span className={styles.checklist}>
              <span>{labels.checklist}</span>
              <span className={styles.checklistClose}>{labels.checklistClose}</span>
            </span>
          ) : null}
          {item.importer ? <span className={styles.brandLink}>{labels.importer}</span> : null}
        </div>
      );
    case "push":
      return (
        <div className={cx(styles.push)} data-testid="game-planner-push">
          <span className={styles.pushIcon} aria-hidden="true" />
          {labels.push}
        </div>
      );
    case "welcome":
      return (
        <div className={cx(styles.notice, styles.ok)} data-testid="game-planner-welcome">
          {labels.welcome}
        </div>
      );
    case "calls":
      return (
        <div className={cx(styles.calls)} data-testid="game-planner-calls">
          <span className={styles.callsText}>{labels.calls}</span>
          <span className={styles.answers}>
            {labels.callsAnswers.map((answer) => (
              <span key={answer} className={styles.answer}>
                {answer}
              </span>
            ))}
          </span>
        </div>
      );
  }
}

/**
 * The banner's buttons. Plain: accept and continue without accepting, one size,
 * one style. Nudged: « Tout accepter » as the button, « Personnaliser » as a
 * link, the refusal one screen further. Equal: refuse and accept side by side,
 * one size, one style, then « Personnaliser ».
 */
function BannerButtons({ style, labels }: { style: "plain" | "nudged" | "equal"; labels: ActivationPhoneCopy }) {
  switch (style) {
    case "plain":
      return (
        <span className={styles.buttons}>
          <span className={styles.button}>{labels.bannerAccept}</span>
          <span className={styles.button}>{labels.bannerContinue}</span>
        </span>
      );
    case "nudged":
      return (
        <>
          <span className={styles.buttons}>
            <span className={styles.button}>{labels.bannerAcceptAll}</span>
          </span>
          <span className={styles.link}>{labels.bannerCustomise}</span>
        </>
      );
    case "equal":
      return (
        <>
          <span className={styles.buttons}>
            <span className={styles.button}>{labels.bannerRejectAll}</span>
            <span className={styles.button}>{labels.bannerAcceptAll}</span>
          </span>
          <span className={styles.link}>{labels.bannerCustomise}</span>
        </>
      );
  }
}
