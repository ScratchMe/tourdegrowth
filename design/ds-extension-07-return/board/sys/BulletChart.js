// Board stand-in for the synced BulletChart (components/viz/BulletChart), WITH
// the delta proposed in components/viz/BulletChart/BulletChart.delta.md:
// an optional `band` (a published range, drawn as a bracket under the track,
// never on it) and `value: null` (a target and a band with no figure yet).
// Not ported.
import React from "react";
import { cx } from "./_cx.js";
const h = React.createElement;

const pos = (v, [lo, hi]) => Math.min(100, Math.max(0, ((v - lo) / (hi - lo)) * 100));

export const BulletChart = ({ value, target, domain, ariaLabel, size = "md", band, className }) => {
  const hasValue = typeof value === "number" && Number.isFinite(value);
  const overflow = hasValue && value > domain[1];
  const below = hasValue && value < domain[0];
  const hasTarget = typeof target === "number" && target >= domain[0] && target <= domain[1];
  return h("div", { className: cx("BulletChart_wrap", `BulletChart_${size}`, band && "BulletChart_banded", className), role: "img", "aria-label": ariaLabel },
    h("div", { className: "BulletChart_track" },
      hasValue && !below ? h("div", { className: cx("BulletChart_value", overflow && "BulletChart_overflow"), style: { width: `${pos(value, domain)}%` } }) : null,
      below ? h("span", { className: "BulletChart_below" }) : null,
      hasTarget ? h("div", { className: "BulletChart_target", style: { left: `${pos(target, domain)}%` } }) : null),
    band ? h("div", { className: "BulletChart_bandRow" },
      h("span", { className: "BulletChart_band", style: { left: `${pos(band[0], domain)}%`, width: `${pos(band[1], domain) - pos(band[0], domain)}%` } })) : null);
};
