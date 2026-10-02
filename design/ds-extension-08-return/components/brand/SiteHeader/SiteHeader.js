// SiteHeader — design system extension 08. Today's header, plus a compact
// state for landscape windows once the page has scrolled.
// Plain React, no JSX, so the board runs this very file without a build.
import React from "react";
import { SpaceBand, SpaceRace } from "../SpaceBand/SpaceBand.js";
import { SiteHeaderCompactor } from "./SiteHeaderCompactor.js";

const h = React.createElement;

/**
 * One component for every page: the wordmark first, then the page's own
 * controls on the right; the space band under the row on a page that belongs
 * to a space.
 *
 * What extension 08 adds, all of it an enhancement over the same HTML:
 *
 *  - a compact race, drawn in the row after the wordmark and hidden until
 *    the compact state (`SpaceRace variant="compact"`);
 *  - the row's frosted glass as its own layer, so the compact state can
 *    shrink it with a transform without touching the header's box;
 *  - the edge (the band's colour slimmed to a stripe, or the plain header's
 *    dashed rule), which rises with the line;
 *  - `SiteHeaderCompactor`, the one client piece: it sets
 *    `data-compact="true"` once the page has scrolled (and back at the top),
 *    keeps the header full while keyboard focus is inside it, and gives the
 *    page `--sticky-offset-compact`. Without it — no JavaScript, a server
 *    render, a browser without the feature — the header is today's.
 *
 * The compact state only exists in a landscape window
 * (`@media (orientation: landscape)` in SiteHeader.css): a phone held
 * upright never sees it.
 *
 * A child marked `data-header-compact="leave"` leaves the compact line (the
 * landing's two quiet links). Everything else in the row stays; a control
 * followed by leaving ones closes up on the right over their room.
 */
export const SiteHeader = ({ locale, children, width = "wide", space, bandLinked, open }) => {
  const [brand, ...rest] = React.Children.toArray(children);
  return h("header", {
    className: "SiteHeader_header",
    "data-site-header": space ? "band" : "plain",
    "data-space": space,
    "data-compact": "false",
  },
    h("div", { className: "SiteHeader_bar" },
      h("div", { className: "SiteHeader_glass", "aria-hidden": "true" }),
      h("div", { className: `SiteHeader_row SiteHeader_${width}` },
        h("div", { className: "SiteHeader_lead" },
          brand,
          space ? h(SpaceRace, { locale, space, linked: bandLinked, open, variant: "compact" }) : null),
        rest.length ? h("div", { className: "SiteHeader_end" }, rest) : null)),
    space
      ? h("div", { className: "SiteHeader_band" }, h(SpaceBand, { locale, space, linked: bandLinked, width, open }))
      : null,
    h("div", { className: "SiteHeader_edge", "aria-hidden": "true" }),
    h(SiteHeaderCompactor, null));
};
