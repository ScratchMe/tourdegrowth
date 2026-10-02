import type { ReactNode } from "react";
import { ENGINE_ENTRY_EVENT, type EngineEntryDetail } from "@/lib/analytics/goatcounter";
import { GAME_ENTRY_EVENT, type GameEntryDetail } from "@/lib/game/events";
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

/**
 * The detail each race counts its clicks with. Typed against both closed
 * lists (the game's and the engine's), so a detail `/admin/stats` cannot
 * read does not compile.
 */
const PILL_DETAIL = {
  band: "space_band",
  compact: "space_band_compact",
} as const satisfies Record<SpaceRaceVariant, GameEntryDetail & EngineEntryDetail>;

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

/** Where a race is drawn: in the band (today's), or in the compact header's one line (design system extension 08). */
export type SpaceRaceVariant = "band" | "compact";

export interface SpaceRaceProps {
  locale: Locale;
  /** The leg you are on: filled, never a link (`aria-current="page"`). */
  space: Space;
  /** Whether the other legs' pills are links. `false` in the quiz and the Deep dive — see `SpaceBandProps.linked`. */
  linked?: boolean;
  /** Which spaces are open. Defaults to what the build saw; previews and tests pass their own. */
  open?: Partial<Record<Space, boolean>>;
  /**
   * `band` (default): today's race, on the band's colour. `compact`: the same
   * three pills on the compact header's paper — this leg filled in its
   * space's colour with its pictogram and short name, the others their
   * number (their names stay for screen readers), a closed one greyed and
   * dashed. Its links are out of the Tab order: a keyboard user who reaches
   * the header gets the full header back, and the band's race with it.
   */
  variant?: SpaceRaceVariant;
  /** A class from the component that places the race (SiteHeader places the compact one). */
  className?: string;
}

/**
 * The race: three legs, in the order the race runs them, this one filled, a
 * closed one greyed, dashed and « bientôt », never a link (Antoine,
 * 2026-09-28). Drawn twice by `SiteHeader` on a page with a space: in the
 * band, and in the compact header's line (design system extension 08) —
 * only one of the two is ever exposed, the other being `visibility: hidden`.
 *
 * The compact race's clicks count apart, as `space_band_compact` (Antoine,
 * 2026-10-02): `/admin/stats` can then say whether anyone uses it.
 */
export function SpaceRace({ locale, space, linked = true, open, variant = "band", className }: SpaceRaceProps) {
  const isOpen = (s: Space) => s === space || (open?.[s] ?? SPACE_OPEN_AT_BUILD[s]);
  const compact = variant === "compact";
  const navClass = [styles.race, compact && styles.raceCompact, className].filter(Boolean).join(" ");

  return (
    <nav
      className={navClass}
      aria-label={tc(SPACE_STRINGS.race, locale)}
      data-space={compact ? space : undefined}
      data-race={variant}
    >
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
          const tabIndex = compact ? -1 : undefined;
          return (
            <li key={s} className={styles.stop} data-state={state} data-stop={s}>
              {state === "current" ? (
                <span className={styles.pill} aria-current="page">
                  {body}
                </span>
              ) : state === "open" && linked ? (
                PILL_EVENT[s] ? (
                  <TrackedLink
                    className={styles.pill}
                    href={localePath(locale, HOME[s])}
                    event={PILL_EVENT[s]}
                    detail={PILL_DETAIL[variant]}
                    tabIndex={tabIndex}
                  >
                    {body}
                  </TrackedLink>
                ) : (
                  <a className={styles.pill} href={localePath(locale, HOME[s])} tabIndex={tabIndex}>
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
  );
}

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
 * state: it renders the same in a Server Component and in the quiz. Its race
 * is `SpaceRace`, which the compact header also draws (extension 08).
 */
export function SpaceBand({ locale, space, linked = true, width = "wide", open }: SpaceBandProps) {
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
        <SpaceRace locale={locale} space={space} linked={linked} open={open} />
      </div>
    </div>
  );
}
