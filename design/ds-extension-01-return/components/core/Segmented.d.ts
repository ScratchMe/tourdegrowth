import * as React from "react";

export interface SegmentedOption {
  id: string;
  label: React.ReactNode;
  /** Only read when `as="a"` — a real page load. */
  href?: string;
}

/**
 * Two-to-three option segmented control: one hard 2px edge around the group, the selected side filled ink.
 * @startingPoint section="Core" subtitle="md (ToneToggle scale) and compact (header scale)" viewport="520x160"
 */
export interface SegmentedProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  options: SegmentedOption[];
  value: string;
  onChange?: (id: string) => void;
  /** md = Inter label, 44px · compact = mono uppercase, 32px visual + 6px transparent pad = 44px hit */
  size?: "md" | "compact";
  /** Accessible group name, e.g. "Tone" or "Language". Required. */
  label: string;
  /** Fill of the selected segment. Defaults to --ink-0; ToneToggle passes a function returning --paint-red for "roast". */
  activeColor?: string | ((id: string) => string | undefined);
  /** Render segments as links (full page load) instead of buttons. Use for the language switch. */
  as?: "button" | "a";
}

export declare function Segmented(props: SegmentedProps): JSX.Element;
