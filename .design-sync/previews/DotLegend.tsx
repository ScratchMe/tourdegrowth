import { DotLegend } from "tour-de-growth";

/*
 * The legend under a set of DotGrids: each swatch drawn by the same rules as
 * the dot it names, stroke included. Name only the marks the grids beside it
 * draw — an entry for a shape nobody sees is one more thing to read.
 */

/** The peloton's legend. Here `aria-hidden`: a visually hidden table beside the grids already says it all. */
export const Peloton = () => (
  <DotLegend
    aria-hidden
    items={[
      { mark: "referred", label: "came through a referral (12)" },
      { mark: "filled", label: "measured" },
      { mark: "range", label: "estimated range" },
      { mark: "unknown", label: "not measured" },
    ]}
  />
);

/** « Et si »: what the what-ifs add and lose, by shape — no second colour. */
export const WhatIf = () => (
  <DotLegend
    items={[
      { mark: "filled", label: "there today" },
      { mark: "gained", label: "added by your what-ifs" },
      { mark: "lost", label: "lost to your what-ifs" },
    ]}
  />
);

/** On a slide: 20px swatches in the slide's meta type. */
export const Slide = () => (
  <DotLegend
    aria-hidden
    medium="slide"
    items={[
      { mark: "filled", label: "measured" },
      { mark: "range", label: "estimated range" },
      { mark: "unknown", label: "not measured" },
    ]}
  />
);
