import { HubMountain, NightSurface } from "tour-de-growth";

/*
 * The game hub's mountain — design I + B, retained by Antoine on 2026-09-28.
 * « Le côté obscur » is the race's mountain leg, and the hub's intro is a
 * night poster: five cols for the five zones, the one you can play filled in
 * the game's ochre and flagged with its number, the others tagged with
 * theirs, an amber moon over the first.
 *
 * The heights are a drawing, not a measure — the legend never says what a
 * height means, and nothing on the hub is scored. The whole figure is
 * aria-hidden: the zone list under it says in words which zone is open. It
 * reads the night world's tokens, so it lives inside `data-world="night"`
 * (here a `NightSurface`; on the hub, `ProsePage introWorld="night"`).
 * Copy: `GAME_HUB.mountain`.
 */

const pad = { padding: "8px 24px 24px" } as const;
const zones = (open: number[]) => [0, 1, 2, 3, 4].map((i) => ({ open: open.includes(i) }));

/** Today: retention, the third zone, is the one level you can play. */
export const OneOpen = () => (
  <NightSurface as="div" style={{ ...pad, width: 760 }}>
    <HubMountain zones={zones([2])} title="Profil de la montagne" legend="cinq cols, cinq entreprises" />
  </NightSurface>
);

/** Two levels open: two flags, each carrying its zone's number. */
export const TwoOpen = () => (
  <NightSurface as="div" style={{ ...pad, width: 760 }}>
    <HubMountain zones={zones([0, 2])} title="Mountain profile" legend="five climbs, five companies" />
  </NightSurface>
);

/** A phone: the plot lower, the moon smaller. */
export const Phone = () => (
  <NightSurface as="div" style={{ ...pad, width: 390 }}>
    <HubMountain zones={zones([2])} title="Profil de la montagne" legend="cinq cols, cinq entreprises" />
  </NightSurface>
);
