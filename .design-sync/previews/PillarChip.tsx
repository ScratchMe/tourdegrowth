import { PillarChip } from "tour-de-growth";

/*
 * The five AARRR scores. Pillar names stay in English on French screens —
 * that is deliberate, it keeps the acronym readable and SPEC.md uses them
 * that way in its own French prose.
 *
 * Since design I + B (2026-09-28) a chip is a solid-edged card with a thin
 * meter along its foot — the score's share of 20, red on the weak pillar,
 * hidden from assistive technology (it repeats the number). A meter's track
 * is the chip's width, so chips shown together are stretched into equal
 * cells: five content-sized chips drew a 16/20 bar as long as an 18/20 one.
 *
 * `weak` marks the lowest-scoring pillar and there is AT MOST ONE (roast adds
 * the second-lowest as a lighter red — see StampedPillar for what happens to
 * the lowest in that mode).
 */

const PILLARS = [
  { pillar: "Acquisition", score: 18 },
  { pillar: "Activation", score: 12 },
  { pillar: "Retention", score: 8 },
  { pillar: "Referral", score: 16 },
  { pillar: "Revenue", score: 20 },
];

/**
 * The default chip — score, then name, sized to its content. `total`
 * defaults to 20, so the denominator always prints: there is no prop that
 * yields a bare "18". Pass `total` only to override that 20.
 *
 * Content-sized is for a chip on its own. Shown side by side like this, the
 * meters sit on tracks of different lengths and stop comparing — which is
 * why the product stretches them (the two stories below).
 */
export const Chips = () => (
  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
    {PILLARS.map((p) => (
      <PillarChip key={p.pillar} pillar={p.pillar} score={p.score} weak={p.pillar === "Retention"} />
    ))}
  </div>
);

/**
 * `stretch` fills the cell, score pinned left and name right — at every width
 * since the meters, so every track is the same length and the bars compare.
 *
 * The free space is taken by a single auto margin on the pillar name, not by
 * `justify-content` — the row has four flex children (score, "/20", name,
 * glossary trigger), so spacing them apart split "18" from "/20". That was a
 * real production defect for a month, fixed 2026-09-11.
 */
export const Stretch = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 400 }}>
    {PILLARS.map((p) => (
      <PillarChip
        key={p.pillar}
        pillar={p.pillar}
        score={p.score}
        total={20}
        weak={p.pillar === "Retention"}
        stretch
      />
    ))}
  </div>
);

/** The phone's two-up grid: equal cells, stretched chips. `children` is the slot for an inline glossary trigger. */
export const Small = () => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, maxWidth: 342 }}>
    {PILLARS.map((p) => (
      <PillarChip key={p.pillar} pillar={p.pillar} score={p.score} size="sm" weak={p.pillar === "Retention"} stretch />
    ))}
  </div>
);
