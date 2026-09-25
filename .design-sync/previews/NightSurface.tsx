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
 */

const pad = { padding: 24, display: "flex", flexDirection: "column", gap: 16 } as const;

/** The same components as on paper, unchanged: the world rebinds the tokens they read. */
export const SameComponents = () => (
  <NightSurface as="div" style={pad}>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Tag tone="neutral">Quarter 2</Tag>
      <Tag tone="outline">April to June</Tag>
      <Tag tone="ink">hit</Tag>
    </div>
    <Card elevation="panel" padding="16px 18px">
      <p style={{ margin: 0 }}>Three months are about to pass. Watch the numbers.</p>
    </Card>
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <Button>Run the quarter</Button>
      <Button variant="secondary">Leave the call</Button>
    </div>
  </NightSurface>
);

/** A dashboard row at night: one hidden tile among known ones. */
export const DashboardRow = () => (
  <NightSurface as="div" style={pad}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12 }}>
      <StatTile label="Résiliations" value="5,4 %" sub="objectif du trimestre : 5,6 %" />
      <StatTile label="Abonnés" value="104 210" sub="mars, fin de mois" />
      <StatTile label="Confiance des abonnés" hidden hiddenLabel="pas sur ton dashboard" hiddenNote="Masquée jusqu'en décembre" />
    </div>
  </NightSurface>
);

/** Paper nested inside the night: a clipping keeps its own ground and ink. */
export const PaperInside = () => (
  <NightSurface as="div" style={pad}>
    <p style={{ margin: 0 }}>Your dashboard said churn was under target. The outside world printed this.</p>
    <div style={{ maxWidth: 420 }}>
      <EventClipping
        kind="reports"
        masthead="SignalConso"
        headline="Complaints against Flixo pile up"
        text="Dozens of complaints on SignalConso, the French government's consumer reporting site. A journalist is asking the press office questions."
      />
    </div>
  </NightSurface>
);
