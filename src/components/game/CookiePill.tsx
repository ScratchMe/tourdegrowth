import type { CookiePillCopy } from "@/lib/game/copy";
import styles from "./ClickPill.module.css";

export interface CookiePillProps {
  /** lib/game/planner-phone.ts `cookieRefusal(ids).clicks`: 1, or 3 when the banner buries the refusal. */
  clicks: 1 | 3;
  /** `cookieRefusal(ids).alert` — decided by the view, not re-derived here: the refusal is buried, and the law says why that is a problem. */
  alert: boolean;
  labels: CookiePillCopy;
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
 * « Refuser les cookies : 3 clics » under Quandi's phone (GAME-BRIEF §18.7) —
 * the activation level's « N clics pour résilier »: how many clicks it takes
 * to refuse the cookies. A measurable fact the CNIL frames, never a judgement.
 * With the refusal buried behind « Personnaliser », the pill says why it is a
 * problem in words (« le refus doit être aussi simple que l'accord ») and turns
 * to the alert colour, which only repeats them. Drawn with `ClickPill`'s own
 * styles: the pills are one object in every level.
 */
export function CookiePill({ clicks, alert, labels, size = "md", announce = true, className }: CookiePillProps) {
  return (
    <p
      className={[styles.pill, styles[size], alert ? styles.over : "", className ?? ""].filter(Boolean).join(" ")}
      data-testid="game-cookies"
      data-clicks={clicks}
      data-alert={alert ? "true" : "false"}
      aria-live={announce ? "polite" : undefined}
    >
      <Figure template={alert ? labels.hidden : labels.easy} value={String(clicks)} />
      {alert ? <span className={styles.suffix}> · {labels.lawSuffix}</span> : null}
    </p>
  );
}

/** The number stands out in the sentence; the sentence stays one string from the copy file. */
function Figure({ template, value }: { template: string; value: string }) {
  const at = template.indexOf(value);
  if (at < 0) return <>{template}</>;
  return (
    <>
      {template.slice(0, at)}
      <b className={styles.figure}>{value}</b>
      {template.slice(at + value.length)}
    </>
  );
}
