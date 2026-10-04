import { BulletChart, NightSurface, StatTile } from "tour-de-growth";

/*
 * One figure, its label, and what it did since last time. Three states, and
 * the component's type is a union that keeps them apart: a hidden tile does
 * not even accept a `value`.
 *
 * Every tile is one the product draws, with its strings as it prints them:
 * the game's dashboard (`components/game/Dashboard.tsx`; December's
 * `RevealCells` is the only other caller), from `dashboardProps`
 * (game/_island/island-view.ts) on the reference paths of
 * `lib/game/__tests__/paths.ts`, played through the reducer and formatted
 * by `lib/game/format.ts`.
 *
 * The growth engine drew tiles until A20.d T3.b (#313) turned its « what if »
 * tiles into WhatIfFigures' tables. Since then no product call site draws
 * the unknown state (`value={null}` with `unknownLabel`, a long dash, and a
 * hatched meter when `bar.value` is null) nor a `neutral` delta, so no card
 * shows them: the contract keeps both, for the next caller.
 */

const row = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, maxWidth: 720 } as const;

/**
 * Known: the caller's formatted string, a signed delta that also says it in words, a sub line.
 * The delta is green when it is good news and red when it is bad; the direction alone decides
 * nothing (a churn going down is good). The game's dashboard at the end of March on reference
 * path M (`dashboardProps`, its deltas against the start of the quarter, `lastQuarterStart`):
 * churn down 0.6 points (good), subscribers and revenue down (bad). The dashboard sets churn
 * as its stencil hero with a bullet (see `Sizes` and `WithBullet`); here it sits at the size
 * of the others.
 */
export const Known = () => (
  <div style={row}>
    <StatTile
      size="auto"
      label={"Churn · per month"}
      value={"5.4%"}
      delta={{ text: "−0.6 pts this quarter", direction: "down", sentiment: "good" }}
      sub={"quarter target: 5.1%"}
    />
    <StatTile
      size="auto"
      label={"Subscribers"}
      value={"99,158"}
      delta={{ text: "−842 this quarter", direction: "down", sentiment: "bad" }}
      sub={"March, end of month"}
    />
    <StatTile
      size="auto"
      label={"Monthly revenue"}
      value={"€1.29M"}
      delta={{ text: "−€0.01M this quarter", direction: "down", sentiment: "bad" }}
      sub={"−€0.01M vs January"}
    />
  </div>
);

/**
 * Hidden: no value anywhere in the DOM. The blurred shapes say "there is a
 * number here"; the sharp label says why you cannot read it. The game's two
 * secret tiles, in French, as they sit on its dashboard until December.
 */
export const Hidden = () => (
  <NightSurface as="div" style={{ padding: 20 }}>
    <div style={row}>
      <StatTile
        size="auto"
        label="Confiance des abonnés"
        hidden
        hiddenLabel="pas sur ton dashboard"
        hiddenNote="Masquée jusqu'en décembre"
      />
      <StatTile
        size="auto"
        label="Radar DGCCRF"
        hidden
        hiddenLabel="pas sur ton dashboard"
        hiddenNote="Masquée jusqu'en décembre"
      />
    </div>
  </NightSurface>
);

/**
 * A meter under the figure. `good` and `bad` colour the fill, but the words
 * carry the meaning ("at breaking point"): colour only repeats them. The
 * CEO's patience at the end of March on path M (67, good) and at the end of
 * June on path B (31, under the low line of 35, bad); subscriber trust
 * revealed in December on path A, whose meter the game leaves neutral.
 */
export const WithMeter = () => (
  <NightSurface as="div" style={{ padding: 20 }}>
    <div style={row}>
      <StatTile
        size="auto"
        label="CEO's patience"
        value="67"
        delta={{ text: "+12 this quarter", direction: "up", sentiment: "good" }}
        bar={{ value: 67, tone: "good" }}
      />
      <StatTile
        size="auto"
        label="CEO's patience"
        value="31"
        delta={{ text: "−20 this quarter", direction: "down", sentiment: "bad" }}
        bar={{ value: 31, tone: "bad" }}
        sub="at breaking point"
      />
      <StatTile
        size="auto"
        label="Subscriber trust"
        value="83"
        bar={{ value: 83, tone: "neutral" }}
        sub="revealed in December"
      />
    </div>
  </NightSurface>
);

/**
 * A `BulletChart` at `sm` as the tile's child — a value against its target,
 * never a second number. The game's churn tile on 1 January, in French:
 * 6,0 % against the first quarter's 5,6 %, on the dashboard's 2–9 % track.
 */
export const WithBullet = () => (
  <div style={{ maxWidth: 300 }}>
    <StatTile size="lg" label="Résiliations · par mois" value="6,0 %" sub="objectif du trimestre : 5,6 %">
      <BulletChart
        value={0.06}
        target={0.056}
        domain={[0.02, 0.09]}
        ariaLabel="Résiliations 6,0 %, objectif du trimestre : 5,6 %"
      />
    </StatTile>
  </div>
);

/**
 * `hero` is the stencil figure — one per dashboard, like the score numeral —
 * and shrinks below 760px on its own. `md` and `sm` are mono. The
 * game's churn tile in December on path A.
 */
export const Sizes = () => (
  <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
    <StatTile size="lg" label="Churn · per month" value="4.0%" sub="board target: 4.0%" />
    <StatTile size="md" label="Churn · per month" value="4.0%" sub="board target: 4.0%" />
    <StatTile size="sm" label="Churn · per month" value="4.0%" sub="board target: 4.0%" />
  </div>
);
