import * as React from "react";

/**
 * The product's action button.
 * @startingPoint section="Core" subtitle="Primary, secondary, quiet — all sizes and states" viewport="700x180"
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary = filled road-paint red, max one per screen · secondary = ink outline · quiet = underlined mono-weight link */
  variant?: "primary" | "secondary" | "quiet";
  /** md = desktop (14px 24px) · lg = mobile full-width (16px) */
  size?: "md" | "lg";
  fullWidth?: boolean;
}

export declare function Button(props: ButtonProps): JSX.Element;
