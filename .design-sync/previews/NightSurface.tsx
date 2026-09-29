import { Button, Card, EventClipping, NightSurface, StatTile, Tag } from "tour-de-growth";

/*
 * The night world is an attribute on a container, never a component
 * variant: `<section data-world="night">` painting its own ground and text
 * colour, and nothing else — no padding, no width. Everything inside reads
 * the same semantic tokens as on paper, now bound to night values, so there
 * is no "dark Button" to reach for.
 *
 * Paper can come back inside it (`data-world="paper"`): the game's press
 * clippings are paper on purpose, because the outside world shows the cost
 * the dashboard hides.
 *
 * Copy: content/game/retention.ts. Numbers: states played through the
 * reducer (lib/game/__tests__/paths.ts), formatted by lib/game/format.ts.
 */

const pad = { padding: 24, display: "flex", flexDirection: "column", gap: 16 } as const;

/**
 * The same components as on paper, unchanged: the world rebinds the tokens
 * they read. The strings are the game's own (timeline, hand, resume prompt),
 * put side by side here only to show the tokens.
 */
export const SameComponents = () => (
  <NightSurface as="div" style={pad}>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Tag tone="neutral">Q2</Tag>
      <Tag tone="outline">Apr–Jun</Tag>
      <Tag tone="ink">hit</Tag>
    </div>
    <Card elevation="panel" padding="16px 18px">
      <p style={{ margin: 0 }}>{"The team is fully booked for the quarter. Three months are about to pass: watch the numbers."}</p>
    </Card>
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <Button>{"Run the quarter"}</Button>
      <Button variant="secondary">{"Start over"}</Button>
    </div>
  </NightSurface>
);

/**
 * A dashboard row at night, in French, as it stands after a first quarter
 * that hit its target (paths.ts PATH_M): two known tiles with what they did
 * this quarter, and subscriber trust hidden among them.
 */
export const DashboardRow = () => (
  <NightSurface as="div" style={pad}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12 }}>
      <StatTile
        label={"Résiliations · par mois"}
        value={"5,4 %"}
        sub={"objectif du trimestre : 5,1 %"}
        delta={{ text: "−0,6 pt ce trimestre", direction: "down", sentiment: "good" }}
      />
      <StatTile
        label={"Abonnés"}
        value={"99 158"}
        sub={"mars, fin de mois"}
        delta={{ text: "−842 ce trimestre", direction: "down", sentiment: "bad" }}
      />
      <StatTile label={"Confiance des abonnés"} hidden hiddenLabel={"pas sur ton dashboard"} hiddenNote={"Masquée jusqu'en décembre"} />
    </div>
  </NightSurface>
);

/**
 * Paper nested inside the night: the complaints clipping of a real second
 * quarter (paths.ts PATH_C) keeps its own ground and ink, its "What it
 * signals" note included.
 */
export const PaperInside = () => (
  <NightSurface as="div" style={pad}>
    <p style={{ margin: 0 }}>{"Meanwhile, outside"}</p>
    <div style={{ maxWidth: 480 }}>
      <EventClipping
        kind="reports"
        masthead={"SignalConso"}
        headline={"Complaints against Flixo pile up"}
        text={"Dozens of complaints on SignalConso, the French government's consumer reporting site. A journalist is asking the press office questions."}
        why={{ heading: "What it signals", lines: ["The authorities read SignalConso: your regulator radar, the hidden tile on your dashboard, is nearing the inspection threshold. Every new trick brings it closer."] }}
      />
    </div>
  </NightSurface>
);
