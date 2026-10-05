import type { SentPillCopy } from "@/lib/game/copy";
import styles from "./ClickPill.module.css";

export interface SentPillProps {
  /** `sentInYourName(ids).messages`, already formatted for the locale (`formatInt`): « 214 », « 856 ». It fills the `{n}` of `labels.some`. */
  count: string;
  /** `sentInYourName(ids).alert` — decided by the view, not re-derived here: messages went out in Thomas's name that he did not write. */
  alert: boolean;
  labels: SentPillCopy;
  /** `sm` for the sticky action bar on a phone: same words, smaller type. */
  size?: "md" | "sm";
  /**
   * Whether the pill speaks for itself (`aria-live="polite"`). On by default;
   * off inside the level's island, which says a change in its one region
   * (plan E5) — exactly as `ClickPill`.
   */
  announce?: boolean;
  className?: string;
}

/**
 * « 214 messages envoyés au nom de Thomas · des messages qu'il n'a pas
 * écrits » under Partix's phone (GAME-BRIEF §19.7) — the referral level's
 * « N clics pour résilier »: how many messages went out in Thomas's name
 * without his writing them. A measurable fact the law frames (marketing by
 * message without consent), never a judgement. Once any went out, the pill
 * says so in words (the suffix) and turns to the alert colour, which only
 * repeats them. Drawn with `ClickPill`'s own styles: the pills are one object
 * in every level.
 */
export function SentPill({ count, alert, labels, size = "md", announce = true, className }: SentPillProps) {
  return (
    <p
      className={[styles.pill, styles[size], alert ? styles.over : "", className ?? ""].filter(Boolean).join(" ")}
      data-testid="game-sent"
      data-alert={alert ? "true" : "false"}
      aria-live={announce ? "polite" : undefined}
    >
      {alert ? <Figure template={labels.some} value={count} /> : labels.none}
      {alert ? <span className={styles.suffix}> · {labels.suffix}</span> : null}
    </p>
  );
}

/** The count stands out in the sentence; the sentence stays one string from the copy file. */
function Figure({ template, value }: { template: string; value: string }) {
  const slot = "{n}";
  const at = template.indexOf(slot);
  if (at < 0) return <>{template}</>;
  return (
    <>
      {template.slice(0, at)}
      <b className={styles.figure}>{value}</b>
      {template.slice(at + slot.length)}
    </>
  );
}
