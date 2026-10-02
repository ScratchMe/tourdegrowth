"use client";

import { useEffect, useRef } from "react";
import { attachCompactHeader } from "./compact-header";

/**
 * The site header's one client piece — design system extension 08.
 * `SiteHeader` renders it; no page does. It mounts an empty, hidden marker
 * and, once mounted, hands the enclosing `<header>` to `attachCompactHeader`
 * (`compact-header.ts`), which compacts it once the page has scrolled.
 * Without JavaScript, or before hydration, it does nothing: the header is
 * today's (mechanic 2).
 */
export function SiteHeaderCompactor() {
  const marker = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const header = marker.current?.closest("header");
    return header ? attachCompactHeader(header) : undefined;
  }, []);
  return <span ref={marker} hidden data-header-compactor="" />;
}
