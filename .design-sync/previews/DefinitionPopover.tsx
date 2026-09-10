import { DefinitionPopover } from "tour-de-growth";

/*
 * The definition itself. Both placements are RENDERED AT ONCE by GlossaryTerm
 * and CSS picks which one shows at the current width — there is no viewport
 * detection in JS anywhere in this product. Which is also why anything that
 * grabs focus has to be guarded to the placement actually on screen.
 *
 * The definition here is the SHORT one. The long "In practice" text lives on
 * the term's own page and never in this box — a 200-word popover is broken.
 */

const CAC =
  "Customer Acquisition Cost — everything you spend to win one new customer, divided by the number of customers won.";

/** `anchored` — under the trigger, 280px max. The desktop shape. */
export const Anchored = () => (
  <div style={{ padding: "8px 0", maxWidth: 320 }}>
    <DefinitionPopover
      term="CAC"
      definition={CAC}
      placement="anchored"
      more={{ href: "/en/glossary/cac", label: "Learn more →" }}
    />
  </div>
);

/**
 * `docked` — a full-width sheet at the bottom of the screen. The mobile
 * shape, and the only one with a ✕.
 *
 * The frame below stands in for a phone viewport: the sheet is
 * `position: fixed`, so it needs an ancestor with a `transform` to be
 * contained by anything smaller than the window.
 */
export const Docked = () => (
  <div
    style={{
      position: "relative",
      transform: "translateZ(0)",
      overflow: "hidden",
      height: 240,
      width: 300,
      border: "1px dashed #d6d3d1",
      borderRadius: 6,
    }}
  >
    <DefinitionPopover
      term="CAC"
      definition={CAC}
      placement="docked"
      closeLabel="Close"
      more={{ href: "/en/glossary/cac", label: "Learn more →" }}
    />
  </div>
);

/** `more` is optional — omit it and the popover is a dead end, which is why the product always passes it. */
export const NoLink = () => (
  <div style={{ padding: "8px 0", maxWidth: 320 }}>
    <DefinitionPopover term="Churn" definition="The share of customers who stop paying over a given period." placement="anchored" />
  </div>
);

/** In French, where the term title keeps its full expansion. */
export const French = () => (
  <div style={{ padding: "8px 0", maxWidth: 320 }}>
    <DefinitionPopover
      term="CAC — Coût d'Acquisition Client"
      definition="Tout ce que tu dépenses pour gagner un client, divisé par le nombre de clients gagnés."
      placement="anchored"
      more={{ href: "/fr/glossary/cac", label: "En savoir plus →" }}
    />
  </div>
);
