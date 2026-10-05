import { NightSurface, SentPill } from "tour-de-growth";

/*
 * "214 messages sent in Thomas's name · messages he didn't write", under
 * Partix's phone — the referral level's "N clicks to cancel": how many
 * messages went out in Thomas's name without his writing them. A measurable
 * fact the law frames (marketing by message without consent), never a
 * judgement. Once any went out, the pill says so in words and turns to the
 * alert colour, which only repeats them. The game decides every prop
 * (`sentInYourName` in lib/game/split-phone.ts); `count` arrives already
 * formatted. Drawn with ClickPill's own styles: one object, every level.
 */

const EN = {
  none: "0 messages sent in Thomas's name",
  some: "{n} messages sent in Thomas's name",
  suffix: "messages he didn't write",
};

const FR = {
  none: "0 message envoyé au nom de Thomas",
  some: "{n} messages envoyés au nom de Thomas",
  suffix: "des messages qu'il n'a pas écrits",
};

const col = { padding: 20, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12 } as const;

/** What the pill can say: nothing went out, then 214 (one message each), 642 (an invitation and two follow-ups each), 856 (both). */
export const States = () => (
  <NightSurface as="div" style={col}>
    <SentPill count="0" alert={false} labels={EN} />
    <SentPill count="214" alert labels={EN} />
    <SentPill count="642" alert labels={EN} />
    <SentPill count="856" alert labels={EN} />
  </NightSurface>
);

/** French runs longer; on a phone the pill wraps rather than overflowing the sticky bar. */
export const French = () => (
  <NightSurface as="div" style={{ ...col, maxWidth: 300 }}>
    <SentPill count="0" alert={false} labels={FR} />
    <SentPill count="856" alert labels={FR} />
  </NightSurface>
);

/** `sm` — the same words, smaller type, for the sticky action bar on a phone. */
export const Small = () => (
  <NightSurface as="div" style={col}>
    <SentPill size="sm" count="0" alert={false} labels={EN} />
    <SentPill size="sm" count="856" alert labels={EN} />
  </NightSurface>
);
