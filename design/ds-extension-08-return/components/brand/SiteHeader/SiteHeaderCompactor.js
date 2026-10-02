// SiteHeaderCompactor — design system extension 08. The header's one client
// piece ("use client" in the app). It renders an empty, hidden marker and,
// once mounted, hands the header to `attachCompactHeader`.
"use client";
import React from "react";
import { attachCompactHeader } from "./compactHeader.js";

const h = React.createElement;

export const SiteHeaderCompactor = () => {
  const marker = React.useRef(null);
  React.useEffect(() => {
    const header = marker.current?.closest("header");
    return header ? attachCompactHeader(header) : undefined;
  }, []);
  return h("span", { ref: marker, hidden: true, "data-header-compactor": "" });
};
