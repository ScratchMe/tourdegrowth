import { PillarChip } from "tour-de-growth";

/*
 * The five AARRR scores. Pillar names stay in English on French screens —
 * that is deliberate, it keeps the acronym readable and SPEC.md uses them
 * that way in its own French prose.
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
 */
export const Chips = () => (
  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
    {PILLARS.map((p) => (
      <PillarChip key={p.pillar} pillar={p.pillar} score={p.score} weak={p.pillar === "Retention"} />
    ))}
  </div>
);

/**
 * `stretch` fills the column, score pinned left and name right — the result
 * screen's desktop alignment, so the chips line up with the score card above
 * them. It is inert below 761px, where the two-column chip grid takes over.
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

/** `children` is the slot for an inline glossary trigger — every pillar name carries one. */
export const Mobile = () => (
  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", maxWidth: 320 }}>
    {PILLARS.map((p) => (
      <PillarChip key={p.pillar} pillar={p.pillar} score={p.score} size="mobile" weak={p.pillar === "Retention"} />
    ))}
  </div>
);
