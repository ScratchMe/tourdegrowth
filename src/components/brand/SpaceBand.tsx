import type { ReactNode } from "react";
import { ENGINE_ENTRY_EVENT } from "@/lib/analytics/goatcounter";
import { GAME_ENTRY_EVENT } from "@/lib/game/events";
import type { Locale } from "@/lib/i18n/locale";
import { localePath } from "@/lib/i18n/routes";
import { SPACE_STRINGS } from "@/lib/i18n/space-strings";
import { tc } from "@/lib/i18n/translatable";
import { PICTO_VIEWBOX, SPACE_PICTO_PARTS } from "./space-pictos";
import { TrackedLink } from "./TrackedLink";
import styles from "./SpaceBand.module.css";

/**
 * The click a pill counts, as `space_band` (CHANTIERS.md A7.9, C15): the
 * engine's and the game's doors. The Tour's pill leads back to the landing,
 * which is not a start of anything: it stays a plain link.
 */
const PILL_EVENT: Partial<Record<Space, string>> = { engine: ENGINE_ENTRY_EVENT, game: GAME_ENTRY_EVENT };

/** The three spaces of the Tour, in the order the race runs them. */
export const SPACES = ["tour", "engine", "game"] as const;
export type Space = (typeof SPACES)[number];

/**
 * Where each space starts. The Tour's home is the landing; the engine is one
 * page (`ENGINE_PATH` in `lib/engine/access.ts`, spelled here rather than
 * imported so the quiz's bundle does not take the engine's flag module with
 * it); the game's is its hub.
 */
const HOME: Record<Space, string> = { tour: "/", engine: "/aarrr-funnel-template", game: "/game" };

/**
 * Which spaces the build saw open. Read from the values `next.config.mjs`
 * inlines, never from `GAME_ENABLED` / `ENGINE_ENABLED`: the band renders in
 * the quiz and the result, which are Client Components, and a server variable
 * is undefined there — the same reason `SiteFooter` reads its game link this
 * way. Literal `process.env.X` accesses on purpose: the only form Next inlines.
 */
export const SPACE_OPEN_AT_BUILD: Record<Space, boolean> = {
  tour: true,
  engine: process.env.TDG_ENGINE_OPEN_AT_BUILD === "1",
  game: process.env.TDG_GAME_OPEN_AT_BUILD === "1",
};

/** One pictogram of the road book, drawn in `currentColor` (`space-pictos.ts`). */
function picto(space: Space): ReactNode {
  return (
    <svg viewBox={PICTO_VIEWBOX} aria-hidden="true" focusable="false">
      {SPACE_PICTO_PARTS[space].map((part, index) =>
        part.kind === "ring" ? (
          <circle
            key={index}
            cx={part.cx}
            cy={part.cy}
            r={part.r}
            fill="none"
            stroke="currentColor"
            strokeWidth={part.width}
          />
        ) : part.kind === "stroke" ? (
          <path key={index} d={part.d} stroke="currentColor" strokeWidth={part.width} fill="none" />
        ) : (
          <path key={index} d={part.d} fill="currentColor" />
        ),
      )}
    </svg>
  );
}

/** The road book's three pictograms: a flat stage, a stopwatch, a mountain. Drawn in `currentColor`. */
export const SPACE_PICTO: Record<Space, ReactNode> = {
  tour: picto("tour"),
  engine: picto("engine"),
  game: picto("game"),
};

export interface SpaceBandProps {
  locale: Locale;
  /** The space this page belongs to. */
  space: Space;
  /**
   * Whether the other spaces' pills are links. `false` inside the two flows
   * the product exists to get people through — the quiz and the Deep dive —
   * for the reason `SiteFooter` stays out of them: an exit halfway down a
   * funnel works against it. The race is still shown, as a map.
   */
  linked?: boolean;
  /**
   * The column the band's content aligns to — the header row's own:
   * `wide` (the app shell, 1040px), `reading` (the prose column, 760px),
   * `narrow` (the quiz and the Deep dive, 720px).
   */
  width?: "wide" | "reading" | "narrow";
  /** Which spaces are open. Defaults to what the build saw; previews and tests pass their own. */
  open?: Partial<Record<Space, boolean>>;
}

/**
 * The space band — design I + B, retained by Antoine on 2026-09-28.
 *
 * « Un Tour, trois étapes » (the decision's words, never the band's — see
 * below): the check-up, the growth engine and the game
 * are three legs of one race. The band hangs from the header of every page
 * that belongs to one of them, and says which: the leg's pictogram, its place
 * in the race and its kind (« 1/3 · Plaine »), its name, and on the right the
 * whole race, this leg filled. Each leg wears its colour (`tokens/spaces.css`):
 * ink for the Tour, ultramarine for the engine, ochre for the game.
 *
 * A leg that is not open yet stays in the race, greyed, dashed and marked
 * « bientôt », with no link (Antoine, 2026-09-28): the race is the promise,
 * and a closed page is never linked to.
 *
 * It never says « étape » (see `space-strings.ts`). Server-safe and free of
 * state: it renders the same in a Server Component and in the quiz.
 */
export function SpaceBand({ locale, space, linked = true, width = "wide", open }: SpaceBandProps) {
  const isOpen = (s: Space) => s === space || (open?.[s] ?? SPACE_OPEN_AT_BUILD[s]);
  const n = SPACES.indexOf(space) + 1;

  return (
    <div className={styles.band} data-space={space} data-testid="space-band">
      <div className={`${styles.inner} ${styles[width]}`}>
        <span className={styles.picto}>{SPACE_PICTO[space]}</span>
        <p className={styles.where}>
          <span className={styles.kicker}>
            {n}/{SPACES.length} · {tc(SPACE_STRINGS.kind[space], locale)}
          </span>
          <span className={styles.name}>{tc(SPACE_STRINGS.name[space], locale)}</span>
        </p>
        <nav className={styles.race} aria-label={tc(SPACE_STRINGS.race, locale)}>
          <ol className={styles.stops}>
            {SPACES.map((s, i) => {
              const state = s === space ? "current" : isOpen(s) ? "open" : "soon";
              const body = (
                <>
                  <span className={styles.mini}>{SPACE_PICTO[s]}</span>
                  <span className={styles.n}>{i + 1}</span>
                  <span className={styles.label}>{tc(SPACE_STRINGS.short[s], locale)}</span>
                  {state === "soon" && <span className={styles.soon}>{tc(SPACE_STRINGS.soon, locale)}</span>}
                </>
              );
              return (
                <li key={s} className={styles.stop} data-state={state} data-stop={s}>
                  {state === "current" ? (
                    <span className={styles.pill} aria-current="page">
                      {body}
                    </span>
                  ) : state === "open" && linked ? (
                    PILL_EVENT[s] ? (
                      <TrackedLink className={styles.pill} href={localePath(locale, HOME[s])} event={PILL_EVENT[s]} detail="space_band">
                        {body}
                      </TrackedLink>
                    ) : (
                      <a className={styles.pill} href={localePath(locale, HOME[s])}>
                        {body}
                      </a>
                    )
                  ) : (
                    <span className={styles.pill}>{body}</span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}
