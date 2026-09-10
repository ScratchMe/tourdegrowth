import { Tag } from "tour-de-growth";

/*
 * The generic chip. PillarChip, ModeTag and StampedPillar are all purpose-built
 * and should be preferred where they apply — reach for Tag only for something
 * the system has no named chip for.
 */

/** All four tones. `red` is roast emphasis, never an error state. */
export const Tones = () => (
  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
    <Tag tone="neutral">15 questions</Tag>
    <Tag tone="outline">3 min</Tag>
    <Tag tone="ink">Deep dive</Tag>
    <Tag tone="red">Roast Mode</Tag>
  </div>
);

/** In a row, the way the landing's meta line sets them. */
export const InARow = () => (
  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
    <Tag tone="outline">Acquisition</Tag>
    <Tag tone="outline">Activation</Tag>
    <Tag tone="outline">Retention</Tag>
    <Tag tone="outline">Referral</Tag>
    <Tag tone="outline">Revenue</Tag>
  </div>
);
