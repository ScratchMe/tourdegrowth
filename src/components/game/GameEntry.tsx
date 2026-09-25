"use client";

import { useId } from "react";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { trackEvent } from "@/lib/analytics/goatcounter";
import { NightSurface } from "./NightSurface";
import styles from "./GameEntry.module.css";

/**
 * Everything the card shows, already resolved on the server in the reader's
 * language (`r/[id]/game-entry.ts`). The event travels as two strings rather
 * than as the game's vocabulary: `components/game` may import `lib/game` only
 * as types (game-bundles.test.ts, rule 2), and the result page's client bundle
 * has no business carrying the engine to fire one click.
 */
export interface GameEntryView {
  /** `/{locale}/game/retention?from=result` — another root layout, hence a bare link. */
  href: string;
  title: string;
  /** The opening sentence (plain or Deep dive variant) and the rest, joined. */
  body: string;
  cta: string;
  /** The mono mention beside the button: « vingt minutes, gratuit ». */
  meta: string;
  band: {
    /** « Résiliations 6,0 % », the number formatted from the level model. */
    churn: string;
    trust: string;
    notOnDashboard: string;
  };
  event: { name: string; detail: string };
}

export interface GameEntryProps extends GameEntryView {
  className?: string;
}

/**
 * The offer to play the game, on a result page whose bottleneck includes a
 * stage that has a level — game plan §2.6 and §3.10, GAME-BRIEF.md 13.3 A.
 *
 * A preview card, never a call to action that competes with the page's own:
 * the button is secondary (13.3 — never solid red), and the card is flat
 * paper, because the one raised card on this screen is the score. Across its
 * top, a 44px band of the night world shows the object of the game in one
 * glance — the churn the CEO watches, and the trust that is not on his
 * dashboard. The empty cell stands in for that missing number; it is drawn,
 * not a glyph, so no font can turn it into a tofu box, and it is hidden from
 * assistive technology because the words beside it already say it.
 *
 * The link is a bare `<a>` (`Button hard`): the game lives under the content
 * pages' root layout and this page under the app's, so a `next/link` would
 * prefetch a route it can only reach by reloading the document anyway
 * (cross-root-links.test.ts, CLAUDE.md 2026-09-14).
 */
export function GameEntry({ href, title, body, cta, meta, band, event, className }: GameEntryProps) {
  const titleId = useId();
  return (
    <Card
      elevation="flat"
      padding="0"
      className={[styles.card, className ?? ""].filter(Boolean).join(" ")}
      role="region"
      aria-labelledby={titleId}
      data-testid="game-entry"
    >
      <NightSurface as="div" className={styles.band} data-testid="game-entry-band">
        <span className={styles.bandItem}>{band.churn}</span>
        <span className={styles.bandSep} aria-hidden="true" data-testid="game-entry-band-sep">
          ·
        </span>
        <span className={styles.bandItem}>
          {band.trust}
          <span className={styles.missing} aria-hidden="true" />
          <span className={styles.bandMuted}>{band.notOnDashboard}</span>
        </span>
      </NightSurface>
      <div className={styles.body}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <p className={styles.text}>{body}</p>
        <div className={styles.actions}>
          <Button
            variant="secondary"
            href={href}
            hard
            onClick={() => trackEvent(event.name, event.detail)}
            data-testid="game-entry-cta"
          >
            {cta}
          </Button>
          <span className={styles.meta}>{meta}</span>
        </div>
      </div>
    </Card>
  );
}
