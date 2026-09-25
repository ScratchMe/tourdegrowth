import { BulletChart } from "tour-de-growth";

/*
 * A value against its target on one fixed track: the bar is ink, the target
 * is the one red tick. No numbers inside it — it always sits under a figure
 * that states the value, next to a line that states the target. The words
 * carry the reading; the bar repeats it.
 *
 * No qualitative bands: without room for their labels they would be
 * decoration that looks like data.
 */

const col = { display: "flex", flexDirection: "column", gap: 18, maxWidth: 360 } as const;
const caption = { font: "var(--meta-xs)", color: "var(--text-muted)", marginBottom: 6 } as const;

/** Above target (churn 6.0%, objective 5.6%) and under it (4.9%) on the same 0–8% track. */
export const AgainstTarget = () => (
  <div style={col}>
    <div>
      <div style={caption}>Churn 6.0% — target 5.6%</div>
      <BulletChart size="md" value={6} target={5.6} domain={[0, 8]} ariaLabel="Churn 6.0%, target 5.6%: above" />
    </div>
    <div>
      <div style={caption}>Churn 4.9% — target 5.6%</div>
      <BulletChart size="md" value={4.9} target={5.6} domain={[0, 8]} ariaLabel="Churn 4.9%, target 5.6%: below" />
    </div>
  </div>
);

/**
 * Past the scale, the bar fills the track and its end turns into a point —
 * "further than this", not a value that happens to sit on the edge.
 */
export const PastTheScale = () => (
  <div style={col}>
    <div>
      <div style={caption}>Résiliations 9,4 % — objectif 5,6 %</div>
      <BulletChart
        size="md"
        value={9.4}
        target={5.6}
        domain={[0, 8]}
        ariaLabel="Résiliations 9,4 %, au-delà de l'échelle, objectif 5,6 % : au-dessus"
      />
    </div>
  </div>
);

/** `mini` (8px) is the size that lives inside a StatTile; `md` (12px) stands on its own row. */
export const Sizes = () => (
  <div style={col}>
    <BulletChart size="mini" value={5.2} target={4} domain={[0, 8]} ariaLabel="Churn 5.2%, board target 4%: above" />
    <BulletChart size="md" value={5.2} target={4} domain={[0, 8]} ariaLabel="Churn 5.2%, board target 4%: above" />
  </div>
);
