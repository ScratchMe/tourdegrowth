import { Card, MetaLabel } from "tour-de-growth";

/*
 * Card is the only surface in the system. Everything that looks like a panel
 * is this component with a different `elevation` / `tone` — so the two props
 * below are the whole vocabulary, and a new "card-like" thing is almost
 * always one of these rather than a new component.
 */

const body = { margin: "6px 0 0", font: "15px/1.45 Inter, sans-serif" } as const;

/**
 * `raised` is the 7px drop shadow and there is AT MOST ONE per screen — the
 * score card on a result, the question card in the quiz. `panel` is the 5px
 * popover weight. `flat` carries no shadow at all.
 */
export const Elevations = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 380 }}>
    <Card elevation="raised">
      <MetaLabel size="xs">raised</MetaLabel>
      <p style={body}>One per screen. The thing the page is about.</p>
    </Card>
    <Card elevation="panel">
      <MetaLabel size="xs">panel</MetaLabel>
      <p style={body}>Popovers and secondary surfaces.</p>
    </Card>
    <Card elevation="flat">
      <MetaLabel size="xs">flat</MetaLabel>
      <p style={body}>No shadow — grouping only.</p>
    </Card>
  </div>
);

/**
 * `alert` is the red wash used for a weak pillar's insight; `outlineAlert` is
 * dashed red on plain paper and is what advice looks like — the Next move
 * card and the locked upgrade slot both use it. `sunken` recesses an example.
 */
export const Tones = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 380 }}>
    <Card tone="paper">
      <MetaLabel size="xs">paper</MetaLabel>
      <p style={body}>The default ground.</p>
    </Card>
    <Card tone="sunken">
      <MetaLabel size="xs">sunken</MetaLabel>
      <p style={body}>A recessed worked example.</p>
    </Card>
    <Card tone="alert">
      <MetaLabel size="xs" tone="alert">alert</MetaLabel>
      <p style={body}>Red wash — a diagnosis, not an error.</p>
    </Card>
    <Card tone="outlineAlert">
      <MetaLabel size="xs" tone="alert">outlineAlert</MetaLabel>
      <p style={body}>Dashed red on paper — this is what advice looks like.</p>
    </Card>
  </div>
);

/** `padding` takes a raw CSS value; the default is 26px 30px, 20px on mobile. */
export const Padding = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 380 }}>
    <Card elevation="panel">
      <p style={{ ...body, marginTop: 0 }}>Default padding.</p>
    </Card>
    <Card elevation="panel" padding="14px 16px">
      <p style={{ ...body, marginTop: 0 }}>Tightened to 14px 16px.</p>
    </Card>
  </div>
);
