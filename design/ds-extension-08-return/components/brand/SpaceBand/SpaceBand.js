// SpaceBand — design system extension 08. The band is unchanged; its race is
// now its own export, `SpaceRace`, so the compact header can carry the race
// in its one line (SiteHeader). Plain React, no JSX, so the board runs this
// very file without a build.
import React from "react";
import { SPACE_STRINGS, tc, localePath, TrackedLink, SPACE_OPEN_AT_BUILD, SPACE_HOME, SPACE_EVENT } from "tour-de-growth/space";

const h = React.createElement;

export const SPACES = ["tour", "engine", "game"];

// The three pictograms, 34 × 22, unchanged (space-pictos).
export const SPACE_PICTO = {
  tour: h("svg", { viewBox: "0 0 34 22", "aria-hidden": "true", focusable: "false" },
    h("path", { d: "M1 20.5H33", stroke: "currentColor", strokeWidth: "2.2", fill: "none" }),
    h("path", { d: "M1 19V15.2C5 14.2 8 15.6 12 14.8S20 13.9 24 14.6 30 14.2 33 14.4V19Z", fill: "currentColor" }),
    h("path", { d: "M28.6 14V4.2", stroke: "currentColor", strokeWidth: "1.8" }),
    h("path", { d: "M28.6 4.4H33V8.6H28.6Z", fill: "currentColor" })),
  engine: h("svg", { viewBox: "0 0 34 22", "aria-hidden": "true", focusable: "false" },
    h("circle", { cx: "17", cy: "12.6", r: "7.6", fill: "none", stroke: "currentColor", strokeWidth: "2.2" }),
    h("path", { d: "M17 12.6V7.8M14.2 2.2H19.8M17 2.2V5", stroke: "currentColor", strokeWidth: "2.2", fill: "none" }),
    h("path", { d: "M23.2 6.4L25 4.6", stroke: "currentColor", strokeWidth: "2.2" }),
    h("path", { d: "M1 9.5H7M3 13H7.5M1 16.5H7", stroke: "currentColor", strokeWidth: "1.8" })),
  game: h("svg", { viewBox: "0 0 34 22", "aria-hidden": "true", focusable: "false" },
    h("path", { d: "M1 20.5H33", stroke: "currentColor", strokeWidth: "2.2", fill: "none" }),
    h("path", { d: "M1 19.4L10.4 9.2L14 12.6L20.6 3.2L33 19.4Z", fill: "currentColor" })),
};

/**
 * The race: three legs, this one filled, a closed one greyed, dashed and
 * « bientôt », never a link (Antoine, 2026-09-28).
 *
 * variant "band"    — today's race, on the band's colour (unchanged markup).
 * variant "compact" — the same three pills on the compact header's paper:
 *                     the current leg keeps its pictogram and short name, in
 *                     the space's colour; the others show their number (the
 *                     name is still there, for screen readers). Its links
 *                     are out of the Tab order: a keyboard user who reaches
 *                     the header gets the full header back, and the band's
 *                     race with it (SiteHeader, mechanic 6).
 */
export const SpaceRace = ({ locale, space, linked = true, open, variant = "band", hidden }) => {
  const isOpen = (s) => s === space || (open?.[s] ?? SPACE_OPEN_AT_BUILD[s]);
  const compact = variant === "compact";
  return h("nav", {
    className: compact ? "SpaceBand_race SpaceBand_raceCompact" : "SpaceBand_race",
    "aria-label": tc(SPACE_STRINGS.race, locale),
    "data-space": compact ? space : undefined,
    "data-header-part": compact ? "race" : undefined,
    hidden,
  },
    h("ol", { className: "SpaceBand_stops" },
      SPACES.map((s, i) => {
        const state = s === space ? "current" : isOpen(s) ? "open" : "soon";
        const body = [
          h("span", { key: "m", className: "SpaceBand_mini" }, SPACE_PICTO[s]),
          h("span", { key: "n", className: "SpaceBand_n" }, i + 1),
          h("span", { key: "l", className: "SpaceBand_label" }, tc(SPACE_STRINGS.short[s], locale)),
          state === "soon" ? h("span", { key: "s", className: "SpaceBand_soon" }, tc(SPACE_STRINGS.soon, locale)) : null,
        ];
        let pill;
        if (state === "current") {
          pill = h("span", { className: "hit_strip SpaceBand_pill", "aria-current": "page" }, body);
        } else if (state === "open" && linked) {
          // As today: a TrackedLink where the leg has an entry event (the
          // engine, the game), a plain link otherwise. The compact race's
          // links leave the Tab order and say where the click came from.
          const props = {
            className: "hit_strip SpaceBand_pill",
            href: localePath(locale, SPACE_HOME[s]),
            tabIndex: compact ? -1 : undefined,
          };
          pill = SPACE_EVENT[s]
            ? h(TrackedLink, { ...props, event: SPACE_EVENT[s], detail: compact ? "space_band_compact" : "space_band" }, body)
            : h("a", props, body);
        } else {
          pill = h("span", { className: "hit_strip SpaceBand_pill" }, body);
        }
        return h("li", { key: s, className: "SpaceBand_stop", "data-state": state, "data-stop": s }, pill);
      })));
};

/**
 * The band, unchanged: pictogram, place and kind, name, and the race.
 * Server-safe and free of state.
 */
export const SpaceBand = ({ locale, space, linked = true, width = "wide", open }) => {
  const n = SPACES.indexOf(space) + 1;
  return h("div", { className: "SpaceBand_band", "data-space": space, "data-testid": "space-band" },
    h("div", { className: `SpaceBand_inner SpaceBand_${width}` },
      h("span", { className: "SpaceBand_picto" }, SPACE_PICTO[space]),
      h("p", { className: "SpaceBand_where" },
        h("span", { className: "SpaceBand_kicker" }, `${n}/${SPACES.length} · ${tc(SPACE_STRINGS.kind[space], locale)}`),
        h("span", { className: "SpaceBand_name" }, tc(SPACE_STRINGS.name[space], locale))),
      h(SpaceRace, { locale, space, linked, open, variant: "band" })));
};
