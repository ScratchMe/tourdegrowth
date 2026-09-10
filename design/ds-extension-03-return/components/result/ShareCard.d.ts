import * as React from "react";

/**
 * The 1200×630 share image shown on its own result page, with Share and Save.
 * @startingPoint section="Result" subtitle="desktop · mobile" viewport="480x420"
 */
export interface ShareCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** URL of the rendered OG image for this result (author's language, author's tone). */
  src: string;
  alt: string;
  /** Uppercase mono line above the image, e.g. "Your share image — what LinkedIn and Slack show". */
  caption?: React.ReactNode;
  shareLabel?: React.ReactNode;
  saveLabel?: React.ReactNode;
  /** Web Share API when available, else copy link. */
  onShare?: () => void;
  /** Direct link to the PNG; the anchor carries `download`. */
  saveHref: string;
  size?: "desktop" | "mobile";
}

export declare function ShareCard(props: ShareCardProps): JSX.Element;
