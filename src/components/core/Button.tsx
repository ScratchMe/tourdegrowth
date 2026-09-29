import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode, Ref } from "react";
import styles from "./Button.module.css";

type Variant = "primary" | "secondary" | "quiet";
type Size = "sm" | "md" | "lg";

interface SharedProps {
  /** primary = filled road-paint red, max one per screen · secondary = ink outline · quiet = the one text button: underlined, drawn as a line of text, tapped on a 44px strip */
  variant?: Variant;
  /**
   * sm = --label-button-sm, 11px 20px: the header CTA, the admin's small
   * actions, and a `quiet` action beside sliders or fields (the growth
   * engine) — not part of the DS bundle's own matrix, see Button.module.css ·
   * md = the default (14px 24px) · lg = the large CTA: 17px label, 17px 20px
   * padding (16px sides under 760px). `sm` was a `compact` flag beside the
   * size until the variant names were made one word per axis (S-16).
   */
  size?: Size;
  fullWidth?: boolean;
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

type PlainButtonProps = SharedProps & {
  href?: undefined;
  /**
   * A request this button started is in flight: `aria-busy` plus `disabled`,
   * so it says why and cannot be sent twice; the label stays and gains an
   * ellipsis (Button.module.css). Buttons only — a link that is "loading" is
   * a navigation, and the browser already shows that.
   */
  loading?: boolean;
  /** React 19 passes `ref` as a prop: it reaches the `<button>` with the rest. */
  ref?: Ref<HTMLButtonElement>;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className">;

type ButtonProps = LinkButtonProps | PlainButtonProps;

/**
 * The product's one action-button recipe. Exactly one `primary` per screen —
 * it's the filled red one, and its scarcity is what makes it work. Renders a
 * Next.js `Link` when given `href`, a plain `<button>` otherwise — same look
 * either way.
 */
export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", fullWidth = false } = props;
  const className = [
    styles.button,
    styles[size],
    styles[variant],
    fullWidth ? styles.fullWidth : "",
    props.className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  if (props.href !== undefined) {
    const { href, hard = false, variant: _v, size: _s, fullWidth: _fw, className: _cn, children, ...rest } =
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

  const {
    href: _h,
    variant: _v2,
    size: _s2,
    fullWidth: _fw2,
    className: _cn2,
    loading = false,
    disabled,
    children,
    ...rest
  } = props;
  return (
    <button
      type="button"
      className={className}
      {...rest}
      disabled={loading || disabled}
      aria-busy={loading || undefined}
    >
      {children}
    </button>
  );
}
