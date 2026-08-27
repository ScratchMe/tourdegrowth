import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

type Variant = "primary" | "secondary";
type Size = "default" | "compact";

type LinkButtonProps = {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children" | "className">;

type PlainButtonProps = {
  href?: undefined;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className">;

type ButtonProps = LinkButtonProps | PlainButtonProps;

/**
 * The one button recipe used everywhere (DESIGN-BRIEF.md "Layout & elevation"):
 * `primary` (red fill) and `secondary` (ink outline), `default` or `compact`
 * (header CTA) sizing. Renders a Next.js `Link` when given `href`, a plain
 * `<button>` otherwise — same look either way.
 */
export function Button(props: ButtonProps) {
  const { variant = "primary", size = "default", className: extraClassName } = props;
  const className = [
    styles.button,
    variant === "primary" ? styles.primary : styles.secondary,
    size === "compact" ? styles.compact : "",
    extraClassName ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  if (props.href !== undefined) {
    const { href, variant: _variant, size: _size, className: _className, children, ...rest } = props;
    return (
      <Link href={href} className={className} {...rest}>
        {children}
      </Link>
    );
  }

  const { href: _href, variant: _variant2, size: _size2, className: _className2, children, ...rest } = props;
  return (
    <button type="button" className={className} {...rest}>
      {children}
    </button>
  );
}
