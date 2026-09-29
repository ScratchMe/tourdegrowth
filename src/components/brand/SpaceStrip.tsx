import { SPACE_STRIP } from "@/content/space-strip";
import type { Locale } from "@/lib/i18n/locale";
import { SPACE_STRINGS } from "@/lib/i18n/space-strings";
import { tc } from "@/lib/i18n/translatable";
import { SPACE_OPEN_AT_BUILD, SPACE_PICTO, SPACES, type Space } from "./SpaceBand";
import styles from "./SpaceStrip.module.css";

export interface SpaceStripProps {
  locale: Locale;
  /** Which spaces are open. Defaults to what the build saw; previews and tests pass their own. */
  open?: Partial<Record<Space, boolean>>;
  className?: string;
}

/**
 * The race in three cards, on the landing — design I + B, retained by
 * Antoine on 2026-09-28.
 *
 * The band (`SpaceBand`) says which leg a page belongs to; this says what
 * the three legs are, once, to someone who has not started: the check-up, the
 * engine, the game, each in its own colour and pictogram, each with when it
 * comes and what it gives. Under the hero, where a visitor who scrolled is
 * deciding whether the Tour is worth three minutes.
 *
 * The cards are not links. The hero's button is the landing's one way in, and
 * the band's pills are the race's navigation; a second set of doors here
 * would compete with both. A leg not open yet stays in the race, as on the
 * band (Antoine, 2026-09-28): dashed, and « bientôt » where « Ensuite » would
 * be — the state is a word, never a colour alone.
 *
 * The heading is the band's accessible name, « Le Tour en trois parties »:
 * the three spaces are never « étapes », a word the product keeps for the
 * five AARRR stages. The game's card is set in the night, the world the game
 * is played in. Server Component.
 */
export function SpaceStrip({ locale, open, className }: SpaceStripProps) {
  const isOpen = (s: Space) => s === "tour" || (open?.[s] ?? SPACE_OPEN_AT_BUILD[s]);

  return (
    <section
      className={[styles.strip, className ?? ""].filter(Boolean).join(" ")}
      aria-labelledby="space-strip-title"
      data-testid="space-strip"
    >
      <h2 id="space-strip-title" className={styles.heading}>
        {tc(SPACE_STRINGS.race, locale)}
      </h2>
      <ol className={styles.grid}>
        {SPACES.map((s, i) => {
          const state = isOpen(s) ? "open" : "soon";
          return (
            <li
              key={s}
              className={styles.card}
              data-space={s}
              data-state={state}
              data-world={s === "game" ? "night" : undefined}
              data-testid={`space-strip-${s}`}
            >
              <div className={styles.top}>
                {/* The band's sign, read by nobody: the list already gives the order, the heading the name. */}
                <span className={styles.chip} aria-hidden="true">
                  <span className={styles.picto}>{SPACE_PICTO[s]}</span>
                  <b>{i + 1}</b>
                  <span className={styles.kind}>{tc(SPACE_STRINGS.kind[s], locale)}</span>
                </span>
                <span className={styles.when}>
                  {state === "open" ? tc(SPACE_STRIP.when[s], locale) : tc(SPACE_STRINGS.soon, locale)}
                </span>
              </div>
              <h3 className={styles.name}>{tc(SPACE_STRINGS.name[s], locale)}</h3>
              <p className={styles.pitch}>{tc(SPACE_STRIP.pitch[s], locale)}</p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
