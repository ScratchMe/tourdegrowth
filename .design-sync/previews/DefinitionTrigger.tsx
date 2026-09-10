import { DefinitionTrigger, PillarChip } from "tour-de-growth";

/*
 * The "?" that opens a definition. On its own it is deliberately tiny — it
 * has to sit inside a line of question copy or inside a pillar chip without
 * pushing anything around, so it is sized to the text it interrupts.
 *
 * It does not own the popover. Whether one is open is the caller's state
 * (one at a time per screen) — see GlossaryTerm for the two of them wired
 * together, which is how the product always uses it.
 */

const line = { font: "17px/1.5 Inter, sans-serif", margin: 0 } as const;

/** Inline in a sentence, which is where six of the fifteen questions put it. */
export const Inline = () => (
  <p style={line}>
    Have you defined a specific "aha" moment <DefinitionTrigger term="aha moment" /> for new users?
  </p>
);

/*
 * `open` drives aria-expanded and a darker border, so the trigger shows it is
 * the one talking. The whole difference is a border/colour shift on a 16px
 * glyph, which is invisible unless the two states sit side by side — so they
 * do. (For the trigger together with the panel it opens, see GlossaryTerm.)
 */
export const Open = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    <p style={line}>
      Closed <DefinitionTrigger term="churn" /> — muted border, aria-expanded=false
    </p>
    <p style={line}>
      Open <DefinitionTrigger term="churn" open /> — ink border, aria-expanded=true
    </p>
  </div>
);

/**
 * `tone` matches the surrounding text: `muted` on paper, `alert` inside a red
 * wash chip — a weak pillar's chip is red, and an ink-coloured "?" in it
 * would read as a different element.
 */
export const Tones = () => (
  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
    <PillarChip pillar="Acquisition" score={18} total={20}>
      <DefinitionTrigger term="Acquisition" tone="muted" />
    </PillarChip>
    <PillarChip pillar="Retention" score={8} total={20} weak>
      <DefinitionTrigger term="Retention" tone="alert" />
    </PillarChip>
  </div>
);

/** `label` overrides the whole accessible name — the caller localizes it. */
export const Localized = () => (
  <p style={line}>
    Connais-tu ta principale cause de churn{" "}
    <DefinitionTrigger term="churn" label="Définition : churn" /> ?
  </p>
);
