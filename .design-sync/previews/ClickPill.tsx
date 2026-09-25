import { ClickPill, NightSurface } from "tour-de-growth";

/*
 * "2 clicks to cancel", under the phone — the number the dark patterns push
 * up while the reader ticks cards. Past three, or with the phone, the pill
 * says WHY it is a problem in words; the red only repeats them. The game
 * decides `overLaw`, the component never re-derives it. It is the one
 * `aria-live` of the phone: the count is the change a screen-reader user
 * needs to hear when ticking a card.
 */

const EN = {
  count: "{n} clicks to cancel",
  infinite: "∞ clicks to cancel",
  lawSuffix: "the law expects a direct path",
  phoneSuffix: "you have to call",
};

const FR = {
  count: "{n} clics pour résilier",
  infinite: "∞ clics pour résilier",
  lawSuffix: "la loi attend un parcours direct",
  phoneSuffix: "il faut téléphoner",
};

const col = { padding: 20, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12 } as const;

/** Within the law, past it, and the phone — the three things the pill can say. */
export const States = () => (
  <NightSurface as="div" style={col}>
    <ClickPill clicks={2} overLaw={false} labels={EN} />
    <ClickPill clicks={6} overLaw labels={EN} />
    <ClickPill clicks="phone" overLaw labels={EN} />
  </NightSurface>
);

/** French runs longer; on a phone the pill wraps rather than overflowing the sticky bar. */
export const French = () => (
  <NightSurface as="div" style={{ ...col, maxWidth: 300 }}>
    <ClickPill clicks={3} overLaw={false} labels={FR} />
    <ClickPill clicks={5} overLaw labels={FR} />
    <ClickPill clicks="phone" overLaw labels={FR} />
  </NightSurface>
);

/** `compact` — the same words, smaller type, for the sticky action bar on a phone. */
export const Compact = () => (
  <NightSurface as="div" style={col}>
    <ClickPill size="compact" clicks={2} overLaw={false} labels={EN} />
    <ClickPill size="compact" clicks={6} overLaw labels={EN} />
  </NightSurface>
);
