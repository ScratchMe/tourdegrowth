// HowItCompares — design system extension 07. Your figure, the published
// reference and your team's target, as ONE object (Q9).
// Plain React, no JSX.
import React from "react";
import { BulletChart, MetaLabel, Tag } from "tour-de-growth";

const h = React.createElement;

/**
 * Today: a "Reference" strip from 0 with a dashed range, its caveat, a target
 * box in another step, and "below the target" on the board. Here: one chart
 * (BulletChart, with the `band` delta) — the bar is your figure, the red
 * tick your team's target, the bracket under the track the published range —
 * one legend line, the caveat word for word, and the target box itself, for
 * the numbers that can name a stage (Q12: the target is asked where the
 * value is in front of you).
 *
 * The verdict tag appears only against a TEAM TARGET (C1): "Below target"
 * is the red of a diagnosis (Tag alert); "At or above target" is neutral.
 * A reference never earns a tag.
 */
export const HowItCompares = ({
  title,
  value = null,
  domain,
  band,
  target = null,
  chartLabel,
  legend = [],
  caveat,
  verdict,
  targetField,
  note,
  headingId = "compare-title",
}) =>
  h("section", { className: "HowItCompares_root", "aria-labelledby": headingId },
    h("div", { className: "HowItCompares_head" },
      h(MetaLabel, { as: "h3", size: "sm", tone: "muted", id: headingId }, title),
      verdict ? h(Tag, { tone: verdict.tone === "below" ? "alert" : "neutral" }, verdict.label) : null),
    // Nothing to draw (no figure, no published range, no target): no chart.
    value != null || band || target != null
      ? h(BulletChart, { value, target, domain, band, ariaLabel: chartLabel, size: "md" })
      : null,
    legend.length
      ? h("ul", { className: "HowItCompares_legend" },
          legend.map((l) =>
            h("li", { key: l.kind, className: `HowItCompares_key HowItCompares_key-${l.kind}` },
              h("span", { className: "HowItCompares_swatch", "aria-hidden": "true" }),
              l.label)))
      : null,
    caveat ? h("p", { className: "HowItCompares_caveat" }, caveat) : null,
    note ? h("p", { className: "HowItCompares_note" }, note) : null,
    targetField ? h("div", { className: "HowItCompares_targetField" }, targetField) : null);
