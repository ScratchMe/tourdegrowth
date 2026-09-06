"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { trackEvent } from "@/lib/analytics/goatcounter";

export interface TrackedLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  /** GoatCounter event name and optional detail (`name/detail`) — see `lib/analytics/goatcounter.ts`. */
  event: string;
  detail?: string;
  children: ReactNode;
}

/**
 * A plain `<a>` that fires one analytics event on click — the smallest
 * possible client island (REVIEW-02.md R2-14). It exists so that the
 * components around a tracked link can stay Server Components instead of
 * becoming client bundles for the sake of a single `onClick`.
 */
export function TrackedLink({ event, detail, children, ...rest }: TrackedLinkProps) {
  return (
    <a {...rest} onClick={() => trackEvent(event, detail)}>
      {children}
    </a>
  );
}
