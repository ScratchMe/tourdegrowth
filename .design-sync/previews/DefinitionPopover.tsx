import { DefinitionPopover } from "tour-de-growth";

/*
 * The definition itself. GlossaryTerm opens ONE panel, `placement="auto"`, in
 * the top layer, and CSS picks its shape at the current width — there is no
 * viewport detection in JS anywhere in this product. The two placements
 * below draw each of those shapes in place, so a story can show them.
 *
 * The definition here is the SHORT one. The long "In practice" text lives on
 * the term's own page and never in this box — a 200-word popover is broken.
 *
 * Terms and definitions: content/glossary-terms.ts, as GlossaryTerm resolves
 * them by id and locale; labels: dictionary.ts (`glossary`).
 */

const noop = () => {};
const CAC_TERM = "CAC — Customer Acquisition Cost";
const CAC = "Customer Acquisition Cost: how much you spend on average to acquire one new customer.";

/** `anchored` — under the trigger, 280px max. The desktop shape. */
export const Anchored = () => (
  <div style={{ padding: "8px 0", maxWidth: 320 }}>
    <DefinitionPopover
      term={CAC_TERM}
      definition={CAC}
      placement="anchored"
      more={{ href: "/en/glossary/cac", label: "Learn more →" }}
    />
  </div>
);

/**
 * `docked` — a full-width sheet at the bottom of the screen. The mobile
 * shape, and the only one with a ✕, which renders when the caller passes
 * `onClose` (GlossaryTerm always does).
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
      height: 260,
      width: 340,
      border: "1px dashed #d6d3d1",
      borderRadius: 6,
    }}
  >
    <DefinitionPopover
      term={CAC_TERM}
      definition={CAC}
      placement="docked"
      closeLabel="Close"
      onClose={noop}
      more={{ href: "/en/glossary/cac", label: "Learn more →" }}
    />
  </div>
);

/** `more` is optional — omit it and the popover is a dead end, which is why the product always passes it. */
export const NoLink = () => (
  <div style={{ padding: "8px 0", maxWidth: 320 }}>
    <DefinitionPopover term="Churn" definition="The rate of customers or users who stop using your product over a given period." placement="anchored" />
  </div>
);

/** In French: the same entry resolved for the other locale — term, definition, link and its label all change. */
export const French = () => (
  <div style={{ padding: "8px 0", maxWidth: 320 }}>
    <DefinitionPopover
      term="CAC — Coût d'Acquisition Client"
      definition="Coût d'Acquisition Client : combien tu dépenses en moyenne pour obtenir un nouveau client."
      placement="anchored"
      more={{ href: "/fr/glossary/cac", label: "En savoir plus →" }}
    />
  </div>
);
