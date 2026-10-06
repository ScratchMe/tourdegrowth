import { ChargePill, NightSurface } from "tour-de-growth";

/*
 * "Charged when the trial ends: €59.99 · with no reminder before the charge",
 * under Gainix's phone — the revenue level's "N clicks to cancel": what the
 * end of the trial will charge, and whether anything announces it. A
 * measurable fact, never a judgement: no French text requires a reminder
 * before a trial ends, so the coral says a problem, never a law. With a trial
 * that charges with no reminder, or an option ticked in advance, the pill says
 * so in words and turns to the alert colour, which only repeats them. The game
 * decides every prop (`trialCharge` in lib/game/fit-phone.ts); `amount`
 * arrives already formatted. Drawn with ClickPill's own styles: one object,
 * every level.
 */

const EN = {
  amount: "Charged when the trial ends: {amount}",
  silentSuffix: "with no reminder before the charge",
  addonSuffix: "including an add-on ticked in advance",
};

const FR = {
  amount: "Prélevé à la fin de l'essai\u00a0: {amount}",
  silentSuffix: "sans rappel avant le prélèvement",
  addonSuffix: "dont une option cochée d'avance",
};

const col = { padding: 20, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12 } as const;

/** What the pill can say in English: the plain 7-day trial, a silent 14-day one, an add-on ticked in advance, both. */
export const States = () => (
  <NightSurface as="div" style={col}>
    <ChargePill amount="€7.99" silent={false} addon={false} labels={EN} />
    <ChargePill amount="€59.99" silent addon={false} labels={EN} />
    <ChargePill amount="€10.98" silent={false} addon labels={EN} />
    <ChargePill amount="€62.98" silent addon labels={EN} />
  </NightSurface>
);

/** French runs longer; on a phone the pill wraps rather than overflowing the sticky bar. */
export const French = () => (
  <NightSurface as="div" style={{ ...col, maxWidth: 300 }}>
    <ChargePill amount="7,99\u00a0€" silent={false} addon={false} labels={FR} />
    <ChargePill amount="62,98\u00a0€" silent addon labels={FR} />
  </NightSurface>
);

/** `sm` — the same words, smaller type, for the sticky action bar on a phone. */
export const Small = () => (
  <NightSurface as="div" style={col}>
    <ChargePill size="sm" amount="€7.99" silent={false} addon={false} labels={EN} />
    <ChargePill size="sm" amount="€62.98" silent addon labels={EN} />
  </NightSurface>
);
