import type { HTMLAttributes } from "react";
import { Button } from "@/components/core/Button";
import styles from "./ShareCard.module.css";

export interface ShareCardProps extends HTMLAttributes<HTMLDivElement> {
  /** The rendered OG image for this result — the author's language and tone. */
  src: string;
  /** Already translated, and specific enough to describe the image it stands in for. */
  alt: string;
  /** Uppercase mono line above the image, already translated. */
  caption?: string;
  /** Already-translated button label. */
  shareLabel: string;
  /** Already-translated link label. */
  saveLabel: string;
  /** Web Share API where there is one, clipboard fallback otherwise — the caller decides. */
  onShare?: () => void;
  /** Direct link to the PNG. Must be same-origin or the browser ignores `download`. */
  saveHref: string;
  /** Filename the download is offered under; omit to let the browser choose. */
  saveFileName?: string;
  size?: "desktop" | "mobile";
}

/**
 * The result's own share image, shown on the page it belongs to, with the
 * Share action and a Save link — design system extension 03, §3.
 *
 * One per result page, for owner and visitor alike. It absorbs "Share this
 * result", which leaves the CTA row; that row then holds the primary alone.
 * Desktop: left column, under the pillar chips — the picture of the result
 * sits under the result. Mobile: after the primary CTA, before the
 * disclaimer.
 *
 * Sunken paper, because this is an artefact *of* the result rather than a
 * surface of it — the one raised card on this screen is already spent on the
 * score. Share is a secondary Button and never a primary: the primary here
 * is "Take your own Tour →". No platform icons (the brand ships no icon
 * files) and no copy-link field.
 *
 * The image is rendered server-side by Satori in the author's language and
 * tone. This component never re-renders it and never localises it for the
 * reader — a crawler fetching the preview has no reader to localise for.
 */
export function ShareCard({
  src,
  alt,
  caption,
  shareLabel,
  saveLabel,
  onShare,
  saveHref,
  saveFileName,
  size = "desktop",
  className,
  ...rest
}: ShareCardProps) {
  const desktop = size === "desktop";

  return (
    <div
      className={[styles.frame, desktop ? styles.desktop : styles.mobile, className ?? ""]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {caption ? <div className={styles.caption}>{caption}</div> : null}
      {/* Not next/image: this is a route handler's PNG, already exactly
          1200×630 and cached by the CDN, so the optimiser has nothing to add
          and would put a second render pass in front of it. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={styles.image} src={src} alt={alt} width={1200} height={630} />
      <div className={styles.actions}>
        <Button variant="secondary" onClick={onShare}>
          {shareLabel}
        </Button>
        <a className={styles.save} href={saveHref} download={saveFileName ?? ""}>
          {saveLabel}
        </a>
      </div>
    </div>
  );
}
