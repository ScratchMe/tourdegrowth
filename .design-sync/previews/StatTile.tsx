import { BulletChart, NightSurface, StatTile } from "tour-de-growth";

/*
 * One figure, its label, and what it did since last time. Three states, and
 * the component's type is a union that keeps them apart: a hidden tile does
 * not even accept a `value`.
 *
 * Copy and numbers are the game's own (content/game/retention.ts): the
 * dashboard of the retention level, at the end of the first quarter.
 */

const row = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, maxWidth: 720 } as const;

/** Known: the caller's formatted string, a signed delta that also says it in a word, a sub line. */
export const Known = () => (
  <div style={row}>
    <StatTile
      label="Churn"
      value="5.4%"
      delta={{ text: "−0.6 pts · better", direction: "down", sentiment: "good" }}
      sub="quarter target: 5.6%"
    />
    <StatTile
      label="Monthly revenue"
      value="€1.27M"
      delta={{ text: "−2.1% vs January", direction: "down", sentiment: "bad" }}
      sub="March, end of month"
    />
    <StatTile label="Subscribers" value="104,210" delta={{ text: "±0 · flat", direction: "flat" }} sub="March, end of month" />
  </div>
);

/**
 * Unknown: `value={null}` — a long dash and a "not measured" word, never a
 * zero. With a meter, the track is hatched: an empty bar would read as zero.
 */
export const Unknown = () => (
  <div style={row}>
    <StatTile label="Activation rate" value={null} unknownLabel="not measured" sub="no activation event defined" />
    <StatTile label="Taux d'activation" value={null} unknownLabel="non mesuré" bar={{ value: null, tone: "neutral" }} />
  </div>
);

/**
 * Hidden: no value anywhere in the DOM. The blurred shapes say "there is a
 * number here"; the sharp label says why you cannot read it. Night world,
 * because that is where hidden tiles live — the CEO's dashboard.
 */
export const Hidden = () => (
  <NightSurface as="div" style={{ padding: 20 }}>
    <div style={row}>
      <StatTile
        label="Subscriber trust"
        hidden
        hiddenLabel="not on your dashboard"
        hiddenNote="Hidden until December"
      />
      <StatTile label="Radar DGCCRF" hidden hiddenLabel="pas sur ton dashboard" hiddenNote="Masquée jusqu'en décembre" />
    </div>
  </NightSurface>
);

/**
 * A meter under the figure. `bad` colours the fill, but the words carry the
 * meaning ("at breaking point"): colour only repeats them.
 */
export const WithMeter = () => (
  <NightSurface as="div" style={{ padding: 20 }}>
    <div style={row}>
      <StatTile label="CEO's patience" value="72" bar={{ value: 72, tone: "neutral" }} sub="out of 100" />
      <StatTile label="CEO's patience" value="31" bar={{ value: 31, tone: "bad" }} sub="at breaking point" />
      <StatTile label="Confiance des abonnés" value="64" bar={{ value: 64, tone: "good" }} sub="révélée en décembre" />
    </div>
  </NightSurface>
);

/** A mini `BulletChart` as the tile's child — a value against its target, never a second number. */
export const WithBullet = () => (
  <div style={{ maxWidth: 260 }}>
    <StatTile label="Résiliations" value="6,0 %" sub="objectif du trimestre : 5,6 %">
      <BulletChart value={6} target={5.6} domain={[0, 8]} ariaLabel="Résiliations 6,0 %, objectif 5,6 % : au-dessus" />
    </StatTile>
  </div>
);

/**
 * `hero` is the stencil figure — one per dashboard, like the score numeral —
 * and shrinks below 760px on its own. `md` and `compact` are mono.
 */
export const Sizes = () => (
  <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
    <StatTile size="hero" label="Churn" value="4.1%" sub="board target: 4%" />
    <StatTile size="md" label="Churn" value="4.1%" sub="board target: 4%" />
    <StatTile size="compact" label="Churn" value="4.1%" sub="board target: 4%" />
  </div>
);
