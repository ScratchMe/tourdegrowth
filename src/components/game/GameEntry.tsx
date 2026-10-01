"use client";

import { Fragment, useId } from "react";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { SPACE_PICTO } from "@/components/brand/SpaceBand";
import { trackEvent } from "@/lib/analytics/goatcounter";
import { NightSurface } from "./NightSurface";
import styles from "./GameEntry.module.css";

/**
 * One level the card offers, already resolved on the server in the reader's
 * language (`r/[id]/game-entry.ts`). The event travels as two strings rather
 * than as the game's vocabulary: `components/game` may import `lib/game` only
 * as types (game-bundles.test.ts, rule 2), and the result page's client bundle
 * has no business carrying the engine to fire one click.
 */
export interface GameEntryLevel {
  /** The stage the level plays, « Acquisition », « Retention »: named only when the card offers several. */
  stage: string;
  /** `/{locale}/game/<level>?from=result` — another root layout, hence a bare link. */
  href: string;
  cta: string;
  /** « Résiliations 6,0 % », « Nouveaux clients 2 000 »: the level's number, formatted from its model. */
  metric: string;
  event: { name: string; detail: string };
}

/** Everything the card shows. */
export interface GameEntryView {
  title: string;
  /** The opening sentence (plain or Deep dive variant) and the rest, joined. */
  body: string;
  /** The mono mention beside the button: « vingt minutes, gratuit ». */
  meta: string;
  /** What the band says after the levels' numbers: the trust that is not on the CEO's dashboard. */
  band: { trust: string; notOnDashboard: string };
  /**
   * The levels offered, in the bottleneck's order (lowest stage first). One
   * is the brief's card; several — stages tied at the bottom that each have a
   * level (C30 Q5, 2026-10-01) — one card offering them all, stage by stage.
   */
  levels: readonly [GameEntryLevel, ...GameEntryLevel[]];
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
 * glance — the number the CEO watches, and the trust that is not on his
 * dashboard. The empty cell stands in for that missing number; it is drawn,
 * not a glyph, so no font can turn it into a tofu box, and it is hidden from
 * assistive technology because the words beside it already say it.
 *
 * The link is a bare `<a>` (`Button hard`): the game lives under the content
 * pages' root layout and this page under the app's, so a `next/link` would
 * prefetch a route it can only reach by reloading the document anyway
 * (cross-root-links.test.ts, CLAUDE.md 2026-09-14).
 *
 * Several levels (C30 Q5, A12.f.2): the band lists each level's number
 * before the missing trust, and the card ends on one row per stage — its
 * name, its button — then the mention, once.
 */
export function GameEntry({ title, body, meta, band, levels, className }: GameEntryProps) {
  const titleId = useId();
  const several = levels.length > 1;
  return (
    <Card
      elevation="flat"
      padding="0"
      className={[styles.card, className ?? ""].filter(Boolean).join(" ")}
      role="region"
      aria-labelledby={titleId}
      data-testid="game-entry"
      data-levels={levels.length}
    >
      <NightSurface as="div" className={styles.band} data-testid="game-entry-band">
        {/* The game's sign, as on the band of its pages: a link to the game wears it (design I + B). */}
        <span className={styles.bandPicto} data-testid="game-entry-band-picto">
          {SPACE_PICTO.game}
        </span>
        <span className={[styles.bandItems, several ? styles.bandStacked : ""].filter(Boolean).join(" ")}>
          {levels.map((level) => (
            <Fragment key={level.href}>
              <span className={styles.bandItem}>{level.metric}</span>
              <span className={styles.bandSep} aria-hidden="true" data-testid="game-entry-band-sep">
                ·
              </span>
            </Fragment>
          ))}
          <span className={styles.bandItem}>
            {band.trust}
            <span className={styles.missing} aria-hidden="true" />
            <span className={styles.bandMuted}>{band.notOnDashboard}</span>
          </span>
        </span>
      </NightSurface>
      <div className={styles.body}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <p className={styles.text}>{body}</p>
        {several ? (
          <>
            {/* One row per stage, lowest first: the reader chooses, AARRR order does not (C30 Q5). */}
            <ul className={styles.levels}>
              {levels.map((level) => (
                <li key={level.href} className={styles.level}>
                  <span className={styles.stage}>{level.stage}</span>
                  <LevelButton level={level} />
                </li>
              ))}
            </ul>
            <span className={styles.meta}>{meta}</span>
          </>
        ) : (
          <div className={styles.actions}>
            <LevelButton level={levels[0]} />
            <span className={styles.meta}>{meta}</span>
          </div>
        )}
      </div>
    </Card>
  );
}

/** A level's button: secondary (13.3 — never solid red), a bare link to another root layout, its own door counted. */
function LevelButton({ level }: { level: GameEntryLevel }) {
  const { href, cta, event } = level;
  return (
    <Button
      variant="secondary"
      href={href}
      hard
      onClick={() => trackEvent(event.name, event.detail)}
      data-testid="game-entry-cta"
      data-detail={event.detail}
    >
      {cta}
    </Button>
  );
}
