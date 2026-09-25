import type { LevelCopy } from "@/lib/game/copy";
import styles from "./ClickPill.module.css";

export interface ClickPillProps {
  /** lib/game/view.ts `clicksFor(level, ids)`: a number, or "phone" when leaving takes a call. */
  clicks: number | "phone";
  /** lib/game/view.ts `clicksOverLaw(clicks)` — decided by the view, not re-derived here. */
  overLaw: boolean;
  labels: LevelCopy["clicks"];
  /** `compact` for the sticky action bar on a phone: same words, smaller type. */
  size?: "md" | "compact";
  /**
   * Whether the pill speaks for itself (`aria-live="polite"`). On by default:
   * alone on a page, it is the one change a screen-reader user needs to hear
   * when a card is ticked. Off inside a screen that already has its own live
   * region (the level's island, plan E5): two regions answering the same
   * gesture talk over each other, so that screen says the count itself, in
   * its one region.
   */
  announce?: boolean;
  className?: string;
}

/**
 * « 2 clics pour résilier » under the phone (GAME-BRIEF §5.9) — the number
 * the dark patterns push up while the reader ticks cards. Past three, or
 * with the phone, the pill says WHY it is a problem in words (« la loi attend
 * un parcours direct », « il faut téléphoner »); the red only repeats them.
 *
 * `aria-live="polite"` here and nowhere else on the phone: the count is the
 * one change a screen-reader user needs to hear when ticking a card, and the
 * drawing around it would be noise — unless the screen announces it itself
 * (`announce={false}`).
 */
export function ClickPill({ clicks, overLaw, labels, size = "md", announce = true, className }: ClickPillProps) {
  const phone = clicks === "phone";
  const suffix = phone ? labels.phoneSuffix : overLaw ? labels.lawSuffix : null;
  return (
    <p
      className={[styles.pill, styles[size], overLaw ? styles.over : "", className ?? ""].filter(Boolean).join(" ")}
      data-testid="game-clicks"
      data-clicks={phone ? "phone" : String(clicks)}
      aria-live={announce ? "polite" : undefined}
    >
      {phone ? <Figure template={labels.infinite} value="∞" /> : <Figure template={labels.count} value={String(clicks)} slot="{n}" />}
      {suffix ? <span className={styles.suffix}> · {suffix}</span> : null}
    </p>
  );
}

/** The number stands out in the sentence; the sentence stays one string from the copy file. */
function Figure({ template, value, slot }: { template: string; value: string; slot?: string }) {
  const marker = slot ?? value;
  const at = template.indexOf(marker);
  if (at < 0) return <>{template}</>;
  return (
    <>
      {template.slice(0, at)}
      <b className={styles.figure}>{value}</b>
      {template.slice(at + marker.length)}
    </>
  );
}
