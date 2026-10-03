import type { ReactNode } from "react";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { Button } from "@/components/core/Button";
import styles from "./EngineLanding.module.css";

export interface EngineLandingProps {
  /** « Le moteur ». */
  eyebrow: ReactNode;
  /** The page's H1, always in the HTML: hero size on a first visit, a section's for a returning reader. */
  title: ReactNode;
  /** First visit only: hidden by CSS for a returning reader, still in the HTML (search engines read it). */
  lede?: ReactNode;
  /** First visit only, as `lede`. */
  positioning?: ReactNode;
  /** The privacy promise: a raised card before the call to action, never folded. */
  promiseTitle: ReactNode;
  promiseBody: ReactNode;
  /** The promise in one line, for a returning reader: shown instead of the card, never folded. */
  promiseLine: ReactNode;
  /**
   * « Entre tes chiffres → »: an anchor to the tool, drawn secondary — the
   * page's one primary is the start card's, which shares the first visit's
   * screens with it. Hidden for a returning reader: NextStep holds the primary.
   */
  cta: ReactNode;
  /** The tool's anchor. */
  ctaHref?: string;
  ctaNote?: ReactNode;
  /** The page's Stopwatch, beside the intro on a wide screen, first visit only. Decorative. */
  aside?: ReactNode;
  "data-testid"?: string;
}

/**
 * Everything above the tool on the engine's page, for both visits, from ONE
 * prerendered HTML — design system extension 07 (brief 07 Q1, A18 T4).
 * `[data-engine="known"]` on an ancestor — `<html>`, set before the first
 * paint by `engineKnownScript` (`lib/engine/known-script.ts`) — turns it into
 * the returning reader's version by CSS alone, so nothing jumps under their
 * eyes: the eyebrow, the H1 at a section's size, the promise in one line,
 * then the tool. The lede, the positioning, the promise's card, the call to
 * action and the stopwatch stay in the HTML, hidden.
 *
 * The promise comes before the call to action and never folds (D16): it is
 * the condition under which anyone types an employer's numbers into a web
 * page — a card on a first visit, a line on return.
 *
 * A Server Component: no state, no effect, nothing that waits for hydration.
 */
export function EngineLanding({
  eyebrow,
  title,
  lede,
  positioning,
  promiseTitle,
  promiseBody,
  promiseLine,
  cta,
  ctaHref = "#engine",
  ctaNote,
  aside,
  "data-testid": testId,
}: EngineLandingProps) {
  return (
    <div className={styles.root} data-testid={testId}>
      <div className={styles.main}>
        <MetaLabel size="xs" className={styles.eyebrow}>
          {eyebrow}
        </MetaLabel>
        <h1 className={styles.title}>{title}</h1>
        {lede || positioning ? (
          <div className={styles.intro}>
            {lede ? <p className={styles.lede}>{lede}</p> : null}
            {positioning ? <p className={styles.positioning}>{positioning}</p> : null}
          </div>
        ) : null}
        <div className={styles.promise} data-testid="engine-privacy">
          <h2 className={styles.promiseTitle}>{promiseTitle}</h2>
          <p className={styles.promiseBody}>{promiseBody}</p>
        </div>
        <p className={styles.promiseLine} data-testid="engine-privacy-line">
          {promiseLine}
        </p>
        <div className={styles.cta}>
          {/* An in-page anchor to the tool, not a route: without JavaScript it still lands on the tool's section. */}
          <Button href={ctaHref} hard variant="secondary" size="lg" data-testid="engine-cta">
            {cta}
          </Button>
          {ctaNote ? <p className={styles.ctaNote}>{ctaNote}</p> : null}
        </div>
      </div>
      {aside ? (
        <div className={styles.aside} aria-hidden="true">
          {aside}
        </div>
      ) : null}
    </div>
  );
}
