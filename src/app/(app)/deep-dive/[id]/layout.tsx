import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * REVIEW-02.md R2-08: one Deep dive URL per result, reachable from every
 * shared `/r/<id>` (which is `noindex, follow`), owner-only in practice and
 * identical for anyone else — an unbounded supply of thin pages if indexed.
 * `noindex, follow`, never a robots.txt disallow, for the same reason as
 * `/r/` (see `robots.ts`). A pass-through layout because the page is a
 * Client Component.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function DeepDiveLayout({ children }: { children: ReactNode }) {
  return children;
}
