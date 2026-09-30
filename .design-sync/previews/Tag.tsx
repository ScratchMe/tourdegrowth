import { NightSurface, Tag } from "tour-de-growth";

/*
 * The generic chip. PillarChip, ModeTag and StampedPillar are all purpose-built
 * and should be preferred where they apply — reach for Tag only for something
 * the system has no named chip for. Every label below is one the product
 * actually sets in a Tag.
 */

/**
 * All four tones, each with a label it carries in the product: `neutral`, a
 * card the game's journal lists ("Pause offer" — its one use, at night, see
 * InARow); `outline`, the teaser's "coming soon" (NextLevel); `ink`, a figure
 * the growth engine found ("Found"); `alert`, a trick still "in production" in
 * December's catalogue (PatternCatalogue) — the red of a diagnosis, never an
 * error state.
 */
export const Tones = () => (
  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
    <Tag tone="neutral">Pause offer</Tag>
    <Tag tone="outline">coming soon</Tag>
    <Tag tone="ink">Found</Tag>
    <Tag tone="alert">in production</Tag>
  </div>
);

/** In a row, the way the game's journal lists the two cards a quarter played (GameJournal, night world). */
export const InARow = () => (
  <NightSurface as="div" style={{ padding: 20, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
    <Tag tone="neutral">Pause offer</Tag>
    <Tag tone="neutral">Exit survey</Tag>
  </NightSurface>
);
