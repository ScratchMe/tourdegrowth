import { CookiePill, NightSurface } from "tour-de-growth";

/*
 * "Refusing cookies: 1 click", under Quandi's phone — the activation level's
 * "N clicks to cancel": how many clicks it takes to refuse the cookies. A
 * measurable fact the CNIL frames, never a judgement. With the refusal buried
 * behind "Customise", the pill says WHY it is a problem in words; the red only
 * repeats them. The game decides every prop (`cookieRefusal` in
 * lib/game/planner-phone.ts). Drawn with ClickPill's own styles: one object,
 * every level.
 */

const EN = {
  easy: "Refusing cookies: 1 click",
  hidden: "Refusing cookies: 3 clicks",
  lawSuffix: "refusing must be as easy as agreeing",
};

const FR = {
  easy: "Refuser les cookies\u00a0: 1 clic",
  hidden: "Refuser les cookies\u00a0: 3 clics",
  lawSuffix: "le refus doit être aussi simple que l'accord",
};

const col = { padding: 20, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12 } as const;

/** The two things the pill can say: one click, and three with the refusal buried. */
export const States = () => (
  <NightSurface as="div" style={col}>
    <CookiePill clicks={1} alert={false} labels={EN} />
    <CookiePill clicks={3} alert labels={EN} />
  </NightSurface>
);

/** French runs longer; on a phone the pill wraps rather than overflowing the sticky bar. */
export const French = () => (
  <NightSurface as="div" style={{ ...col, maxWidth: 300 }}>
    <CookiePill clicks={1} alert={false} labels={FR} />
    <CookiePill clicks={3} alert labels={FR} />
  </NightSurface>
);

/** `sm` — the same words, smaller type, for the sticky action bar on a phone. */
export const Small = () => (
  <NightSurface as="div" style={col}>
    <CookiePill size="sm" clicks={1} alert={false} labels={EN} />
    <CookiePill size="sm" clicks={3} alert labels={EN} />
  </NightSurface>
);
