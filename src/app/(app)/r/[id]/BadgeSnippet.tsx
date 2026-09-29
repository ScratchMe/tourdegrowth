"use client";

import { useState } from "react";
import { Button } from "@/components/core/Button";
import { BADGE_COPIED_EVENT, trackEvent } from "@/lib/analytics/goatcounter";
import styles from "./BadgeSnippet.module.css";

export interface BadgeSnippetProps {
  /** The badge's versioned address (`lib/og/badge.ts`), minted on the server. */
  src: string;
  /** « Tour de Growth · 74/100 » — the brand and the total, the same in both languages. */
  alt: string;
  /** The line to paste: the badge, linking to this result, on the canonical domain. */
  markdown: string;
  caption: string;
  lead: string;
  copyLabel: string;
  copiedLabel: string;
  className?: string;
}

/**
 * « Put it in your README » — GROWTH-PLAN.md 3.1 (CHANTIERS.md A3.1,
 * 2026-09-29). The OWNER's only: a visitor has nothing of theirs to embed.
 * The badge says the total and nothing else, the share image's own rule, and
 * links back to this result, whose visitor CTA carries `?ref=` — so a README
 * works for the sharing loop without anyone sharing again.
 *
 * The Markdown sits in a `<pre>` the reader can select by hand, and the
 * button copies it for them: `badge_copied` counts the copy (the one thing
 * this page can see — a paste into a README happens elsewhere).
 */
export function BadgeSnippet({ src, alt, markdown, caption, lead, copyLabel, copiedLabel, className }: BadgeSnippetProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      trackEvent(BADGE_COPIED_EVENT);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // No clipboard (an insecure context, a refused permission): the line is
      // still there to select by hand, which beats an error nobody can act on.
    }
  }

  return (
    <div className={[styles.badge, className ?? ""].filter(Boolean).join(" ")} data-testid="badge-snippet">
      <p className={styles.caption}>{caption}</p>
      <p className={styles.lead}>{lead}</p>
      {/* A route handler's SVG on an immutable address, like the share image beside it: nothing for the optimiser to do. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={styles.image} src={src} alt={alt} loading="lazy" data-testid="badge-image" />
      <pre className={styles.code}>
        <code data-testid="badge-markdown">{markdown}</code>
      </pre>
      <Button variant="secondary" size="sm" onClick={copy} aria-live="polite" data-testid="badge-copy">
        {copied ? copiedLabel : copyLabel}
      </Button>
    </div>
  );
}
