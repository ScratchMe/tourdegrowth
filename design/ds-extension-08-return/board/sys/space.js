import React from "react";
// "tour-de-growth/space" on the board: what SpaceBand imports from the app
// (src/lib/i18n/space-strings.ts, translatable.ts, localePath, the analytics'
// trackEvent and the build's open spaces). Copied from _ds_bundle.js; the
// strings are still "to be reviewed" there. Not ported.
export const SPACE_STRINGS = {
  kind: {
    tour: { fr: "Plaine", en: "Flat" },
    engine: { fr: "Contre-la-montre", en: "Time trial" },
    game: { fr: "Montagne", en: "Mountain" },
  },
  name: {
    tour: { fr: "Le diagnostic", en: "The check-up" },
    engine: { fr: "Le moteur", en: "The engine" },
    game: { fr: "Le côté obscur", en: "The dark side" },
  },
  short: {
    tour: { fr: "Diagnostic", en: "Check-up" },
    engine: { fr: "Moteur", en: "Engine" },
    game: { fr: "Côté obscur", en: "Dark side" },
  },
  soon: { fr: "bientôt", en: "soon" },
  race: { fr: "Le Tour en trois parties", en: "The Tour in three parts" },
};

export const tc = (entry, locale) => entry[locale] ?? entry.fr;

export const localePath = (locale, path = "/") =>
  path === "/" || path === "" ? `/${locale}` : `/${locale}${path.startsWith("/") ? path : `/${path}`}`;

// The board counts nothing.
export const trackEvent = () => {};

// TrackedLink ("use client" in the app): a link that tracks its click.
// The board's copy does the same, with a no-op trackEvent.
export const TrackedLink = ({ event, detail, children, ...rest }) =>
  React.createElement("a", { ...rest, onClick: () => trackEvent(event, detail) }, children);

// "The engine and the game open, as they will be at launch" (the brief's
// screenshots). The board's ?closed=game shows a closed leg.
const closed = new URLSearchParams(location.search).get("closed");
export const SPACE_OPEN_AT_BUILD = { tour: true, engine: closed !== "engine", game: closed !== "game" };

export const SPACE_HOME = { tour: "/", engine: "/aarrr-funnel-template", game: "/game" };
export const SPACE_EVENT = { engine: "engine_entry_clicked", game: "game_entry_clicked" };
