import * as React from "react";

/**
 * The Tour de Growth wordmark, set in stencil caps.
 * @startingPoint section="Brand" subtitle="Stencil wordmark, three sizes" viewport="700x150"
 */
export interface WordmarkProps extends React.HTMLAttributes<HTMLElement> {
  /** sm 15px (mobile header) · md 19px (desktop header) · lg 34px (hero) */
  size?: "sm" | "md" | "lg";
  /** Element to render. Use "h1" only where the wordmark is the page title. */
  as?: keyof JSX.IntrinsicElements;
}

export declare function Wordmark(props: WordmarkProps): JSX.Element;
