import * as React from "react";

/**
 * Raised card for the moment the road stops: a 404, a failed result. Eyebrow + stencil title + one line.
 * @startingPoint section="Core" subtitle="wrongTurn (ink) and fault (red)" viewport="640x300"
 */
export interface DetourCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** wrongTurn = the reader's wrong turn, ink edge and ink shadow · fault = our failure, red edge and red shadow */
  tone?: "wrongTurn" | "fault";
  /** Mono uppercase eyebrow: "Detour", "Lost result". */
  eyebrow?: React.ReactNode;
  /** Stencil title at --display-title (36px). One sentence, with its full stop. */
  title: React.ReactNode;
  /** One body sentence or two, --body-md muted. No buttons inside — the CTA sits below the card. */
  children?: React.ReactNode;
  /** Defaults to --pad-card; use 20px on mobile. */
  padding?: string;
}

export declare function DetourCard(props: DetourCardProps): JSX.Element;
