import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

type Variant = "primary" | "secondary" | "quiet";
type Size = "md" | "lg";

interface SharedProps {
  /** primary = filled road-paint red, max one per screen · secondary = ink outline · quiet = underlined mono-weight link */
  variant?: Variant;
  /** md = desktop (14px 24px) · lg = mobile full-width (16px) */
  size?: Size;
  fullWidth?: boolean;
  /** Smaller inline sizing for the header CTA — not part of the DS bundle's own variant matrix, see Button.module.css. */
  compact?: boolean;
  className?: string;
  children: ReactNode;
}

type LinkButtonProps = SharedProps & {
  href: string;
  /**
   * Full document navigation: a plain `<a>` instead of `next/link`.
   *
   * For links that cross a root layout — the content pages (`/en`, `/fr/…`)
   * and the app routes (`/quiz`, `/r/<id>`, `/deep-dive/<id>`) have had
   * separate ones since REVIEW.md R-24. Next only learns that a target lives
   * under another root layout from the route tree it fetches, so a `<Link>`
   * prefetches the dynamic route as soon as it scrolls into view, fetches it
   * again on click, and then does the full page load anyway: two invocations
   * of the app function per link, for a payload it can never use. Measured
   * on the landing (2026-09-14): six dynamic renders per page view, before
   * anyone clicks. A bare anchor does the one thing that was going to happen
   * regardless. Same-tree links keep `<Link>` — `/r/<id>` → `/quiz?ref=` is a
   * client navigation, and its prefetch is what makes that click instant.
   */
  hard?: boolean;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children" | "className">;

type PlainButtonProps = SharedProps & { href?: undefined } & Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "children" | "className"
  >;

type ButtonProps = LinkButtonProps | PlainButtonProps;

/**
 * The product's one action-button recipe. Exactly one `primary` per screen —
 * it's the filled red one, and its scarcity is what makes it work. Renders a
 * Next.js `Link` when given `href`, a plain `<button>` otherwise — same look
 * either way.
 */
export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", fullWidth = false, compact = false } = props;
  const className = [
    styles.button,
    styles[size],
    styles[variant],
    fullWidth ? styles.fullWidth : "",
    compact ? styles.compact : "",
    props.className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  if (props.href !== undefined) {
    const { href, hard = false, variant: _v, size: _s, fullWidth: _fw, compact: _c, className: _cn, children, ...rest } =
      props;
    if (hard) {
      return (
        <a href={href} className={className} {...rest}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={className} {...rest}>
        {children}
      </Link>
    );
  }

  const { href: _h, variant: _v2, size: _s2, fullWidth: _fw2, compact: _c2, className: _cn2, children, ...rest } =
    props;
  return (
    <button type="button" className={className} {...rest}>
      {children}
    </button>
  );
}
