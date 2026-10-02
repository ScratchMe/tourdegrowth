// EngineLanding — design system extension 07. The top of /aarrr-funnel-template
// for both visits, from ONE prerendered HTML.
// Plain React, no JSX, so the board runs this very file without a build.
import React from "react";
import { Button, MetaLabel } from "tour-de-growth";

const h = React.createElement;

/**
 * The pre-paint flag (Q1). Inline it in <head>, before any stylesheet that
 * paints the page: it only asks whether the engine's storage key EXISTS —
 * it reads no value, parses nothing, sends nothing — and marks <html>
 * `data-engine="known"`. The CSS of this component does the rest, before the
 * first paint, so a returning reader never sees the long introduction appear
 * and then vanish. A search engine has no storage: it always reads the first
 * visit's page, H1, promise and all.
 */
export const engineKnownScript = (storageKey) =>
  `(function(){try{if(window.localStorage.getItem(${JSON.stringify(storageKey)})!==null){document.documentElement.setAttribute("data-engine","known")}}catch(e){}})();`;

/**
 * Everything above the tool. First visit: eyebrow, H1, the positioning, the
 * privacy promise (a card, never folded), the call to action. Returning
 * (`[data-engine=known]` on an ancestor, normally <html>): the eyebrow and
 * the H1 at section size, then the promise as one line, then the tool —
 * the positioning and the call to action are hidden by CSS, not removed:
 * the HTML stays the search landing.
 *
 * `aside` is the page's Stopwatch (desktop, first visit only).
 * `reserve` draws the tool's place while the engine is read (returning only).
 */
export const EngineLanding = ({
  eyebrow,
  title,
  lede,
  positioning,
  promiseTitle,
  promiseBody,
  promiseLine,
  cta,
  ctaHref = "#engine",
  ctaNote,
  aside,
  reserve,
}) =>
  h("header", { className: "EngineLanding_root" },
    h("div", { className: "EngineLanding_main" },
      h(MetaLabel, { size: "sm", tone: "ink", wide: true, className: "EngineLanding_eyebrow" }, eyebrow),
      h("h1", { className: "EngineLanding_title" }, title),
      h("div", { className: "EngineLanding_intro" },
        lede ? h("p", { className: "EngineLanding_lede" }, lede) : null,
        positioning ? h("p", { className: "EngineLanding_positioning" }, positioning) : null),
      // The promise: before the call to action, never folded (constraint 11).
      h("section", { className: "EngineLanding_promise", "aria-labelledby": "engine-promise-title" },
        h("h2", { id: "engine-promise-title", className: "EngineLanding_promiseTitle" }, promiseTitle),
        h("p", { className: "EngineLanding_promiseBody" }, promiseBody)),
      h("p", { className: "EngineLanding_promiseLine" }, promiseLine),
      h("div", { className: "EngineLanding_cta" },
        // Secondary: the page's one primary is the start card's, 600px below
        // (constraint 6). This one only takes the reader there.
        h(Button, { variant: "secondary", size: "lg", href: ctaHref }, cta),
        ctaNote ? h(MetaLabel, { size: "xs", uppercase: false }, ctaNote) : null)),
    aside ? h("div", { className: "EngineLanding_aside", "aria-hidden": "true" }, aside) : null,
    reserve ? h("div", { className: "EngineLanding_reserve", role: "status" }, reserve) : null);
